import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from './DrawerNavigation';
import Authorisation from '../pages/Authorisation';
import ChatBot from '../pages/ChatBot';
import CropRecommendation from '../farmer/pages/CropRecommendation';
import ParameterAnalysis from '../farmer/pages/ParameterAnalysis';
import DiseaseDetection from '../farmer/pages/DiseaseDetection';
import CropListings from '../farmer/CropListings';
import AllOrders from '../farmer/AllOrders';
import vDashboard from '../vendor/VDashboard';
import VNearbyConsumers from '../vendor/VNearbyConsumers';
import VCart from '../vendor/VCart';
import CProductDetail from '../consumer/CProductDetail';
import CCart from '../consumer/CCart';
import CVendorMap from '../consumer/CVendorMap';
import TermsAndConditions from '../pages/TermsAndConditions';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import HelpCenter from '../pages/HelpCenter';
import ScreenWrapper from '../components/ScreenWrapper';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';
import Contact from '../pages/Contact';
import FAQ from '../pages/FAQ';
import Settings from '../pages/Settings';

const Stack = createStackNavigator();

// Wrapped standalone screens with FloatingChatBot
const WrappedCropRecommendation = (props) => <ScreenWrapper><CropRecommendation {...props} /></ScreenWrapper>;
const WrappedParameterAnalysis = (props) => <ScreenWrapper><ParameterAnalysis {...props} /></ScreenWrapper>;
const WrappedDiseaseDetection = (props) => <ScreenWrapper><DiseaseDetection {...props} /></ScreenWrapper>;
const WrappedCropListings = (props) => <ScreenWrapper><CropListings {...props} /></ScreenWrapper>;
const WrappedAllOrders = (props) => <ScreenWrapper><AllOrders {...props} /></ScreenWrapper>;
const WrappedVDashboard = (props) => <ScreenWrapper><vDashboard {...props} /></ScreenWrapper>;
const WrappedVNearbyConsumers = (props) => <ScreenWrapper><VNearbyConsumers {...props} /></ScreenWrapper>;
const WrappedVCart = (props) => <ScreenWrapper><VCart {...props} /></ScreenWrapper>;
const WrappedCProductDetail = (props) => <ScreenWrapper><CProductDetail {...props} /></ScreenWrapper>;
const WrappedCCart = (props) => <ScreenWrapper><CCart {...props} /></ScreenWrapper>;
const WrappedCVendorMap = (props) => <ScreenWrapper><CVendorMap {...props} /></ScreenWrapper>;

// Wrapped pages without ChatBot
const WrappedTermsAndConditions = () => <ScreenWrapper showChatBot={false}><TermsAndConditions /></ScreenWrapper>;
const WrappedPrivacyPolicy = () => <ScreenWrapper showChatBot={false}><PrivacyPolicy /></ScreenWrapper>;
const WrappedHelpCenter = () => <ScreenWrapper showChatBot={false}><HelpCenter /></ScreenWrapper>;
const WrappedTerms = () => <ScreenWrapper showChatBot={false}><Terms /></ScreenWrapper>;
const WrappedPrivacy = () => <ScreenWrapper showChatBot={false}><Privacy /></ScreenWrapper>;
const WrappedContact = () => <ScreenWrapper showChatBot={false}><Contact /></ScreenWrapper>;
const WrappedFAQ = () => <ScreenWrapper showChatBot={false}><FAQ /></ScreenWrapper>;
const WrappedSettings = () => <ScreenWrapper showChatBot={false}><Settings /></ScreenWrapper>;

const StackNavigation = () => {
  return (
    <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Auth" component={Authorisation} />
          <Stack.Screen name="ChatBot" component={ChatBot} />
          <Stack.Screen name="Drawer" component={DrawerNavigation} />
          
          {/* Info Pages */}
          <Stack.Screen name="TermsAndConditions" component={WrappedTermsAndConditions} />
          <Stack.Screen name="PrivacyPolicy" component={WrappedPrivacyPolicy} />
          <Stack.Screen name="HelpCenter" component={WrappedHelpCenter} />
          <Stack.Screen name="Terms" component={WrappedTerms} />
          <Stack.Screen name="Privacy" component={WrappedPrivacy} />
          <Stack.Screen name="Contact" component={WrappedContact} />
          <Stack.Screen name="FAQ" component={WrappedFAQ} />
          <Stack.Screen name="Settings" component={WrappedSettings} />

          {/*Farmers*/}
          <Stack.Screen name="CropRecommendation" component={WrappedCropRecommendation} />
          <Stack.Screen name="ParameterAnalysis" component={WrappedParameterAnalysis} />
          <Stack.Screen name="DiseaseDetection" component={WrappedDiseaseDetection} />
          <Stack.Screen name="CropListings" component={WrappedCropListings} />
          <Stack.Screen name="AllOrders" component={WrappedAllOrders} />

        {/* Vendors */}
        <Stack.Screen name="vDashboard" component={WrappedVDashboard} />
        <Stack.Screen name="VNearbyConsumers" component={WrappedVNearbyConsumers} />
        <Stack.Screen name="VCart" component={WrappedVCart} />

        {/* Consumers */}
        <Stack.Screen name="CProductDetail" component={WrappedCProductDetail} />
        <Stack.Screen name="CCart" component={WrappedCCart} />
        <Stack.Screen name="CVendorMap" component={WrappedCVendorMap} />
        </Stack.Navigator>
    </NavigationContainer>
  )
}

export default StackNavigation