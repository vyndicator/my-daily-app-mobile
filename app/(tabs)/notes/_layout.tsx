import { Stack } from 'expo-router';
import { COLORS } from '../../../theme';

export default function NotesLayout() {
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
