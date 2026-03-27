import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBirthdaysStore } from '../../stores/birthdays.store';
import { useHabitsStore } from '../../stores/habits.store';
import client from '../../api/client';
import { COLORS } from '../../theme';

async function triggerDailySummaryNotification() {
  await client.post('/api/notifications/trigger');
}

export default function PlaygroundScreen() {
  const { birthdays, load: loadBirthdays } = useBirthdaysStore();
  const { load: loadHabits, todayHabits } = useHabitsStore();
  const todos = useHabitsStore((s) => s.todos);

  const todayStr = new Date().toISOString().split('T')[0];

  const todaysBirthdays = birthdays.filter((b) => {
    const d = new Date(b.date);
    const today = new Date();
    return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  });

  const openHabits = todayHabits().filter((h) => !h.completedToday);

  const openTodos = todos.filter(
    (t) => !t.completed && t.dueDate.split('T')[0] === todayStr,
  );

  useEffect(() => {
    loadBirthdays();
    loadHabits();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Playground
          </Text>
        </View>

        <Text style={styles.sectionLabel}>DAILY SUMMARY</Text>
        <Text style={styles.description}>
          Trigger a notification with today's birthdays, open habits, and open todos.
        </Text>

        <View style={styles.summaryCard}>
          <SummaryRow
            icon="cake-variant-outline"
            color={COLORS.info}
            label={
              todaysBirthdays.length > 0
                ? `${todaysBirthdays.length} birthday${todaysBirthdays.length > 1 ? 's' : ''} today`
                : 'No birthdays today'
            }
          />
          <SummaryRow
            icon="checkbox-marked-circle-outline"
            color={COLORS.emerald}
            label={
              openTodos.length > 0
                ? `${openTodos.length} open todo${openTodos.length > 1 ? 's' : ''}`
                : 'All todos done'
            }
          />
          <SummaryRow
            icon="repeat"
            color={COLORS.warning}
            label={
              openHabits.length > 0
                ? `${openHabits.length} open habit${openHabits.length > 1 ? 's' : ''}`
                : 'All habits done'
            }
          />
        </View>

        <Button
          mode="contained"
          icon="bell"
          onPress={triggerDailySummaryNotification}
          style={styles.button}
        >
          Send daily summary
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ icon, color, label }: { icon: string; color: string; label: string }) {
  return (
    <View style={styles.summaryRow}>
      <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      <Text style={styles.summaryRowText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryRowText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  button: {
    borderRadius: 10,
  },
});
