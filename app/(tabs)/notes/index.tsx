import React, { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, FAB, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNotesStore } from '../../../stores/notes.store';
import EmptyState from '../../../components/EmptyState';
import { COLORS } from '../../../theme';
import { Note } from '../../../types';

export default function NotesScreen() {
  const { notes, loading, load, remove } = useNotesStore();
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (id: number) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/notes/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <Text
            variant="bodyMedium"
            style={styles.noteText}
            numberOfLines={4}
          >
            {item.content}
          </Text>
          <IconButton
            icon="trash-can-outline"
            iconColor={COLORS.textSecondary}
            size={18}
            onPress={() => handleDelete(item.id)}
            style={styles.deleteBtn}
          />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Notes</Text>
        <Text variant="bodySmall" style={styles.count}>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </Text>
      </View>

      {loading && notes.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={COLORS.emerald} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={
            <EmptyState
              icon="note-outline"
              title="No notes yet"
              subtitle="Tap + to create your first note"
            />
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => router.push('/(tabs)/notes/new')}
      />
    </SafeAreaView>
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
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  title: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  count: {
    color: COLORS.textSecondary,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingRight: 4,
  },
  noteText: {
    flex: 1,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  deleteBtn: {
    margin: 0,
    marginTop: -4,
  },
  loader: {
    marginTop: 60,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: COLORS.emerald,
  },
});
