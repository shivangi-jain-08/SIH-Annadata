/**
 * Gemini API Key Debug Info Component
 * Shows which API key is being used at runtime
 * Add this to your app to debug the API key issue
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import GEMINI_CONFIG from './config/gemini.config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GeminiDebugInfo = () => {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testApiKey = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const result = await model.generateContent('Say "Hello from project 88533503361"');
      const response = await result.response;
      const text = response.text();
      
      setTestResult({
        success: true,
        message: 'API key works!',
        project: '88533503361 (NEW)',
        response: text.substring(0, 100)
      });
    } catch (error) {
      // Extract project number from error
      const errorMessage = error.message || error.toString();
      let project = 'Unknown';
      
      if (errorMessage.includes('840080244280')) {
        project = '840080244280 (OLD - BROKEN)';
      } else if (errorMessage.includes('88533503361')) {
        project = '88533503361 (NEW)';
      }
      
      setTestResult({
        success: false,
        message: error.message,
        project,
        error: errorMessage
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Gemini API Debug Info</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>API Key Prefix:</Text>
        <Text style={styles.value}>{GEMINI_CONFIG.apiKey.substring(0, 20)}...</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Model:</Text>
        <Text style={styles.value}>{GEMINI_CONFIG.model}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Project Status:</Text>
        <Text style={[styles.value, GEMINI_CONFIG.isNewKey ? styles.success : styles.warning]}>
          {GEMINI_CONFIG.projectStatus}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Expected Key:</Text>
        <Text style={styles.value}>
          {GEMINI_CONFIG.isNewKey ? '✅ Correct' : '❌ Wrong (Old key detected)'}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.testButton, testing && styles.testButtonDisabled]} 
        onPress={testApiKey}
        disabled={testing}
      >
        <Text style={styles.testButtonText}>
          {testing ? '🔄 Testing...' : '🧪 Test API Key'}
        </Text>
      </TouchableOpacity>
      
      {testResult && (
        <View style={[styles.resultContainer, testResult.success ? styles.resultSuccess : styles.resultError]}>
          <Text style={styles.resultTitle}>
            {testResult.success ? '✅ Success!' : '❌ Error'}
          </Text>
          <Text style={styles.resultProject}>Project: {testResult.project}</Text>
          <Text style={styles.resultMessage}>{testResult.message.substring(0, 200)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  success: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  warning: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
  },
  resultSuccess: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  resultError: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultProject: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  resultMessage: {
    fontSize: 12,
    color: '#666',
  },
});

export default GeminiDebugInfo;
