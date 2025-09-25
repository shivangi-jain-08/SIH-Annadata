import React from 'react';
import { View, StyleSheet } from 'react-native';
import FloatingChatBot from './FloatingChatBot';

const ScreenWrapper = ({ children, showChatBot = true }) => {
  return (
    <View style={styles.container}>
      {children}
      {showChatBot && <FloatingChatBot />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});

export default ScreenWrapper;