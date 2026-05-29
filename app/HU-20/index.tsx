import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HU20Notificaciones() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HU-20</Text>
      <Text style={styles.subtitle}>Recibir notificaciones</Text>
      <Text style={styles.text}>
        Pantalla en desarrollo para el módulo de notificaciones.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#003B73",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 8,
    textAlign: "center",
  },
  text: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
});
