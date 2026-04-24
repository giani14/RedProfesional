import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  successGreen: "#D1FAE5",
  checkIcon: "#10B981",
};

export default function AsigProfeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={60} color={COLORS.checkIcon} />
        </View>

        <Text style={styles.title}>¡Rol asignado correctamente!</Text>
        <Text style={styles.subtitle}>Tu cuenta ha sido creada como</Text>

        {/* Etiqueta de Rol Profesional */}
        <View style={[styles.roleBadge, { backgroundColor: "#FEF3C7" }]}>
          <Text style={[styles.roleText, { color: "#92400E" }]}>
            Profesional
          </Text>
        </View>

        <Text style={styles.footerText}>
          Ya puedes comenzar a usar RedProfesional.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/Home")}
        >
          <Text style={styles.buttonText}>Ir al inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Los estilos son idénticos al de arriba para mantener la coherencia visual
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A4670",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: { fontSize: 16, color: "#6B7280", marginBottom: 15 },
  roleBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  roleText: { fontWeight: "bold", fontSize: 16 },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#EAB308",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: { color: "#1A4670", fontSize: 18, fontWeight: "bold" },
});
