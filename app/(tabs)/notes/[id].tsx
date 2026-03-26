import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useNotesStore } from '../../../stores/notes.store';
import { COLORS } from '../../../theme';

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, update } = useNotesStore();
  const note = notes.find((n) => n.id === Number(id));
  const [content, setContent] = useState(note?.content ?? '');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (note) setContent(note.content);
  }, [note]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Note', 'Note cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await update(Number(id), content.trim());
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Edit Note',
          headerRight: () => (
            <Button
              onPress={handleSave}
              loading={saving}
              disabled={saving || !content.trim()}
              textColor={COLORS.emerald}
              compact
            >
              Save
            </Button>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TextInput
          value={content}
          onChangeText={setContent}
          multiline
          style={styles.input}
          contentStyle={styles.inputContent}
          autoFocus
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    fontSize: 16,
    lineHeight: 26,
  },
  inputContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
  },
});
