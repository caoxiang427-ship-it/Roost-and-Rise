/* 
 * Edit Categories for self-care log screen.
 * Users can add, delete, update categories, or change emoji.
*/

import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  getUserCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  SelfCareCategory,
} from '@/lib/self-care';
import EmojiPicker from '@/components/EmojiPicker';

type Mode = 'add' | 'edit' | 'collapsed';

export default function EditCategoriesScreen() {
  const [categories, setCategories] = useState<SelfCareCategory[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('collapsed');
  const [editLabel, setEditLabel] = useState('');
  const [editEmoji, setEditEmoji] = useState('😀');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const categs = await getUserCategories();
    setCategories(categs);
  }

  function handleExpand(categ: SelfCareCategory) {
    if (activeId == categ.id) {
      setActiveId(null); // not expanded -> collapsed 
      setMode('collapsed');
    } else {
      setActiveId(categ.id);
      setMode('edit');
      setEditLabel(categ.label);
      setEditEmoji(categ.emoji);
    }
  }

  function handleAdd() {
    setActiveId('new'); // placeholder id
    setMode('add');
    setEditLabel('');
    setEditEmoji('🌿'); 
  }

  async function handleSave() {
    if (!editLabel.trim()) {
      Alert.alert('Error', 'Label cannot be empty');
      return;
    }

    if (mode == 'add') {
      const result = await addCategory(editLabel.trim(), editEmoji);
      if (result.error) {
        Alert.alert('Error', 'Could not add category. Please try again.');
        return;
      }
    } else if (activeId) {
      const result = await updateCategory(activeId, editLabel.trim(), editEmoji);
      if (result.error) {
        Alert.alert('Error', 'Could not save changes. Please try again.');
        return;
      }
    }

    setActiveId(null);
    setMode('collapsed');
    loadCategories();
   }

  async function handleDelete() {
    if (!activeId || mode != 'edit') return;

    Alert.alert('Delete category?',
      'This category will be removed from your list. Past logs will not be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCategory(activeId);
            if (result.error) {
              Alert.alert('Error', 'Could not delete. Please try again.');
              return;
            }
            setActiveId(null);
            setMode('collapsed');
            loadCategories();
          }
        }
      ]
    );
  }

  function handleCancel() {
    setActiveId(null);
    setMode('collapsed');
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.subtitle}>
        Manage your self-care categories. Tap one to edit or delete.
      </Text>

      {categories.map(categ => (
        <View key={categ.id} style={styles.card}>
          <Pressable
            onPress={() => handleExpand(categ)}
            style={styles.row}
          >
            <Text style={styles.rowLabel}>
              {categ.emoji}  {categ.label}
            </Text>
            <Text style={styles.chevron}>
              {activeId === categ.id ? '▴' : '▾'}
            </Text>
          </Pressable>

          {activeId === categ.id && mode === 'edit' && (
            <EditForm 
              emoji={editEmoji}
              setEmoji={setEditEmoji}
              label={editLabel}
              setLabel={setEditLabel}
              onSave={handleSave}
              onDelete={handleDelete}
              onCancel={handleCancel}
            />
          )}
        </View>
      ))}

      {mode !== 'add' ? (
        <Pressable style={styles.addCard} onPress={handleAdd}>
          <Text style={styles.addText}>+ Add new category</Text>
        </Pressable>
      ) : (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>New category</Text>
          </View>
          <AddForm
            emoji={editEmoji}
            setEmoji={setEditEmoji}
            label={editLabel}
            setLabel={setEditLabel}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </View>
      )}
    </ScrollView>
  );
}

interface EditFormProps {
  emoji: string;
  setEmoji: (e: string) => void;
  label: string;
  setLabel: (s: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

function EditForm({ emoji, setEmoji, label, setLabel, onSave, onDelete, onCancel }: EditFormProps) {
  return (
    <View style={styles.expandedField}>
      <View style={styles.emojiSection}>
        <EmojiPicker selectedEmoji={emoji} onSelect={setEmoji} />
      </View>

      <Text style={styles.fieldLabel}>Label</Text>
      <TextInput
        style={styles.input}
        onChangeText={setLabel}
        value={label}
        placeholder="Name your category"
        maxLength={20}
      />

      <View style={styles.buttonRow}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <Pressable style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </Pressable>
    </View>
  );
}

interface AddFormProps {
  emoji: string;
  setEmoji: (e: string) => void;
  label: string;
  setLabel: (s: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function AddForm({ emoji, setEmoji, label, setLabel, onSave, onCancel }: AddFormProps) {
  return (
    <View style={styles.expandedField}>
      <View style={styles.emojiSection}>
        <EmojiPicker selectedEmoji={emoji} onSelect={setEmoji} />
      </View>

      <Text style={styles.fieldLabel}>Label</Text>
      <TextInput
        style={styles.input}
        onChangeText={setLabel}
        value={label}
        placeholder="e.g., Meditation, Reading"
        maxLength={20}
      />

      <View style={styles.buttonRow}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>Create</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE8B8',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  subtitle: {
    fontSize: 13,
    color: '#8B6F3F',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLabel: {
    fontSize: 16,
    color: '#3D2914',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 14,
    color: '#A67C2E',
  },
  expandedField: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0E4C8',
    paddingTop: 16,
  },
  emojiSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D2914',
  },
  input: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#3D2914',
    borderWidth: 1,
    borderColor: '#E0D4A8',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#E0D4A8',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8B6F3F',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#E8A33D',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C44536',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  deleteButtonText: {
    color: '#C44536',
    fontSize: 13,
    fontWeight: '600',
  },
  addCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0D4A8',
    borderStyle: 'dashed',
  },
  addText: {
    fontSize: 15,
    color: '#A67C2E',
    fontWeight: 'bold',
  },
});
