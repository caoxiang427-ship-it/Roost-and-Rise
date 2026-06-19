import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { forwardRef, useCallback } from 'react';
import { Ionicons } from "@expo/vector-icons";

type AddTaskProps = {
    close: () => void;
}

type Ref = BottomSheet;

const CalendarSheet = forwardRef<Ref, AddTaskProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        []

    );

    return (
        <BottomSheet 
            ref={ref} 
            snapPoints={['100%']} 
            index={-1} 
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            handleIndicatorStyle={{backgroundColor: '#000'}}
            backdropComponent={renderBackdrop}>
                <BottomSheetView style={styles.header}>
                    <TouchableOpacity
                    onPress={props.close}>
                        <Ionicons name='close' size={30} color="#937254"/>
                    </TouchableOpacity>
                </BottomSheetView>
        </BottomSheet>
        
        
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        backgroundColor: '#f7f4e1',
    },
    header: {
        paddingTop: 100,
        paddingLeft: 30,
    },
});

export default CalendarSheet;