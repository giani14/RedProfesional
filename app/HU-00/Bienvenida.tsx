import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#FBBF24",
  textMain: "#111827",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  shapeBeige: "#F3E5AB",
  shapeBlue: "#5D89BA",
};

export default function Bienvenida() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* === FIGURAS DECORATIVAS (ADN VISUAL) === */}
      <View style={[styles.shape, styles.shapeTopLeft]} />
      <View style={[styles.shape, styles.shapeTopRight]} />
      <View style={[styles.shape, styles.shapeBottomLeft]} />

      <SafeAreaView style={styles.content}>
        {/* LOGOTIPO CENTRAL */}
        <View style={styles.logoSection}>
          <Image
            source={require("@/assets/images/RedProfesional-removebg.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>
            Conecta con los mejores expertos de Cochabamba
          </Text>
        </View>

        {/* BLOQUE DE ACCIONES (JERARQUÍA VISUAL) */}
        <View style={styles.actionSection}>
          <Text style={styles.welcomeText}>
            ¡Tu solución profesional a un toque de distancia!
          </Text>

          {/* 1. Opción Principal: Registro */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push("/HU-01/registrar")}
          >
            <Text style={styles.btnPrimaryText}>Comenzar ahora</Text>
          </TouchableOpacity>

          {/* 2. Opción Secundaria: Iniciar Sesión */}
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push("/HU-02/login")}
          >
            <Text style={styles.btnSecondaryText}>Ya tengo una cuenta</Text>
          </TouchableOpacity>

          {/* 3. Opción Terciaria: Invitado */}
          <TouchableOpacity
            style={styles.btnGuest}
            onPress={() => router.push("/(invitado)")}
          >
            <Text style={styles.btnGuestText}>Explorar como invitado</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER DE CONFIANZA */}
        <Text style={styles.footerNote}>
          Seguridad y confianza en cada servicio
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 30,
    zIndex: 10,
  },
  logoSection: {
    alignItems: "center",
    marginTop: SCREEN_HEIGHT * 0.1,
  },
  logo: {
    width: SCREEN_WIDTH * 0.7,
    height: 120,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontWeight: "500",
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primaryBlue,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 28,
  },
  actionSection: {
    width: "100%",
    marginBottom: 20,
  },
  btnPrimary: {
    backgroundColor: COLORS.accentGold,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  btnPrimaryText: {
    color: COLORS.primaryBlue,
    fontSize: 18,
    fontWeight: "bold",
  },
  btnSecondary: {
    backgroundColor: "transparent",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primaryBlue,
    marginBottom: 20,
  },
  btnSecondaryText: {
    color: COLORS.primaryBlue,
    fontSize: 16,
    fontWeight: "bold",
  },
  btnGuest: {
    alignItems: "center",
    paddingVertical: 10,
  },
  btnGuestText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footerNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    opacity: 0.7,
  },
  /* ESTILOS DE LAS FIGURAS (IDENTIDAD VISUAL) */
  shape: {
    position: "absolute",
    zIndex: 1,
    opacity: 0.5,
  },
  shapeTopLeft: {
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.shapeBeige,
  },
  shapeTopRight: {
    top: 100,
    right: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.shapeBlue,
    opacity: 0.3,
  },
  shapeBottomLeft: {
    bottom: -60,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.accentGold,
    opacity: 0.2,
  },
});
