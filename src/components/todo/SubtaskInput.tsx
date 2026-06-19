import { View, StyleSheet, TouchableOpacity,} from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from "@expo/vector-icons";



const SubtaskInput = () => {
    return (
        <View style={styles.subtaskContainer}>
                    <TouchableOpacity
                      onPress={() => console.log("add subtask")}>
                        <Ionicons name="add-circle-outline" size={30} color="#937254"/>
                    </TouchableOpacity>

                    <BottomSheetTextInput
                      multiline
                      style={styles.subtaskInput}
                      placeholder='Add subtask here'
                      placeholderTextColor={'#AF947B'}>
                    </BottomSheetTextInput>
                  </View>
    );
};

const styles = StyleSheet.create({
    subtaskContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 40,
        marginVertical: 5,
    },
    subtaskInput: {
        marginLeft: 5,
        flex: 1    
    },
});

export default SubtaskInput