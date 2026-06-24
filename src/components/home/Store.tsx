import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCallback, forwardRef } from 'react';

type StoreProps = {
    close: () => void;
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
            snapPoints={['50%']}
            //enableDynamicSizing={true}
           // maxDynamicContentSize={700}
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            handleIndicatorStyle={{backgroundColor: '#5E4833'}}
            backdropComponent={renderBackdrop}>
            <BottomSheetView>
                <Text>This is the store</Text>
            </BottomSheetView>
        </BottomSheet>
                

    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f7f4e1',
    },
    
});

export default Store;