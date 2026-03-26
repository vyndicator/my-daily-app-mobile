import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useBirthdaysStore } from '../../../stores/birthdays.store';
import DatePicker from '../../../components/DatePicker';
import { COLORS } from '../../../theme';

export default function NewBirthdayScreen() {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { add } = useBirthdaysStore();
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a name.');
      return;
    }
    setSaving(true);
    try {
      await add(name.trim(), date.toISOString().split('T')[0], notes.trim() || undefined);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Add Birthday',
          headerRight: () => (
            <Button
              onPress={handleSave}
              loading={saving}
              disabled={saving || !name.trim()}
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            autoFocus
            left={<TextInput.Icon icon="account-outline" />}
          />

          <DatePicker value={date} onChange={setDate} label="Birthday" />

          <TextInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="note-outline" />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { padding: 20, gap: 16 },
  input: { backgroundColor: COLORS.surfaceVariant },
});
