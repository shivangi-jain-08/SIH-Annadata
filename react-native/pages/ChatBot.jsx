import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../Icon';
import { GEMINI_API_KEY } from '@env';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ChatBot = () => {

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const chatRef = useRef(null);

    const sendMessage = async () => {
        console.log(input);
        try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const modelName = "gemini-2.0-flash";
        const model = genAI.getGenerativeModel({ model: modelName });
        const agriPrompt = `
            You are Krishi Mitra, (female) a friendly and casual virtual multillingual assistant for Indian  farmers.  
            Guide farmers through every step: explain soil analysis, crop selection, planting schedules, watering needs, pest and disease identification, and harvest best practices.  
            Respond in the farmer's chosen language (detect based on language code):  
            - Hindi (देवनागरी)  
            - Punjabi (ਗੁਰਮੁਖੀ)  
            - Telugu (తెలుగు)  
            - Malayalam (മലയാളം)  

            Always:  
            • Use simple, conversational tone as if speaking to a friend.  
            • Provide concise bullet points for steps.  
            • Offer examples using local crop names and common seasons.  
            • Encourage follow‑up questions.  

            When giving crop details, include:  
            1. *Soil Type & Preparation*  
            2. *Sowing Period & Method*  
            3. *Nutrient & Water Requirements*  
            4. *Pest/Disease Signs & Remedies*  
            5. *Harvest Indicators & Post‑Harvest Tips*  

            At the end of each reply, prompt: "क्या मैं और मदद कर सकता हूँ?", "ਕੀ ਹੋਰ ਸਹਾਇਤਾ ਚਾਹੀਦੀ ਹੈ?", "మరింత సహాయం కావాలా?", "കൂടുതൽ സഹായം വേണോ?" as appropriate. write response within 100-300 characters.
            User query: ${input}`;

            const result = await model.generateContent(agriPrompt);
            const response = await result.response;
            const text = response.text();
            
            console.log(text);
        } catch (error) {
            console.error("Error fetching from Gemini API:", error);
        }

    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F2FCE2' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: '#F2FCE2' }}>
                <Icon name="BotMessageSquare" color="green" size={46} />
                <Text style={{ fontSize: 24, fontWeight: '500', color: 'green' }}>Krishi Mitra</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 10 }}>
                <Text>Your Agricultural Assistant (Powered by Gemini AI)</Text>
            </View>
            <View style={{ borderTopWidth: 1, borderColor: 'grey', marginTop: 20 }}></View>

            {/* Chat Messages */}
            <ScrollView style={{ flex: 1, backgroundColor: 'white' }}><Text>{GEMINI_API_KEY}</Text></ScrollView>

            {/* Input Section */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, width: '100%'}}>
                <TouchableOpacity style={{ padding: 10, borderRadius: 5, height: 40, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5, borderColor: 'green', borderWidth: 1 }}><Icon name="Mic" color="green" size={24}/></TouchableOpacity>
                <TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40, flex: 1 }} onChangeText={setInput} value={input} placeholder='Type or Speak you message'/>
                <TouchableOpacity style={{ backgroundColor: 'green', padding: 10, borderRadius: 5, height: 40, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 }} onPress={sendMessage}><Icon name="Send" color="white" size={16}/></TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default ChatBot