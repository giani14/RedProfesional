import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CorreoInexistente() {
  // Obtenemos el correo que el usuario escribió desde los parámetros de navegación
  const { emailErroneo } = useLocalSearchParams();

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerBar}>
        <SafeAreaView edges={["top"]} style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar contraseña</Text>
        </SafeAreaView>
      </View>

      <View style={styles.content}>
        <Image
          source={require("@/assets/images/RedProfesional-removebg.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Icono de advertencia circular */}
        <View style={styles.warningCircleContainer}>
          <View style={styles.warningCircle}>
            <Ionicons name="alert" size={50} color="#EF4444" />
          </View>
        </View>

        <Text style={styles.title}>Correo no encontrado</Text>
        <Text style={styles.subtitle}>
          No existe una cuenta registrada con{"\n"}
          <Text style={styles.emailHighlight}>
            {emailErroneo || "usuario@correo.com"}
          </Text>
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.back()}
        >
          <Text style={styles.mainButtonText}>Intentar con otro correo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerLinkContainer}
          onPress={() => router.push("/HU-02/login")} // Ajusta a tu ruta de login
        >
          <Text style={styles.footerLinkText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Decoraciones de fondo inferiores */}
      <View style={styles.bgDecorationContainer}>
        <View style={[styles.shape, styles.shapeBottomLeft]} />
        <View style={[styles.shape, styles.shapeBottomRight]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerBar: {
    backgroundColor: "#1E3A5F",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 15,
    paddingTop: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginRight: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: "center",
    paddingTop: 40,
    zIndex: 1,
  },
  logo: {
    width: "80%",
    height: 80,
    marginBottom: 30,
  },
  warningCircleContainer: {
    marginBottom: 25,
  },
  warningCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FEE2E2", // Rojo muy claro
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#EF4444",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  emailHighlight: {
    color: "#1E3A5F",
    fontWeight: "bold",
  },
  mainButton: {
    backgroundColor: "#FBBF24",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  mainButtonText: {
    color: "#1E3A5F",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerLinkContainer: {
    marginTop: 20,
  },
  footerLinkText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "bold",
  },
  bgDecorationContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  shape: {
    position: "absolute",
    opacity: 0.5,
  },
  shapeBottomLeft: {
    bottom: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#3B82F6",
  },
  shapeBottomRight: {
    bottom: -20,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FDE68A",
  },
});
