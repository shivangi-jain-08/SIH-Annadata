import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Linking,
  Animated,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const Contact = () => {
  const navigation = useNavigation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name')
      return false
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address')
      return false
    }
    if (!formData.subject.trim()) {
      Alert.alert('Validation Error', 'Please enter a subject')
      return false
    }
    if (!formData.message.trim()) {
      Alert.alert('Validation Error', 'Please enter your message')
      return false
    }
    return true
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    
    try {
      // For now, just log the data
      const submissionData = {
        ...formData,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      }
      
      console.log('Contact Form Submission:', submissionData)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      Alert.alert(
        'Message Sent!',
        'Thank you for contacting us. We will get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
              })
            }
          }
        ]
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Voice input simulation (since actual voice recognition requires additional setup)
  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
      
      // Simulate voice-to-text result
      const voiceMessages = [
        "I need help with crop disease detection feature.",
        "The weather forecast is not showing correctly in my area.",
        "I want to know more about your premium services.",
        "There is an issue with my order status.",
        "Can you help me understand how to use the AI features?"
      ]
      
      const randomMessage = voiceMessages[Math.floor(Math.random() * voiceMessages.length)]
      setFormData(prev => ({
        ...prev,
        message: prev.message + (prev.message ? ' ' : '') + randomMessage
      }))
      
      Alert.alert('Voice Input', 'Voice message added to your text!')
    } else {
      // Start recording
      setIsRecording(true)
      
      // Pulse animation for recording state
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isRecording) pulse()
        })
      }
      pulse()
      
      Alert.alert('Voice Recording', 'Speak your message. Tap the microphone again to stop.')
    }
  }

  // Social media handlers
  const handleSocialMedia = (platform) => {
    const urls = {
      instagram: 'https://www.instagram.com/annadata_official',
      facebook: 'https://www.facebook.com/annadata.official',
      twitter: 'https://twitter.com/annadata_tech',
      linkedin: 'https://www.linkedin.com/company/annadata-technologies',
      youtube: 'https://www.youtube.com/c/annadatatech',
      whatsapp: 'https://wa.me/919876543210'
    }
    
    Linking.openURL(urls[platform]).catch(() => {
      Alert.alert('Error', `Could not open ${platform}. Please try again later.`)
    })
  }

  // Phone and email handlers
  const handleCall = () => {
    Linking.openURL('tel:+919876543210')
  }

  const handleEmail = () => {
    Linking.openURL('mailto:support@annadata.com')
  }

  const ContactInfoCard = ({ icon, title, subtitle, onPress, iconColor = '#4CAF50' }) => (
    <TouchableOpacity style={styles.contactInfoCard} onPress={onPress}>
      <View style={[styles.contactInfoIcon, { backgroundColor: iconColor + '20' }]}>
        <Icon name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.contactInfoContent}>
        <Text style={styles.contactInfoTitle}>{title}</Text>
        <Text style={styles.contactInfoSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="ChevronRight" size={20} color="#999" />
    </TouchableOpacity>
  )

  const SocialMediaButton = ({ icon, platform, color }) => (
    <TouchableOpacity
      style={[styles.socialButton, { backgroundColor: color + '20' }]}
      onPress={() => handleSocialMedia(platform)}
    >
      <Icon name={icon} size={24} color={color} />
    </TouchableOpacity>
  )

  const InputField = ({ label, placeholder, value, onChangeText, multiline = false, icon, keyboardType = 'default' }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon && (
          <View style={styles.inputIcon}>
            <Icon name={icon} size={20} color="#666" />
          </View>
        )}
        <TextInput
          style={[
            styles.textInput,
            multiline && styles.multilineInput,
            icon && styles.textInputWithIcon
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
          placeholderTextColor="#999"
        />
        {multiline && (
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleVoiceInput}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Icon
                name="Mic"
                size={20}
                color={isRecording ? '#F44336' : '#4CAF50'}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Get In Touch</Text>
            <Text style={styles.heroSubtitle}>
              We're here to help you with any questions or concerns about Annadata
            </Text>
          </View>

          {/* Quick Contact Options */}
          <View style={styles.quickContactSection}>
            <Text style={styles.sectionTitle}>Quick Contact</Text>
            <ContactInfoCard
              icon="Phone"
              title="Call Us"
              subtitle="+91 98765 43210"
              onPress={handleCall}
              iconColor="#4CAF50"
            />
            <ContactInfoCard
              icon="Mail"
              title="Email Us"
              subtitle="support@annadata.com"
              onPress={handleEmail}
              iconColor="#2196F3"
            />
            <ContactInfoCard
              icon="MessageCircle"
              title="WhatsApp"
              subtitle="Chat with our support team"
              onPress={() => handleSocialMedia('whatsapp')}
              iconColor="#25D366"
            />
          </View>

          {/* Contact Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Send us a Message</Text>
            <View style={styles.formContainer}>
              <InputField
                label="Full Name *"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                icon="User"
              />
              
              <InputField
                label="Email Address *"
                placeholder="Enter your email address"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                icon="Mail"
                keyboardType="email-address"
              />
              
              <InputField
                label="Phone Number"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                icon="Phone"
                keyboardType="phone-pad"
              />
              
              <InputField
                label="Subject *"
                placeholder="What is this about?"
                value={formData.subject}
                onChangeText={(text) => setFormData(prev => ({ ...prev, subject: text }))}
                icon="MessageSquare"
              />
              
              <InputField
                label="Message *"
                placeholder="Tell us more about your inquiry... You can also use the microphone to speak your message"
                value={formData.message}
                onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
                multiline={true}
              />

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Icon name={loading ? "Clock" : "Send"} size={20} color="white" />
                <Text style={styles.submitButtonText}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Social Media Section */}
          <View style={styles.socialMediaSection}>
            <Text style={styles.sectionTitle}>Follow Us</Text>
            <Text style={styles.sectionSubtitle}>
              Stay connected with us on social media for updates and tips
            </Text>
            <View style={styles.socialButtonsContainer}>
              <SocialMediaButton
                icon="Instagram"
                platform="instagram"
                color="#E4405F"
              />
              <SocialMediaButton
                icon="Facebook"
                platform="facebook"
                color="#1877F2"
              />
              <SocialMediaButton
                icon="Twitter"
                platform="twitter"
                color="#1DA1F2"
              />
              <SocialMediaButton
                icon="Linkedin"
                platform="linkedin"
                color="#0A66C2"
              />
              <SocialMediaButton
                icon="Youtube"
                platform="youtube"
                color="#FF0000"
              />
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Office Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Icon name="MapPin" size={20} color="#4CAF50" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Address</Text>
                  <Text style={styles.infoText}>
                    Annadata Technologies Private Limited{'\n'}
                    Tech Hub, Ludhiana, Punjab, India - 141001
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Icon name="Clock" size={20} color="#FF9800" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Business Hours</Text>
                  <Text style={styles.infoText}>
                    Monday - Friday: 9:00 AM - 6:00 PM (IST){'\n'}
                    Saturday: 9:00 AM - 1:00 PM (IST){'\n'}
                    Sunday: Closed
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Icon name="Headphones" size={20} color="#2196F3" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Response Time</Text>
                  <Text style={styles.infoText}>
                    Email: Within 24 hours{'\n'}
                    Phone: Immediate during business hours{'\n'}
                    WhatsApp: Within 2 hours
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* FAQ Link */}
          <View style={styles.faqSection}>
            <TouchableOpacity
              style={styles.faqButton}
              onPress={() => navigation.navigate('FAQ')}
            >
              <Icon name="HelpCircle" size={24} color="#4CAF50" />
              <View style={styles.faqContent}>
                <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
                <Text style={styles.faqSubtitle}>Find quick answers to common questions</Text>
              </View>
              <Icon name="ChevronRight" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header Styles
  header: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 15,
  },
  placeholder: {
    width: 40,
  },

  // Container Styles
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Section Styles
  quickContactSection: {
    padding: 20,
  },
  formSection: {
    padding: 20,
  },
  socialMediaSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  infoSection: {
    padding: 20,
  },
  faqSection: {
    padding: 20,
    paddingBottom: 30,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },

  // Contact Info Card
  contactInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactInfoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfoContent: {
    flex: 1,
  },
  contactInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactInfoSubtitle: {
    fontSize: 14,
    color: '#666',
  },

  // Form Styles
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  textInputWithIcon: {
    paddingLeft: 50,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingRight: 50,
  },
  voiceButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5A5A5',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Social Media Styles
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  // Info Section Styles
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // FAQ Section
  faqButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqContent: {
    flex: 1,
    marginLeft: 16,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  faqSubtitle: {
    fontSize: 14,
    color: '#666',
  },
})

export default Contact