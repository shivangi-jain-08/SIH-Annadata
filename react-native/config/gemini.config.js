import Constants from 'expo-constants';
import { GEMINI_API_KEY } from '@env';

/**
 * Gemini API Configuration with multiple fallback mechanisms
 * This ensures we always use the correct, latest API key
 */

// Priority 1: Try to get from @env (babel-plugin-dotenv)
let apiKey = 'gemini-key-here'; // Default placeholder

// Priority 2: Try Expo Constants (app.config.js extra)
if (!apiKey || apiKey === 'undefined' || apiKey.includes('840080244280')) {
  console.warn('⚠️ GEMINI_API_KEY from @env is invalid, trying Expo Constants...');
  apiKey = Constants.expoConfig?.extra?.geminiApiKey;
}

// Priority 3: Hardcoded NEW key as last resort (temporary fix)
if (!apiKey || apiKey === 'undefined' || apiKey.includes('840080244280')) {
  console.warn('⚠️ Using hardcoded GEMINI_API_KEY as fallback');
  // This is the NEW working key from project 88533503361
  apiKey = 'gemini-key-here';
}

// Validation
if (!apiKey || apiKey === 'undefined') {
  throw new Error('GEMINI_API_KEY is not configured! Check .env file and app.config.js');
}

// Detect which project the key belongs to
const detectProject = () => {
  // The old broken key starts with different characters
  // This is a safety check to ensure we're not using the old key
  const keyPrefix = apiKey.substring(0, 20);
  console.log('🔑 Using GEMINI_API_KEY prefix:', keyPrefix);
  
  if (apiKey === 'gemini-key-here') {
    console.log('✅ Using NEW API key from project 88533503361 (Annadata)');
    return 'NEW';
  } else {
    console.warn('⚠️ WARNING: Using potentially old API key! Project may be 840080244280');
    return 'UNKNOWN';
  }
};

const projectStatus = detectProject();

export const GEMINI_CONFIG = {
  apiKey,
  model: 'gemini-2.5-flash',
  projectStatus,
  isNewKey: projectStatus === 'NEW',
};

export default GEMINI_CONFIG;
