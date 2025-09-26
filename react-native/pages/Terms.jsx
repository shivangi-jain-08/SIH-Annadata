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

const Terms = () => {
  const navigation = useNavigation()
  const [selectedLanguage, setSelectedLanguage] = useState('English')

  const languages = [
    { key: 'English', label: 'English' },
    { key: 'Hindi', label: 'हिंदी' },
    { key: 'Punjabi', label: 'ਪੰਜਾਬੀ' }
  ]

  const termsContent = {
    English: {
      title: 'Terms and Conditions',
      lastUpdated: 'Last updated: September 26, 2025',
      sections: [
        {
          title: '1. Introduction',
          content: `Welcome to Annadata, a comprehensive agricultural platform designed to connect farmers, vendors, and consumers. By accessing or using our application, you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of these terms, then you may not access the service.

Annadata is operated by Annadata Technologies Private Limited. These Terms govern your use of our mobile application and related services.`
        },
        {
          title: '2. Acceptance of Terms',
          content: `By creating an account, accessing, or using any part of Annadata, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. You also represent that you have the legal authority to accept these Terms on behalf of yourself and any party you represent.`
        },
        {
          title: '3. User Accounts and Registration',
          content: `To access certain features of Annadata, you must register for an account. When you register, you must:
• Provide accurate, current, and complete information
• Maintain the security of your password and identification
• Accept all risks of unauthorized access to your account
• Notify us immediately of any unauthorized use of your account

You are responsible for all activities that occur under your account. We reserve the right to suspend or terminate accounts that violate these Terms.`
        },
        {
          title: '4. User Roles and Responsibilities',
          content: `Annadata serves three primary user types:

FARMERS:
• Can list and sell agricultural products
• Must provide accurate product descriptions and pricing
• Are responsible for product quality and delivery
• Must comply with local agricultural regulations

VENDORS/BUYERS:
• Can purchase products from farmers
• Must make payments as agreed
• Are responsible for timely acceptance of deliveries
• Must provide accurate delivery information

CONSUMERS:
• Can browse and purchase agricultural products
• Must provide accurate payment and delivery information
• Are responsible for timely payment and acceptance of orders`
        },
        {
          title: '5. Product Listings and Transactions',
          content: `When using Annadata for commercial transactions:

• All product listings must be accurate and truthful
• Prices must be clearly stated and honored
• Product quality must meet described standards
• Delivery terms must be honored by all parties
• Disputes should be resolved through our platform mechanisms
• We reserve the right to remove fraudulent or misleading listings
• Payment processing is subject to our payment terms and third-party processor terms`
        },
        {
          title: '6. Technology Services',
          content: `Annadata provides various technology services including:

DISEASE DETECTION:
• AI-powered crop disease identification
• Results are provided as guidance only
• Users should consult agricultural experts for critical decisions
• We are not liable for crop losses based on our recommendations

WEATHER SERVICES:
• Real-time weather information for farming decisions
• Data is sourced from third-party providers
• We do not guarantee accuracy of weather predictions
• Users should verify critical weather information from multiple sources`
        },
        {
          title: '7. Intellectual Property',
          content: `All content, features, and functionality of Annadata, including but not limited to text, graphics, logos, images, software, and data compilations, are owned by Annadata Technologies Private Limited and are protected by copyright, trademark, and other intellectual property laws.

You may not:
• Copy, modify, or distribute our content without permission
• Use our trademarks or logos without authorization
• Reverse engineer or attempt to extract source code
• Create derivative works based on our services`
        },
        {
          title: '8. Privacy and Data Protection',
          content: `We take your privacy seriously. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.

Key privacy principles:
• We collect only necessary information for service provision
• Your data is protected using industry-standard security measures
• We do not sell personal information to third parties
• You have rights to access, modify, and delete your personal data
• Location data is used only for service enhancement and with your consent`
        },
        {
          title: '9. Prohibited Uses',
          content: `You may not use Annadata for any unlawful purpose or in violation of these Terms. Prohibited activities include:

• Violating any applicable laws or regulations
• Transmitting harmful, offensive, or inappropriate content
• Engaging in fraudulent transactions or misrepresentation
• Interfering with the security or functionality of our services
• Using automated systems to access our services without permission
• Impersonating other users or entities
• Uploading malicious software or code`
        },
        {
          title: '10. Limitation of Liability',
          content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:

• Annadata is provided "AS IS" without warranties of any kind
• We are not liable for indirect, incidental, or consequential damages
• Our total liability shall not exceed the amount paid by you for our services
• We are not responsible for third-party content or services
• We do not guarantee uninterrupted or error-free service
• Users assume all risks associated with agricultural decisions based on our platform`
        },
        {
          title: '11. Indemnification',
          content: `You agree to indemnify, defend, and hold harmless Annadata Technologies Private Limited, its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from:

• Your use of our services
• Your violation of these Terms
• Your violation of any third-party rights
• Any content you submit or transmit through our services
• Your negligent or wrongful conduct`
        },
        {
          title: '12. Modifications to Terms',
          content: `We reserve the right to modify these Terms at any time. When we make changes, we will:

• Post the updated Terms on our platform
• Notify users of significant changes via email or in-app notification
• Update the "Last Modified" date at the top of these Terms

Your continued use of Annadata after changes constitute acceptance of the modified Terms. If you disagree with modifications, you should discontinue use of our services.`
        },
        {
          title: '13. Termination',
          content: `Either party may terminate this agreement at any time:

• Users may delete their accounts and stop using our services
• We may suspend or terminate accounts for violation of these Terms
• We may discontinue services with reasonable notice
• Upon termination, your right to use our services ceases immediately
• Surviving provisions include liability limitations, indemnification, and intellectual property rights`
        },
        {
          title: '14. Governing Law and Jurisdiction',
          content: `These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of Annadata will be subject to the exclusive jurisdiction of the courts in Punjab, India.

For international users, local laws may also apply to your use of our services.`
        },
        {
          title: '15. Contact Information',
          content: `If you have any questions about these Terms and Conditions, please contact us:

Email: legal@annadata.com
Phone: +91-1234567890
Address: Annadata Technologies Private Limited
         Tech Hub, Ludhiana, Punjab, India

For technical support: support@annadata.com
For business inquiries: business@annadata.com`
        }
      ]
    },
    Hindi: {
      title: 'नियम और शर्तें',
      lastUpdated: 'अंतिम अपडेट: 26 सितंबर, 2025',
      sections: [
        {
          title: '1. परिचय',
          content: `अन्नदाता में आपका स्वागत है, एक व्यापक कृषि मंच जो किसानों, विक्रेताओं और उपभोक्ताओं को जोड़ने के लिए डिज़ाइन किया गया है। हमारे एप्लिकेशन तक पहुंचकर या उसका उपयोग करके, आप इन नियमों और शर्तों ("नियम") से बाध्य होने के लिए सहमत हैं।

अन्नदाता का संचालन अन्नदाता टेक्नोलॉजीज प्राइवेट लिमिटेड द्वारा किया जाता है। ये नियम हमारे मोबाइल एप्लिकेशन और संबंधित सेवाओं के आपके उपयोग को नियंत्रित करते हैं।`
        },
        {
          title: '2. नियमों की स्वीकृति',
          content: `अन्नदाता का खाता बनाकर, पहुंचकर, या किसी भी हिस्से का उपयोग करके, आप स्वीकार करते हैं कि आपने इन नियमों और हमारी गोपनीयता नीति को पढ़ा, समझा और उनसे बाध्य होने के लिए सहमति दी है।`
        },
        {
          title: '3. उपयोगकर्ता खाते और पंजीकरण',
          content: `अन्नदाता की कुछ सुविधाओं तक पहुंचने के लिए, आपको एक खाते के लिए पंजीकरण करना होगा। जब आप पंजीकरण करते हैं, तो आपको:
• सटीक, वर्तमान और पूर्ण जानकारी प्रदान करनी चाहिए
• अपने पासवर्ड और पहचान की सुरक्षा बनाए रखनी चाहिए
• अपने खाते तक अनधिकृत पहुंच के सभी जोखिम स्वीकार करने चाहिए
• अपने खाते के किसी भी अनधिकृत उपयोग की तुरंत सूचना देनी चाहिए`
        },
        {
          title: '4. उपयोगकर्ता भूमिकाएं और जिम्मेदारियां',
          content: `अन्नदाता तीन मुख्य उपयोगकर्ता प्रकारों की सेवा करता है:

किसान:
• कृषि उत्पादों को सूचीबद्ध और बेच सकते हैं
• सटीक उत्पाद विवरण और मूल्य निर्धारण प्रदान करना चाहिए
• उत्पाद की गुणवत्ता और डिलीवरी के लिए जिम्मेदार हैं

विक्रेता/खरीदार:
• किसानों से उत्पाद खरीद सकते हैं
• सहमत के अनुसार भुगतान करना चाहिए
• डिलीवरी की समय पर स्वीकृति के लिए जिम्मेदार हैं`
        },
        {
          title: '5. उत्पाद सूची और लेन-देन',
          content: `व्यावसायिक लेन-देन के लिए अन्नदाता का उपयोग करते समय:

• सभी उत्पाद सूचियां सटीक और सच्ची होनी चाहिए
• कीमतें स्पष्ट रूप से बताई जानी चाहिए और उनका सम्मान किया जाना चाहिए
• उत्पाद की गुणवत्ता वर्णित मानकों को पूरा करनी चाहिए
• डिलीवरी की शर्तों का सभी पक्षों द्वारा सम्मान किया जाना चाहिए`
        },
        {
          title: '6. प्रौद्योगिकी सेवाएं',
          content: `अन्नदाता विभिन्न प्रौद्योगिकी सेवाएं प्रदान करता है:

रोग पहचान:
• एआई-संचालित फसल रोग पहचान
• परिणाम केवल मार्गदर्शन के रूप में प्रदान किए जाते हैं
• महत्वपूर्ण निर्णयों के लिए कृषि विशेषज्ञों से सलाह लें

मौसम सेवाएं:
• खेती के निर्णयों के लिए वास्तविक समय मौसम जानकारी
• डेटा तृतीय-पक्ष प्रदाताओं से प्राप्त किया जाता है`
        },
        {
          title: '7. बौद्धिक संपदा',
          content: `अन्नदाता की सभी सामग्री, सुविधाएं और कार्यक्षमता अन्नदाता टेक्नोलॉजीज प्राइवेट लिमिटेड की संपत्ति है और कॉपीराइट, ट्रेडमार्क और अन्य बौद्धिक संपदा कानूनों द्वारा संरक्षित है।`
        },
        {
          title: '8. गोपनीयता और डेटा सुरक्षा',
          content: `हम आपकी गोपनीयता को गंभीरता से लेते हैं। आपकी व्यक्तिगत जानकारी का हमारा संग्रह, उपयोग और सुरक्षा हमारी गोपनीयता नीति द्वारा नियंत्रित होती है।`
        },
        {
          title: '9. निषिद्ध उपयोग',
          content: `आप अन्नदाता का उपयोग किसी भी गैरकानूनी उद्देश्य के लिए या इन नियमों के उल्लंघन में नहीं कर सकते हैं।`
        },
        {
          title: '10. देयता की सीमा',
          content: `कानून द्वारा अनुमतित अधिकतम सीमा तक, अन्नदाता किसी भी प्रकार की वारंटी के बिना "जैसा है" प्रदान किया जाता है।`
        }
      ]
    },
    Punjabi: {
      title: 'ਨਿਯਮ ਅਤੇ ਸ਼ਰਤਾਂ',
      lastUpdated: 'ਅਖੀਰੀ ਅਪਡੇਟ: 26 ਸਤੰਬਰ, 2025',
      sections: [
        {
          title: '1. ਜਾਣ-ਪਛਾਣ',
          content: `ਅੰਨਦਾਤਾ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ, ਇੱਕ ਵਿਆਪਕ ਖੇਤੀਬਾੜੀ ਪਲੇਟਫਾਰਮ ਜੋ ਕਿਸਾਨਾਂ, ਵਿਕਰੇਤਾਵਾਂ ਅਤੇ ਖਰੀਦਦਾਰਾਂ ਨੂੰ ਜੋੜਨ ਲਈ ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਹੈ। ਸਾਡੀ ਐਪਲੀਕੇਸ਼ਨ ਤੱਕ ਪਹੁੰਚ ਕਰਕੇ ਜਾਂ ਇਸ ਦੀ ਵਰਤੋਂ ਕਰਕੇ, ਤੁਸੀਂ ਇਨ੍ਹਾਂ ਨਿਯਮਾਂ ਅਤੇ ਸ਼ਰਤਾਂ ਨਾਲ ਬੰਨ੍ਹੇ ਹੋਣ ਲਈ ਸਹਿਮਤ ਹੁੰਦੇ ਹੋ।

ਅੰਨਦਾਤਾ ਦਾ ਸੰਚਾਲਨ ਅੰਨਦਾਤਾ ਟੈਕਨੋਲੋਜੀਜ਼ ਪ੍ਰਾਈਵੇਟ ਲਿਮਿਟੇਡ ਦੁਆਰਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।`
        },
        {
          title: '2. ਨਿਯਮਾਂ ਦੀ ਸਵੀਕ੍ਰਿਤੀ',
          content: `ਅੰਨਦਾਤਾ ਦਾ ਖਾਤਾ ਬਣਾ ਕੇ, ਪਹੁੰਚ ਕਰਕੇ, ਜਾਂ ਕਿਸੇ ਵੀ ਹਿੱਸੇ ਦੀ ਵਰਤੋਂ ਕਰਕੇ, ਤੁਸੀਂ ਸਵੀਕਾਰ ਕਰਦੇ ਹੋ ਕਿ ਤੁਸੀਂ ਇਨ੍ਹਾਂ ਨਿਯਮਾਂ ਅਤੇ ਸਾਡੀ ਗੁਪਤਤਾ ਨੀਤੀ ਨੂੰ ਪੜ੍ਹਿਆ, ਸਮਝਿਆ ਅਤੇ ਉਨ੍ਹਾਂ ਨਾਲ ਬੰਨ੍ਹੇ ਹੋਣ ਲਈ ਸਹਿਮਤੀ ਦਿੱਤੀ ਹੈ।`
        },
        {
          title: '3. ਉਪਭੋਗੀ ਖਾਤੇ ਅਤੇ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
          content: `ਅੰਨਦਾਤਾ ਦੀਆਂ ਕੁਝ ਸੁਵਿਧਾਵਾਂ ਤੱਕ ਪਹੁੰਚਣ ਲਈ, ਤੁਹਾਨੂੰ ਇੱਕ ਖਾਤੇ ਲਈ ਰਜਿਸਟਰ ਕਰਨਾ ਹੋਵੇਗਾ। ਜਦੋਂ ਤੁਸੀਂ ਰਜਿਸਟਰ ਕਰਦੇ ਹੋ, ਤੁਹਾਨੂੰ:
• ਸਹੀ, ਮੌਜੂਦਾ ਅਤੇ ਪੂਰੀ ਜਾਣਕਾਰੀ ਪ੍ਰਦਾਨ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ
• ਆਪਣੇ ਪਾਸਵਰਡ ਅਤੇ ਪਛਾਣ ਦੀ ਸੁਰੱਖਿਆ ਬਣਾਈ ਰੱਖਣੀ ਚਾਹੀਦੀ ਹੈ
• ਆਪਣੇ ਖਾਤੇ ਤੱਕ ਅਣਅਧਿਕਾਰਤ ਪਹੁੰਚ ਦੇ ਸਾਰੇ ਜੋਖਮ ਸਵੀਕਾਰ ਕਰਨੇ ਚਾਹੀਦੇ ਹਨ`
        },
        {
          title: '4. ਉਪਭੋਗੀ ਭੂਮਿਕਾਵਾਂ ਅਤੇ ਜ਼ਿੰਮੇਵਾਰੀਆਂ',
          content: `ਅੰਨਦਾਤਾ ਤਿੰਨ ਮੁੱਖ ਉਪਭੋਗੀ ਕਿਸਮਾਂ ਦੀ ਸੇਵਾ ਕਰਦਾ ਹੈ:

ਕਿਸਾਨ:
• ਖੇਤੀਬਾੜੀ ਉਤਪਾਦਾਂ ਨੂੰ ਸੂਚੀਬੱਧ ਅਤੇ ਵੇਚ ਸਕਦੇ ਹਨ
• ਸਹੀ ਉਤਪਾਦ ਵੇਰਵੇ ਅਤੇ ਕੀਮਤ ਪ੍ਰਦਾਨ ਕਰਨੇ ਚਾਹੀਦੇ ਹਨ
• ਉਤਪਾਦ ਦੀ ਗੁਣਵੱਤਾ ਅਤੇ ਡਿਲੀਵਰੀ ਲਈ ਜ਼ਿੰਮੇਵਾਰ ਹਨ

ਵਿਕਰੇਤਾ/ਖਰੀਦਦਾਰ:
• ਕਿਸਾਨਾਂ ਤੋਂ ਉਤਪਾਦ ਖਰੀਦ ਸਕਦੇ ਹਨ
• ਸਹਿਮਤੀ ਅਨੁਸਾਰ ਭੁਗਤਾਨ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ`
        },
        {
          title: '5. ਉਤਪਾਦ ਸੂਚੀ ਅਤੇ ਲੈਣ-ਦੇਣ',
          content: `ਵਪਾਰਿਕ ਲੈਣ-ਦੇਣ ਲਈ ਅੰਨਦਾਤਾ ਦੀ ਵਰਤੋਂ ਕਰਦੇ ਸਮੇਂ:

• ਸਾਰੀਆਂ ਉਤਪਾਦ ਸੂਚੀਆਂ ਸਹੀ ਅਤੇ ਸੱਚੀਆਂ ਹੋਣੀਆਂ ਚਾਹੀਦੀਆਂ ਹਨ
• ਕੀਮਤਾਂ ਸਪੱਸ਼ਟ ਰੂਪ ਵਿੱਚ ਦੱਸੀਆਂ ਜਾਣੀਆਂ ਚਾਹੀਦੀਆਂ ਹਨ
• ਉਤਪਾਦ ਦੀ ਗੁਣਵੱਤਾ ਵਰਣਿਤ ਮਾਪਦੰਡਾਂ ਨੂੰ ਪੂਰਾ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ`
        },
        {
          title: '6. ਤਕਨੀਕੀ ਸੇਵਾਵਾਂ',
          content: `ਅੰਨਦਾਤਾ ਵੱਖ-ਵੱਖ ਤਕਨੀਕੀ ਸੇਵਾਵਾਂ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ:

ਰੋਗ ਪਛਾਣ:
• AI-ਸੰਚਾਲਿਤ ਫਸਲ ਰੋਗ ਪਛਾਣ
• ਨਤੀਜੇ ਸਿਰਫ਼ ਮਾਰਗਦਰਸ਼ਨ ਵਜੋਂ ਪ੍ਰਦਾਨ ਕੀਤੇ ਜਾਂਦੇ ਹਨ

ਮੌਸਮੀ ਸੇਵਾਵਾਂ:
• ਖੇਤੀ ਦੇ ਫੈਸਲਿਆਂ ਲਈ ਅਸਲ-ਸਮਾਂ ਮੌਸਮ ਜਾਣਕਾਰੀ`
        },
        {
          title: '7. ਬੌਧਿਕ ਸੰਪਤੀ',
          content: `ਅੰਨਦਾਤਾ ਦੀ ਸਾਰੀ ਸਮੱਗਰੀ, ਸੁਵਿਧਾਵਾਂ ਅਤੇ ਕਾਰਜਸ਼ੀਲਤਾ ਅੰਨਦਾਤਾ ਟੈਕਨੋਲੋਜੀਜ਼ ਪ੍ਰਾਈਵੇਟ ਲਿਮਿਟੇਡ ਦੀ ਸੰਪਤੀ ਹੈ।`
        },
        {
          title: '8. ਗੁਪਤਤਾ ਅਤੇ ਡਾਟਾ ਸੁਰੱਖਿਆ',
          content: `ਅਸੀਂ ਤੁਹਾਡੀ ਗੁਪਤਤਾ ਨੂੰ ਗੰਭੀਰਤਾ ਨਾਲ ਲੈਂਦੇ ਹਾਂ। ਤੁਹਾਡੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਦਾ ਸਾਡਾ ਸੰਗ੍ਰਹਿ, ਵਰਤੋਂ ਅਤੇ ਸੁਰੱਖਿਆ ਸਾਡੀ ਗੁਪਤਤਾ ਨੀਤੀ ਦੁਆਰਾ ਨਿਯੰਤਰਿਤ ਹੈ।`
        },
        {
          title: '9. ਨਿਸ਼ੇਧਿਤ ਵਰਤੋਂ',
          content: `ਤੁਸੀਂ ਅੰਨਦਾਤਾ ਦੀ ਵਰਤੋਂ ਕਿਸੇ ਵੀ ਗੈਰ-ਕਾਨੂੰਨੀ ਮਕਸਦ ਲਈ ਜਾਂ ਇਨ੍ਹਾਂ ਨਿਯਮਾਂ ਦੀ ਉਲੰਘਣਾ ਵਿੱਚ ਨਹੀਂ ਕਰ ਸਕਦੇ।`
        },
        {
          title: '10. ਦੇਣਦਾਰੀ ਦੀ ਸੀਮਾ',
          content: `ਕਾਨੂੰਨ ਦੁਆਰਾ ਅਨੁਮਤਿਤ ਅਧਿਕਤਮ ਸੀਮਾ ਤੱਕ, ਅੰਨਦਾਤਾ ਕਿਸੇ ਵੀ ਕਿਸਮ ਦੀ ਵਾਰੰਟੀ ਦੇ ਬਿਨਾਂ "ਜਿਵੇਂ ਹੈ" ਪ੍ਰਦਾਨ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।`
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
    const content = termsContent[selectedLanguage]
    
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
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
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
            By using Annadata, you agree to these Terms and Conditions
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
    backgroundColor: '#4CAF50',
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
    color: '#4CAF50',
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
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
})

export default Terms