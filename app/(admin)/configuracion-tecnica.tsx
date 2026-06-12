import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function ConfiguracionTecnicaScreen() {
  const [mantenimiento, setMantenimiento] = useState(false);
  const [logsActivos, setLogsActivos] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Variables de Entorno e Infraestructura
      </Text>

      <View style={styles.settingRow}>
        <View style={styles.meta}>
          <Text style={styles.settingLabel}>Modo Mantenimiento</Text>
          <Text style={styles.settingSub}>
            Bloquea el acceso a la app móvil temporalmente
          </Text>
        </View>
        <Switch
          value={mantenimiento}
          onValueChange={setMantenimiento}
          trackColor={{ true: "#1A4670" }}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.meta}>
          <Text style={styles.settingLabel}>
            Registro de Auditoría Detallada
          </Text>
          <Text style={styles.settingSub}>
            Guarda trazas detalladas de eventos de red
          </Text>
        </View>
        <Switch
          value={logsActivos}
          onValueChange={setLogsActivos}
          trackColor={{ true: "#1A4670" }}
        />
      </View>

      <View style={styles.boxInfo}>
        <Text style={styles.boxTitle}>Estado de Servicios</Text>
        <Text style={styles.statusText}>
          ● Supabase Auth:{" "}
          <Text style={{ fontWeight: "bold", color: "green" }}>ONLINE</Text>
        </Text>
        <Text style={styles.statusText}>
          ● Supabase Storage Buckets:{" "}
          <Text style={{ fontWeight: "bold", color: "green" }}>
            OPERATIONAL
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A4670",
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  meta: { flex: 1, paddingRight: 10 },
  settingLabel: { fontSize: 15, fontWeight: "500", color: "#333" },
  settingSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  boxInfo: {
    marginTop: 30,
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 8,
  },
  boxTitle: { fontWeight: "bold", color: "#1A4670", marginBottom: 10 },
  statusText: { fontSize: 14, color: "#4B5563", marginBottom: 5 },
});
