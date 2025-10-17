import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

export const MicButton = ({ onPress, isRecording }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      // Pulse animasyonu başlat
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Animasyonu durdur ve sıfırla
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity 
        style={[
          styles.button, 
          isRecording && styles.recordingButton
        ]} 
        onPress={onPress}
      >
        <Text style={styles.text}>🎤</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    width: 60,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  recordingButton: {
    backgroundColor: '#E74C3C', // Kırmızı - Kayıt yaparken
    shadowColor: '#E74C3C',
    shadowOpacity: 0.5,
  },
  text: { fontSize: 24, color: '#fff' },
});
