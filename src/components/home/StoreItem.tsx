import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Alert } from 'react-native';

type StoreItemProps = {
    imageUrl: any,
    itemName: string,
    itemPrice: number,
    coins: number,
    onBuy: () => void,
};


const StoreItem = (props: StoreItemProps) => {

    const handleBuying = () => {
        if (props.coins < props.itemPrice) {
            Alert.alert(
                "Not enough coins :(",
                "Keep earning more!",
                [{ text: "OK" }]                
            );
            return;
        }

        Alert.alert(
        'Buy item?',
        'Are you sure?',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Buy', onPress: () => props.onBuy() },
        ]
        );
    }
    
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 10,}}>
            <View style={styles.container}>
                <Text style={styles.itemTxt}>{props.itemName}</Text>
                <View style={styles.imageContainer}>
                    <Image
                      source={props.imageUrl}
                      style={{width:60, height: 60}}
                      ></Image>
                </View>
                <View style={styles.priceContainer}>
                <Image
                  source={require('../../../assets/images/home/coin.png')}
                  style={{width: 18, height: 20, marginHorizontal: 1,}}
                  ></Image>
                  <Text style={styles.itemTxt}>{props.itemPrice}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.buyBtn} onPress={handleBuying}>
                <Text style={styles.buyTxt}>Buy</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F4E6B0",
        borderWidth: 2,
        borderRadius: 20,
        borderColor: '#5E4833',
        justifyContent: 'center',
        alignItems: 'center',
        height: 130,
        width: 105,
    },
    imageContainer: {
        backgroundColor: '#FFF',
        alignSelf: 'stretch',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 5,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    itemTxt: {
        fontFamily: "InterBold",
        color: "#5E4833",
        fontSize: 15,
        paddingVertical: 3,
    },
    buyBtn: {
        backgroundColor: '#008B1A',
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginTop: 5,
    },
    buyTxt: {
        color: "#FFF",
        fontFamily: "InterBold",
        fontSize: 12,
    }
});

export default StoreItem;