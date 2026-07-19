/*
 * Edit Categories for self-care log screen.
 * Grid of category tiles + centered edit/add modal.
*/

import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Modal } from 'react-native';
import {
  getUserCategories,
  addCategory,
  deleteCategory,
  SelfCareCategory,
  CATEGORY_CATALOG,
} from '@/lib/self-care';
import { styles } from '@/styles/editcateg_styles';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditCategoriesScreen() {
  const [categories, setCategories] = useState<SelfCareCategory[]>([]);
  const [addVisible, setAddVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const categs = await getUserCategories();
    setCategories(categs);
  }

  const activeLabels = categories.map(c => c.label);
  const available = CATEGORY_CATALOG.filter(c => !activeLabels.includes(c.label));

  async function handleAddFromCatalog(label: string, icon: string) {
    const result = await addCategory(label, icon);
    if (result.error) {
      Alert.alert('Error', 'Could not add. Please try again.');
      return;
    }
    setAddVisible(false);
    loadCategories();
    showToast(`${label} added`);
  }

  function handleLongPress(categ: SelfCareCategory) {
    Alert.alert(
      `Remove ${categ.label}?`,
      'It will be removed from your list. Past logs are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCategory(categ.id);
            if (result.error) {
              Alert.alert('Error', 'Could not remove. Please try again.');
              return;
            }
            loadCategories();
          },
        },
      ]
    );
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
      ]}
    >
      <Text style={styles.title}>Edit categories</Text>
      <Text style={styles.subtitle}>
        Choose which self-care categories appear on your recovery screen.
      </Text>

      <View style={styles.tipCard}>
        <Ionicons name="hand-left-outline" size={18} color="#8FB07A" />
        <Text style={styles.tipText}>Long-press any tile to remove it. Your past logs are kept.</Text>
      </View>

      {/* Active categories grid */}
      <View style={styles.grid}>
        {categories.map(categ => (
          <Pressable
            key={categ.id}
            style={styles.tile}
            onLongPress={() => handleLongPress(categ)}
            delayLongPress={350}
          >
            <View style={styles.tileIcon}>
              <Ionicons name={categ.icon as any} size={24} color="#6E7D67" />
            </View>
            <Text style={styles.tileLabel} numberOfLines={1}>{categ.label}</Text>
          </Pressable>
        ))}

        {/* Add tile */}
        <Pressable style={styles.addTile} onPress={() => setAddVisible(true)}>
          <Ionicons name="add" size={26} color="#6E7D67" />
          <Text style={styles.addText}>Add new</Text>
        </Pressable>
      </View>

      {/* Catalog modal */}
      <Modal visible={addVisible} transparent animationType="fade" onRequestClose={() => setAddVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAddVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add a category</Text>
              <Pressable onPress={() => setAddVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color="#6E7D67" />
              </Pressable>
            </View>

            {available.length === 0 ? (
              <Text style={styles.emptyText}>You've added every category.</Text>
            ) : (
              <ScrollView style={styles.catalogScroll}>
                {available.map(item => (
                  <Pressable
                    key={item.label}
                    style={styles.catalogRow}
                    onPress={() => handleAddFromCatalog(item.label, item.icon)}
                  >
                    <View style={styles.catalogIcon}>
                      <Ionicons name={item.icon as any} size={22} color="#6E7D67" />
                    </View>
                    <Text style={styles.catalogLabel}>{item.label}</Text>
                    <Ionicons name="add-circle-outline" size={22} color="#8FB07A" />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
      
      {toast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </ScrollView>
  );
}
