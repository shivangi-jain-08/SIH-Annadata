// User Service for User Data Management

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../config/api';

class UserService {
    
    // Get current user data from AsyncStorage
    static async getCurrentUser() {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                return JSON.parse(userData);
            }
            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Get user token from AsyncStorage
    static async getUserToken() {
        try {
            const token = await AsyncStorage.getItem('userToken');
            return token;
        } catch (error) {
            console.error('Error getting user token:', error);
            return null;
        }
    }

    // Fetch fresh user profile from API
    static async fetchUserProfile(userId = null) {
        try {
            const token = await this.getUserToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            let endpoint = '/users/profile';
            if (userId) {
                endpoint = `/users/profile/${userId}`;
            }

            console.log('Fetching user profile from:', endpoint);

            const response = await apiRequest(endpoint, {
                method: 'GET',
                headers,
            });

            if (response.success && response.data) {
                // Handle nested user object structure
                const userData = response.data.user || response.data;
                
                // Update AsyncStorage with fresh data
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                return userData;
            } else {
                throw new Error(response.message || 'Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            
            // Fallback to cached data
            const cachedUser = await this.getCurrentUser();
            if (cachedUser) {
                return cachedUser;
            }
            
            throw new Error('Failed to fetch user profile. Please check your connection.');
        }
    }

    // Update user profile
    static async updateUserProfile(profileData) {
        try {
            const token = await this.getUserToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            console.log('Updating user profile...');

            const response = await apiRequest('/users/profile', {
                method: 'PUT',
                headers,
                body: JSON.stringify(profileData),
            });

            if (response.success && response.data) {
                // Handle nested user object structure
                const userData = response.data.user || response.data;
                
                // Update AsyncStorage with updated data
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                
                return {
                    success: true,
                    data: userData
                };
            } else {
                throw new Error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
            // Return success with local update for offline mode
            return {
                success: true,
                data: profileData,
                isOffline: true
            };
        }
    }

    // Get user profile (combines cached and API data)
    static async getUserProfile() {
        try {
            const token = await this.getUserToken();
            if (!token) {
                // Return cached data if no token
                const cachedUser = await this.getCurrentUser();
                return {
                    success: true,
                    data: cachedUser,
                    isCached: true
                };
            }

            // Try to fetch from API
            const freshData = await this.fetchUserProfile();
            return {
                success: true,
                data: freshData
            };
        } catch (error) {
            console.error('Error getting user profile:', error);
            
            // Fallback to cached data
            const cachedUser = await this.getCurrentUser();
            return {
                success: true,
                data: cachedUser,
                isCached: true
            };
        }
    }

    // Update profile image URL specifically
    static async updateProfileImage(profileUrl) {
        try {
            const currentUser = await this.getCurrentUser();
            if (!currentUser) {
                throw new Error('No user data found');
            }

            const updatedData = await this.updateUserProfile({ 
                profileUrl: profileUrl 
            });

            return updatedData;
        } catch (error) {
            console.error('Error updating profile image:', error);
            throw new Error('Failed to update profile image. Please try again.');
        }
    }

    // Clear user data (logout)
    static async clearUserData() {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            return true;
        } catch (error) {
            console.error('Error clearing user data:', error);
            return false;
        }
    }

    // Check if user is logged in
    static async isUserLoggedIn() {
        try {
            const token = await this.getUserToken();
            const userData = await this.getCurrentUser();
            return !!(token && userData);
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }

    // Format user data for display
    static formatUserData(userData) {
        if (!userData) return null;

        // Extract location details from address
        const parseLocationFromAddress = (address) => {
            if (!address) return {};
            
            const parts = address.split(', ');
            let village = '';
            let district = '';
            let state = '';
            let pincode = '';

            // Try to extract from common address formats
            if (parts.length >= 2) {
                village = parts[0] || '';
                
                // Look for state (usually contains common Indian state names)
                const stateIndex = parts.findIndex(part => 
                    part.toLowerCase().includes('punjab') ||
                    part.toLowerCase().includes('haryana') ||
                    part.toLowerCase().includes('rajasthan') ||
                    part.toLowerCase().includes('uttar pradesh') ||
                    part.toLowerCase().includes('gujarat') ||
                    part.toLowerCase().includes('maharashtra')
                );
                
                if (stateIndex !== -1) {
                    state = parts[stateIndex];
                    // District is usually before state
                    if (stateIndex > 0) {
                        district = parts[stateIndex - 1];
                    }
                }

                // Look for pincode (6 digits)
                const pincodeMatch = address.match(/\b\d{6}\b/);
                if (pincodeMatch) {
                    pincode = pincodeMatch[0];
                }
            }

            return { village, district, state, pincode };
        };

        const locationInfo = parseLocationFromAddress(userData.address);
        const coordinates = userData.location?.coordinates || userData.coordinates || [];

        return {
            id: userData._id || userData.id,
            fullName: userData.name || userData.fullName || 'Unknown User',
            email: userData.email || 'No email provided',
            phone: userData.phone || 'No phone provided',
            role: userData.role || 'user',
            location: userData.location || {},
            coordinates: coordinates,
            address: userData.address || 'No address provided',
            village: userData.village || locationInfo.village || 'Unknown Village',
            state: userData.state || locationInfo.state || 'Unknown State',
            district: userData.district || locationInfo.district || 'Unknown District',
            pincode: userData.pincode || locationInfo.pincode || 'Unknown',
            profileImage: userData.profileImage || userData.avatar || null,
            profileUrl: userData.profileUrl || null, // New profileUrl field for image URL
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            isActive: userData.isActive,
        };
    }

    // Get user role with proper formatting
    static getUserRole(userData) {
        if (!userData || !userData.role) return 'User';
        
        const role = userData.role.toLowerCase();
        switch (role) {
            case 'farmer':
                return 'Farmer';
            case 'vendor':
                return 'Vendor';
            case 'consumer':
                return 'Consumer';
            case 'buyer':
                return 'Buyer';
            default:
                return 'User';
        }
    }

    // Get user initials for avatar
    static getUserInitials(userData) {
        if (!userData) return 'U';
        
        const name = userData.name || userData.fullName || 'User';
        const names = name.split(' ');
        
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        } else if (names.length === 1) {
            return names[0].substring(0, 2).toUpperCase();
        }
        
        return 'U';
    }

    // Get profile image URL with fallback to generated avatar
    static getProfileImageUrl(userData, size = 120) {
        // Priority: profileUrl -> profileImage -> generated avatar
        if (userData?.profileUrl) {
            return userData.profileUrl;
        }
        
        if (userData?.profileImage) {
            return userData.profileImage;
        }
        
        // Fallback to generated avatar
        return this.getAvatarUrl(userData, size);
    }

    // Generate avatar URL with initials (fallback when no profile image)
    static getAvatarUrl(userData, size = 120) {
        const initials = this.getUserInitials(userData);
        const colors = ['4CAF50', '2196F3', 'FF9800', '9C27B0', 'F44336', '00BCD4'];
        const role = userData?.role || 'user';
        
        // Generate color based on role
        let colorIndex = 0;
        if (role === 'farmer') colorIndex = 0;
        else if (role === 'vendor') colorIndex = 1;
        else if (role === 'consumer') colorIndex = 2;
        else colorIndex = Math.floor(Math.random() * colors.length);
        
        const bgColor = colors[colorIndex];
        return `https://via.placeholder.com/${size}/${bgColor}/FFFFFF?text=${initials}`;
    }

    // Get user stats (if available from API)
    static async getUserStats(userId = null) {
        try {
            const token = await this.getUserToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            let endpoint = '/users/stats';
            if (userId) {
                endpoint = `/users/stats/${userId}`;
            }

            const response = await apiRequest(endpoint, {
                method: 'GET',
                headers,
            });

            return response.success ? response.data : {};
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return {};
        }
    }

    // Generate mock user data for testing
    static generateMockUserData() {
        return {
            _id: '64f8b2a1e5d3c2b1a0987654',
            name: 'Rajesh Kumar Singh',
            email: 'rajesh.kumar@example.com',
            phone: '+91 9876543210',
            role: 'farmer',
            location: {
                village: 'Khairpur Village',
                district: 'Ludhiana',
                state: 'Punjab',
                pincode: '141008'
            },
            coordinates: [75.8573, 30.8408], // Ludhiana coordinates
            address: 'Village Khairpur, Ludhiana, Punjab, India',
            profileImage: null,
            profileUrl: null, // New profileUrl field for image URL
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-09-26T08:20:00Z'
        };
    }

    // Reverse geocode coordinates to address using LocationService
    static async reverseGeocodeLocation(latitude, longitude) {
        try {
            const LocationService = require('./LocationService').default;
            const addressInfo = await LocationService.reverseGeocode(latitude, longitude);
            
            return {
                street: addressInfo.street || '',
                city: addressInfo.city || '',
                state: addressInfo.state || '',
                country: addressInfo.country || 'India',
                pincode: addressInfo.postalCode || '',
                formattedAddress: addressInfo.formattedAddress || `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            };
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            // Return coordinates as fallback
            return {
                street: 'Current Location',
                city: 'Unknown',
                state: 'Unknown',
                country: 'India',
                pincode: '',
                formattedAddress: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            };
        }
    }
}

export default UserService;

// Helper functions for easy import
export const getCurrentUser = UserService.getCurrentUser.bind(UserService);
export const fetchUserProfile = UserService.fetchUserProfile.bind(UserService);
export const formatUserData = UserService.formatUserData.bind(UserService);
export const getUserRole = UserService.getUserRole.bind(UserService);
export const getAvatarUrl = UserService.getAvatarUrl.bind(UserService);
export const getProfileImageUrl = UserService.getProfileImageUrl.bind(UserService);
export const updateProfileImage = UserService.updateProfileImage.bind(UserService);