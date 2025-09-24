import React from 'react'
import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native'
import RoleCard from './RoleCard';
import CheckBox from 'react-native-check-box'
import Icon from '../Icon';

const Register = () => {
    const [role, setRole] = React.useState('Farmer');
    const [checked, setChecked] = React.useState(false);

    return (
        <ScrollView style={{ flex: 1, padding: 10 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
            <Text style={{ fontWeight: '500' }}>I am</Text>
            <View style={{ flexDirection: 'row', alignSelf: 'center', gap: 10, marginTop: 10 }}>
                <RoleCard title="Farmer" icon='Leaf' selected={true} />
                <RoleCard title="Vendor" icon="ShoppingCart" selected={false} />
                <RoleCard title="Consumer" icon="Users" selected={false} />
            </View>
            <View style={{ marginTop: 20 }}><Text>Full Name</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} /></View>
            <View style={{ marginTop: 20 }}><Text>Email</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} /></View>
            <View style={{ marginTop: 20 }}><Text>Phone</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} /></View>
            <View style={{ marginTop: 20 }}><Text>Password</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} secureTextEntry /></View>
            <View style={{ marginTop: 20 }}><Text>Confirm Password</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} secureTextEntry /></View>
            <View style={{ marginTop: 20 }}><Text>Farm Name</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} /></View>
            <View style={{ marginTop: 20 }}><Text>Farm Location</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} /></View>
            <View style={{ marginTop: 20 }}><Text>Farm Size (in Acres)</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} /></View>
            <View style={{ marginTop: 20 }}><Text>Primary Crops</Text><TextInput style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, padding: 5, height: 40 }} /></View>
            <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, height: 30 }}>
                    <CheckBox
                        style={{ flex: 1 }}
                        onClick={() => {
                            setChecked(!checked);
                        }}
                        isChecked={checked}
                        rightText={"I agree to the terms and conditions"} />
                </View>
            </View>
            <View style={{ marginTop: 20 }}>
                <TouchableOpacity style={{ backgroundColor: 'green', padding: 10, borderRadius: 5, height: 40, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 }}><Text style={{ color: 'white', fontSize: 16 }}>Create Account</Text><Icon name="ArrowRight" color="white" size={16} /></TouchableOpacity>
            </View>
            <View style={{ borderTopWidth: 1, borderColor: 'grey', marginTop: 20 }}><Text style={{ textAlign: 'center', paddingTop: 10 }}>Or Continue With</Text></View>
            
            <View style={{ marginTop: 20, alignSelf: 'center' }}><Text>Already have an account? <Text style={{ color: 'green' }}>Log In</Text></Text></View>
        </ScrollView>
    )
}

export default Register