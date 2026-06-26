import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCallback, forwardRef } from 'react';
import { Ionicons } from "@expo/vector-icons";
import InventoryItem from './InventoryItem';
import { STORE_ITEMS } from '@/constants/storeItems';

type InventoryProps = {
    close: () => void;
    chickName: string;
    ownedItems: number[];
    equippedItemId: number | null;
    onEquip: (itemId: number) => void;
    onUnequip: (itemId: number) => void;
};

type Ref = BottomSheet;

const Inventory = forwardRef<Ref, InventoryProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        []

    );

    const INVENTORY_ITEMS = STORE_ITEMS.filter(item => props.ownedItems.includes(item.id));

    const onEquip = (itemId: number) => {
        if (props.equippedItemId !== null) {
            Alert.alert(
                "You alredy have an item equipped",
                "only one item can be equipped at a time",
                [{ text: "OK" }]                
            );
            return;
        }
        props.onEquip(itemId);
    };

    const onUnequip = (itemId: number) => {
        if (props.equippedItemId === null) {
            Alert.alert(
                "There's nothing to unequip",
                "equip or buy more items :)",
                [{ text: "OK" }]                
            );
            return; 
        }
        props.onUnequip(itemId);
    }

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
              data={INVENTORY_ITEMS}
              numColumns={3}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <InventoryItem 
                  imageUrl={item.image} 
                  itemName={item.name} 
                  isEquipped={props.equippedItemId === item.id} 
                  onEquip={() => onEquip(item.id)}
                  onUnequip={() => onUnequip(item.id)} />
            )}
            ListHeaderComponent={() => (
                <View>
                    <View style={styles.header}>
                        <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={props.close}>
                            <Ionicons name='close' size={30} color="#FCF4D2"/>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inventory}>
                        <Text style={styles.inventoryTitle}>👜 Inventory </Text>
                    </View>
                    <Text style={styles.inventorySubtitle}>Dress up {props.chickName} here!</Text>
                </View>               
            )}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 90 }}
            columnWrapperStyle={{ justifyContent: 'flex-start', gap: 20, marginBottom: 5 }}
            ListEmptyComponent={() => (
                <View style={{ alignItems: 'center', padding: 20, paddingBottom: 70, }}>
                    <Text style={{fontFamily: 'InterBold', fontSize: 20, color: '#5E4833'}}>You don't own anything yet</Text>
                    <Text style={{fontFamily: "InterSemiBold", fontSize: 15, color: '#937254'}}>Buy some things from the store</Text>
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
    inventory: {
        backgroundColor: '#F4E6B0',
        paddingVertical: 5,
        paddingHorizontal: 20,
        marginHorizontal: -20,
    },
    inventoryTitle: {
        color: "#5E4833",
        fontFamily: "InterBold",
        fontSize: 33,
    },
    inventorySubtitle: {
        fontFamily: "InterSemiBold",
        fontSize: 15,
        color: '#937254',
        paddingVertical: 10,
    },
});

export default Inventory;