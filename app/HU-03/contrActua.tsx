import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContraActualizada() {
  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Decoración Superior */}
      <View style={styles.topDecoration}>
        <View style={[styles.blob, styles.blueBlob, { top: -60, left: -40 }]} />
      </View>

      <SafeAreaView style={styles.content}>
        {/* Logo de RedProfesional */}
        <Image
          source={require("@/assets/images/RedProfesional-removebg.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Icono de Éxito */}
        <View style={styles.successIconContainer}>
          <View style={styles.greenCircle}>
            <Ionicons name="checkmark" size={60} color="white" />
          </View>
        </View>

        {/* Textos Informativos */}
        <Text style={styles.title}>¡Contraseña actualizada!</Text>
        <Text style={styles.subtitle}>
          Tu contraseña ha sido cambiada correctamente.
        </Text>

        {/* Botón Iniciar Sesión */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.replace("/HU-02/login")}
        >
          <Text style={styles.mainButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Decoración Inferior */}
      <View style={styles.bottomDecoration}>
        <View
          style={[styles.blob, styles.yellowBlob, { bottom: -50, right: -60 }]}
        />
        <View
          style={[
            styles.blob,
            styles.blueBlob,
            { bottom: -80, left: -20, opacity: 0.3 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 30,
    zIndex: 10,
  },
  logo: {
    width: 220,
    height: 80,
    marginBottom: 40,
  },
  successIconContainer: {
    marginBottom: 30,
  },
  greenCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#22C55E", // Verde de confirmación
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E3A5F",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 24,
  },
  mainButton: {
    backgroundColor: "#FBBF24", // Amarillo/Naranja del diseño
    width: "100%",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
  },
  mainButtonText: {
    color: "#1E3A5F",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Estilos para las decoraciones (blobs)
  blob: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  blueBlob: {
    backgroundColor: "#3B82F6",
    opacity: 0.1,
  },
  yellowBlob: {
    backgroundColor: "#FDE68A",
    opacity: 0.4,
  },
  topDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
  },
  bottomDecoration: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
  },
});
