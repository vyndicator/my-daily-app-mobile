import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  IconButton,
  ActivityIndicator,
  Divider,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useShoppingStore } from '../../stores/shopping.store';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../theme';
import { ShoppingItem, HistoryItem } from '../../types';

export default function ShoppingScreen() {
  const { items, history, loading, load, addItem, removeItem, toggleFavoriteHistory } =
    useShoppingStore();
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    try {
      await addItem(text);
    } catch {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleRemove = (id: number) => {
    Alert.alert('Remove Item', 'Remove this item from the list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
    ]);
  };

  const handleQuickAdd = async (text: string) => {
    try {
      await addItem(text);
    } catch {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const favorites = history.filter((h) => h.isFavorite);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Shopping List
        </Text>
        <Text variant="bodySmall" style={styles.count}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* Add input */}
      <View style={styles.inputRow}>
        <RNTextInput
          ref={inputRef}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Add item..."
          placeholderTextColor={COLORS.textSecondary}
          style={styles.textInput}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, !inputText.trim() && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!inputText.trim()}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Quick add favorites */}
      {favorites.length > 0 && (
        <View style={styles.favoritesSection}>
          <Text variant="labelSmall" style={styles.sectionLabel}>
            QUICK ADD
          </Text>
          <View style={styles.chipsRow}>
            {favorites.map((item) => (
              <Chip
                key={item.id}
                onPress={() => handleQuickAdd(item.text)}
                icon="plus"
                style={styles.chip}
                textStyle={styles.chipText}
                compact
              >
                {item.text}
              </Chip>
            ))}
          </View>
        </View>
      )}

      <Divider style={styles.divider} />

      {loading && items.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={COLORS.emerald} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="List is empty"
          subtitle="Add items using the field above"
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }: { item: ShoppingItem }) => (
            <View style={styles.itemRow}>
              <MaterialCommunityIcons
                name="circle-outline"
                size={22}
                color={COLORS.border}
                style={styles.itemDot}
              />
              <Text style={styles.itemText}>{item.text}</Text>
              <IconButton
                icon="close"
                iconColor={COLORS.textSecondary}
                size={18}
                onPress={() => handleRemove(item.id)}
              />
            </View>
          )}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={loading}
        />
      )}

      {/* History with toggle favorite */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <Divider style={styles.divider} />
          <Text variant="labelSmall" style={styles.sectionLabel}>
            HISTORY
          </Text>
          <FlatList
            data={history}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.historyList}
            renderItem={({ item }: { item: HistoryItem }) => (
              <TouchableOpacity
                style={styles.historyItem}
                onPress={() => handleQuickAdd(item.text)}
                onLongPress={() => toggleFavoriteHistory(item.id)}
              >
                <MaterialCommunityIcons
                  name={item.isFavorite ? 'star' : 'star-outline'}
                  size={14}
                  color={item.isFavorite ? COLORS.warning : COLORS.textSecondary}
                />
                <Text style={styles.historyText}>{item.text}</Text>
              </TouchableOpacity>
            )}
          />
          <Text variant="bodySmall" style={styles.historyHint}>
            Tap to add · Long press to toggle favorite
          </Text>
        </View>
      )}
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
    paddingBottom: 8,
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
  inputRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 10,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  favoritesSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surfaceVariant,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  chipText: {
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  divider: {
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemDot: {
    marginRight: 4,
  },
  itemText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  historySection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  historyList: {
    gap: 8,
    paddingRight: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  historyHint: {
    color: COLORS.textSecondary,
    opacity: 0.5,
    marginTop: 6,
    fontSize: 11,
    textAlign: 'center',
  },
});
