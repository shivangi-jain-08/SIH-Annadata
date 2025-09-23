import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from './DrawerNavigation';
import Authorisation from '../pages/Authorisation';
import ChatBot from '../pages/ChatBot';

const Stack = createStackNavigator();

const StackNavigation = () => {
  return (
    <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Auth" component={Authorisation} />
          <Stack.Screen name="ChatBot" component={ChatBot} />
          <Stack.Screen name="Drawer" component={DrawerNavigation} />
        </Stack.Navigator>
    </NavigationContainer>
  )
}

export default StackNavigation