import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/auth.store';
import { COLORS } from '../../theme';

interface FeatureTile {
  icon: string;
  title: string;
  description: string;
  color: string;
  route: string;
}

const FEATURES: FeatureTile[] = [
  {
    icon: 'note-text-outline',
    title: 'Notes',
    description: 'Capture your thoughts and ideas',
    color: '#60A5FA',
    route: '/(tabs)/notes',
  },
  {
    icon: 'cart-outline',
    title: 'Shopping',
    description: 'Manage your shopping list',
    color: '#FBBF24',
    route: '/(tabs)/shopping',
  },
  {
    icon: 'checkbox-marked-circle-outline',
    title: 'Habits & Todos',
    description: 'Track habits and daily tasks',
    color: '#10B981',
    route: '/(tabs)/habits',
  },
  {
    icon: 'cake-variant-outline',
    title: 'Birthdays',
    description: 'Never miss a birthday',
    color: '#F472B6',
    route: '/(tabs)/birthdays',
  },
  {
    icon: 'flask-outline',
    title: 'Playground',
    description: 'Test features & notifications',
    color: '#A78BFA',
    route: '/(tabs)/playground',
  },
];

export default function HomeScreen() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="titleSmall" style={styles.greeting}>
              Good {getGreeting()}
            </Text>
            <Text variant="headlineSmall" style={styles.email}>
              {user?.email?.split('@')[0]}
            </Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.avatar}>
            <Avatar.Icon
              size={40}
              icon="logout"
              style={{ backgroundColor: COLORS.surfaceVariant }}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Today's summary strip */}
        <View style={styles.summaryStrip}>
          <MaterialCommunityIcons name="calendar-today" size={16} color={COLORS.emerald} />
          <Text style={styles.summaryText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Feature grid */}
        <Text variant="labelLarge" style={styles.sectionLabel}>
          Features
        </Text>
        <View style={styles.grid}>
          {FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.title}
              style={styles.tile}
              onPress={() => router.push(feature.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.tileIcon, { backgroundColor: feature.color + '20' }]}>
                <MaterialCommunityIcons
                  name={feature.icon as any}
                  size={28}
                  color={feature.color}
                />
              </View>
              <Text variant="titleSmall" style={styles.tileTitle}>
                {feature.title}
              </Text>
              <Text variant="bodySmall" style={styles.tileDescription}>
                {feature.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  email: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  avatar: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '47.5%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  tileDescription: {
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
