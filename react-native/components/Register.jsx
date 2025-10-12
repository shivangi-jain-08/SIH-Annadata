import React from 'react'
import { ScrollView, View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native'
import RoleCard from './RoleCard';
import CheckBox from 'react-native-check-box'
import Icon from '../Icon';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, buildUrl, checkNetworkConnection } from '../config/api';

const Register = () => {
    const navigation = useNavigation();
    
    const [selectedRole, setSelectedRole] = React.useState('Farmer');
    const [terms, setTerms] = React.useState(false);
    const [fullName, setFullName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [errors, setErrors] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [showErrorModal, setShowErrorModal] = React.useState(false);
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [fullNameFocused, setFullNameFocused] = React.useState(false);
    const [emailFocused, setEmailFocused] = React.useState(false);
    const [phoneFocused, setPhoneFocused] = React.useState(false);
    const [passwordFocused, setPasswordFocused] = React.useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = React.useState(false);

    const roles = [
    { title: 'Farmer', icon: 'Leaf' },
    { title: 'Vendor', icon: 'ShoppingCart' },
    { title: 'Consumer', icon: 'Users' },
    ];

    const validateInputs = () => {
        const newErrors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[+]?[\d\s-()]{10,}$/.test(phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!terms) {
            newErrors.terms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
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

            const registerData = {
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password: password,
                role: selectedRole.toLowerCase()
            };

            // Make API request
            const data = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(registerData),
            });

            if (data.success) {
                // Registration successful
                setShowSuccessModal(true);
            } else {
                // Registration failed
                setErrorMessage(data.message || 'Registration failed. Please try again.');
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrorMessage('Network error. Please check your internet connection and try again.');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
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

    const getInputContainerStyle = () => {
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
        <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
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

            {/* Full Name Input */}
            <View style={getInputContainerStyle()}>
                <Text style={getLabelStyle('fullName', fullNameFocused)}>
                    Full Name
                </Text>
                <View style={{ position: 'relative' }}>
                    <TextInput 
                        style={getInputStyle('fullName', fullNameFocused)} 
                        value={fullName} 
                        onChangeText={(text) => {
                            setFullName(text);
                            if (errors.fullName) {
                                setErrors(prev => ({ ...prev, fullName: null }));
                            }
                        }}
                        onFocus={() => setFullNameFocused(true)}
                        onBlur={() => setFullNameFocused(false)}
                        placeholder="Enter your full name"
                        placeholderTextColor="#95A5A6"
                        autoCapitalize="words"
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
                            name="User" 
                            size={20} 
                            color={fullNameFocused ? '#4CAF50' : errors.fullName ? '#FF4444' : '#95A5A6'} 
                        />
                    </View>
                </View>
                {errors.fullName && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <Icon name="AlertCircle" size={14} color="#FF4444" />
                        <Text style={{ color: '#FF4444', fontSize: 12, marginLeft: 4, flex: 1 }}>
                            {errors.fullName}
                        </Text>
                    </View>
                )}
            </View>

            {/* Email Input */}
            <View style={getInputContainerStyle()}>
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

            {/* Phone Input */}
            <View style={getInputContainerStyle()}>
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

            {/* Password Input */}
            <View style={getInputContainerStyle()}>
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

            {/* Confirm Password Input */}
            <View style={getInputContainerStyle()}>
                <Text style={getLabelStyle('confirmPassword', confirmPasswordFocused)}>
                    Confirm Password
                </Text>
                <View style={{ position: 'relative' }}>
                    <TextInput 
                        style={getInputStyle('confirmPassword', confirmPasswordFocused)} 
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword} 
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (errors.confirmPassword) {
                                setErrors(prev => ({ ...prev, confirmPassword: null }));
                            }
                        }}
                        onFocus={() => setConfirmPasswordFocused(true)}
                        onBlur={() => setConfirmPasswordFocused(false)}
                        placeholder="Confirm your password"
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
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        activeOpacity={0.7}
                    >
                        <Icon 
                            name={showConfirmPassword ? "EyeOff" : "Eye"} 
                            size={20} 
                            color={confirmPasswordFocused ? '#4CAF50' : errors.confirmPassword ? '#FF4444' : '#95A5A6'} 
                        />
                    </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <Icon name="AlertCircle" size={14} color="#FF4444" />
                        <Text style={{ color: '#FF4444', fontSize: 12, marginLeft: 4, flex: 1 }}>
                            {errors.confirmPassword}
                        </Text>
                    </View>
                )}
            </View>

            {/* Terms and Conditions */}
            <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'flex-start' }}>
                <CheckBox
                    style={{ flex: 1 }}
                    onClick={() => {
                        setTerms(!terms);
                        if (errors.terms) {
                            setErrors(prev => ({ ...prev, terms: null }));
                        }
                    }}
                    isChecked={terms}
                    rightText={"I agree to the terms and conditions"}
                    rightTextStyle={{ fontSize: 14, color: errors.terms ? '#FF4444' : '#666', flex: 1 }}
                    checkBoxColor={errors.terms ? '#FF4444' : '#4CAF50'}
                />
            </View>
            {errors.terms && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Icon name="AlertCircle" size={14} color="#FF4444" />
                    <Text style={{ color: '#FF4444', fontSize: 12, marginLeft: 4, flex: 1 }}>
                        {errors.terms}
                    </Text>
                </View>
            )}

            {/* Register Button */}
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
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                                Create Account
                            </Text>
                            <Icon name="ArrowRight" color="white" size={16} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: 20, alignSelf: 'center' }}>
                <Text style={{ textAlign: 'center', fontSize: 14 }}>
                    Already have an account?{' '}
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={{ color: '#4CAF50', fontWeight: '600' }}>Log In</Text>
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
                                Registration Failed
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

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
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
                                backgroundColor: '#E8F5E8',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 12,
                            }}>
                                <Icon name="CheckCircle" size={30} color="#4CAF50" />
                            </View>
                            <Text style={{
                                fontSize: 18,
                                fontWeight: '600',
                                color: '#333',
                                textAlign: 'center',
                                marginBottom: 8,
                            }}>
                                Account Created Successfully!
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: '#666',
                                textAlign: 'center',
                                lineHeight: 20,
                            }}>
                                Welcome to Annadata! You can now log in with your credentials.
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
                            onPress={() => {
                                setShowSuccessModal(false);
                                navigation.navigate('Login');
                            }}
                        >
                            <Text style={{
                                color: 'white',
                                fontSize: 16,
                                fontWeight: '600',
                            }}>
                                Go to Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    )
}

export default Register