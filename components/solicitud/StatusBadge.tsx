import React from "react";
import { StyleSheet, Text, View } from "react-native";

// 1. Ampliamos los tipos para incluir los nuevos estados que estamos usando
export type EstadoSolicitud =
  | "pendiente"
  | "revisando"
  | "en_proceso"
  | "aceptada"
  | "rechazada"
  | "finalizado";

// 2. Definimos los colores para cada estado posible
const colors: Record<string, { bg: string; fg: string; label: string }> = {
  pendiente: { bg: "#FEF3C7", fg: "#B45309", label: "Pendiente" },
  revisando: { bg: "#E0F2FE", fg: "#0369A1", label: "Revisando" },
  en_proceso: { bg: "#DBEAFE", fg: "#1E40AF", label: "En Proceso" },
  aceptada: { bg: "#D1FAE5", fg: "#047857", label: "Aceptada" },
  rechazada: { bg: "#FEE2E2", fg: "#B91C1C", label: "Rechazada" },
  finalizado: { bg: "#D1FAE5", fg: "#047857", label: "Finalizado" },
};

interface Props {
  estado: string; // Lo dejamos como string para mayor flexibilidad al recibir datos de la DB
}

export function StatusBadge({ estado }: Props) {
  // 3. NORMALIZACIÓN Y SEGURIDAD (La clave para evitar el crash)
  // Pasamos a minúsculas y si el estado no existe, usamos "pendiente" por defecto
  const estadoKey = estado?.toLowerCase() || "pendiente";
  const c = colors[estadoKey] || colors.pendiente;

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{c.label}</Text>
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
  text: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize", // Esto hace que la primera letra sea siempre mayúscula
  },
});
