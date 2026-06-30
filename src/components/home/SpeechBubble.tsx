import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, Easing } from 'react-native-reanimated';

type SpeechBubbleProps = {
    text: string
}
const SpeechBubble = (props: SpeechBubbleProps) => {

    const insets = useSafeAreaInsets();

    return (
        <Animated.View
            style={[styles.speechWrapper, {marginLeft: insets.left + 10}]}
            entering={FadeIn.duration(300).easing(Easing.inOut(Easing.quad))}
            exiting={ FadeOut.duration(300).easing(Easing.inOut(Easing.quad))}>
                <View style={styles.speechBubble}>
                <Text style={{color: '#937254', fontSize: 15, fontFamily: 'InterBold'}}>{props.text}</Text>
                </View>
                <View style={styles.speechBubbleTail}/>
        </Animated.View>
    )
};



const styles = StyleSheet.create({
    speechWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
        position: 'absolute',
        top: '65%',
    },
    speechBubble: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 8,
        maxWidth: 100,
    },
    speechBubbleTail: {
        width: 0,
        height: 0,
        borderTopWidth: 5,
        borderBottomWidth: 5,
        borderLeftWidth: 15,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#FFF',     // border color
    },
});

export default SpeechBubble;