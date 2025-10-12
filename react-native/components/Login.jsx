import React from 'react'
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native'
import RoleCard from './RoleCard';
import CheckBox from 'react-native-check-box'
import Icon from '../Icon';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, buildUrl, checkNetworkConnection } from '../config/api';

const Login = () => {
    const navigation = useNavigation();

    const [selectedRole, setSelectedRole] = React.useState('Farmer');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [method, setMethod] = React.useState('Email');
    const [checked, setChecked] = React.useState(false);
    const [errors, setErrors] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [showErrorModal, setShowErrorModal] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [emailFocused, setEmailFocused] = React.useState(false);
    const [phoneFocused, setPhoneFocused] = React.useState(false);
    const [passwordFocused, setPasswordFocused] = React.useState(false);

    const handleLogin = async () => {
        // Clear previous errors
        setErrors({});
        
        // Validate inputs
        if (!validateInputs()) {
            return;
        }

        setLoading(true);

        try {
            // Check network connection first
            const isConnected = await checkNetworkConnection();
            if (!isConnected) {
                setErrorMessage('Unable to connect to server. Please check your internet connection and ensure the backend server is running.');
                setShowErrorModal(true);
                setLoading(false);
                return;
            }

            const loginData = {
                email: method === 'Email' ? email : '', 
                phone: method === 'Phone' ? phone : '',
                password: password,
                role: selectedRole.toLowerCase()
            };

            // For phone login, we need to get user by phone first since backend expects email
            let loginEmail = email;
            if (method === 'Phone') {
                // For now, use phone as email - this needs backend adjustment for production
                loginEmail = phone + '@phone.login';
            }

            // Make API request using the new configuration
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: method === 'Email' ? email : phone, // Backend currently expects email
                    password: password
                }),
            });

            if (data.success) {
                // Store user data and token
                await AsyncStorage.setItem('userToken', data.data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
                
                // Check if user role matches selected role
                if (data.data.user.role !== selectedRole.toLowerCase()) {
                    setErrorMessage(`Your account is registered as ${data.data.user.role}. Please select the correct role.`);
                    setShowErrorModal(true);
                    setLoading(false);
                    return;
                }

                console.log('Login successful:', data.data.user);
                navigation.navigate('Drawer', { 
                    screen: 'BottomTab', 
                    params: { 
                        role: selectedRole,
                        userData: data.data.user 
                    } 
                });
            } else {
                // Login failed
                setErrorMessage(data.message || 'Login failed. Please check your credentials.');
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('Network error. Please check your internet connection and try again.');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
    { title: 'Farmer', icon: 'Leaf' },
    { title: 'Vendor', icon: 'ShoppingCart' },
    { title: 'Consumer', icon: 'Users' },
    ];

    const validateInputs = () => {
        const newErrors = {};

        if (method === 'Email') {
            if (!email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                newErrors.email = 'Please enter a valid email address';
            }
        }

        if (method === 'Phone') {
            if (!phone.trim()) {
                newErrors.phone = 'Phone number is required';
            } else if (!/^[+]?[\d\s-()]{10,}$/.test(phone)) {
                newErrors.phone = 'Please enter a valid phone number';
            }
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getInputStyle = (fieldName, isFocused = false) => {
        const hasError = errors[fieldName];
        
        return {
            borderWidth: 2,
            borderColor: hasError 
                ? '#FF4444' 
                : isFocused 
                    ? '#4CAF50' 
                    : '#E1E5E9',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            height: 56,
            fontSize: 16,
            backgroundColor: isFocused ? '#FFFFFF' : '#F8F9FA',
            color: '#2C3E50',
            elevation: isFocused ? 2 : 0,
            shadowColor: isFocused ? '#4CAF50' : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isFocused ? 0.1 : 0,
            shadowRadius: isFocused ? 4 : 0,
        };
    };

    const getInputContainerStyle = (fieldName, isFocused = false) => {
        return {
            position: 'relative',
            marginTop: 20,
        };
    };

    const getLabelStyle = (fieldName, isFocused = false) => {
        const hasError = errors[fieldName];
        
        return {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 8,
            color: hasError 
                ? '#FF4444' 
                : isFocused 
                    ? '#4CAF50' 
                    : '#34495E',
        };
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                I am a
            </Text>
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
            <View style={{ marginTop: 24, flexDirection: 'row', gap: 12, backgroundColor: '#F5F6FA', borderRadius: 8, padding: 4 }}>
                <TouchableOpacity 
                    style={{ 
                        flex: 1, 
                        alignItems: 'center', 
                        backgroundColor: method === 'Email' ? '#4CAF50' : 'transparent', 
                        borderRadius: 6, 
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                    }} 
                    onPress={() => {
                        setMethod('Email');
                        setErrors({}); // Clear errors when switching methods
                    }}
                >
                    <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '600',
                        color: method === 'Email' ? 'white' : '#666' 
                    }}>
                        Email
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{ 
                        flex: 1, 
                        alignItems: 'center', 
                        backgroundColor: method === 'Phone' ? '#4CAF50' : 'transparent', 
                        borderRadius: 6, 
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                    }} 
                    onPress={() => {
                        setMethod('Phone');
                        setErrors({}); // Clear errors when switching methods
                    }}
                >
                    <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '600',
                        color: method === 'Phone' ? 'white' : '#666' 
                    }}>
                        Phone
                    </Text>
                </TouchableOpacity>
            </View>
            {method === 'Email' ? (
                <View style={getInputContainerStyle('email', emailFocused)}>
                    <Text style={getLabelStyle('email', emailFocused)}>
                        Email Address
                    </Text>
                    <View style={{ position: 'relative' }}>
                        <TextInput 
                            style={getInputStyle('email', emailFocused)} 
                            value={email} 
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) {
                                    setErrors(prev => ({ ...prev, email: null }));
                                }
                            }}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            placeholder="Enter your email address"
                            placeholderTextColor="#95A5A6"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <View style={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            width: 24,
                            height: 24,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Icon 
                                name="Mail" 
                                size={20} 
                                color={emailFocused ? '#4CAF50' : errors.email ? '#FF4444' : '#95A5A6'} 
                            />
                        </View>
                    </View>
                    {errors.email && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Icon name="AlertCircle" size={14} color="#FF4444" />
                            <Text style={{ color: '#FF4444', fontSize: 12, marginLeft: 4, flex: 1 }}>
                                {errors.email}
                            </Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={getInputContainerStyle('phone', phoneFocused)}>
                    <Text style={getLabelStyle('phone', phoneFocused)}>
                        Phone Number
                    </Text>
                    <View style={{ position: 'relative' }}>
                        <TextInput 
                            style={getInputStyle('phone', phoneFocused)} 
                            value={phone} 
                            onChangeText={(text) => {
                                setPhone(text);
                                if (errors.phone) {
                                    setErrors(prev => ({ ...prev, phone: null }));
                                }
                            }}
                            onFocus={() => setPhoneFocused(true)}
                            onBlur={() => setPhoneFocused(false)}
                            placeholder="Enter your phone number"
                            placeholderTextColor="#95A5A6"
                            keyboardType="phone-pad"
                        />
                        <View style={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            width: 24,
                            height: 24,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Icon 
                                name="Phone" 
                                size={20} 
                                color={phoneFocused ? '#4CAF50' : errors.phone ? '#FF4444' : '#95A5A6'} 
                            />
                        </View>
                    </View>
                    {errors.phone && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Icon name="AlertCircle" size={14} color="#FF4444" />
                            <Text style={{ color: '#FF4444', fontSize: 12, marginLeft: 4, flex: 1 }}>
                                {errors.phone}
                            </Text>
                        </View>
                    )}
                </View>
            )}
            
            <View style={getInputContainerStyle('password', passwordFocused)}>
                <Text style={getLabelStyle('password', passwordFocused)}>
                    Password
                </Text>
                <View style={{ position: 'relative' }}>
                    <TextInput 
                        style={getInputStyle('password', passwordFocused)} 
                        secureTextEntry={!showPassword}
                        value={password} 
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) {
                                setErrors(prev => ({ ...prev, password: null }));
                            }
                        }}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        placeholder="Enter your password"
                        placeholderTextColor="#95A5A6"
                    />
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            width: 24,
                            height: 24,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                    >
                        <Icon 
                            name={showPassword ? "EyeOff" : "Eye"} 
                            size={20} 
                            color={passwordFocused ? '#4CAF50' : errors.password ? '#FF4444' : '#95A5A6'} 
                        />
                    </TouchableOpacity>
                </View>
                {errors.password && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <Icon name="AlertCircle" size={14} color="#FF4444" />
                        <Text style={{ color: '#FF4444', fontSize: 12, marginLeft: 4, flex: 1 }}>
                            {errors.password}
                        </Text>
                    </View>
                )}
            </View>
            <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                    <CheckBox
                        style={{ flex: 1 }}
                        onClick={() => {
                            setChecked(!checked);
                        }}
                        isChecked={checked}
                        rightText={"Remember me"}
                        rightTextStyle={{ fontSize: 14, color: '#666' }}
                        checkBoxColor={'#4CAF50'}
                    />
                </View>
                <TouchableOpacity>
                    <Text style={{ color: '#4CAF50', fontSize: 14, fontWeight: '600' }}>
                        Forgot Password?
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: 30 }}>
                <TouchableOpacity 
                    style={{ 
                        backgroundColor: loading ? '#CCCCCC' : '#4CAF50', 
                        padding: 15, 
                        borderRadius: 8, 
                        height: 50, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        flexDirection: 'row', 
                        gap: 8,
                        elevation: 2,
                        shadowColor: '#4CAF50',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    }} 
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                                Log In
                            </Text>
                            <Icon name="ArrowRight" color="white" size={16} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: 20, alignSelf: 'center' }}>
                <Text style={{ textAlign: 'center', fontSize: 14 }}>
                    Don't have an account?{' '}
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={{ color: '#4CAF50', fontWeight: '600' }}>Register</Text>
                    </TouchableOpacity>
                </Text>
            </View>

            {/* Error Modal */}
            <Modal
                visible={showErrorModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowErrorModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 30,
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        padding: 24,
                        width: '100%',
                        maxWidth: 300,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                    }}>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                                width: 60,
                                height: 60,
                                borderRadius: 30,
                                backgroundColor: '#FFEBEE',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 12,
                            }}>
                                <Icon name="AlertCircle" size={30} color="#F44336" />
                            </View>
                            <Text style={{
                                fontSize: 18,
                                fontWeight: '600',
                                color: '#333',
                                textAlign: 'center',
                                marginBottom: 8,
                            }}>
                                Login Unsuccessful
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: '#666',
                                textAlign: 'center',
                                lineHeight: 20,
                            }}>
                                {errorMessage}
                            </Text>
                        </View>
                        
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#4CAF50',
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 8,
                                alignItems: 'center',
                            }}
                            onPress={() => setShowErrorModal(false)}
                        >
                            <Text style={{
                                color: 'white',
                                fontSize: 16,
                                fontWeight: '600',
                            }}>
                                Try Again
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Login