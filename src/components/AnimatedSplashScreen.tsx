import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native'

export default function AnimatedSplash({ ready, onFinish }: { ready: boolean, onFinish: () => void }) {
  const animationRef = useRef<LottieView>(null);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!ready) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onFinish();
    });
  }, [ready]);

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents={ready ? 'none' : 'auto'}>
      <LottieView
        ref={animationRef}
        source={require('@/assets/images/onboarding/Roost&Rise_Logo.json')}
        autoPlay
        loop
        style={{ width: 300, height: 300 }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});