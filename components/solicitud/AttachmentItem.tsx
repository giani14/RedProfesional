import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  nombre: string;
  onDownload?: () => void;
}

export function AttachmentItem({ nombre, onDownload }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name="document-text-outline" size={20} color="#1A4670" />
      <Text style={styles.name} numberOfLines={1}>
        {nombre}
      </Text>
      <TouchableOpacity onPress={onDownload} hitSlop={8}>
        <Ionicons name="download-outline" size={20} color="#1A4670" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
  },
  name: { flex: 1, fontSize: 13, color: "#1F2937" },
});
