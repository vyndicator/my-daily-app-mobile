import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useBirthdaysStore } from '../../../stores/birthdays.store';
import DatePicker from '../../../components/DatePicker';
import { COLORS } from '../../../theme';

export default function EditBirthdayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { birthdays, update } = useBirthdaysStore();
  const birthday = birthdays.find((b) => b.id === Number(id));
  const router = useRouter();

  const [name, setName] = useState(birthday?.name ?? '');
  const [date, setDate] = useState(birthday ? new Date(birthday.date) : new Date());
  const [notes, setNotes] = useState(birthday?.notes ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (birthday) {
      setName(birthday.name);
      setDate(new Date(birthday.date));
      setNotes(birthday.notes ?? '');
    }
  }, [birthday]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a name.');
      return;
    }
    setSaving(true);
    try {
      await update(
        Number(id),
        name.trim(),
        date.toISOString().split('T')[0],
        notes.trim() || undefined
      );
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Edit Birthday',
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
