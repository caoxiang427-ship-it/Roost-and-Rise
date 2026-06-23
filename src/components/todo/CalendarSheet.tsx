import 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { forwardRef, useCallback, useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { CalendarList } from 'react-native-calendars';

type CalendarSheetProps = {
    close: () => void;
    selectedDate: string;
    syncSelectedDate: (selected: string) => void;
}

type Ref = BottomSheet;

const CalendarSheet = forwardRef<Ref, CalendarSheetProps>((props, ref) => {
    
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        []

    );

    const { height: SCREEN_HEIGHT } = Dimensions.get('window'); 

    return (
        <BottomSheet 
            ref={ref} 
            snapPoints={['75%']} 
            index={-1} 
            enablePanDownToClose={true}
            backgroundStyle={styles.container}
            handleIndicatorStyle={{backgroundColor: 'transparent'}}
            backdropComponent={renderBackdrop}>
                <BottomSheetView style={styles.wrapper}>
                    <View style={styles.header}>
                        <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={props.close}>
                            <Ionicons name='close' size={30} color="#937254"/>
                        </TouchableOpacity>
                    </View>

                    <CalendarList
                        pastScrollRange={12}
                        futureScrollRange={12}
                        scrollEnabled={true}
                        showScrollIndicator={true}
                        nestedScrollEnabled={true}
                        style={{height: SCREEN_HEIGHT * 0.85}}
                        onDayPress={(day) => {
                            props.syncSelectedDate(day.dateString);
                        }}
                        markedDates={{
                            [props.selectedDate]: {
                            selected: true,
                            selectedColor: '#3B99B9',
                            }
                        }}
                    />

                </BottomSheetView>
        </BottomSheet>
        
        
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f7f4e1',
    },
    wrapper: {
        flex: 1,
        },
    header: {
        paddingHorizontal: 30,
        paddingBottom: 5,
    },
    closeBtn: {
    }
});

export default CalendarSheet;