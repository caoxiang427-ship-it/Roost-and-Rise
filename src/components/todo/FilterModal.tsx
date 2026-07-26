import { Modal, View, TouchableOpacity, StyleSheet, ImageBackground, Text, Image } from 'react-native';
import { useTodoStore } from '@/store/useTodoStore';
import { Ionicons } from '@expo/vector-icons';

const OPTIONS: { key: 'easy' | 'moderate' | 'difficult'; label: string; color: string }[] = [
  { key: 'easy',      label: 'Easy',      color: '#00931b' },
  { key: 'moderate',  label: 'Moderate',  color: '#d78100' },
  { key: 'difficult', label: 'Difficult', color: '#BC0000' },
];

type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
};

const FilterModal = (props: FilterModalProps) => {

  const {difficultyFilter, toggleDifficultyFilter, clearFilters, dreadOnly, toggleDreadOnly} = useTodoStore();
  return (
    <Modal visible={props.visible} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.backdrop}
        onPress={props.onClose} 
        activeOpacity={1} 
      >
        <TouchableOpacity activeOpacity={1} style={styles.box}>
            <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                <Ionicons name={'filter'}
                    size={24}
                    color={'#5E4833'}/>
                <Text style={styles.title}>Filter Tasks</Text>
            </View>
            <Text style={{fontFamily: 'InterBold', color: '#5E4833', marginVertical: 5}}> Filter by Difficulty</Text>
            {OPTIONS.map(opt => {
                const checked = difficultyFilter.includes(opt.key);
                return (
                <TouchableOpacity
                    key={opt.key}
                    style={styles.row}
                    onPress={() => toggleDifficultyFilter(opt.key)}
                >
                    <Ionicons
                    name={checked ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={opt.color}
                    />
                    <Text style={styles.rowLabel}>{opt.label}</Text>
                </TouchableOpacity>
                );
            })}
            <Text style={{fontFamily: 'InterBold', color: '#5E4833', marginVertical: 5}}> Filter by Dread</Text>

            <TouchableOpacity style={styles.row} onPress={toggleDreadOnly}>
                <Ionicons
                    name={dreadOnly ? 'checkbox' : 'square-outline'}
                    size={24}
                    color="#7A5Fb0"
                />
                <Text style={styles.rowLabel}>Only dreaded 😰</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
                <Text style={styles.clearTxt}>Clear filters</Text>
            </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    width: '80%',
    height: '30%',
    justifyContent: 'center',
    paddingBottom: 15,
    paddingHorizontal: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: 2,
    paddingHorizontal: 8,
    gap: 12,
  },
  rowLabel: { fontFamily: 'InterSemiBold', fontSize: 15, color: '#937254' },
  title: { fontFamily: 'InterBold', fontSize: 20, color: '#5E4833', paddingVertical: 8 },
  clearBtn: { 
    marginTop: 8, 
    paddingVertical: 6, 
    paddingHorizontal: 10,
    backgroundColor: '#937254', 
    borderRadius: 10, 
    alignSelf: 'flex-start' },
  clearTxt: { fontFamily: 'InterSemiBold', fontSize: 14, color: '#fff' },
  divider: {
  height: 1,
  alignSelf: 'stretch',
  backgroundColor: '#E4D8B4',
  marginVertical: 8,
},
});


export default FilterModal;