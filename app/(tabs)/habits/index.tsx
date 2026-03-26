import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  FAB,
  ActivityIndicator,
  SegmentedButtons,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, isToday, parseISO } from 'date-fns';
import { useHabitsStore } from '../../../stores/habits.store';
import EmptyState from '../../../components/EmptyState';
import { COLORS } from '../../../theme';
import { Habit, Todo } from '../../../types';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function HabitsScreen() {
  const { habits, todos, loading, load, completeHabit, completeTodo, removeHabit, removeTodo, todayHabits, pendingTodos, overdueTodos } =
    useHabitsStore();
  const [tab, setTab] = useState('habits');
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  const handleCompleteHabit = (id: number) => {
    completeHabit(id);
  };

  const handleDeleteHabit = (id: number) => {
    Alert.alert('Delete Habit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void removeHabit(id) },
    ]);
  };

  const handleDeleteTodo = (id: number) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void removeTodo(id) },
    ]);
  };

  const todayList = todayHabits();
  const pending = pendingTodos();
  const overdue = overdueTodos();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Habits & Tasks
        </Text>
      </View>

      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        style={styles.segment}
        buttons={[
          {
            value: 'habits',
            label: `Habits (${todayList.length}/${habits.length})`,
            icon: 'repeat',
          },
          {
            value: 'todos',
            label: `Tasks (${overdue.length + pending.length})`,
            icon: 'checkbox-marked-outline',
          },
        ]}
      />

      {loading && habits.length === 0 && todos.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={COLORS.emerald} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.emerald} />}
        >
          {tab === 'habits' ? (
            <>
              {/* Today's habits */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  TODAY — {DAY_FULL[new Date().getDay()].toUpperCase()}
                </Text>
                {todayList.length === 0 ? (
                  <Text style={styles.emptyText}>No habits scheduled for today</Text>
                ) : (
                  todayList.map((habit: Habit) => (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      onComplete={() => handleCompleteHabit(habit.id)}
                      onEdit={() => router.push(`/(tabs)/habits/${habit.id}?type=habit`)}
                      onDelete={() => handleDeleteHabit(habit.id)}
                    />
                  ))
                )}
              </View>

              {/* All habits */}
              {habits.filter((h) => !h.days.includes(new Date().getDay())).length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>ALL HABITS</Text>
                  {habits
                    .filter((h) => !h.days.includes(new Date().getDay()))
                    .map((habit: Habit) => (
                      <HabitRow
                        key={habit.id}
                        habit={habit}
                        onComplete={() => handleCompleteHabit(habit.id)}
                        onEdit={() => router.push(`/(tabs)/habits/${habit.id}?type=habit`)}
                        onDelete={() => handleDeleteHabit(habit.id)}
                        dimmed
                      />
                    ))}
                </View>
              )}

              {habits.length === 0 && (
                <EmptyState
                  icon="repeat"
                  title="No habits yet"
                  subtitle="Tap + to create a new habit"
                />
              )}
            </>
          ) : (
            <>
              {/* Overdue */}
              {overdue.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: COLORS.danger }]}>
                    OVERDUE
                  </Text>
                  {overdue.map((todo: Todo) => (
                    <TodoRow
                      key={todo.id}
                      todo={todo}
                      onComplete={() => completeTodo(todo.id)}
                      onEdit={() => router.push(`/(tabs)/habits/${todo.id}?type=todo`)}
                      onDelete={() => handleDeleteTodo(todo.id)}
                      overdue
                    />
                  ))}
                </View>
              )}

              {/* Pending */}
              {pending.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>UPCOMING</Text>
                  {pending.map((todo: Todo) => (
                    <TodoRow
                      key={todo.id}
                      todo={todo}
                      onComplete={() => completeTodo(todo.id)}
                      onEdit={() => router.push(`/(tabs)/habits/${todo.id}?type=todo`)}
                      onDelete={() => handleDeleteTodo(todo.id)}
                    />
                  ))}
                </View>
              )}

              {todos.filter((t) => !t.completed).length === 0 && (
                <EmptyState
                  icon="checkbox-marked-circle-outline"
                  title="All done!"
                  subtitle="No pending tasks"
                />
              )}
            </>
          )}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => router.push('/(tabs)/habits/new')}
      />
    </SafeAreaView>
  );
}

function HabitRow({
  habit,
  onComplete,
  onEdit,
  onDelete,
  dimmed,
}: {
  habit: Habit;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  dimmed?: boolean;
}) {
  return (
    <View style={[styles.row, dimmed && styles.rowDimmed]}>
      <TouchableOpacity onPress={onComplete} style={styles.checkArea}>
        <MaterialCommunityIcons
          name={habit.completedToday ? 'check-circle' : 'circle-outline'}
          size={24}
          color={habit.completedToday ? COLORS.emerald : COLORS.border}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.rowContent} onPress={onEdit}>
        <Text
          style={[
            styles.rowText,
            habit.completedToday && styles.rowTextDone,
          ]}
        >
          {habit.text}
        </Text>
        <View style={styles.daysRow}>
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <View
              key={d}
              style={[
                styles.dayBadge,
                habit.days.includes(d) && styles.dayBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.dayBadgeText,
                  habit.days.includes(d) && styles.dayBadgeTextActive,
                ]}
              >
                {DAY_LABELS[d]}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
      <IconButton
        icon="trash-can-outline"
        iconColor={COLORS.textSecondary}
        size={18}
        onPress={onDelete}
      />
    </View>
  );
}

function TodoRow({
  todo,
  onComplete,
  onEdit,
  onDelete,
  overdue,
}: {
  todo: Todo;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  overdue?: boolean;
}) {
  const dueDateObj = parseISO(todo.dueDate);
  const dueDateLabel = isToday(dueDateObj)
    ? 'Today'
    : format(dueDateObj, 'MMM d, yyyy');

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={onComplete} style={styles.checkArea}>
        <MaterialCommunityIcons
          name={todo.completed ? 'check-circle' : 'circle-outline'}
          size={24}
          color={todo.completed ? COLORS.emerald : overdue ? COLORS.danger : COLORS.border}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.rowContent} onPress={onEdit}>
        <Text style={[styles.rowText, todo.completed && styles.rowTextDone]}>
          {todo.text}
        </Text>
        <View style={styles.todoBadgeRow}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={12}
            color={overdue ? COLORS.danger : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.todoDate,
              overdue && { color: COLORS.danger },
            ]}
          >
            {dueDateLabel}
          </Text>
          {todo.recurring && (
            <MaterialCommunityIcons name="repeat" size={12} color={COLORS.info} />
          )}
        </View>
      </TouchableOpacity>
      <IconButton
        icon="trash-can-outline"
        iconColor={COLORS.textSecondary}
        size={18}
        onPress={onDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  segment: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  loader: {
    marginTop: 60,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingRight: 4,
  },
  rowDimmed: {
    opacity: 0.5,
  },
  checkArea: {
    padding: 14,
  },
  rowContent: {
    flex: 1,
    paddingVertical: 12,
    gap: 6,
  },
  rowText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  rowTextDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 3,
  },
  dayBadge: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceVariant,
  },
  dayBadgeActive: {
    backgroundColor: COLORS.emeraldDark,
  },
  dayBadgeText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  dayBadgeTextActive: {
    color: '#FFFFFF',
  },
  todoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todoDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: COLORS.emerald,
  },
});
