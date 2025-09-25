import React from 'react'
import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native'
import RoleCard from './RoleCard';
import CheckBox from 'react-native-check-box'
import Icon from '../Icon';
import { useNavigation } from '@react-navigation/native';

const Register = () => {
    const navigation = useNavigation();
    
    const [selectedRole, setSelectedRole] = React.useState('Farmer');
    const [terms, setTerms] = React.useState(false);
    const [fullName, setFullName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const roles = [
    { title: 'Farmer', icon: 'Leaf' },
    { title: 'Vendor', icon: 'ShoppingCart' },
    { title: 'Consumer', icon: 'Users' },
    ];

    const handleRegister = () => {
        // Handle register logic here
        if (!terms) {
            console.log('You must agree to the terms and conditions');
            return;
        }
        console.log('Registering with:', { selectedRole, fullName, email, phone, password, confirmPassword });
    }


    return (
        <ScrollView style={{ flex: 1, padding: 10 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
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
            <View style={{ marginTop: 20 }}><Text>Full Name</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} value={fullName} onChangeText={setFullName} /></View>
            <View style={{ marginTop: 20 }}><Text>Email</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} value={email} onChangeText={setEmail}/></View>
            <View style={{ marginTop: 20 }}><Text>Phone</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} value={phone} onChangeText={setPhone}/></View>
            <View style={{ marginTop: 20 }}><Text>Password</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} value={password} onChangeText={setPassword} secureTextEntry /></View>
            <View style={{ marginTop: 20 }}><Text>Confirm Password</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry /></View>
            <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, height: 30 }}>
                    <CheckBox
                        style={{ flex: 1 }}
                        onClick={() => {
                            setChecked(!terms);
                        }}
                        isChecked={terms}
                        rightText={"I agree to the terms and conditions"} />
                </View>
            </View>
            <View style={{ marginTop: 20 }}>
                <TouchableOpacity style={{ backgroundColor: 'green', padding: 10, borderRadius: 5, height: 40, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 }} onPress={handleRegister}><Text style={{ color: 'white', fontSize: 16 }}>Create Account</Text><Icon name="ArrowRight" color="white" size={16} /></TouchableOpacity>
            </View>
            <View style={{ borderTopWidth: 1, borderColor: 'grey', marginTop: 20 }}><Text style={{ textAlign: 'center', paddingTop: 10 }}>Or Continue With</Text></View>

            <View style={{ marginTop: 20, alignSelf: 'center' }}><Text>Already have an account? <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={{ color: 'green' }}>Log In</Text></TouchableOpacity></Text></View>
        </ScrollView>
    )
}

export default Register