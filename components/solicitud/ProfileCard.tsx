import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { EstadoSolicitud, StatusBadge } from "./StatusBadge";

interface Props {
  nombre: string;
  rol: string;
  estado: EstadoSolicitud;
  avatar?: ImageSourcePropType;
}

export function ProfileCard({ nombre, rol, estado, avatar }: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={avatar ?? require("@/assets/images/avatar.png")}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {nombre}
          </Text>
          <Ionicons name="checkmark-circle" size={16} color="#2563EB" />
        </View>
        <Text style={styles.rol}>{rol}</Text>
      </View>
      <StatusBadge estado={estado} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12 },
  info: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  name: { fontSize: 15, fontWeight: "bold", color: "#1F2937" },
  rol: { fontSize: 12, color: "#6B7280", marginTop: 2 },
});
