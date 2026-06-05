import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
// Importamos solo lo necesario. Nota: EstadoSolicitud ahora es más flexible.
import { StatusBadge } from "./StatusBadge";

interface Props {
  nombre: string;
  rol: string;
  estado: string; // <-- CAMBIO: Usamos string para que sea compatible con la base de datos
  avatar?: ImageSourcePropType;
}

export function ProfileCard({ nombre, rol, estado, avatar }: Props) {
  return (
    <View style={styles.card}>
      <Image
        // Usamos un placeholder de internet si no hay avatar, para evitar errores de carga local
        source={
          avatar ?? {
            uri: "https://via.placeholder.com/150/F1F5F9/94A3B8?text=Avatar",
          }
        }
        style={styles.avatar}
      />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {nombre}
          </Text>
          <Ionicons name="checkmark-circle" size={16} color="#2563EB" />
        </View>
        <Text style={styles.rol} numberOfLines={1}>
          {rol}
        </Text>
      </View>
      {/* Pasamos el estado directamente al badge blindado */}
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
    // Sombreado más suave para un look profesional
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  info: { flex: 1, marginRight: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  name: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  rol: { fontSize: 13, color: "#6B7280", marginTop: 2 },
});
