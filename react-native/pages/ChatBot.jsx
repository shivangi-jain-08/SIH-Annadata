import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Animated, Dimensions, StyleSheet, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from '../Icon';
import { GEMINI_API_KEY } from '@env';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import HardwareService from '../services/HardwareService';
import UserService from '../services/UserService';
import WeatherService from '../services/weatherService';
import OrdersService from '../services/ordersService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Enhanced Message Component with Image Support and Crop Recommendations
const MessageBubble = ({ message, isUser, onSpeak, isSpeaking, onDiseasePhoto, navigation }) => {
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
        {/* Show image if present */}
        {message.image && (
          <Image 
            source={{ uri: message.image }} 
            style={styles.messageImage}
            resizeMode="cover"
          />
        )}
        
        <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
          {message.text}
        </Text>
        
        {/* Disease Report Display */}
        {message.diseaseReport && (
          <View style={styles.diseaseReportContainer}>
            <Text style={styles.diseaseReportTitle}>🔍 रोग विश्लेषण:</Text>
            <Text style={styles.diseaseReportDisease}>रोग: {message.diseaseReport.diseaseName}</Text>
            <Text style={styles.diseaseReportTreatment}>उपचार: {message.diseaseReport.treatment}</Text>
          </View>
        )}

        {/* Crop Recommendation Data Display */}
        {message.cropRecommendationData && (
          <View style={styles.cropRecContainer}>
            <Text style={styles.cropRecTitle}>📊 डेटा आधारित सिफारिश:</Text>
            
            {message.cropRecommendationData.sensorData && (
              <View style={styles.sensorDataSummary}>
                <Text style={styles.sensorDataTitle}>🌡️ सेंसर डेटा:</Text>
                <View style={styles.sensorGrid}>
                  <Text style={styles.sensorValue}>pH: {message.cropRecommendationData.sensorData.ph?.toFixed(1) || 'N/A'}</Text>
                  <Text style={styles.sensorValue}>N: {message.cropRecommendationData.sensorData.nitrogen?.toFixed(0) || 'N/A'}ppm</Text>
                  <Text style={styles.sensorValue}>P: {message.cropRecommendationData.sensorData.phosphorus?.toFixed(0) || 'N/A'}ppm</Text>
                  <Text style={styles.sensorValue}>K: {message.cropRecommendationData.sensorData.potassium?.toFixed(0) || 'N/A'}ppm</Text>
                </View>
              </View>
            )}
            
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>📍 {message.cropRecommendationData.location?.address || 'Punjab, India'}</Text>
              {message.hasRealData && (
                <View style={styles.realDataIndicator}>
                  <Icon name="CheckCircle" size={12} color="#4CAF50" />
                  <Text style={styles.realDataText}>वास्तविक डेटा</Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Action buttons for bot messages */}
        <View style={styles.messageActions}>
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
          
          {/* Disease Detection Photo Button */}
          {!isUser && (message.needsPhoto || message.text.includes('📷') || message.text.includes('फोटो')) && (
            <TouchableOpacity 
              style={styles.photoButton} 
              onPress={onDiseasePhoto}
            >
              <Icon name="Camera" size={20} color="#2196F3" />
              <Text style={styles.photoButtonText}>📷 फोटो</Text>
            </TouchableOpacity>
          )}

          {/* Navigation Button for Detailed Analysis */}
          {!isUser && message.needsNavigation && navigation && (
            <TouchableOpacity 
              style={styles.navigationButton} 
              onPress={() => {
                if (message.navigationTarget === 'CropRecommendation') {
                  navigation.navigate('CropRecommendation');
                }
              }}
            >
              <Icon name="ArrowRight" size={18} color="#4CAF50" />
              <Text style={styles.navigationButtonText}>विस्तृत विश्लेषण</Text>
            </TouchableOpacity>
          )}
        </View>
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
        <Text style={styles.typingText}>Krishika is typing</Text>
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
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState(null);
    const [detectedLanguage, setDetectedLanguage] = useState('hindi');
    const [recording, setRecording] = useState(null);
    const [hasAudioPermission, setHasAudioPermission] = useState(false);
    const [isProcessingVoice, setIsProcessingVoice] = useState(false);
    const [voiceConversationMode, setVoiceConversationMode] = useState(false);
    const chatRef = useRef(null);
    const pulseAnimation = useRef(new Animated.Value(1)).current;
    const speechRecognitionTimeout = useRef(null);
    const silenceDetectionTimeout = useRef(null);
    const recordingMetering = useRef(null);
    const [userContextData, setUserContextData] = useState(null);
    const [chatSession, setChatSession] = useState(null);
    const chatSessionRef = useRef(null);

    // Initialize Gemini Chat Session with system instruction
    const initializeChatSession = async () => {
        try {
            console.log('Initializing Gemini chat session with system instruction...');
            
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const systemInstruction = generateSystemInstruction();
            
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash",
                systemInstruction: systemInstruction
            });
            
            // Start a new chat session
            const newChatSession = model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                },
            });
            
            setChatSession(newChatSession);
            chatSessionRef.current = newChatSession;
            
            console.log('Chat session initialized successfully');
            return newChatSession;
        } catch (error) {
            console.error('Failed to initialize chat session:', error);
            return null;
        }
    };

    // Reset chat session when user context changes
    const resetChatSession = async () => {
        console.log('Resetting chat session with updated context...');
        const newSession = await initializeChatSession();
        return newSession;
    };

    // Check if context has changed significantly and refresh chat session
    const checkAndRefreshContext = async (newContextData) => {
        if (!userContextData || !chatSessionRef.current) {
            return; // Initial setup, no need to refresh
        }

        // Check for significant changes that warrant chat session refresh
        const significantChanges = 
            JSON.stringify(newContextData?.user) !== JSON.stringify(userContextData?.user) ||
            JSON.stringify(newContextData?.location) !== JSON.stringify(userContextData?.location) ||
            JSON.stringify(newContextData?.hardware) !== JSON.stringify(userContextData?.hardware) ||
            Math.abs(Date.now() - (userContextData?.lastUpdated || 0)) > 30 * 60 * 1000; // 30 minutes

        if (significantChanges) {
            console.log('Significant context changes detected, refreshing chat session...');
            await resetChatSession();
        }
    };

    // Fetch comprehensive user context data
    const fetchUserContextData = async () => {
        try {
            console.log('Fetching comprehensive user context data...');
            
            const contextData = {};
            
            // 1. Get user profile data
            try {
                const userData = await UserService.getCurrentUser();
                if (userData) {
                    const formattedUser = UserService.formatUserData(userData);
                    contextData.user = formattedUser;
                    contextData.userRole = UserService.getUserRole(userData);
                }
            } catch (error) {
                console.warn('Error fetching user data:', error);
            }
            
            // 2. Get current location and weather data
            try {
                let locationData = null;
                let weatherData = null;
                
                // Try to get current GPS location
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    locationData = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        accuracy: location.coords.accuracy
                    };
                } else {
                    // Fallback to user's saved location
                    if (contextData.user?.coordinates?.length === 2) {
                        locationData = {
                            latitude: contextData.user.coordinates[1],
                            longitude: contextData.user.coordinates[0],
                            source: 'profile'
                        };
                    }
                }
                
                // Fetch weather data if we have location
                if (locationData) {
                    weatherData = await WeatherService.getCurrentWeather(
                        locationData.latitude, 
                        locationData.longitude
                    );
                    const weatherAdvice = WeatherService.getWeatherAdvice(weatherData);
                    weatherData.farmingAdvice = weatherAdvice;
                }
                
                contextData.location = locationData;
                contextData.weather = weatherData;
                
            } catch (error) {
                console.warn('Error fetching location/weather data:', error);
            }
            
            // 3. Get hardware/sensor data
            try {
                const hardwareMessages = await HardwareService.getLatestHardwareMessages(3);
                if (hardwareMessages.length > 0) {
                    contextData.sensors = {
                        latest: hardwareMessages[0],
                        recent: hardwareMessages,
                        summary: HardwareService.getSensorSummary(hardwareMessages[0]?.sensorData)
                    };
                }
            } catch (error) {
                console.warn('Error fetching hardware data:', error);
            }
            
            // 4. Get crop recommendations
            try {
                const cropRecommendations = await HardwareService.getLatestCropRecommendations(3);
                if (cropRecommendations.length > 0) {
                    contextData.cropRecommendations = cropRecommendations;
                }
            } catch (error) {
                console.warn('Error fetching crop recommendations:', error);
            }
            
            // 5. Get orders data (for farmers/vendors)
            try {
                if (contextData.userRole === 'Farmer' || contextData.userRole === 'Vendor') {
                    const orders = await OrdersService.getUserOrders('seller');
                    if (orders?.success && orders.data) {
                        const orderMetrics = OrdersService.getDashboardMetrics(orders.data);
                        contextData.orders = {
                            recent: orders.data.slice(0, 5),
                            metrics: orderMetrics,
                            activeOrders: OrdersService.calculateActiveOrders(orders.data),
                            totalRevenue: OrdersService.calculateTotalRevenue(orders.data)
                        };
                    }
                }
            } catch (error) {
                console.warn('Error fetching orders data:', error);
            }
            
            // 6. Add timestamp and data freshness info
            contextData.timestamp = new Date().toISOString();
            contextData.dataFreshness = {
                user: !!contextData.user,
                weather: !!contextData.weather,
                sensors: !!contextData.sensors,
                orders: !!contextData.orders,
                location: !!contextData.location
            };
            
            console.log('User context data collected:', contextData);
            
            // Add timestamp for context freshness tracking
            contextData.lastUpdated = Date.now();
            
            // Check if context changed significantly and refresh chat session
            await checkAndRefreshContext(contextData);
            
            setUserContextData(contextData);
            
            return contextData;
            
        } catch (error) {
            console.error('Error fetching user context data:', error);
            return null;
        }
    };

    // Initialize audio permissions, Speech setup, and Chat Session
    useEffect(() => {
      initializeAudio();
      setupSpeechEvents();
      
      // Initialize components in sequence
      const initializeComponents = async () => {
        await fetchUserContextData(); // Fetch user context data first
        await initializeChatSession(); // Then initialize chat session with context
      };
      
      initializeComponents();
      
      return () => {
        if (speechRecognitionTimeout.current) {
          clearTimeout(speechRecognitionTimeout.current);
        }
        if (silenceDetectionTimeout.current) {
          clearTimeout(silenceDetectionTimeout.current);
        }
        stopSpeaking();
      };
    }, []);

    const initializeAudio = async () => {
      try {
        // Use expo-av for both Android and iOS - more reliable in Expo Go
        const { status } = await Audio.getPermissionsAsync();
        
        if (status === 'granted') {
          setHasAudioPermission(true);
        } else {
          // Request permission if not granted
          const { status: requestStatus } = await Audio.requestPermissionsAsync();
          setHasAudioPermission(requestStatus === 'granted');
          
          if (requestStatus !== 'granted') {
            Alert.alert(
              'Microphone Permission Required',
              'Krishika needs microphone access for voice chat. Please enable it in your device settings.',
              [{ text: 'OK' }]
            );
          }
        }

        // Configure audio mode for recording and playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
        
        console.log('Audio initialized successfully, permission:', status);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setHasAudioPermission(false);
        Alert.alert('Audio Setup Error', 'Failed to setup audio. Voice features may not work properly.');
      }
    };

    const setupSpeechEvents = () => {
      // Setup speech synthesis event listeners
      Speech.getAvailableVoicesAsync().then(voices => {
        console.log('Available voices:', voices.length);
      });
    };

    // Helper function to check and request permissions
    const checkAndRequestPermissions = async () => {
      try {
        const { status } = await Audio.getPermissionsAsync();
        
        if (status === 'granted') {
          setHasAudioPermission(true);
          return true;
        }
        
        const { status: requestStatus } = await Audio.requestPermissionsAsync();
        const granted = requestStatus === 'granted';
        setHasAudioPermission(granted);
        
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Krishika needs microphone access for voice features. Please enable it in Settings.',
            [{ text: 'OK' }]
          );
        }
        
        return granted;
      } catch (error) {
        console.error('Permission check failed:', error);
        setHasAudioPermission(false);
        return false;
      }
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

    // Enhanced Voice Conversation Mode - Direct to Gemini
    const startVoiceConversation = async () => {
      try {
        // Check permissions
        const { status } = await Audio.getPermissionsAsync();
        
        if (status !== 'granted') {
          const { status: requestStatus } = await Audio.requestPermissionsAsync();
          if (requestStatus !== 'granted') {
            Alert.alert(
              'Microphone Permission Required',
              'Voice conversation needs microphone access.',
              [{ text: 'OK' }]
            );
            return;
          }
          setHasAudioPermission(true);
        }

        setIsListening(true);
        setVoiceConversationMode(true);
        
        // Stop any current speech
        if (isSpeaking) {
          await stopSpeaking();
        }

        // Animate microphone
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, { toValue: 1.2, duration: 600, useNativeDriver: true }),
            Animated.timing(pulseAnimation, { toValue: 1, duration: 600, useNativeDriver: true }),
          ])
        ).start();

        console.log('Starting voice conversation mode...');
        
        // Enhanced recording options with metering
        const recordingOptions = {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          isMeteringEnabled: true, // Enable audio level monitoring
          android: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 44100,
            numberOfChannels: 1, // Mono for efficiency
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 44100,
            numberOfChannels: 1, // Mono for efficiency
            bitRate: 128000,
          },
        };

        // Start recording with silence detection
        const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
        setRecording(newRecording);
        
        console.log('Voice conversation started with silence detection');

        // Start silence detection
        startSilenceDetection(newRecording);

        // Maximum recording time (30 seconds)
        speechRecognitionTimeout.current = setTimeout(() => {
          stopVoiceConversation();
        }, 30000);

      } catch (error) {
        console.error('Failed to start voice conversation:', error);
        setIsListening(false);
        setVoiceConversationMode(false);
        pulseAnimation.setValue(1);
        
        Alert.alert('Voice Error', 'Failed to start voice conversation. Please try again.');
      }
    };

    // Silence detection to auto-stop recording
    const startSilenceDetection = (recording) => {
      const checkSilence = async () => {
        try {
          if (recording && isListening) {
            const status = await recording.getStatusAsync();
            
            // Check if recording is active and get metering
            if (status.isRecording && status.metering !== undefined) {
              const audioLevel = status.metering;
              
              // If audio level is very low (silence threshold: -40dB)
              if (audioLevel < -40) {
                // Start silence timer if not already started
                if (!silenceDetectionTimeout.current) {
                  silenceDetectionTimeout.current = setTimeout(() => {
                    console.log('Silence detected, stopping recording...');
                    stopVoiceConversation();
                  }, 1500); // Stop after 1.5 seconds of silence
                }
              } else {
                // Clear silence timer if user is speaking
                if (silenceDetectionTimeout.current) {
                  clearTimeout(silenceDetectionTimeout.current);
                  silenceDetectionTimeout.current = null;
                }
              }
            }
            
            // Continue checking if still listening
            if (isListening) {
              setTimeout(checkSilence, 100); // Check every 100ms
            }
          }
        } catch (error) {
          console.log('Silence detection error:', error);
        }
      };
      
      // Start checking after 500ms to avoid immediate triggering
      setTimeout(checkSilence, 500);
    };

    // Legacy function for backward compatibility
    const startVoiceRecognition = () => {
      startVoiceConversation();
    };

    const stopVoiceConversation = async () => {
      try {
        setIsListening(false);
        setIsProcessingVoice(true);
        pulseAnimation.setValue(1);

        // Clear all timers
        if (speechRecognitionTimeout.current) {
          clearTimeout(speechRecognitionTimeout.current);
          speechRecognitionTimeout.current = null;
        }
        if (silenceDetectionTimeout.current) {
          clearTimeout(silenceDetectionTimeout.current);
          silenceDetectionTimeout.current = null;
        }

        if (recording) {
          console.log('Stopping recording and processing directly with Gemini...');
          
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          setRecording(null);
          
          // Process directly with Gemini for full conversation
          await processVoiceToResponse(uri);
        }
        
        setIsProcessingVoice(false);
        setVoiceConversationMode(false);
      } catch (error) {
        console.error('Failed to stop voice conversation:', error);
        setIsProcessingVoice(false);
        setVoiceConversationMode(false);
        Alert.alert('Error', 'Failed to process voice conversation.');
      }
    };

    // Legacy function for backward compatibility
    const stopVoiceRecognition = () => {
      stopVoiceConversation();
    };

    // Optimized Direct Voice-to-Response Processing
    const processVoiceToResponse = async (audioUri) => {
      try {
        console.log('Processing voice directly to response with Gemini AI:', audioUri);
        
        // Read audio file as base64
        const audioResponse = await fetch(audioUri);
        const audioBlob = await audioResponse.blob();
        
        // Convert blob to base64
        const base64Audio = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });

        // Initialize Gemini AI with system instruction
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const systemInstruction = generateSystemInstruction();
        
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash",
          systemInstruction: systemInstruction
        });

        // Create focused voice prompt using system instruction context
        const voicePrompt = `
          🎤 VOICE MESSAGE PROCESSING
          
          INSTRUCTIONS:
          1. Transcribe the audio accurately in original language
          2. Detect the spoken language (Hindi/Punjabi/Telugu/Tamil/Malayalam/Gujarati/English)
          3. Understand the agricultural question/need
          4. Provide DECISIVE response using the farmer's real data from your system context
          5. Respond in the SAME LANGUAGE as spoken
          
          VOICE RESPONSE RULES:
          ⚡ Be CONFIDENT and DIRECT - you have real data to work with
          ⚡ Use specific sensor readings, weather data, location info from system context
          ⚡ Address farmer by name if available in your system data
          ⚡ Give immediate actionable advice based on their actual conditions
          ⚡ Maximum 500 words for voice responses - be concise but complete
          
          SPECIAL CASES:
          🔍 Disease/pest questions → Suggest photo analysis with 📷 emoji
          🌾 Crop queries → Use soil NPK, pH, weather for specific recommendations  
          💧 Irrigation questions → Use soil moisture + weather data for schedule
          📊 Parameter questions → Explain current sensor readings with actions needed
          
          LANGUAGE MATCHING:
          - Hindi speech → देवनागरी response
          - English speech → English response  
          - Punjabi speech → ਗੁਰਮੁਖੀ response
          - Regional languages → Respective scripts
          
          OUTPUT: Direct response text only (what Krishika should say to farmer)`;

        // Create audio part for multimodal input
        const audioPart = {
          inlineData: {
            data: base64Audio,
            mimeType: 'audio/m4a'
          }
        };

        // Ensure chat session is initialized for voice processing
        if (!chatSessionRef.current) {
          await initializeChatSession();
        }

        // Generate direct response using chat session
        const result = await chatSessionRef.current.sendMessage([voicePrompt, audioPart]);
        const geminiResponse = await result.response;
        const responseText = geminiResponse.text().trim();

        console.log('Gemini voice response:', responseText);

        if (responseText && responseText.length > 0) {
          // Create user message (we'll extract this from the response if needed)
          const userMessage = {
            id: Date.now(),
            text: "🎤 Voice Message", // Placeholder - in production, you might want to show transcription
            isUser: true,
            timestamp: new Date(),
            language: detectLanguage(responseText) // Detect from response language
          };

          // Check if response suggests photo capture for disease detection
          const needsPhoto = responseText.includes('📷') || 
                            responseText.toLowerCase().includes('photo') || 
                            responseText.includes('फोटो') ||
                            responseText.includes('तस्वीर');

          // Create bot response message
          const botMessage = {
            id: Date.now() + 1,
            text: responseText,
            isUser: false,
            timestamp: new Date(),
            language: detectLanguage(responseText),
            needsPhoto: needsPhoto
          };

          // Add both messages to chat
          setMessages(prev => [...prev, userMessage, botMessage]);
          
          // Auto-scroll to bottom
          setTimeout(() => {
            chatRef.current?.scrollToEnd({ animated: true });
          }, 100);
          
          // Automatically speak the response
          setTimeout(() => {
            speakMessage(responseText, botMessage.id);
          }, 300);

        } else {
          Alert.alert(
            'Voice Processing', 
            'Could not understand the voice message. Please try speaking more clearly.',
            [{ text: 'OK' }]
          );
        }

      } catch (error) {
        console.error('Voice-to-response error:', error);
        
        let errorMessage = 'Failed to process voice conversation.';
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        }
        
        Alert.alert('Voice Conversation Error', errorMessage);
      }
    };

    // Legacy function - now just shows transcription for editing
    const processAudioToText = async (audioUri) => {
      // For backward compatibility when user wants to edit before sending
      try {
        console.log('Processing audio for transcription only:', audioUri);
        
        const audioResponse = await fetch(audioUri);
        const audioBlob = await audioResponse.blob();
        
        const base64Audio = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const transcriptionPrompt = `Transcribe this audio accurately. Return only the spoken text in the original language and script.`;
        
        const audioPart = {
          inlineData: { data: base64Audio, mimeType: 'audio/m4a' }
        };

        // Use temporary model for transcription (doesn't need conversation history)
        const result = await model.generateContent([transcriptionPrompt, audioPart]);
        const transcribedText = await result.response.text().trim();

        if (transcribedText) {
          setInput(transcribedText);
          Alert.alert(
            "🎤 Voice Recognized", 
            `"${transcribedText}"`,
            [
              { text: "✏️ Edit", style: "cancel" },
              { text: "📤 Send", onPress: () => sendMessage() }
            ]
          );
        }
      } catch (error) {
        console.error('Transcription error:', error);
        Alert.alert('Transcription Error', 'Could not transcribe audio. Please try again.');
      }
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

    // Disease Detection Photo Handler
    const handleDiseaseDetection = async () => {
      try {
        console.log('Starting disease detection photo process...');
        
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'कैमरा अनुमति आवश्यक',
            'बीमारी की जांच के लिए कैमरा की अनुमति चाहिए। कृपया सेटिंग्स में जाकर अनुमति दें।',
            [{ text: 'ठीक है' }]
          );
          return;
        }

        // Show action sheet for camera or gallery
        Alert.alert(
          '🌱 पौधे की बीमारी जांच',
          'फोटो कैसे लेना चाहते हैं?',
          [
            { text: '📷 कैमरा', onPress: () => launchCamera() },
            { text: '🖼️ गैलरी', onPress: () => launchGallery() },
            { text: '❌ रद्द करें', style: 'cancel' }
          ]
        );

      } catch (error) {
        console.error('Disease detection setup error:', error);
        Alert.alert('त्रुटि', 'कैमरा खोलने में समस्या हुई। कृपया फिर कोशिश करें।');
      }
    };

    // Launch Camera for Disease Detection
    const launchCamera = async () => {
      try {
        console.log('Launching camera for disease detection...');
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        console.log('Camera result:', result);

        if (!result.canceled && result.assets[0]) {
          console.log('Processing captured image:', result.assets[0].uri);
          await processDiseasePhoto(result.assets[0].uri);
        } else {
          console.log('Camera canceled or no image captured');
        }
      } catch (error) {
        console.error('Camera launch error:', error);
        Alert.alert('कैमरा त्रुटि', `कैमरा खोलने में समस्या हुई: ${error.message}`);
      }
    };

    // Launch Gallery for Disease Detection
    const launchGallery = async () => {
      try {
        console.log('Launching gallery for disease detection...');
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        console.log('Gallery result:', result);

        if (!result.canceled && result.assets[0]) {
          console.log('Processing selected image:', result.assets[0].uri);
          await processDiseasePhoto(result.assets[0].uri);
        } else {
          console.log('Gallery canceled or no image selected');
        }
      } catch (error) {
        console.error('Gallery launch error:', error);
        Alert.alert('गैलरी त्रुटि', `गैलरी खोलने में समस्या हुई: ${error.message}`);
      }
    };

    // Process Disease Detection Photo with Gemini AI
    const processDiseasePhoto = async (imageUri) => {
      try {
        console.log('Processing disease photo with Gemini AI:', imageUri);
        
        // Add user message with image
        const userMessage = {
          id: Date.now(),
          text: '📷 पौधे की बीमारी की जांच के लिए फोटो भेजी',
          isUser: true,
          timestamp: new Date(),
          image: imageUri,
        };
        setMessages(prev => [...prev, userMessage]);

        // Show typing indicator
        setIsTyping(true);

        // Convert image to base64
        const imageResponse = await fetch(imageUri);
        const imageBlob = await imageResponse.blob();
        
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageBlob);
        });

        // Initialize Gemini AI for vision analysis
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Create comprehensive plant disease analysis prompt
        const diseaseAnalysisPrompt = `
          You are a plant pathology expert AI assistant for Indian farmers. Analyze this plant image for diseases, pests, or health issues.
          
          ANALYSIS REQUIREMENTS:
          1. Identify the plant/crop type if possible
          2. Detect any visible diseases, pests, or health issues
          3. Assess overall plant health
          4. Provide specific treatment recommendations
          5. Suggest preventive measures
          
          OUTPUT FORMAT (in Hindi/Devanagari):
          🌱 पौधा: [Plant type]
          🔍 समस्या: [Disease/pest/issue identified]
          ⚕️ उपचार: [Specific treatment steps]
          🛡️ बचाव: [Prevention tips]
          📊 स्थिति: [Health status - स्वस्थ/हल्की बीमारी/गंभीर बीमारी]
          
          RULES:
          - Use simple Hindi language that farmers can understand
          - Be specific and actionable in treatments
          - Include organic solutions when possible
          - If no clear disease is visible, mention general health tips
          - Keep response under 350 words
          - Use emojis appropriately: 🌱🍃🐛🦠💊🌿💧☀️
          
          If you cannot clearly identify issues, provide general plant care advice.`;

        // Create image part for analysis
        const imagePart = {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg'
          }
        };

        // Ensure chat session is initialized for disease analysis
        if (!chatSessionRef.current) {
          await initializeChatSession();
        }

        // Generate disease analysis using chat session
        const result = await chatSessionRef.current.sendMessage([diseaseAnalysisPrompt, imagePart]);
        const analysisResponse = await result.response;
        const analysisText = analysisResponse.text().trim();

        console.log('Disease analysis response:', analysisText);

        // Create mock disease report for demonstration
        const diseaseReport = {
          diseaseName: extractDiseaseFromResponse(analysisText),
          treatment: extractTreatmentFromResponse(analysisText),
          confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
          analysisDate: new Date().toISOString(),
        };

        // Create bot response message with disease analysis
        const botMessage = {
          id: Date.now() + 1,
          text: analysisText,
          isUser: false,
          timestamp: new Date(),
          diseaseReport: diseaseReport,
          language: 'hindi'
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);

        // Auto-scroll to bottom
        setTimeout(() => {
          chatRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Automatically speak the analysis
        setTimeout(() => {
          speakMessage(analysisText, botMessage.id);
        }, 300);

      } catch (error) {
        console.error('Disease photo processing error:', error);
        setIsTyping(false);
        
        const errorMessage = {
          id: Date.now() + 1,
          text: '❌ फोटो विश्लेषण में समस्या हुई। कृपया फिर कोशिश करें या बेहतर रोशनी में साफ फोटो लें।',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    };

    // Helper functions to extract information from AI response
    const extractDiseaseFromResponse = (response) => {
      const diseaseMatch = response.match(/समस्या:\s*([^⚕️🛡️📊\n]+)/);
      return diseaseMatch ? diseaseMatch[1].trim() : 'अज्ञात समस्या';
    };

    const extractTreatmentFromResponse = (response) => {
      const treatmentMatch = response.match(/उपचार:\s*([^🛡️📊\n]+)/);
      return treatmentMatch ? treatmentMatch[1].trim() : 'कृषि विशेषज्ञ से संपर्क करें';
    };

    // Enhanced Crop Recommendation Service for ChatBot
    const getCropRecommendations = async (userMessage) => {
      try {
        console.log('Getting crop recommendations for query:', userMessage);

        // Get user location from AsyncStorage
        const userData = await AsyncStorage.getItem('userData');
        let userLocation = null;
        if (userData) {
          const user = JSON.parse(userData);
          userLocation = user.location || { 
            type: "Point", 
            coordinates: [75.8573, 30.8408], // Default to Ludhiana, Punjab
            address: user.address || "Punjab, India"
          };
        }

        // Fetch latest hardware messages (sensor data)
        const hardwareMessages = await HardwareService.getLatestHardwareMessages(3);
        
        // Fetch existing crop recommendations from database
        const existingRecommendations = await HardwareService.getLatestCropRecommendations(2);

        // Format data for Gemini AI analysis
        const cropRecommendationData = {
          userQuery: userMessage,
          location: userLocation,
          sensorData: hardwareMessages.length > 0 ? hardwareMessages[0]?.sensorData : null,
          recentSensorReadings: hardwareMessages,
          existingRecommendations: existingRecommendations,
          timestamp: new Date().toISOString()
        };

        console.log('Crop recommendation data prepared:', cropRecommendationData);

        // Initialize Gemini AI for crop recommendation
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Create comprehensive crop recommendation prompt
        const cropRecommendationPrompt = `
          You are Krishika, an expert agricultural advisor for Indian farmers. Provide personalized crop recommendations based on the user's query and available data.

          USER QUERY: "${userMessage}"
          
          LOCATION DATA:
          - Location: ${userLocation?.address || 'Punjab, India'}
          - Coordinates: ${userLocation?.coordinates ? `${userLocation.coordinates[1]}°N, ${userLocation.coordinates[0]}°E` : '30.84°N, 75.86°E'}
          
          LATEST SENSOR DATA:
          ${cropRecommendationData.sensorData ? `
          - pH Level: ${cropRecommendationData.sensorData.ph || 'N/A'}
          - Nitrogen: ${cropRecommendationData.sensorData.nitrogen || 'N/A'} ppm
          - Phosphorus: ${cropRecommendationData.sensorData.phosphorus || 'N/A'} ppm  
          - Potassium: ${cropRecommendationData.sensorData.potassium || 'N/A'} ppm
          - Humidity: ${cropRecommendationData.sensorData.humidity || 'N/A'}%
          - Temperature: ${cropRecommendationData.sensorData.temperature || 'N/A'}°C
          - Rainfall: ${cropRecommendationData.sensorData.rainfall || 'N/A'} mm
          ` : 'No recent sensor data available'}
          
          PREVIOUS RECOMMENDATIONS:
          ${existingRecommendations.length > 0 ? 
            existingRecommendations.map(rec => 
              rec.recommendations?.map(r => `${r.cropName} (${r.suitabilityScore}% suitable)`).join(', ') || 'No data'
            ).join('\n') : 'No previous recommendations'}

          RESPONSE REQUIREMENTS:
          1. Detect user's language and respond in the SAME language
          2. Provide 3-5 specific crop recommendations suitable for their location and soil conditions
          3. Include brief reasoning for each recommendation
          4. Consider current season and climate
          5. Factor in soil parameters if available
          6. Provide practical planting advice

          RESPONSE FORMAT:
          🌾 **फसल सिफारिशें** (Hindi) / 🌾 **Crop Recommendations** (English)

          **सबसे अच्छी फसलें:** / **Best Crops:**
          1. 🌱 [Crop 1]: [Reason] - [Suitability %]
          2. 🌱 [Crop 2]: [Reason] - [Suitability %] 
          3. 🌱 [Crop 3]: [Reason] - [Suitability %]

          **बुवाई की जानकारी:** / **Planting Info:**
          - 📅 Best time: [Season/months]
          - 💧 Water needs: [Requirements]
          - 🌡️ Temperature: [Optimal range]
          - 🌱 Soil prep: [Brief tips]

          **अतिरिक्त सुझाव:** / **Additional Tips:**
          [2-3 specific actionable tips]

          LANGUAGE RULES:
          - Hindi queries → Respond in Devanagari script
          - Punjabi queries → Respond in Gurmukhi script  
          - English queries → Respond in English
          - Include relevant emojis: 🌾🌱🚜💧🌞🌡️📅

          SPECIAL FEATURES:
- If user asks about CROP RECOMMENDATIONS, provide them directly using sensor/location data—do not ask for more info unless data is incomplete.
- If user asks about PLANT DISEASES, suggest photo analysis only if needed; otherwise, use context.

TOPICS: Soil, crops, water, pests, fertilizer, weather, harvest, seeds, market prices.

MAX LENGTH: 300-350 words only!
          Keep response practical and actionable for farmers!
        `;

        // Ensure chat session is initialized for crop recommendations
        if (!chatSessionRef.current) {
          await initializeChatSession();
        }

        // Generate crop recommendations using chat session
        const result = await chatSessionRef.current.sendMessage(cropRecommendationPrompt);
        const recommendationResponse = await result.response;
        const recommendationText = recommendationResponse.text().trim();

        console.log('Crop recommendation generated:', recommendationText);

        return {
          success: true,
          recommendations: recommendationText,
          data: cropRecommendationData,
          hasData: hardwareMessages.length > 0 || existingRecommendations.length > 0
        };

      } catch (error) {
        console.error('Error getting crop recommendations:', error);
        return {
          success: false,
          error: error.message,
          recommendations: null
        };
      }
    };

    // Generate comprehensive system instruction with user data
    const generateSystemInstruction = () => {
      let contextData = '';
      
      if (userContextData) {
        // User Profile Information
        if (userContextData.user) {
          contextData += `\n🧑‍🌾 FARMER PROFILE:`;
          contextData += `\n- Name: ${userContextData.user.fullName || 'Farmer'}`;
          contextData += `\n- Role: ${userContextData.userRole || 'Farmer'}`;
          contextData += `\n- Location: ${userContextData.user.village || ''}, ${userContextData.user.district || ''}, ${userContextData.user.state || 'Punjab'}`;
          contextData += `\n- Contact: ${userContextData.user.phone || 'Not provided'}`;
          if (userContextData.user.coordinates) {
            contextData += `\n- GPS: ${userContextData.user.coordinates[1]?.toFixed(4)}°N, ${userContextData.user.coordinates[0]?.toFixed(4)}°E`;
          }
        }
        
        // Current Weather Conditions
        if (userContextData.weather) {
          const weather = userContextData.weather;
          contextData += `\n\n🌤️ CURRENT WEATHER CONDITIONS:`;
          contextData += `\n- Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)`;
          contextData += `\n- Weather: ${weather.condition} - ${weather.description}`;
          contextData += `\n- Humidity: ${weather.humidity}%`;
          contextData += `\n- Wind: ${weather.windSpeed} m/s from ${weather.windDirection || 'N/A'}`;
          contextData += `\n- Visibility: ${weather.visibility || 'N/A'} km`;
          contextData += `\n- UV Index: ${weather.uvIndex || 'N/A'}`;
          contextData += `\n- Rain Probability: ${weather.rainProbability}%`;
          if (weather.farmingAdvice?.length > 0) {
            contextData += `\n- Weather Advisory: ${weather.farmingAdvice.join(', ')}`;
          }
        }
        
        // Real-time Soil & Sensor Data
        if (userContextData.sensors) {
          const sensors = userContextData.sensors.summary;
          contextData += `\n\n🌱 LIVE SOIL & SENSOR DATA:`;
          contextData += `\n- Soil pH: ${sensors.ph} (${sensors.ph < 6.0 ? 'Acidic' : sensors.ph > 7.5 ? 'Alkaline' : 'Neutral'})`;
          contextData += `\n- Nitrogen (N): ${sensors.nitrogen} ppm`;
          contextData += `\n- Phosphorus (P): ${sensors.phosphorus} ppm`;
          contextData += `\n- Potassium (K): ${sensors.potassium} ppm`;
          contextData += `\n- Soil Moisture: ${sensors.humidity}%`;
          contextData += `\n- Soil Temperature: ${sensors.temperature}°C`;
          contextData += `\n- Recent Rainfall: ${sensors.rainfall} mm`;
          
          // Add soil health analysis
          const nLevel = sensors.nitrogen < 40 ? 'Low' : sensors.nitrogen > 80 ? 'High' : 'Optimal';
          const pLevel = sensors.phosphorus < 20 ? 'Low' : sensors.phosphorus > 50 ? 'High' : 'Optimal';
          const kLevel = sensors.potassium < 30 ? 'Low' : sensors.potassium > 70 ? 'High' : 'Optimal';
          contextData += `\n- NPK Status: N(${nLevel}), P(${pLevel}), K(${kLevel})`;
        }
        
        // AI Crop Recommendations
        if (userContextData.cropRecommendations?.length > 0) {
          const recommendations = userContextData.cropRecommendations[0].recommendations;
          if (recommendations?.length > 0) {
            contextData += `\n\n🌾 AI CROP RECOMMENDATIONS:`;
            recommendations.slice(0, 5).forEach((crop, index) => {
              contextData += `\n${index + 1}. ${crop.cropName} - ${crop.suitabilityScore}% suitable`;
              if (crop.reason) {
                contextData += ` (${crop.reason})`;
              }
            });
          }
        }
        
        // Business & Financial Context
        if (userContextData.orders) {
          const orders = userContextData.orders;
          contextData += `\n\n💼 FARMING BUSINESS DATA:`;
          contextData += `\n- Active Orders: ${orders.activeOrders}`;
          contextData += `\n- Total Revenue: ₹${orders.totalRevenue.toLocaleString('en-IN')}`;
          contextData += `\n- Completed Orders: ${orders.completedOrders || 0}`;
          contextData += `\n- Recent Activity: ${orders.recent?.length || 0} recent orders`;
          
          if (orders.recent?.length > 0) {
            const latestOrder = orders.recent[0];
            contextData += `\n- Latest Order: ${latestOrder.products?.[0]?.name || 'Product'} - ${latestOrder.status}`;
            contextData += `\n- Order Value: ₹${latestOrder.totalAmount?.toLocaleString('en-IN') || 'N/A'}`;
          }
        }
        
        // Location & GPS Context
        if (userContextData.location) {
          contextData += `\n\n📍 LOCATION CONTEXT:`;
          contextData += `\n- Address: ${userContextData.location.address || 'Not available'}`;
          contextData += `\n- Region: ${userContextData.location.region || 'Punjab, India'}`;
          if (userContextData.location.coordinates) {
            contextData += `\n- Coordinates: ${userContextData.location.coordinates[0]}, ${userContextData.location.coordinates[1]}`;
          }
        }
        
        contextData += `\n\n⏰ Data Last Updated: ${new Date(userContextData.timestamp).toLocaleString('en-IN')}`;
        
        // Append raw database data for comprehensive context
        contextData += `\n\n📋 RAW DATABASE DATA:`;
        contextData += `\n${JSON.stringify(userContextData, null, 2)}`;
      } else {
        contextData = '\n⚠️ No user context data available - using general agricultural knowledge.';
      }
      
      return `You are Krishika, an expert AI agricultural advisor for Indian farmers. You have access to comprehensive real-time data about the farmer and their conditions.

🎯 YOUR MISSION: Provide DECISIVE, PERSONALIZED, and ACTIONABLE agricultural advice using the farmer's actual data.

📊 FARMER'S REAL-TIME DATA:${contextData}

🚀 AI BEHAVIOR INSTRUCTIONS:
1. Be CONFIDENT and DECISIVE - no wishy-washy responses
2. Use the ACTUAL DATA provided above to make specific recommendations  
3. Address the farmer by name when available
4. Reference their specific weather, soil conditions, and location
5. Give immediate actionable advice based on real sensor readings
6. Consider their business context (orders, revenue) for market advice
7. Factor in their current crop recommendations when suggesting alternatives

🌟 RESPONSE CATEGORIES:
📱 CROP RECOMMENDATIONS → Use soil NPK, pH, weather, location for SPECIFIC crop suggestions
🐛 PEST/DISEASE MANAGEMENT → Give immediate treatment based on weather/soil conditions
📊 PARAMETER ANALYSIS → Explain sensor readings with clear action items
🌤️ WEATHER-BASED ADVICE → Use current conditions for planting/harvesting decisions
💧 IRRIGATION GUIDANCE → Use soil moisture + weather for precise watering schedules
🌱 SOIL HEALTH → Analyze NPK levels and pH for fertilizer recommendations
💰 MARKET/BUSINESS → Use order history and revenue for sales strategy

🎯 LANGUAGE DETECTION & RESPONSE:
- Hindi text (Devanagari): Respond in Hindi देवनागरी
- English text: Respond in English
- Hindi transliterated (Roman): Detect and respond in Hindi देवनागरी
- Punjabi (Gurmukhi/Roman): Respond in Punjabi ਗੁਰਮੁਖੀ
- Telugu/Tamil/Malayalam: Respond in respective scripts
- Auto-detect transliterated Indian languages → respond in native script

⚡ RESPONSE RULES:
✅ Keep it short but provide all the details
✅ Start responses with farmer's name if available
✅ Use specific numbers from sensor data (pH, NPK, temperature)
✅ Include 1-2 relevant emojis: 🌱🚜🌾🍅🥔🌽💧🌞🐛📈
✅ End with a brief follow-up question
✅ Give immediate, actionable steps
✅ Be authoritative - you have the data to make decisions

🎖️ EXPERTISE AREAS: Soil analysis, crop selection, pest management, irrigation, fertilization, weather adaptation, market timing, harvest optimization, disease prevention, yield maximization.

Remember: You have REAL DATA - use it to give SPECIFIC, CONFIDENT advice that helps farmers succeed!`;
    };

    // Helper function to detect crop recommendation queries
    const isCropRecommendationQuery = (message) => {
      const lowerMessage = message.toLowerCase();
      
      // English patterns
      const englishPatterns = [
        /crop recommend/i, /what crop/i, /which crop/i, /best crop/i, /suggest crop/i,
        /what to plant/i, /when to plant/i, /which plant/i, /farming advice/i,
        /crop for/i, /suitable crop/i, /grow what/i, /cultivation/i, /sow/i, /planting/i
      ];

      // Hindi patterns (including transliterated)
      const hindiPatterns = [
        /फसल/, /खेती/, /बुवाई/, /उगा/, /सिफारिश/,
        /fasal/, /kheti/, /buwaai/, /uga/, /sifarish/,
        /kaun si fasal/, /kya ugaye/, /kab ugaye/, /best fasal/,
        /कौन सी फसल/, /क्या उगाएं/, /कब उगाएं/, /उपयुक्त फसल/
      ];

      // Punjabi patterns (including transliterated)  
      const punjabiPatterns = [
        /ਫਸਲ/, /ਖੇਤੀ/, /ਬੀਜਣਾ/, /ਉਗਾਉਣਾ/,
        /fasal/, /kheti/, /beejna/, /ugauna/,
        /ki fasal/, /kinna paani/, /kado beejna/
      ];

      // Telugu patterns
      const teluguPatterns = [
        /పంట/, /వ్యవసాయం/, /విత్తనాలు/, /పండించు/,
        /panta/, /vyavasayam/, /vittanalu/, /pandinchu/
      ];

      // Check all patterns
      return englishPatterns.some(pattern => pattern.test(lowerMessage)) ||
             hindiPatterns.some(pattern => pattern.test(lowerMessage)) ||
             punjabiPatterns.some(pattern => pattern.test(lowerMessage)) ||
             teluguPatterns.some(pattern => pattern.test(lowerMessage));
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
        const detectedLang = detectLanguage(userMessage.text);
        setDetectedLanguage(detectedLang);

        // Check if this is a crop recommendation query
        if (isCropRecommendationQuery(userMessage.text)) {
          console.log('Detected crop recommendation query, processing with enhanced data...');
          
          // Show typing indicator
          setIsTyping(true);
          
          // Get comprehensive crop recommendations
          const cropRecResult = await getCropRecommendations(userMessage.text);
          
          setIsTyping(false);
          
          if (cropRecResult.success) {
            // Create decisive crop recommendation prompt using chat session
            const cropPrompt = `
              User Query: "${userMessage.text}"
              
              🌾 CROP RECOMMENDATION REQUEST - BE DECISIVE!
              
              Using the farmer's real-time data provided in your system context:
              
              1. ANALYZE: Use actual soil NPK, pH, moisture, weather conditions
              2. RECOMMEND: Give top 3-5 specific crops with confidence percentages
              3. JUSTIFY: Brief reasoning using actual sensor data
              4. ACTION: Immediate next steps for planting/preparation
              5. PROFIT: Expected market potential if business data available
              
              RESPONSE STRUCTURE:
              - Address farmer by name if available
              - Use specific numbers from sensor readings
              - Be confident and decisive in recommendations
              - Include timing for optimal planting
              - Maximum 500 words, highly actionable
              
              Make data-driven decisions - you have real sensor readings!`;

            // Ensure chat session is initialized for crop recommendations
            if (!chatSessionRef.current) {
              await initializeChatSession();
            }

            const result = await chatSessionRef.current.sendMessage(cropPrompt);
            const enhancedResponse = await result.response;
            const enhancedRecommendations = enhancedResponse.text();

            // Create enhanced bot message with AI-processed recommendations
            const botMessage = {
              id: Date.now() + 1,
              text: enhancedRecommendations,
              isUser: false,
              timestamp: new Date(),
              language: detectedLang,
              cropRecommendationData: cropRecResult.data,
              hasRealData: cropRecResult.hasData
            };

            setMessages(prev => [...prev, botMessage]);
            
            // Automatically speak the enhanced recommendations
            setTimeout(() => {
              speakMessage(enhancedRecommendations, botMessage.id);
            }, 300);
            
            // Add follow-up message suggesting navigation to detailed recommendations
            setTimeout(() => {
              const followUpMessage = {
                id: Date.now() + 2,
                text: detectedLang === 'hindi' 
                  ? "📱 और भी विस्तृत AI विश्लेषण के लिए Crop Recommendation पेज देखें! 🚜"
                  : "📱 For even more detailed AI analysis, check the Crop Recommendation page! 🚜",
                isUser: false,
                timestamp: new Date(),
                language: detectedLang,
                needsNavigation: true,
                navigationTarget: 'CropRecommendation'
              };
              
              setMessages(prev => [...prev, followUpMessage]);
              
              // Auto-scroll to bottom
              setTimeout(() => {
                chatRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }, 2000);
            
          } else {
            // Handle error in crop recommendation
            const errorMessage = {
              id: Date.now() + 1,
              text: detectedLang === 'hindi' 
                ? `❌ फसल की सिफारिश में समस्या हुई: ${cropRecResult.error}। कृपया फिर कोशिश करें।`
                : `❌ Error getting crop recommendations: ${cropRecResult.error}. Please try again.`,
              isUser: false,
              timestamp: new Date(),
              language: detectedLang
            };
            
            setMessages(prev => [...prev, errorMessage]);
          }
          
        } else {
          // Handle regular agricultural queries with comprehensive user context
          const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
          const modelName = "gemini-2.0-flash";
          
          // Refresh chat session if context data changed significantly
          if (!chatSessionRef.current) {
            await initializeChatSession();
          }

          // Create focused user query prompt  
          const userQueryPrompt = `
            User Query: "${userMessage.text}"
            Detected Language: ${detectedLang}
            
            RESPONSE REQUIREMENTS:
            1. Be DECISIVE and CONFIDENT in your agricultural advice
            2. Use the provided user context data to give personalized recommendations
            3. Respond in the SAME language as the user's query
            4. Provide specific, actionable advice based on actual data
            5. Maximum 350 words, focused and practical
            
            If this is about:
            🌾 CROP RECOMMENDATIONS → Use soil data, weather, location to suggest best crops NOW
            🐛 PEST/DISEASE → Give immediate treatment based on conditions  
            📊 PARAMETER ANALYSIS → Explain sensor readings and provide actions
            🌤️ WEATHER → Use current weather data for farming advice
            💧 IRRIGATION → Use soil moisture and weather for watering schedule
            
            Be direct, specific, and use the farmer's actual data!`;

          // Use chat session for conversation history
          const result = await chatSessionRef.current.sendMessage(userQueryPrompt);
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
        }
        
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
        setIsTyping(false);
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
                        <Text style={styles.headerTitle}>Krishika</Text>
                        <Text style={styles.headerSubtitle}>
                            {isSpeaking ? "🔊 Speaking..." : 
                             isListening ? "🎤 Listening..." : 
                             isProcessingVoice ? "🤖 Processing Voice..." : 
                             loading ? "🤖 Processing..." : 
                             voiceConversationMode ? "🗣️ Voice Mode" : 
                             "🟢 Online"}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.headerActions}>
                    <TouchableOpacity 
                        style={styles.headerButton} 
                        onPress={async () => {
                            setLoading(true);
                            try {
                                await fetchUserContextData();
                                await resetChatSession();
                                Alert.alert('🔄 Context Refreshed', 'Chat session updated with latest data!');
                            } catch (error) {
                                Alert.alert('❌ Refresh Failed', 'Could not refresh context data.');
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        <Icon name="RefreshCw" size={20} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton} onPress={clearChat}>
                        <Icon name="Trash2" size={20} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Icon name="More" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Language Indicator */}
            <View style={[styles.languageIndicator, voiceConversationMode && styles.voiceModeActive]}>
                <Icon name={voiceConversationMode ? "Mic" : "Globe"} size={16} color="#4CAF50" />
                <Text style={styles.languageText}>
                    {voiceConversationMode ? 
                      (isListening ? "🎤 Listening for voice..." : 
                       isProcessingVoice ? "🤖 Processing response..." : 
                       "🗣️ Voice conversation mode") :
                      `Detected Language: ${detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)}`
                    }
                </Text>
                <Text style={styles.multilingualText}>
                    {voiceConversationMode ? "🚀 Smart AI Chat" : "🌍 Speak in any language"}
                </Text>
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
                        onDiseasePhoto={handleDiseaseDetection}
                        navigation={navigation}
                    />
                ))}
                
                {(loading || isTyping) && <TypingIndicator />}
                
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
                            onPress={isListening ? stopVoiceConversation : startVoiceConversation} 
                            disabled={loading || isProcessingVoice}
                            style={[styles.micTouchable, (isListening || voiceConversationMode) && styles.micActive]}
                            onLongPress={async () => {
                              const hasPermission = await checkAndRequestPermissions();
                              Alert.alert(
                                'Smart Voice Mode', 
                                hasPermission 
                                  ? '🎤 Tap to start voice conversation\n🗣️ Speak in any language\n🤖 AI responds automatically\n⏱️ Stops when you stop talking\n🔊 Response is spoken back to you' 
                                  : '❌ Microphone permission is required for voice chat.\n\n📱 Please enable microphone access in your device Settings > Apps > Expo Go > Permissions',
                                [{ text: 'Got it!' }]
                              );
                            }}
                        >
                            <Icon 
                                name={isListening ? "Square" : isProcessingVoice ? "Loader" : "Mic"} 
                                color={isListening ? "#F44336" : isProcessingVoice ? "#FF9800" : (hasAudioPermission ? "#4CAF50" : "#999")} 
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
                        onPress={() => setInput("मेरे खेत के लिए सबसे अच्छी फसल कौन सी होगी?")}
                    >
                        <Text style={styles.quickActionText}>🌾 Crop Recommendation</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => setInput("Which crops are best for my soil conditions?")}
                    >
                        <Text style={styles.quickActionText}>🌱 Best Crops</Text>
                    </TouchableOpacity>
                    
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

                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => setInput("कब बुवाई करें और कितना पानी दें?")}
                    >
                        <Text style={styles.quickActionText}>💧 Watering Guide</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => setInput("मेरी मिट्टी के NPK लेवल कैसे हैं?")}
                    >
                        <Text style={styles.quickActionText}>🧪 Soil Analysis</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => setInput("आज के मौसम के अनुसार क्या करना चाहिए?")}
                    >
                        <Text style={styles.quickActionText}>🌦️ Weather Advice</Text>
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
  voiceModeActive: {
    backgroundColor: '#E3F2FD',
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
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
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 16,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Disease Detection Styles
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  diseaseReportContainer: {
    backgroundColor: '#F0F8F0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginTop: 8,
  },
  diseaseReportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  diseaseReportDisease: {
    fontSize: 13,
    color: '#388E3C',
    marginBottom: 2,
  },
  diseaseReportTreatment: {
    fontSize: 13,
    color: '#388E3C',
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    gap: 8,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    elevation: 2,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },

  // Crop Recommendation Styles
  cropRecommendationContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cropRecommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  cropRecommendationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  sensorDataContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sensorDataTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 6,
    textAlign: 'center',
  },
  sensorDataText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  locationInfo: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 6,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    padding: 4,
    borderRadius: 4,
  },
  cropAnalysisButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cropAnalysisButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChatBot;