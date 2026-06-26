import { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import EmojiPickerModal from 'rn-emoji-keyboard';

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ selectedEmoji, onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleEmojiPick(emojiObject: { emoji: string }) {
    onSelect(emojiObject.emoji);
    setIsOpen(false);
  }

  return (
    <>
      <Pressable 
        style={styles.button} 
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.emoji}>{selectedEmoji || '😀'}</Text>
        <Text style={styles.hint}>Tap to change</Text>
      </Pressable>

      <EmojiPickerModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onEmojiSelected={handleEmojiPick}
        categoryPosition="top"
        enableSearchBar
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0D4A8',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  hint: {
    fontSize: 11,
    color: '#8B6F3F',
    fontStyle: 'italic',
  },
});
