import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, FAB, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useBirthdaysStore, getDaysUntil } from '../../../stores/birthdays.store';
import EmptyState from '../../../components/EmptyState';
import { COLORS } from '../../../theme';
import { Birthday } from '../../../types';

type Filter = 'all' | 'month' | 'week';


function getBadgeColor(days: number): string {
  if (days === 0) return COLORS.emerald;
  if (days <= 7) return COLORS.warning;
  if (days <= 30) return COLORS.info;
  return COLORS.textSecondary;
}

export default function BirthdaysScreen() {
  const { loading, load, remove, sortedByUpcoming } = useBirthdaysStore();
  const [filter, setFilter] = useState<Filter>('all');
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (id: number) => {
    Alert.alert('Delete Birthday', 'Remove this birthday?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  const allSorted = sortedByUpcoming();

  const filtered = allSorted.filter((b) => {
    const days = getDaysUntil(b.date);
    if (filter === 'week') return days <= 7;
    if (filter === 'month') return days <= 30;
    return true;
  });

  const renderItem = ({ item }: { item: Birthday }) => {
    const days = getDaysUntil(item.date);
    const badgeColor = getBadgeColor(days);
    const isToday = days === 0;

    return (
      <TouchableOpacity
        style={[styles.card, isToday && styles.cardToday]}
        onPress={() => router.push(`/(tabs)/birthdays/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatarCircle, { backgroundColor: badgeColor + '25' }]}>
          <Text style={[styles.avatarText, { color: badgeColor }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="cake-variant-outline"
              size={13}
              color={COLORS.textSecondary}
            />
            <Text style={styles.detail}>
              {format(parseISO(item.date), 'MMMM d')}
            </Text>
          </View>
          {item.notes ? (
            <Text style={styles.notes} numberOfLines={1}>
              {item.notes}
            </Text>
          ) : null}
        </View>

        <View style={styles.daysContainer}>
          <Text style={[styles.daysNumber, { color: badgeColor }]}>
            {isToday ? '🎂' : days}
          </Text>
          {!isToday && (
            <Text style={styles.daysLabel}>days</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="close" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Birthdays
        </Text>
        <Text variant="bodySmall" style={styles.count}>
          {filtered.length} {filtered.length === 1 ? 'person' : 'people'}
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {(['all', 'month', 'week'] as Filter[]).map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            textStyle={filter === f ? styles.filterChipTextActive : styles.filterChipText}
            compact
          >
            {f === 'all' ? 'All' : f === 'month' ? 'This month' : 'This week'}
          </Chip>
        ))}
      </View>

      {loading && filtered.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={COLORS.emerald} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={
            <EmptyState
              icon="cake-variant-outline"
              title="No birthdays"
              subtitle={
                filter === 'all'
                  ? 'Tap + to add a birthday'
                  : 'No birthdays in this period'
              }
            />
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => router.push('/(tabs)/birthdays/new')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  title: { color: COLORS.textPrimary, fontWeight: 'bold' },
  count: { color: COLORS.textSecondary },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: COLORS.surfaceVariant,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: COLORS.emeraldDark,
    borderColor: COLORS.emerald,
  },
  filterChipText: { color: COLORS.textSecondary, fontSize: 12 },
  filterChipTextActive: { color: '#FFFFFF', fontSize: 12 },
  loader: { marginTop: 60 },
  list: { padding: 16, paddingBottom: 100, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardToday: {
    borderColor: COLORS.emerald,
    backgroundColor: COLORS.emerald + '10',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardContent: { flex: 1, gap: 3 },
  name: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detail: { color: COLORS.textSecondary, fontSize: 12 },
  notes: { color: COLORS.textSecondary, fontSize: 12, opacity: 0.7 },
  daysContainer: { alignItems: 'center', minWidth: 36 },
  daysNumber: { fontSize: 20, fontWeight: 'bold' },
  daysLabel: { color: COLORS.textSecondary, fontSize: 10, marginTop: -2 },
  deleteBtn: { padding: 4 },
});
