import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Animated, Dimensions, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from '../Icon';
import { GEMINI_API_KEY } from '@env';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

// Message Component
const MessageBubble = ({ message, isUser, onSpeak, isSpeaking }) => {
  const bubbleAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bubbleAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer,
        { opacity: bubbleAnimation, transform: [{ translateY: bubbleAnimation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
      ]}
    >
      {!isUser && (
        <View style={styles.botAvatar}>
          <Icon name="BotMessageSquare" size={24} color="#4CAF50" />
        </View>
      )}
      
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
          {message.text}
        </Text>
        
        {!isUser && (
          <TouchableOpacity 
            style={[styles.speakerButton, isSpeaking && styles.speakerActive]} 
            onPress={() => onSpeak(message.text, message.id)}
          >
            <Icon 
              name={isSpeaking ? "VolumeX" : "Volume2"} 
              size={16} 
              color={isSpeaking ? "#F44336" : "#4CAF50"} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {isUser && (
        <View style={styles.userAvatar}>
          <Icon name="User" size={20} color="white" />
        </View>
      )}
    </Animated.View>
  );
};

// Typing Indicator Component
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.botAvatar}>
        <Icon name="BotMessageSquare" size={24} color="#4CAF50" />
      </View>
      <View style={styles.typingBubble}>
        <Text style={styles.typingText}>Krishi Mitra is typing</Text>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </View>
    </View>
  );
};

