import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

export default function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const animationRef = useRef<LottieView>(null);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require('@/assets/images/onboarding/Roost&Rise_Logo.json')}
        autoPlay
        loop={false}
        onAnimationFinish={onFinish}
        style={{ width: 250, height: 250 }}
      />
    </View>
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