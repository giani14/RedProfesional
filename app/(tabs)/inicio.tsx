import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InicioScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        {/* Logo o Icono */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>RP</Text>
        </View>

        <Text style={styles.title}>RedProfesional</Text>
        <Text style={styles.subtitle}>
          Conecta con los mejores profesionales o encuentra nuevos clientes en
          un solo lugar.
        </Text>

        <View style={styles.buttonContainer}>
          {/* Botón de Iniciar Sesión (Simulado) */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("../login")}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          {/* OPCIÓN: SELECCIONAR ROL (Redirige a selRol.tsx) */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("../selRol")}
          >
            <Text style={styles.registerButtonText}>
              Seleccionar Rol / Registrarse
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 RedProfesional Cochabamba</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#2563EB",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    // Sombra para iOS y Android
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  loginButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  registerButtonText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    paddingBottom: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#94A3B8",
    fontSize: 12,
  },
});
