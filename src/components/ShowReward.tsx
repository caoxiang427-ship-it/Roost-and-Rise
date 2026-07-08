import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type ShowRewardProp = {
    xp?: number;
    coins?: number;
    decrease?: boolean;
};


const ShowReward = (props: ShowRewardProp) => {
    return (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={styles.container}>
            {props.xp && !props.decrease && <Text style={styles.xp}>+{props.xp} XP</Text>}
            {props.xp && props.decrease && <Text style={styles.xp}>-{props.xp} XP</Text>}
            {props.coins &&
            <View style={styles.coinContainer}>
                <Text style={styles.coin}>+{props.coins} </Text>
                <Image
                source={require('../../assets/images/home/coin.png')}
                style={[styles.coinImage]}
                ></Image>
            </View>}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 10,
    },
    xp: {
        fontFamily: 'InterBold',
        fontSize: 15,
        color: '#008c1a'
    },
    coinContainer: {
        flexDirection: 'row',
    },
    coin: {
        fontFamily: 'InterBold',
        fontSize: 15,
        color: "#a56007"
    },
    coinImage: {
        height: 20,
        width: 20,
    },

});

export default ShowReward;