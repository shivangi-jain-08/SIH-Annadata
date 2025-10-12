import React, { useRef, useEffect, useState } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Dimensions, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '../Icon';

const { width, height } = Dimensions.get('window');

const FloatingChatBot = () => {
  const navigation = useNavigation();
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const tooltipAnimation = useRef(new Animated.Value(0)).current;
  const [showTooltip, setShowTooltip] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Check user role on component mount
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserRole(user.role);
          // Only show for farmers
          setIsVisible(user.role === 'farmer');
        }
      } catch (error) {
        console.log('Error checking user role:', error);
        setIsVisible(false);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    // Only run animations if visible (farmer role)
    if (!isVisible) return;

    // Show tooltip animation
    const showTooltipAnimation = () => {
      Animated.timing(tooltipAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    };

    // Hide tooltip after 3 seconds
    const hideTooltipAnimation = () => {
      Animated.timing(tooltipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowTooltip(false);
      });
    };

    // Gentle pulse animation
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Start animations with delays
    const tooltipTimer = setTimeout(showTooltipAnimation, 1000);
    const hideTooltipTimer = setTimeout(hideTooltipAnimation, 4000);
    const pulseTimer = setTimeout(startPulse, 1500);

    return () => {
      clearTimeout(tooltipTimer);
      clearTimeout(hideTooltipTimer);
      clearTimeout(pulseTimer);
    };
  }, [isVisible]);

  const handlePress = () => {
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to ChatBot
    navigation.navigate('ChatBot');
  };

  // Don't render if user is not a farmer
  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {/* Tooltip */}
      {showTooltip && (
        <Animated.View
          style={[
            styles.tooltip,
            {
              opacity: tooltipAnimation,
              transform: [
                {
                  translateX: tooltipAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.tooltipText}>Ask Krishika! 🌱</Text>
          <View style={styles.tooltipArrow} />
        </Animated.View>
      )}

      {/* Floating Button */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { scale: scaleAnimation },
              { scale: pulseAnimation }
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {/* Krishka Bot Icon */}
          <Icon name="BotMessageSquare" size={28} color="white" />
          
          {/* AI Assistant Badge */}
          <Animated.View style={styles.badge}>
            <Text style={styles.badgeText}>AI</Text>
          </Animated.View>
          
          {/* Online indicator */}
          <Animated.View style={styles.onlineIndicator}>
            <Animated.View style={styles.onlineDot} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    // Container for the button itself
  },
  tooltip: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    position: 'relative',
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  tooltipArrow: {
    position: 'absolute',
    right: -8,
    top: '50%',
    marginTop: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: '#333',
    borderTopWidth: 4,
    borderTopColor: 'transparent',
    borderBottomWidth: 4,
    borderBottomColor: 'transparent',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
});

export default FloatingChatBot;