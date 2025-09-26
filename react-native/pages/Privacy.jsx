import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const Privacy = () => {
  const navigation = useNavigation()
  const [selectedLanguage, setSelectedLanguage] = useState('English')

  const languages = [
    { key: 'English', label: 'English' },
    { key: 'Hindi', label: 'हिंदी' },
    { key: 'Punjabi', label: 'ਪੰਜਾਬੀ' }
  ]

  const privacyContent = {
    English: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: September 26, 2025',
      sections: [
        {
          title: '1. Introduction',
          content: `At Annadata Technologies Private Limited ("we," "us," or "our"), we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Annadata mobile application and related services.

By using Annadata, you consent to the data practices described in this Privacy Policy. If you do not agree with the practices described in this policy, please do not use our services.`
        },
        {
          title: '2. Information We Collect',
          content: `We collect several types of information from and about users of our services:

PERSONAL INFORMATION:
• Name, email address, phone number
• Profile information and photographs
• Location data (with your permission)
• Agricultural business details and farming practices

USAGE INFORMATION:
• App usage patterns and preferences
• Device information (model, OS version, device ID)
• Log files and analytics data
• Search queries and interaction history

AGRICULTURAL DATA:
• Crop information and farming practices
• Disease detection images and results
• Weather data requests and usage
• Product listings and transaction data

AUTOMATICALLY COLLECTED INFORMATION:
• IP address and device identifiers
• Browser type and operating system
• Time stamps and usage analytics
• Crash reports and performance data`
        },
        {
          title: '3. How We Use Your Information',
          content: `We use the collected information for various purposes:

SERVICE PROVISION:
• Provide and maintain our agricultural platform
• Enable user registration and account management
• Facilitate transactions between farmers, vendors, and consumers
• Deliver disease detection and weather services
• Send notifications and important updates

IMPROVEMENT AND ANALYTICS:
• Analyze usage patterns to improve our services
• Develop new features and functionality
• Conduct research and analytics for agricultural insights
• Optimize app performance and user experience

COMMUNICATION:
• Respond to your inquiries and provide customer support
• Send marketing communications (with your consent)
• Notify you of updates, security alerts, or changes to our services
• Facilitate communication between platform users

LEGAL AND SAFETY:
• Comply with legal obligations and regulations
• Prevent fraud, abuse, and security breaches
• Enforce our Terms of Service and other policies
• Protect the rights and safety of our users and the public`
        },
        {
          title: '4. Information Sharing and Disclosure',
          content: `We may share your information in the following circumstances:

WITH YOUR CONSENT:
• When you explicitly authorize us to share information
• For marketing communications from trusted partners
• To facilitate transactions you initiate

SERVICE PROVIDERS:
• Third-party vendors who assist in operating our platform
• Payment processors for transaction handling
• Cloud storage and hosting providers
• Analytics and marketing service providers

BUSINESS TRANSACTIONS:
• In connection with mergers, acquisitions, or asset sales
• If we are acquired by or merged with another company
• During due diligence processes (with confidentiality agreements)

LEGAL REQUIREMENTS:
• To comply with applicable laws and regulations
• In response to valid legal requests or court orders
• To protect our rights, property, or safety
• To prevent or investigate fraud or security issues

AGGREGATE DATA:
• We may share anonymized, aggregated data that cannot identify you
• For research purposes and industry insights
• To improve agricultural practices and technology`
        },
        {
          title: '5. Data Security',
          content: `We implement appropriate technical and organizational measures to protect your personal information:

TECHNICAL SAFEGUARDS:
• Encryption of data in transit and at rest
• Secure servers and databases with access controls
• Regular security audits and vulnerability assessments
• Secure authentication and authorization systems

ORGANIZATIONAL MEASURES:
• Employee training on data protection and privacy
• Access controls and need-to-know principles
• Incident response procedures for data breaches
• Regular review and updating of security policies

THIRD-PARTY SECURITY:
• Due diligence on third-party service providers
• Contractual obligations for data protection
• Regular monitoring of third-party security practices

However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.`
        },
        {
          title: '6. Location Data and Services',
          content: `Our app uses location data to provide enhanced services:

LOCATION DATA COLLECTION:
• GPS coordinates for weather services
• Regional information for crop recommendations
• Location-based agricultural insights and tips
• Proximity-based vendor and buyer matching

PERMISSIONS:
• We request explicit permission before accessing location data
• You can revoke location permissions at any time through device settings
• Some features may not function properly without location access

USAGE:
• Location data is used only for service provision
• We do not share precise location data with third parties without consent
• Location information may be used for aggregated analytics

STORAGE AND RETENTION:
• Location data is stored securely with encryption
• Historical location data may be retained for service improvement
• You can request deletion of location data at any time`
        },
        {
          title: '7. AI and Machine Learning Services',
          content: `Our AI-powered features involve specific data processing:

DISEASE DETECTION:
• Images you upload are processed by our AI systems
• We may retain images for model improvement (with your consent)
• AI analysis results are provided for informational purposes only
• Images are stored securely and not shared without permission

CROP RECOMMENDATIONS:
• Agricultural data is processed to provide personalized recommendations
• Historical data may be used to improve recommendation algorithms
• Recommendations are based on data patterns and should be verified with experts

DATA USAGE FOR AI IMPROVEMENT:
• Anonymized data may be used to train and improve our AI models
• You can opt-out of data usage for AI improvement
• AI models are regularly updated to ensure accuracy and relevance

LIMITATIONS:
• AI services are provided for guidance only
• We are not liable for decisions made based on AI recommendations
• Users should consult agricultural experts for critical farming decisions`
        },
        {
          title: '8. Your Privacy Rights',
          content: `You have several rights regarding your personal information:

ACCESS AND PORTABILITY:
• Request access to your personal information
• Obtain a copy of your data in a portable format
• Review how your information is being used

CORRECTION AND UPDATES:
• Update or correct inaccurate personal information
• Modify your profile and account settings
• Request correction of processing errors

DELETION AND ERASURE:
• Request deletion of your personal information
• Close your account and remove associated data
• Exercise "right to be forgotten" where applicable

CONSENT MANAGEMENT:
• Withdraw consent for data processing activities
• Opt-out of marketing communications
• Manage location and other permission settings

RESTRICTION AND OBJECTION:
• Restrict processing of your personal information
• Object to processing for direct marketing
• Request limitation of data usage in certain circumstances

To exercise these rights, contact us at privacy@annadata.com. We will respond to your request within 30 days.`
        },
        {
          title: '9. Data Retention',
          content: `We retain your information for as long as necessary to provide our services:

ACCOUNT INFORMATION:
• Retained while your account is active
• May be retained for up to 2 years after account closure for legal compliance
• Some information may be retained longer if required by law

TRANSACTION DATA:
• Financial transaction records retained for 7 years for tax and audit purposes
• Agricultural transaction data retained for service improvement
• Payment information handled according to payment processor policies

USAGE AND ANALYTICS DATA:
• Aggregated usage data may be retained indefinitely for research
• Individual usage patterns retained for 2 years for service improvement
• Crash reports and technical logs retained for 1 year

AI AND ML DATA:
• Images used for disease detection may be retained with consent
• Training data for AI models may be retained to maintain accuracy
• You can request deletion of AI-related data at any time

LEGAL REQUIREMENTS:
• Some data may be retained longer to comply with legal obligations
• Court orders or regulatory requirements may extend retention periods
• We will inform you of any extended retention requirements`
        },
        {
          title: '10. Children\'s Privacy',
          content: `Annadata is not intended for children under 13 years of age:

AGE RESTRICTIONS:
• Our services are designed for users 13 years and older
• We do not knowingly collect personal information from children under 13
• If you are under 18, you should use our services with parental supervision

PARENTAL OVERSIGHT:
• Parents or guardians may monitor their minor children's use of our services
• We encourage family involvement in agricultural education and activities
• Parents can contact us to request information about their child's account

DATA COLLECTION FROM MINORS:
• If we become aware that we have collected information from a child under 13, we will delete it
• Parents can request access to their child's information
• Special protections apply to data processing for users under 18

EDUCATIONAL USE:
• Our platform may be used for agricultural education with proper supervision
• Schools and educational institutions should ensure appropriate oversight
• Educational accounts may have additional privacy protections`
        },
        {
          title: '11. International Data Transfers',
          content: `Your information may be transferred and processed outside your country:

CROSS-BORDER TRANSFERS:
• We may transfer data to countries with different privacy laws
• Transfers are conducted with appropriate safeguards and protections
• We ensure adequate protection standards are maintained

SAFEGUARDS:
• Standard contractual clauses with international service providers
• Adequacy decisions recognized by relevant privacy authorities
• Binding corporate rules for intra-group transfers

YOUR RIGHTS:
• You have the right to know about international transfers
• You can object to transfers in certain circumstances
• We will inform you of significant changes to transfer arrangements

SERVICE PROVIDERS:
• Our cloud storage and processing may occur in multiple countries
• We select service providers with strong privacy and security standards
• Contractual obligations ensure protection of your data regardless of location`
        },
        {
          title: '12. Changes to Privacy Policy',
          content: `We may update this Privacy Policy from time to time:

NOTIFICATION OF CHANGES:
• We will notify you of significant changes via email or in-app notification
• Material changes will be announced at least 30 days in advance
• The "Last Updated" date at the top will reflect recent modifications

CONTINUED USE:
• Your continued use of our services after changes constitutes acceptance
• If you disagree with changes, you should discontinue use of our services
• You can review the updated policy before continuing to use our platform

TYPES OF CHANGES:
• Legal requirement changes will be implemented as necessary
• Feature updates may require privacy policy modifications
• We may clarify existing practices without changing data handling

HISTORICAL VERSIONS:
• Previous versions of our Privacy Policy are available upon request
• We maintain records of significant policy changes
• You can contact us for information about how changes affect your data`
        },
        {
          title: '13. Contact Information',
          content: `If you have questions or concerns about this Privacy Policy:

PRIVACY OFFICER:
Email: privacy@annadata.com
Phone: +91-1234567890
Address: Annadata Technologies Private Limited
         Privacy Department
         Tech Hub, Ludhiana, Punjab, India - 141001

GENERAL INQUIRIES:
Email: support@annadata.com
Phone: +91-1234567891

DATA PROTECTION REQUESTS:
Email: dataprotection@annadata.com
Subject: [DATA REQUEST] - [Type of Request]

BUSINESS HOURS:
Monday to Friday: 9:00 AM to 6:00 PM (IST)
Saturday: 9:00 AM to 1:00 PM (IST)
Sunday: Closed

RESPONSE TIME:
• Privacy inquiries: Within 2 business days
• Data requests: Within 30 days
• Urgent security matters: Within 24 hours

We are committed to addressing your privacy concerns promptly and transparently.`
        }
      ]
    },
    Hindi: {
      title: 'गोपनीयता नीति',
      lastUpdated: 'अंतिम अपडेट: 26 सितंबर, 2025',
      sections: [
        {
          title: '1. परिचय',
          content: `अन्नदाता टेक्नोलॉजीज प्राइवेट लिमिटेड ("हम," "हमारा," या "हमारी") में, हम आपकी गोपनीयता और व्यक्तिगत जानकारी की सुरक्षा के लिए प्रतिबद्ध हैं। यह गोपनीयता नीति बताती है कि हम आपकी जानकारी कैसे एकत्र, उपयोग, प्रकट और सुरक्षित करते हैं।

अन्नदाता का उपयोग करके, आप इस गोपनीयता नीति में वर्णित डेटा प्रथाओं के लिए सहमति देते हैं।`
        },
        {
          title: '2. हम जो जानकारी एकत्र करते हैं',
          content: `हम अपनी सेवाओं के उपयोगकर्ताओं से कई प्रकार की जानकारी एकत्र करते हैं:

व्यक्तिगत जानकारी:
• नाम, ईमेल पता, फोन नंबर
• प्रोफ़ाइल जानकारी और तस्वीरें
• स्थान डेटा (आपकी अनुमति के साथ)
• कृषि व्यापार विवरण और कृषि प्रथाएं

उपयोग जानकारी:
• ऐप उपयोग पैटर्न और प्राथमिकताएं
• डिवाइस जानकारी (मॉडल, OS संस्करण, डिवाइस ID)
• लॉग फ़ाइलें और एनालिटिक्स डेटा`
        },
        {
          title: '3. हम आपकी जानकारी का उपयोग कैसे करते हैं',
          content: `हम एकत्रित जानकारी का उपयोग विभिन्न उद्देश्यों के लिए करते हैं:

सेवा प्रावधान:
• हमारे कृषि मंच को प्रदान करना और बनाए रखना
• उपयोगकर्ता पंजीकरण और खाता प्रबंधन को सक्षम करना
• किसानों, विक्रेताओं और उपभोक्ताओं के बीच लेनदेन को सुविधाजनक बनाना

सुधार और विश्लेषण:
• हमारी सेवाओं को बेहतर बनाने के लिए उपयोग पैटर्न का विश्लेषण
• नई सुविधाओं और कार्यक्षमता का विकास`
        },
        {
          title: '4. जानकारी साझाकरण और प्रकटीकरण',
          content: `हम निम्नलिखित परिस्थितियों में आपकी जानकारी साझा कर सकते हैं:

आपकी सहमति के साथ:
• जब आप स्पष्ट रूप से जानकारी साझा करने के लिए अधिकृत करते हैं
• विश्वसनीय भागीदारों से विपणन संचार के लिए

सेवा प्रदाताओं के साथ:
• तृतीय-पक्ष विक्रेता जो हमारे प्लेटफ़ॉर्म के संचालन में सहायता करते हैं
• लेनदेन प्रबंधन के लिए भुगतान प्रोसेसर`
        },
        {
          title: '5. डेटा सुरक्षा',
          content: `हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए उपयुक्त तकनीकी और संगठनात्मक उपाय लागू करते हैं:

तकनीकी सुरक्षा उपाय:
• ट्रांजिट और आराम में डेटा का एन्क्रिप्शन
• एक्सेस नियंत्रण के साथ सुरक्षित सर्वर और डेटाबेस
• नियमित सुरक्षा ऑडिट और भेद्यता मूल्यांकन`
        },
        {
          title: '6. स्थान डेटा और सेवाएं',
          content: `हमारा ऐप बेहतर सेवाएं प्रदान करने के लिए स्थान डेटा का उपयोग करता है:

स्थान डेटा संग्रह:
• मौसम सेवाओं के लिए GPS निर्देशांक
• फसल सिफारिशों के लिए क्षेत्रीय जानकारी
• स्थान-आधारित कृषि अंतर्दृष्टि और सुझाव`
        },
        {
          title: '7. AI और मशीन लर्निंग सेवाएं',
          content: `हमारी AI-संचालित सुविधाओं में विशिष्ट डेटा प्रसंस्करण शामिल है:

रोग पहचान:
• आपके द्वारा अपलोड की गई छवियों को हमारे AI सिस्टम द्वारा संसाधित किया जाता है
• हम मॉडल सुधार के लिए छवियों को बनाए रख सकते हैं (आपकी सहमति के साथ)
• AI विश्लेषण परिणाम केवल सूचनात्मक उद्देश्यों के लिए प्रदान किए जाते हैं`
        },
        {
          title: '8. आपके गोपनीयता अधिकार',
          content: `आपकी व्यक्तिगत जानकारी के संबंध में आपके कई अधिकार हैं:

पहुंच और पोर्टेबिलिटी:
• अपनी व्यक्तिगत जानकारी तक पहुंच का अनुरोध करें
• पोर्टेबल प्रारूप में अपने डेटा की प्रति प्राप्त करें
• समीक्षा करें कि आपकी जानकारी का उपयोग कैसे किया जा रहा है`
        }
      ]
    },
    Punjabi: {
      title: 'ਗੁਪਤਤਾ ਨੀਤੀ',
      lastUpdated: 'ਅਖੀਰੀ ਅਪਡੇਟ: 26 ਸਤੰਬਰ, 2025',
      sections: [
        {
          title: '1. ਜਾਣ-ਪਛਾਣ',
          content: `ਅੰਨਦਾਤਾ ਟੈਕਨੋਲੋਜੀਜ਼ ਪ੍ਰਾਈਵੇਟ ਲਿਮਿਟੇਡ ("ਅਸੀਂ," "ਸਾਡਾ," ਜਾਂ "ਸਾਡੀ") ਵਿੱਚ, ਅਸੀਂ ਤੁਹਾਡੀ ਗੁਪਤਤਾ ਅਤੇ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਦੀ ਸੁਰੱਖਿਆ ਲਈ ਪ੍ਰਤਿਬੱਧ ਹਾਂ। ਇਹ ਗੁਪਤਤਾ ਨੀਤੀ ਦੱਸਦੀ ਹੈ ਕਿ ਅਸੀਂ ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਕਿਵੇਂ ਇਕੱਠੀ, ਵਰਤੋਂ, ਪ੍ਰਗਟ ਅਤੇ ਸੁਰੱਖਿਅਤ ਕਰਦੇ ਹਾਂ।

ਅੰਨਦਾਤਾ ਦੀ ਵਰਤੋਂ ਕਰਕੇ, ਤੁਸੀਂ ਇਸ ਗੁਪਤਤਾ ਨੀਤੀ ਵਿੱਚ ਵਰਣਿਤ ਡਾਟਾ ਪ੍ਰਥਾਵਾਂ ਲਈ ਸਹਿਮਤੀ ਦਿੰਦੇ ਹੋ।`
        },
        {
          title: '2. ਅਸੀਂ ਜੋ ਜਾਣਕਾਰੀ ਇਕੱਠੀ ਕਰਦੇ ਹਾਂ',
          content: `ਅਸੀਂ ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ ਦੇ ਉਪਭੋਗੀਆਂ ਤੋਂ ਕਈ ਕਿਸਮ ਦੀ ਜਾਣਕਾਰੀ ਇਕੱਠੀ ਕਰਦੇ ਹਾਂ:

ਨਿੱਜੀ ਜਾਣਕਾਰੀ:
• ਨਾਮ, ਈਮੇਲ ਪਤਾ, ਫੋਨ ਨੰਬਰ
• ਪ੍ਰੋਫਾਈਲ ਜਾਣਕਾਰੀ ਅਤੇ ਤਸਵੀਰਾਂ
• ਸਥਾਨ ਡਾਟਾ (ਤੁਹਾਡੀ ਇਜਾਜ਼ਤ ਨਾਲ)
• ਖੇਤੀਬਾੜੀ ਕਾਰੋਬਾਰ ਵੇਰਵੇ ਅਤੇ ਖੇਤੀ ਅਭਿਆਸ

ਵਰਤੋਂ ਜਾਣਕਾਰੀ:
• ਐਪ ਵਰਤੋਂ ਪੈਟਰਨ ਅਤੇ ਤਰਜੀਹਾਂ
• ਡਿਵਾਇਸ ਜਾਣਕਾਰੀ (ਮਾਡਲ, OS ਸੰਸਕਰਣ, ਡਿਵਾਇਸ ID)`
        },
        {
          title: '3. ਅਸੀਂ ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰਦੇ ਹਾਂ',
          content: `ਅਸੀਂ ਇਕੱਠੀ ਕੀਤੀ ਜਾਣਕਾਰੀ ਦੀ ਵਰਤੋਂ ਵੱਖ-ਵੱਖ ਉਦੇਸ਼ਾਂ ਲਈ ਕਰਦੇ ਹਾਂ:

ਸੇਵਾ ਪ੍ਰਦਾਨਗੀ:
• ਸਾਡੇ ਖੇਤੀਬਾੜੀ ਪਲੇਟਫਾਰਮ ਨੂੰ ਪ੍ਰਦਾਨ ਕਰਨਾ ਅਤੇ ਬਣਾਈ ਰੱਖਣਾ
• ਉਪਭੋਗੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਤੇ ਖਾਤਾ ਪ੍ਰਬੰਧਨ ਨੂੰ ਸਮਰੱਥ ਬਣਾਉਣਾ
• ਕਿਸਾਨਾਂ, ਵਿਕਰੇਤਾਵਾਂ ਅਤੇ ਖਰੀਦਦਾਰਾਂ ਵਿਚਕਾਰ ਲੈਣ-ਦੇਣ ਨੂੰ ਸਹਿਜ ਬਣਾਉਣਾ

ਸੁਧਾਰ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ:
• ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ ਨੂੰ ਬਿਹਤਰ ਬਣਾਉਣ ਲਈ ਵਰਤੋਂ ਪੈਟਰਨ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ
• ਨਵੀਆਂ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ ਅਤੇ ਕਾਰਜਸ਼ੀਲਤਾ ਦਾ ਵਿਕਾਸ`
        },
        {
          title: '4. ਜਾਣਕਾਰੀ ਸਾਂਝਾਕਰਣ ਅਤੇ ਪ੍ਰਗਟਾਵਾ',
          content: `ਅਸੀਂ ਹੇਠ ਲਿਖੀਆਂ ਹਾਲਤਾਂ ਵਿੱਚ ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਸਾਂਝੀ ਕਰ ਸਕਦੇ ਹਾਂ:

ਤੁਹਾਡੀ ਸਹਿਮਤੀ ਨਾਲ:
• ਜਦੋਂ ਤੁਸੀਂ ਸਪੱਸ਼ਟ ਰੂਪ ਵਿੱਚ ਜਾਣਕਾਰੀ ਸਾਂਝੀ ਕਰਨ ਲਈ ਅਧਿਕਾਰਤ ਕਰਦੇ ਹੋ
• ਭਰੋਸੇਯੋਗ ਸਹਿਭਾਗੀਆਂ ਤੋਂ ਮਾਰਕੀਟਿੰਗ ਸੰਚਾਰ ਲਈ

ਸੇਵਾ ਪ੍ਰਦਾਤਾਵਾਂ ਨਾਲ:
• ਤੀਜੀ-ਧਿਰ ਵਿਕਰੇਤਾ ਜੋ ਸਾਡੇ ਪਲੇਟਫਾਰਮ ਦੇ ਸੰਚਾਲਨ ਵਿੱਚ ਸਹਾਇਤਾ ਕਰਦੇ ਹਨ
• ਲੈਣ-ਦੇਣ ਪ੍ਰਬੰਧਨ ਲਈ ਭੁਗਤਾਨ ਪ੍ਰੋਸੈਸਰ`
        },
        {
          title: '5. ਡਾਟਾ ਸੁਰੱਖਿਆ',
          content: `ਅਸੀਂ ਤੁਹਾਡੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਦੀ ਸੁਰੱਖਿਆ ਲਈ ਉਚਿਤ ਤਕਨੀਕੀ ਅਤੇ ਸੰਗਠਨਾਤਮਕ ਉਪਾਅ ਲਾਗੂ ਕਰਦੇ ਹਾਂ:

ਤਕਨੀਕੀ ਸੁਰੱਖਿਆ ਉਪਾਅ:
• ਆਵਾਗਮਨ ਅਤੇ ਅਰਾਮ ਵਿੱਚ ਡਾਟਾ ਦਾ ਐਨਕ੍ਰਿਪਸ਼ਨ
• ਪਹੁੰਚ ਨਿਯੰਤਰਣ ਦੇ ਨਾਲ ਸੁਰੱਖਿਤ ਸਰਵਰ ਅਤੇ ਡਾਟਾਬੇਸ
• ਨਿਯਮਿਤ ਸੁਰੱਖਿਆ ਆਡਿਟ ਅਤੇ ਕਮਜ਼ੋਰੀ ਮੁਲਾਂਕਣ`
        },
        {
          title: '6. ਸਥਾਨ ਡਾਟਾ ਅਤੇ ਸੇਵਾਵਾਂ',
          content: `ਸਾਡਾ ਐਪ ਬਿਹਤਰ ਸੇਵਾਵਾਂ ਪ੍ਰਦਾਨ ਕਰਨ ਲਈ ਸਥਾਨ ਡਾਟਾ ਦੀ ਵਰਤੋਂ ਕਰਦਾ ਹੈ:

ਸਥਾਨ ਡਾਟਾ ਸੰਗ੍ਰਹਿ:
• ਮੌਸਮ ਸੇਵਾਵਾਂ ਲਈ GPS ਨਿਰਦੇਸ਼ਾਂਕ
• ਫਸਲ ਸਿਫ਼ਾਰਸ਼ਾਂ ਲਈ ਖੇਤਰੀ ਜਾਣਕਾਰੀ
• ਸਥਾਨ-ਆਧਾਰਿਤ ਖੇਤੀਬਾੜੀ ਸੂਝ ਅਤੇ ਸੁਝਾਅ`
        },
        {
          title: '7. AI ਅਤੇ ਮਸ਼ੀਨ ਲਰਨਿੰਗ ਸੇਵਾਵਾਂ',
          content: `ਸਾਡੀਆਂ AI-ਸੰਚਾਲਿਤ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ ਵਿੱਚ ਵਿਸ਼ੇਸ਼ ਡਾਟਾ ਪ੍ਰਕਿਰਿਆ ਸ਼ਾਮਲ ਹੈ:

ਰੋਗ ਪਛਾਣ:
• ਤੁਹਾਡੇ ਦੁਆਰਾ ਅਪਲੋਡ ਕੀਤੀਆਂ ਤਸਵੀਰਾਂ ਨੂੰ ਸਾਡੇ AI ਸਿਸਟਮ ਦੁਆਰਾ ਪ੍ਰੋਸੈਸ ਕੀਤਾ ਜਾਂਦਾ ਹੈ
• ਅਸੀਂ ਮਾਡਲ ਸੁਧਾਰ ਲਈ ਤਸਵੀਰਾਂ ਨੂੰ ਬਣਾਈ ਰੱਖ ਸਕਦੇ ਹਾਂ (ਤੁਹਾਡੀ ਸਹਿਮਤੀ ਨਾਲ)
• AI ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜੇ ਸਿਰਫ਼ ਜਾਣਕਾਰੀ ਦੇ ਉਦੇਸ਼ਾਂ ਲਈ ਪ੍ਰਦਾਨ ਕੀਤੇ ਜਾਂਦੇ ਹਨ`
        },
        {
          title: '8. ਤੁਹਾਡੇ ਗੁਪਤਤਾ ਅਧਿਕਾਰ',
          content: `ਤੁਹਾਡੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਦੇ ਸੰਬੰਧ ਵਿੱਚ ਤੁਹਾਡੇ ਕਈ ਅਧਿਕਾਰ ਹਨ:

ਪਹੁੰਚ ਅਤੇ ਪੋਰਟੇਬਿਲਿਟੀ:
• ਆਪਣੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਤੱਕ ਪਹੁੰਚ ਦੀ ਬੇਨਤੀ ਕਰੋ
• ਪੋਰਟੇਬਲ ਫਾਰਮੈਟ ਵਿੱਚ ਆਪਣੇ ਡਾਟਾ ਦੀ ਕਾਪੀ ਪ੍ਰਾਪਤ ਕਰੋ
• ਸਮੀਖਿਆ ਕਰੋ ਕਿ ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ`
        }
      ]
    }
  }

  const renderLanguageTabs = () => (
    <View style={styles.languageTabsContainer}>
      {languages.map((language) => (
        <TouchableOpacity
          key={language.key}
          style={[
            styles.languageTab,
            selectedLanguage === language.key && styles.activeLanguageTab
          ]}
          onPress={() => setSelectedLanguage(language.key)}
        >
          <Text
            style={[
              styles.languageTabText,
              selectedLanguage === language.key && styles.activeLanguageTabText
            ]}
          >
            {language.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderContent = () => {
    const content = privacyContent[selectedLanguage]
    
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.lastUpdated}>{content.lastUpdated}</Text>
        
        {content.sections.map((section, index) => (
          <View key={index} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Language Tabs */}
      {renderLanguageTabs()}

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            Your privacy is important to us and protected by this policy
          </Text>
          <Text style={styles.footerSubtext}>
            © 2025 Annadata Technologies Private Limited. All rights reserved.
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: '#2196F3',
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

  // Language Tabs Styles
  languageTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  languageTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeLanguageTab: {
    backgroundColor: '#2196F3',
  },
  languageTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeLanguageTabText: {
    color: 'white',
  },

  // Content Styles
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },

  // Section Styles
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    textAlign: 'justify',
  },

  // Footer Styles
  footer: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
})

export default Privacy