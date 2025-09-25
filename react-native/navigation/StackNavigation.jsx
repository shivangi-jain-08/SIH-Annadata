import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from './DrawerNavigation';
import Authorisation from '../pages/Authorisation';
import ChatBot from '../pages/ChatBot';
import CropRecommendation from '../farmer/pages/CropRecommendation';
import ParameterAnalysis from '../farmer/pages/ParameterAnalysis';
import DiseaseDetection from '../farmer/pages/DiseaseDetection';
import vDashboard from '../vendor/VDashboard';
import ScreenWrapper from '../components/ScreenWrapper';

const Stack = createStackNavigator();

// Wrapped standalone screens with FloatingChatBot
const WrappedCropRecommendation = () => <ScreenWrapper><CropRecommendation /></ScreenWrapper>;
const WrappedParameterAnalysis = () => <ScreenWrapper><ParameterAnalysis /></ScreenWrapper>;
const WrappedDiseaseDetection = () => <ScreenWrapper><DiseaseDetection /></ScreenWrapper>;
const WrappedVDashboard = () => <ScreenWrapper><vDashboard /></ScreenWrapper>;

const StackNavigation = () => {
  return (
    <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Auth" component={Authorisation} />
          <Stack.Screen name="ChatBot" component={ChatBot} />
          <Stack.Screen name="Drawer" component={DrawerNavigation} />

          {/*Farmers*/}
          <Stack.Screen name="CropRecommendation" component={WrappedCropRecommendation} />
          <Stack.Screen name="ParameterAnalysis" component={WrappedParameterAnalysis} />
          <Stack.Screen name="DiseaseDetection" component={WrappedDiseaseDetection} />

        {/* Vendors */}
        <Stack.Screen name="vDashboard" component={WrappedVDashboard} />
        </Stack.Navigator>
    </NavigationContainer>
  )
}

export default StackNavigation