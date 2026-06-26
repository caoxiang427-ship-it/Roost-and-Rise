import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useCallback, forwardRef } from 'react';
import { Ionicons } from "@expo/vector-icons";
import StoreItem from './StoreItem'; 
import { STORE_ITEMS } from '@/constants/storeItems';

type StoreProps = {
    close: () => void;
    chickName: string;
    coins: number;
    onBuy: (price: number, itemId: number) => void;
    ownedItems: number[];
};

type Ref = BottomSheet;

const Store = forwardRef<Ref, StoreProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        []

    );

    return (
        <BottomSheet 
            ref={ref} 
            index={-1} 
            enableDynamicSizing={true}
            maxDynamicContentSize={700}
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            handleIndicatorStyle={{backgroundColor: '#5E4833'}}
            backdropComponent={renderBackdrop}>
            <BottomSheetFlatList
              data={STORE_ITEMS.filter(item => !props.ownedItems.includes(item.id))}
              numColumns={3}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <StoreItem imageUrl={item.image} itemName={item.name} itemPrice={item.price} coins={props.coins} onBuy={() => props.onBuy(item.price, item.id)} />
            )}
            ListHeaderComponent={() => (
                <View>
                    <View style={styles.header}>
                        <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={props.close}>
                            <Ionicons name='close' size={30} color="#FCF4D2"/>
                        </TouchableOpacity>
                        
                        <View style={styles.coin}>
                            <View style={styles.coinBar}>
                            <Text style={{ fontFamily: "Interbold", color: '#937254', fontSize: 13}}>{props.coins}</Text>
                            </View>
        
                            <Image
                            source={require('../../../assets/images/home/coin.png')}
                            style={[styles.coinImage]}
                            ></Image>
                        </View>

                    </View>

                    <View style={styles.shop}>
                        <Text style={styles.shopTitle}>🌿 Store </Text>
                    </View>
                    <Text style={styles.shopSubtitle}>Spend your coins on {props.chickName} here!</Text>
                </View>               
            )}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 90 }}
            columnWrapperStyle={{ justifyContent: 'flex-start', gap: 20, marginBottom: 5 }}
            ListEmptyComponent={() => (
                <View style={{ alignItems: 'center', padding: 20, paddingBottom: 70, }}>
                    <Text style={{fontFamily: 'InterBold', fontSize: 20, color: '#5E4833'}}>You've bought everything!</Text>
                    <Text style={{fontFamily: "InterSemiBold", fontSize: 15, color: '#937254'}}>more to come soon</Text>
                </View>
            )}
            />
        </BottomSheet>
                

    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f7f4e1',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
    },
    closeBtn: {
        backgroundColor: '#937254',
        borderRadius: 50,
        paddingVertical: 2,
        paddingHorizontal: 2,
    },
     coin: {
        marginTop: 2,
        paddingVertical: 5,
    },
    coinImage: {
        height: 30,
        width: 28,
        position: 'absolute',
    },
    coinBar: {
        backgroundColor: "#FCF4D2",
        borderColor: "#5E4833",
        borderWidth: 2,
        borderRadius: 20,
        paddingVertical: 1,
        paddingLeft: 20,
        paddingRight: 15,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start'
    },
    shop: {
        backgroundColor: '#F4E6B0',
        paddingVertical: 5,
        paddingHorizontal: 20,
        marginHorizontal: -20,
    },
    shopTitle: {
        color: "#5E4833",
        fontFamily: "InterBold",
        fontSize: 33,
    },
    shopSubtitle: {
        fontFamily: "InterSemiBold",
        fontSize: 15,
        color: '#937254',
        paddingVertical: 10,
    },
    storeItemContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        flexWrap: 'wrap',
        paddingBottom: 90,
        justifyContent: 'space-between'
    },
});

export default Store;