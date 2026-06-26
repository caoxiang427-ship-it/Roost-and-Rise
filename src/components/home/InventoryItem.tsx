import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

type InventoryItemProps = {
    imageUrl: any,
    itemName: string,
    isEquipped: boolean,
    onEquip: () => void;
    onUnequip: () => void;
};


const InventoryItem = (props: InventoryItemProps) => {
    
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
                  <Text style={styles.itemTxt}>{props.isEquipped && 'Equipped'}</Text>
                </View>
            </View>

            <View style={styles.bottomBtns}>
                {props.isEquipped ?
                    <TouchableOpacity style={[styles.Btn, { backgroundColor: '#BC0000'}]} onPress={props.onUnequip}>
                        <Text style={styles.buyTxt}>Remove</Text>
                    </TouchableOpacity>
                :
                    <TouchableOpacity style={styles.Btn} onPress={props.onEquip}>
                        <Text style={styles.buyTxt}>Equip</Text>
                    </TouchableOpacity>
                }
            </View>
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
    bottomBtns: {
        flexDirection: 'row',
    },
    Btn: {
        backgroundColor: '#008B1A',
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginTop: 5,
        marginHorizontal: 2,
    },
    buyTxt: {
        color: "#FFF",
        fontFamily: "InterBold",
        fontSize: 12,
    }
});

export default InventoryItem;