const ChatBot = () => {
    const navigation = useNavigation();
    const [messages, setMessages] = useState([
      {
        id: 1,
        text: "नमस्ते! मैं कृषि मित्र हूं। मैं आपकी खेती में मदद करने के लिए यहां हूं। आप मुझसे किसी भी भाषा में बात कर सकते हैं! 🌱",
        isUser: false,
        timestamp: new Date(),
        language: 'hindi'
      }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState(null);
    const [detectedLanguage, setDetectedLanguage] = useState('hindi');
    const [recording, setRecording] = useState(null);
    const [hasAudioPermission, setHasAudioPermission] = useState(false);
    const chatRef = useRef(null);
    const pulseAnimation = useRef(new Animated.Value(1)).current;
    const speechRecognitionTimeout = useRef(null);

    // Initialize audio permissions and Speech setup
    useEffect(() => {
      initializeAudio();
      setupSpeechEvents();
      
      return () => {
        if (speechRecognitionTimeout.current) {
          clearTimeout(speechRecognitionTimeout.current);
        }
        stopSpeaking();
      };
    }, []);

    const initializeAudio = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Audio Recording Permission',
              message: 'Krishi Mitra needs access to your microphone to enable voice chat.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          setHasAudioPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } else {
          // For iOS, permissions are handled by expo-av
          const { status } = await Audio.requestPermissionsAsync();
          setHasAudioPermission(status === 'granted');
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setHasAudioPermission(false);
      }
    };

    const setupSpeechEvents = () => {
      // Setup speech synthesis event listeners
      Speech.getAvailableVoicesAsync().then(voices => {
        console.log('Available voices:', voices.length);
      });
    };

    // Enhanced language detection including transliterated text
    const detectLanguage = (text) => {
      // First check for native scripts
      if (/[\u0900-\u097F]/.test(text)) return 'hindi';
      if (/[\u0A00-\u0A7F]/.test(text)) return 'punjabi';
      if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu';
      if (/[\u0D00-\u0D7F]/.test(text)) return 'malayalam';
      if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil';
      if (/[\u0A80-\u0AFF]/.test(text)) return 'gujarati';
      
      // Check for transliterated patterns (Hindi/Indian languages written in English)
      const lowerText = text.toLowerCase();
      
      // Hindi transliterated patterns
      const hindiPatterns = [
        /\b(mujhe|main|kya|kaise|kahan|kab|kyun|aur|hai|hain|ka|ki|ke|ko|se|me|par|bhi|nahi|haan|ji|sahab|bhai|didi|chacha|mama|papa|beta|beti)\b/,
        /\b(paani|khana|ghar|gaon|shahar|kaam|padhai|school|college|hospital|market|bazaar)\b/,
        /\b(achha|bura|sundar|safed|kala|lal|neela|peela|hari|bada|chota|mota|patla)\b/,
        /\b(pani|kheti|fasal|beej|khad|dawai|kisan|mazdoor|hal|bail)\b/
      ];
      
      // Punjabi transliterated patterns
      const punjabiPatterns = [
        /\b(mainu|tussi|assi|ohna|kinna|kithe|kado|kyun|te|da|di|de|nu|nal|vich|utte|haan|naa)\b/,
        /\b(pani|khet|fasal|beeja|khad|dawa|kisan|mazdoor|hal|bail)\b/
      ];
      
      // Telugu transliterated patterns  
      const teluguPatterns = [
        /\b(nenu|nuvvu|manam|vaaru|enti|ela|ekkada|eppudu|enduku|mariyu|undi|unnaru|ki|lo|meeda|kuda|kaadu|avunu)\b/,
        /\b(neelu|tindam|illu|oorlu|pani|chaduvulu|varaku|raytu|coolie)\b/
      ];
      
      // Check patterns
      if (hindiPatterns.some(pattern => pattern.test(lowerText))) return 'hindi';
      if (punjabiPatterns.some(pattern => pattern.test(lowerText))) return 'punjabi';
      if (teluguPatterns.some(pattern => pattern.test(lowerText))) return 'telugu';
      
      // Default to English for pure English text
      return 'english';
    };

    // Get language code for Speech API
    const getLanguageCode = (language) => {
      const languageMap = {
        'hindi': 'hi-IN',
        'punjabi': 'pa-IN', 
        'telugu': 'te-IN',
        'malayalam': 'ml-IN',
        'tamil': 'ta-IN',
        'gujarati': 'gu-IN',
        'english': 'en-IN'
      };
      return languageMap[language] || 'en-IN';
    };

    // Real Voice Recognition Implementation
    const startVoiceRecognition = async () => {
      if (!hasAudioPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to use voice chat.',
          [{ text: 'OK', onPress: initializeAudio }]
        );
        return;
      }

      try {
        setIsListening(true);
        
        // Animate microphone
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, { toValue: 1.2, duration: 600, useNativeDriver: true }),
            Animated.timing(pulseAnimation, { toValue: 1, duration: 600, useNativeDriver: true }),
          ])
        ).start();

        // Stop any current speech
        if (isSpeaking) {
          await stopSpeaking();
        }

        // Start recording
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        
        setRecording(newRecording);

        // Auto-stop recording after 10 seconds
        speechRecognitionTimeout.current = setTimeout(() => {
          stopVoiceRecognition();
        }, 10000);

      } catch (error) {
        console.error('Failed to start recording:', error);
        setIsListening(false);
        pulseAnimation.setValue(1);
        Alert.alert('Error', 'Failed to start voice recording. Please try again.');
      }
    };

    const stopVoiceRecognition = async () => {
      try {
        setIsListening(false);
        pulseAnimation.setValue(1);

        if (speechRecognitionTimeout.current) {
          clearTimeout(speechRecognitionTimeout.current);
        }

        if (recording) {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          
          // Process the recorded audio
          await processAudioToText(uri);
          setRecording(null);
        }
      } catch (error) {
        console.error('Failed to stop recording:', error);
        Alert.alert('Error', 'Failed to process voice recording.');
      }
    };

    // Process audio to text (Mock implementation - replace with actual speech-to-text service)
    const processAudioToText = async (audioUri) => {
      // Mock implementation - In production, integrate with:
      // - Google Speech-to-Text API
      // - Azure Speech Services
      // - AWS Transcribe
      // - Or use react-native-voice for on-device recognition
      
      const mockRecognizedTexts = [
        "मेरी फसल में कीड़े लग गए हैं, मुझे क्या करना चाहिए?",
        "ਮੈਨੂੰ ਗੇਹੂੰ ਦੀ ਬਿਜਾਈ ਬਾਰੇ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ",
        "టమాటో పంటలో వ్యాధులు వస్తున్నాయి, ఏమి చేయాలి?",
        "What is the best time to plant rice in this season?",
        "എനിക്ക് വെള്ളരിക്ക കൃഷിയെ കുറിച്ച് കൂടുതൽ അറിയണം",
        "મને મગફળીની ખેતી વિશે માહિતી જોઈએ છે"
      ];
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const randomText = mockRecognizedTexts[Math.floor(Math.random() * mockRecognizedTexts.length)];
      setInput(randomText);
      
      Alert.alert(
        "Voice Recognized", 
        `"${randomText}"`,
        [
          { text: "Send", onPress: () => sendMessage() },
          { text: "Edit", style: "cancel" }
        ]
      );
    };

    // Real Text-to-Speech Implementation using Google TTS
    const speakMessage = async (text, messageId) => {
      try {
        // Stop any current speech
        if (isSpeaking) {
          await stopSpeaking();
          return;
        }

        setIsSpeaking(true);
        setSpeakingMessageId(messageId);

        // Detect language for appropriate voice
        const detectedLang = detectLanguage(text);
        const languageCode = getLanguageCode(detectedLang);
        
        // Clean text for better TTS pronunciation
        const cleanedText = text
          .replace(/[🌱🚜🌾🍅🥔🌽🐛🌤️💰📱👥📈🔊🎤🟢]/g, '') // Remove emojis
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
          .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
          .trim();

        // Configure speech options based on language
        const speechOptions = {
          language: languageCode,
          pitch: 1.0,
          rate: 0.8, // Slightly slower for better comprehension
          quality: 'enhanced',
          onStart: () => {
            console.log('Started speaking');
          },
          onDone: () => {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
            console.log('Finished speaking');
          },
          onStopped: () => {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
            console.log('Speech stopped');
          },
          onError: (error) => {
            console.error('Speech error:', error);
            setIsSpeaking(false);
            setSpeakingMessageId(null);
            Alert.alert('Speech Error', 'Unable to play audio. Please try again.');
          }
        };

        // Use different voices for different languages
        const voiceOptions = getVoiceOptions(detectedLang);
        if (voiceOptions.voice) {
          speechOptions.voice = voiceOptions.voice;
        }

        await Speech.speak(cleanedText, speechOptions);

      } catch (error) {
        console.error('TTS Error:', error);
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        Alert.alert('Audio Error', 'Unable to play speech. Please check your device settings.');
      }
    };

    // Get voice options based on language
    const getVoiceOptions = (language) => {
      const voiceMap = {
        'hindi': { voice: 'hi-in-x-hid-local', gender: 'female' },
        'english': { voice: 'en-in-x-end-local', gender: 'female' },
        'punjabi': { voice: 'pa-in-x-pai-local', gender: 'female' },
        'telugu': { voice: 'te-in-x-ted-local', gender: 'female' },
        'malayalam': { voice: 'ml-in-x-mlf-local', gender: 'female' },
        'tamil': { voice: 'ta-in-x-taf-local', gender: 'female' },
        'gujarati': { voice: 'gu-in-x-guf-local', gender: 'female' }
      };
      return voiceMap[language] || { voice: 'en-in-x-end-local', gender: 'female' };
    };

    // Stop current speech
    const stopSpeaking = async () => {
      try {
        await Speech.stop();
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      } catch (error) {
        console.error('Error stopping speech:', error);
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }
    };

    const sendMessage = async () => {
      if (!input.trim()) return;

      const userMessage = {
        id: Date.now(),
        text: input.trim(),
        isUser: true,
        timestamp: new Date(),
        language: detectLanguage(input.trim())
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setLoading(true);
      setError('');

      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const modelName = "gemini-2.0-flash";
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const detectedLang = detectLanguage(userMessage.text);
        setDetectedLanguage(detectedLang);

        const agriPrompt = `
            You are Krishi Mitra, a friendly virtual agricultural assistant for Indian farmers.
            
            IMPORTANT INSTRUCTIONS:
            1. DETECT the actual language from user's message, even if written in English script
            2. If user writes "Mujhe kitni pani deni chahiye" - this is HINDI in English script, respond in Hindi
            3. If user writes "Mainu kinna paani dena chahida" - this is PUNJABI in English script, respond in Punjabi
            4. Auto-detect transliterated Indian languages and respond in the native script of that language
            
            User's message: "${userMessage.text}"
            Pre-detected language hint: ${detectedLang}
            
            RESPONSE RULES:
            ✅ Keep responses SHORT (2-4 sentences max)
            ✅ Be PRECISE and INFORMATIVE
            ✅ Use simple, practical language
            ✅ Include 1-2 relevant emojis: 🌱🚜🌾🍅🥔🌽💧🌞🐛
            ✅ Give actionable advice
            
            LANGUAGE MATCHING:
            - Detect if English text is actually Hindi/Punjabi/Telugu etc. transliterated
            - Respond in the NATIVE SCRIPT of the detected language:
              • Hindi: देवनागरी script
              • Punjabi: ਗੁਰਮੁਖੀ script  
              • Telugu: తెలుగు script
              • Malayalam: മലയാളം script
              • Tamil: தமிழ் script
              • English: English only if genuinely English
            
            TOPICS: Soil, crops, water, pests, fertilizer, weather, harvest, seeds, market prices
            
            End with short follow-up question in same language:
            - Hindi: "और मदद चाहिए? 🌱"
            - Punjabi: "ਹੋਰ ਮਦਦ? 🌱"  
            - Telugu: "ఇంకా సహాయం? 🌱"
            - English: "Need more help? 🌱"
            
            MAX LENGTH: 100-150 words only!`;

        const result = await model.generateContent(agriPrompt);
        const response = await result.response;
        const botResponseText = response.text();
        
        const botMessage = {
          id: Date.now() + 1,
          text: botResponseText,
          isUser: false,
          timestamp: new Date(),
          language: detectedLang
        };

        setMessages(prev => [...prev, botMessage]);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          chatRef.current?.scrollToEnd({ animated: true });
        }, 100);
        
      } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        setError('Sorry, I encountered an error. Please try again.');
        
        const errorMessage = {
          id: Date.now() + 1,
          text: detectedLanguage === 'hindi' 
            ? "क्षमा करें, कुछ गलती हुई है। कृपया दोबारा कोशिश करें। 🙏"
            : "Sorry, I encountered an error. Please try again. 🙏",
          isUser: false,
          timestamp: new Date(),
          language: detectedLanguage
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    };

    // Clear chat
    const clearChat = () => {
      Alert.alert(
        "Clear Chat",
        "Are you sure you want to clear all messages?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear",
            style: "destructive",
            onPress: () => {
              setMessages([{
                id: 1,
                text: "नमस्ते! मैं कृषि मित्र हूं। मैं आपकी खेती में मदद करने के लिए यहां हूं। आप मुझसे किसी भी भाषा में बात कर सकते हैं! 🌱",
                isUser: false,
                timestamp: new Date(),
                language: 'hindi'
              }]);
            }
          }
        ]
      );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Enhanced Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="ArrowLeft" size={24} color="#333" />
                    </TouchableOpacity>
                    
                    <View style={styles.avatarContainer}>
                        <Icon name="BotMessageSquare" color="#4CAF50" size={32} />
                        <View style={styles.onlineIndicator} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Krishi Mitra</Text>
                        <Text style={styles.headerSubtitle}>
                            {isSpeaking ? "🔊 Speaking..." : isListening ? "🎤 Listening..." : "🟢 Online"}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton} onPress={clearChat}>
                        <Icon name="Trash2" size={20} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Icon name="MoreVertical" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Language Indicator */}
            <View style={styles.languageIndicator}>
                <Icon name="Globe" size={16} color="#4CAF50" />
                <Text style={styles.languageText}>
                    Detected Language: {detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)}
                </Text>
                <Text style={styles.multilingualText}>🌍 Speak in any language</Text>
            </View>

            {/* Chat Messages */}
            <ScrollView 
                ref={chatRef}
                style={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.messagesContent}
            >
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        isUser={message.isUser}
                        onSpeak={speakMessage}
                        isSpeaking={speakingMessageId === message.id}
                    />
                ))}
                
                {loading && <TypingIndicator />}
                
                {error && (
                    <View style={styles.errorContainer}>
                        <Icon name="AlertCircle" size={20} color="#F44336" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
            </ScrollView>

            {/* Enhanced Input Section */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <Animated.View style={[styles.micButton, isListening && { transform: [{ scale: pulseAnimation }] }]}>
                        <TouchableOpacity 
                            onPress={isListening ? stopVoiceRecognition : startVoiceRecognition} 
                            disabled={loading}
                            style={[styles.micTouchable, isListening && styles.micActive]}
                            onLongPress={() => {
                              Alert.alert(
                                'Voice Mode', 
                                hasAudioPermission 
                                  ? 'Tap to start/stop recording. Speak clearly in any language.' 
                                  : 'Microphone permission is required for voice chat.',
                                hasAudioPermission ? [] : [{ text: 'Grant Permission', onPress: initializeAudio }]
                              );
                            }}
                        >
                            <Icon 
                                name={isListening ? "Square" : "Mic"} 
                                color={isListening ? "#F44336" : (hasAudioPermission ? "#4CAF50" : "#999")} 
                                size={20}
                            />
                        </TouchableOpacity>
                    </Animated.View>
                    
                    <TextInput 
                        style={styles.textInput}
                        onChangeText={setInput} 
                        value={input} 
                        placeholder="Type or speak your message..."
                        placeholderTextColor="#999"
                        multiline
                        maxLength={500}
                        editable={!loading && !isListening}
                    />
                    
                    <TouchableOpacity 
                        style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!input.trim() || loading || isListening}
                    >
                        <Icon 
                            name={loading ? "Loader" : "Send"} 
                            color="white" 
                            size={18}
                        />
                    </TouchableOpacity>
                </View>
                
                {/* Quick Actions */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActions}>
                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => setInput("मेरी फसल में कीड़े लग गए हैं, क्या करूं?")}
                    >
                        <Text style={styles.quickActionText}>🐛 Pest Problem</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => setInput("What is the best time to plant tomatoes?")}
                    >
                        <Text style={styles.quickActionText}>🍅 Planting Time</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => setInput("मिट्टी की जांच कैसे करें?")}
                    >
                        <Text style={styles.quickActionText}>🌱 Soil Test</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => setInput("Weather forecast for farming")}
                    >
                        <Text style={styles.quickActionText}>🌤️ Weather</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 8,
  },

  // Language Indicator
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  multilingualText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },

  // Messages
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    position: 'relative',
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: '#333',
  },
  speakerButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  speakerActive: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },

  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  typingBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },

  // Input Section
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginBottom: 8,
  },
  micButton: {
    marginRight: 8,
  },
  micTouchable: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  micActive: {
    backgroundColor: '#FFEBEE',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },

  // Quick Actions
  quickActions: {
    paddingVertical: 8,
  },
  quickActionButton: {
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
  },
});

export default ChatBot;