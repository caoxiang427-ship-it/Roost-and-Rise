import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, forwardRef, useCallback } from 'react';

type AddEventProps = {
    close: () => void;
};

type Ref = BottomSheet;

const AddEvent = forwardRef<Ref, AddEventProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        [])

    return (
        <BottomSheet 
            ref={ref} 
            index={-1}
            snapPoints={['60%']}
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            backdropComponent={renderBackdrop}>
            <BottomSheetView>
                <Text>Add event here</Text>
            </BottomSheetView>
        </BottomSheet>
    
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF'
    }
});

export default AddEvent;