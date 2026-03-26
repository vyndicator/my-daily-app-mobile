import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Switch,
  RadioButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useHabitsStore } from '../../../stores/habits.store';
import DatePicker from '../../../components/DatePicker';
import { COLORS } from '../../../theme';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function EditHabitScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: 'habit' | 'todo' }>();
  const { habits, todos, updateHabit, updateTodo } = useHabitsStore();
  const router = useRouter();

  const isHabit = type === 'habit';
  const habit = habits.find((h) => h.id === Number(id));
  const todo = todos.find((t) => t.id === Number(id));

  const [text, setText] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dueDate, setDueDate] = useState(new Date());
  const [recurring, setRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isHabit && habit) {
      setText(habit.text);
      setSelectedDays(habit.days);
    } else if (!isHabit && todo) {
      setText(todo.text);
      setDueDate(new Date(todo.dueDate));
      setRecurring(todo.recurring ?? false);
      setRecurrenceInterval((todo.recurrenceInterval as any) ?? 'weekly');
    }
  }, [habit, todo]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert('Validation', 'Please enter a name.');
      return;
    }
    setSaving(true);
    try {
      if (isHabit) {
        await updateHabit(Number(id), text.trim(), selectedDays);
      } else {
        await updateTodo(Number(id), {
          text: text.trim(),
          dueDate: dueDate.toISOString().split('T')[0],
          recurring,
          recurrenceInterval: recurring ? recurrenceInterval : undefined,
        });
      }
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
          title: isHabit ? 'Edit Habit' : 'Edit Task',
          headerRight: () => (
            <Button
              onPress={handleSave}
              loading={saving}
              disabled={saving || !text.trim()}
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
            label={isHabit ? 'Habit name' : 'Task name'}
            value={text}
            onChangeText={setText}
            mode="outlined"
            style={styles.input}
            autoFocus
          />

          {isHabit ? (
            <View style={styles.field}>
              <Text style={styles.label}>Repeat on</Text>
              <View style={styles.daysRow}>
                {DAY_LABELS.map((label, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayBtn,
                      selectedDays.includes(idx) && styles.dayBtnActive,
                    ]}
                    onPress={() => toggleDay(idx)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selectedDays.includes(idx) && styles.dayTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <>
              <View style={styles.field}>
                <DatePicker value={dueDate} onChange={setDueDate} label="Due date" />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Recurring</Text>
                <Switch
                  value={recurring}
                  onValueChange={setRecurring}
                  color={COLORS.emerald}
                />
              </View>

              {recurring && (
                <View style={styles.field}>
                  <Text style={styles.label}>Repeat every</Text>
                  <RadioButton.Group
                    value={recurrenceInterval}
                    onValueChange={(v) => setRecurrenceInterval(v as any)}
                  >
                    {(['weekly', 'monthly', 'yearly'] as const).map((opt) => (
                      <RadioButton.Item
                        key={opt}
                        label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                        value={opt}
                        color={COLORS.emerald}
                        labelStyle={{ color: COLORS.textPrimary }}
                        style={styles.radioItem}
                      />
                    ))}
                  </RadioButton.Group>
                </View>
              )}
            </>
          )}
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
  field: { gap: 8 },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 2,
  },
  daysRow: { flexDirection: 'row', gap: 8 },
  dayBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayBtnActive: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  dayText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  dayTextActive: { color: '#FFFFFF' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchLabel: { color: COLORS.textPrimary, fontSize: 15 },
  radioItem: { paddingHorizontal: 0 },
});
