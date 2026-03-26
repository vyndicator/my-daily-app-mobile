import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useNotesStore } from '../../../stores/notes.store';
import { COLORS } from '../../../theme';

export default function NewNoteScreen() {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const { add } = useNotesStore();
  const router = useRouter();

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Note', 'Please write something before saving.');
      return;
    }
    setSaving(true);
    try {
      await add(content.trim());
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'New Note',
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
          placeholder="Start writing..."
          placeholderTextColor={COLORS.textSecondary}
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
