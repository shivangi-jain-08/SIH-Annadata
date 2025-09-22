import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Login from '../components/Login';
import Register from '../components/Register';
import { View, Text, TouchableOpacity } from 'react-native';

const Tab = createMaterialTopTabNavigator();

const CustomTab = ({ state, navigation }) => {
    return (
        <View style={{ backgroundColor: '#F5F6FA', padding: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ flex: 1, alignItems: 'center', borderRadius: 10, backgroundColor: state.index === 0 ? 'white' : '#F5F6FA', padding: 5 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={{ fontSize: 20, fontWeight: '500', color: state.index === 0 ? 'black' : 'grey' }}>Log In</Text></TouchableOpacity>
            </View>
            <View style={{ flex: 1, alignItems: 'center', borderRadius: 10, backgroundColor: state.index === 1 ? 'white' : '#F5F6FA', padding: 5 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={{ fontSize: 20, fontWeight: '500', color: state.index === 1 ? 'black' : 'grey' }}>Register</Text></TouchableOpacity>
            </View>
        </View>
    )
}

const TabNavigation = () => {
    return (
        <Tab.Navigator tabBar={props => <CustomTab {...props} />}>
            <Tab.Screen name="Login" component={Login} />
            <Tab.Screen name="Register" component={Register} />
        </Tab.Navigator>
    )
}

export default TabNavigation