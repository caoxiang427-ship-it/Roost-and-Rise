import { STORE_ITEMS, ItemCategory } from '@/constants/home';
import { useProfileStore } from '@/store/useProfileStore';
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useCallback, useState } from 'react';
import { Modal, Image, StyleSheet, Text, TouchableOpacity, View, Pressable, FlatList } from 'react-native';
import 'react-native-gesture-handler';
import StoreItem from './StoreItem';
import { ImageBackground } from 'expo-image';

type StoreProps = {
    visible: boolean,
    close: () => void;
};

const Store = (props: StoreProps) => {

    const TABS: { key: ItemCategory; label: string }[] = [
    { key: 'hats', label: 'Hats' },
    { key: 'accessories', label: 'Accessories' },
    { key: 'others', label: 'Others' },
    ];

    const [activeTab, setActiveTab] = useState<ItemCategory>('hats');

    const {
        chickName,
        coins,
        ownedItemIds
    } = useProfileStore();

    // filter out items the user does not own
    const visibleItems = STORE_ITEMS.filter(
        (item) => item.category === activeTab && !ownedItemIds.includes(item.id),
    );


    return (
        <Modal
            visible={props.visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={props.close} // Android back button
            >
            <View style={styles.overlay}>
                {/* tap outside the card to close */}
                <Pressable style={StyleSheet.absoluteFill} onPress={props.close} />

                <ImageBackground
                    source={require("@/assets/images/home/store.png")}
                    contentFit='contain'
                    style={styles.container}>

                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeBtn} onPress={props.close}>
                        <Ionicons name="close" size={30} color="#FCF4D2" />
                        </TouchableOpacity>

                        <View style={styles.coin}>
                            <View style={styles.coinBar}>
                                <Text style={{ fontFamily: 'InterBold', color: '#937254', fontSize: 13 }}>
                                {coins}
                                </Text>
                            </View>
                            <Image
                                source={require('../../../assets/images/home/coin.png')}
                                style={styles.coinImage}
                            />
                        </View>
                    </View>


                    {/* tab bar */}
                    <View style={styles.tabBar}>
                        {TABS.map((tab) => {
                        const active = tab.key === activeTab;
                        return (
                            <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, active && styles.tabActive]}
                            onPress={() => setActiveTab(tab.key)}
                            >
                            <Text style={styles.tabText}>
                                {tab.label}
                            </Text>
                            </TouchableOpacity>
                        );
                        })}
                    </View>

                        <FlatList
                        style={styles.list}
                        data={visibleItems}
                        numColumns={2}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                        <StoreItem
                        imageUrl={item.image}
                        itemId={item.id}
                        itemName={item.name}
                        itemPrice={item.price}
                        />
                        )}
                        contentContainerStyle={{padding: 20, paddingLeft: 35}}
                        columnWrapperStyle={{ justifyContent: 'flex-start', gap: 30, marginBottom: 5 }}
                        showsVerticalScrollIndicator={true}
                        ListEmptyComponent={() => (                        
                            <View style={{ alignItems: 'center', padding: 20, paddingBottom: 40 }}>                            
                                <Text style={{ fontFamily: 'InterBold', fontSize: 20, color: '#5E4833' }}>                           
                                    Nothing here!                            
                                </Text>                            
                                <Text style={{ fontFamily: 'InterSemiBold', fontSize: 15, color: '#937254' }}>                            
                                    you own everything in this tab                            
                                </Text>                        
                            </View>                        
                        )}
                        />
                </ImageBackground>
            </View>
        </Modal>

    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 120,
        paddingHorizontal: 40,
        width: '100%'
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
        backgroundColor: '#FCF4D2',
        borderColor: '#5E4833',
        borderWidth: 2,
        borderRadius: 20,
        paddingVertical: 1,
        paddingLeft: 20,
        paddingRight: 15,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    tabBar: {
        flexDirection: 'row',
        paddingTop: 90,
        marginHorizontal: 60,
        gap: 10
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
        backgroundColor: '#c9af8a',
    },
    tabActive: {
        backgroundColor: '#fff2df',
    },
    tabText: {
        fontFamily: 'InterBold',
        fontSize: 14,
        color: '#5E4833',
    },
    list: {
        height: 100,
        width: 310,        
        backgroundColor: '#fff2df',
        borderRadius: 10,
        marginBottom: 200,
    },
})

export default Store;