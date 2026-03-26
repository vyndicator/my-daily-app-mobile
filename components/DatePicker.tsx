import React, { useState } from 'react';
import { Platform, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { COLORS } from '../theme';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export default function DatePicker({ value, onChange, label }: Props) {
  const [show, setShow] = useState(false);

  const handleChange = (_: any, selected?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selected) onChange(selected);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.input} onPress={() => setShow(true)}>
        <Text style={styles.value}>{format(value, 'MMM d, yyyy')}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          themeVariant="dark"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
});
