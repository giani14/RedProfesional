import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  label: string;
  value?: string;
  children?: ReactNode;
}

export function InfoSection({ label, value, children }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  value: { fontSize: 13, color: "#4B5563", lineHeight: 18 },
});
