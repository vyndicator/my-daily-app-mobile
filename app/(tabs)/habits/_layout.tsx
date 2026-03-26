import { Stack } from 'expo-router';
import { COLORS } from '../../../theme';

export default function HabitsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    />
  );
}
