import React from 'react'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import RoleCard from './RoleCard';
import CheckBox from 'react-native-check-box'
import Icon from '../Icon';

const Login = () => {
    const [role, setRole] = React.useState('Farmer');
    const [method, setMethod] = React.useState('Email');
    const [checked, setChecked] = React.useState(false);

    return (
        <View style={{ padding: 10 }}>
            <Text style={{ fontWeight: '500' }}>I am</Text>
            <View style={{ flexDirection: 'row', alignSelf: 'center', gap: 10, marginTop: 10 }}>
                <RoleCard title="Farmer" icon='Leaf' selected={true} />
                <RoleCard title="Vendor" icon="ShoppingCart" selected={false} />
                <RoleCard title="Consumer" icon="Users" selected={false} />
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={{ flex: 1, alignItems: 'center', backgroundColor: method == 'Email' ? 'green' : '#F5F6FA', borderRadius: 5, padding: 5 }} onPress={() => setMethod('Email')}><Text style={{ fontSize: 16, color: method == 'Email' ? 'white' : 'grey' }}>Email</Text></TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, alignItems: 'center', backgroundColor: method == 'Phone' ? 'green' : '#F5F6FA', borderRadius: 5, padding: 5 }} onPress={() => setMethod('Phone')}><Text style={{ fontSize: 16, color: method == 'Phone' ? 'white' : 'grey' }}>Phone</Text></TouchableOpacity>
            </View>
            {method == 'Email' ? <View style={{ marginTop: 20 }}><Text>Email</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} /></View> : <View style={{ marginTop: 20 }}><Text>Phone</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} /></View>}
            <View style={{ marginTop: 20 }}><Text>Password</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} secureTextEntry /></View>
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
                <TouchableOpacity style={{ backgroundColor: 'green', padding: 10, borderRadius: 5, height: 40, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 }}><Text style={{ color: 'white', fontSize: 16 }}>Log In</Text><Icon name="ArrowRight" color="white" size={16} /></TouchableOpacity>
            </View>
            <View style={{ borderTopWidth: 1, borderColor: 'grey', marginTop: 20 }}><Text style={{ textAlign: 'center', paddingTop: 10 }}>Or Continue With</Text></View>
            
            <View style={{ marginTop: 20, alignSelf: 'center' }}><Text>Don't have an account? <Text style={{ color: 'green' }}>Register</Text></Text></View>
        </View>
    )
}

export default Login