import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logoRedProfesional = require("../assets/images/RedProfesional-removebg.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Definición de colores basada en tu proyecto
const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  bgColor: "#F3F4F6",
  successGreen: "#D1FAE5",
  checkIcon: "#10B981",
};

export default function AsigClienteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* === FIGURAS DECORATIVAS DE FONDO === */}
      {/* Círculo superior izquierdo (Beige) */}
      <View
        style={{
          position: "absolute",
          top: -40,
          left: -40,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: "#F3E5AB",
          opacity: 0.5,
          zIndex: -1, // Se asegura de estar detrás de todo
        }}
      />

      {/* Círculo inferior izquierdo (Azul) */}
      <View
        style={{
          position: "absolute",
          bottom: -30,
          left: -40,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: "#5D89BA",
          opacity: 0.4,
          zIndex: -1,
        }}
      />

      {/* Círculo inferior derecho (Dorado/Amarillo) */}
      <View
        style={{
          position: "absolute",
          bottom: -40,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: COLORS.accentGold,
          opacity: 0.3,
          zIndex: -1,
        }}
      />
      {/* ===================================== */}

      {/* Logo */}
      <View style={{ alignItems: "center", marginBottom: 1, marginTop: 80 }}>
        <Image
          source={logoRedProfesional}
          style={{
            width: SCREEN_WIDTH * 0.6,
            height: 120,
          }}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        {/* Círculo de éxito con check */}
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={60} color={COLORS.checkIcon} />
        </View>

        <Text style={styles.title}>¡Rol asignado correctamente!</Text>
        <Text style={styles.subtitle}>Tu cuenta ha sido creada como</Text>

        {/* Etiqueta de Rol */}
        <View style={[styles.roleBadge, { backgroundColor: "#DBEAFE" }]}>
          <Text style={[styles.roleText, { color: "#1E40AF" }]}>Cliente</Text>
        </View>

        <Text style={styles.footerText}>
          Ya puedes comenzar a usar RedProfesional.
        </Text>

        {/* Botón Final */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
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
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 15,
  },
  roleBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  roleText: {
    fontWeight: "bold",
    fontSize: 16,
  },
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
  buttonText: {
    color: "#1A4670",
    fontSize: 18,
    fontWeight: "bold",
  },
});
