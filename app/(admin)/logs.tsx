import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function LogsScreen() {
  // Datos muestra simulando acciones críticas
  const mockLogs = [
    {
      id: "1",
      accion: "Aprobación de Profesional",
      detalle: "Admin aprobó a Jhorell Candia",
      fecha: "Hoy, 11:30 AM",
      tipo: "success",
    },
    {
      id: "2",
      accion: "Bloqueo de Cuenta",
      detalle: "Se suspendió usuario por reportes acumulados",
      fecha: "Ayer, 04:15 PM",
      tipo: "danger",
    },
    {
      id: "3",
      accion: "Cambio de Configuración",
      detalle: "Actualización de políticas globales de almacenamiento",
      fecha: "10 Jun 2026",
      tipo: "warning",
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={mockLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <View style={styles.rowHead}>
              <Text style={styles.logTitle}>{item.accion}</Text>
              <Text style={styles.logTime}>{item.fecha}</Text>
            </View>
            <Text style={styles.logDetail}>{item.detalle}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  logCard: {
    padding: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rowHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  logTitle: { fontSize: 15, fontWeight: "bold", color: "#1A4670" },
  logTime: { fontSize: 12, color: "#9CA3AF" },
  logDetail: { fontSize: 14, color: "#4B5563" },
});
