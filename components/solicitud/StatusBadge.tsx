import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type EstadoSolicitud = "Pendiente" | "Aceptada" | "Rechazada";

const colors: Record<EstadoSolicitud, { bg: string; fg: string }> = {
  Pendiente: { bg: "#FEF3C7", fg: "#B45309" },
  Aceptada: { bg: "#D1FAE5", fg: "#047857" },
  Rechazada: { bg: "#FEE2E2", fg: "#B91C1C" },
};

interface Props {
  estado: EstadoSolicitud;
}

export function StatusBadge({ estado }: Props) {
  const c = colors[estado];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{estado}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "700" },
});
