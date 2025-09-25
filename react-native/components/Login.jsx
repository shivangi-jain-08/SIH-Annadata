import React from 'react'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import RoleCard from './RoleCard';
import CheckBox from 'react-native-check-box'
import Icon from '../Icon';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
    const navigation = useNavigation();

    const [selectedRole, setSelectedRole] = React.useState('Farmer');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [method, setMethod] = React.useState('Email');
    const [checked, setChecked] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleLogin = () => {
        // Handle login logic here
        if (!validateInputs()) {
            console.log('Invalid inputs: ', error);
            return;
        }
        console.log('Logging in with:', { selectedRole, email, phone, password, method });
        navigation.navigate('Drawer', { screen: 'BottomTab', params: { role: selectedRole } });
    }

    const roles = [
    { title: 'Farmer', icon: 'Leaf' },
    { title: 'Vendor', icon: 'ShoppingCart' },
    { title: 'Consumer', icon: 'Users' },
    ];

    const validateInputs = () => {
        if (method === 'Email' && !email) {
            setError('Email is required');
            return false;
        }
        if (method === 'Phone' && !phone) {
            setError('Phone number is required');
            return false;
        }
        if (!password) {
            setError('Password is required');
            return false;
        }
        setError('');
        return true;
    }

    return (
        <View style={{ padding: 10 }}>
            <Text style={{ fontWeight: '500' }}>I am</Text>
            <View style={{ flexDirection: 'row', alignSelf: 'center', gap: 10, marginTop: 10 }}>
                {roles.map((role) => (
                    <RoleCard
                    key={role.title}
                    title={role.title}
                    icon={role.icon}
                    selected={selectedRole === role.title} // Pass true/false based on state
                    onPress={() => setSelectedRole(role.title)} // Update state on press
                    />
                ))}
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={{ flex: 1, alignItems: 'center', backgroundColor: method == 'Email' ? 'green' : '#F5F6FA', borderRadius: 5, padding: 5 }} onPress={() => setMethod('Email')}><Text style={{ fontSize: 16, color: method == 'Email' ? 'white' : 'grey' }}>Email</Text></TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, alignItems: 'center', backgroundColor: method == 'Phone' ? 'green' : '#F5F6FA', borderRadius: 5, padding: 5 }} onPress={() => setMethod('Phone')}><Text style={{ fontSize: 16, color: method == 'Phone' ? 'white' : 'grey' }}>Phone</Text></TouchableOpacity>
            </View>
            {method == 'Email' ? <View style={{ marginTop: 20 }}><Text>Email</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} value={email} onChangeText={setEmail} /></View> : <View style={{ marginTop: 20 }}><Text>Phone</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} value={phone} onChangeText={setPhone} /></View>}
            <View style={{ marginTop: 20 }}><Text>Password</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} secureTextEntry value={password} onChangeText={setPassword} /></View>
            <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, height: 30 }}>
                    <CheckBox
                        style={{ flex: 1 }}
                        onClick={() => {
                            setChecked(!checked);
                        }}
                        isChecked={checked}
                        rightText={"Remember me"} />
                </View>
                <TouchableOpacity><Text style={{ color: 'green' }}>Forgot Password?</Text></TouchableOpacity>
            </View>
            <View style={{ marginTop: 20 }}>
                <TouchableOpacity style={{ backgroundColor: 'green', padding: 10, borderRadius: 5, height: 40, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 }} onPress={handleLogin}><Text style={{ color: 'white', fontSize: 16 }}>Log In</Text><Icon name="ArrowRight" color="white" size={16} /></TouchableOpacity>
            </View>
            <View style={{ borderTopWidth: 1, borderColor: 'grey', marginTop: 20 }}><Text style={{ textAlign: 'center', paddingTop: 10 }}>Or Continue With</Text></View>

            <View style={{ marginTop: 20, alignSelf: 'center' }}><Text>Don't have an account? <TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={{ color: 'green' }}>Register</Text></TouchableOpacity></Text></View>
        </View>
    )
}

export default Login