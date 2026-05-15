import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logoRedProfesional = require("@/assets/images/RedProfesional-removebg.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  successGreen: "#D1FAE5",
  checkIcon: "#10B981",
  textGray: "#6B7280",
};

export default function AsigProfeScreen() {
  const router = useRouter();
  // Si pasas el nombre por params desde la pantalla anterior, lo capturamos aquí
  const { nombre } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* === FIGURAS DECORATIVAS === */}
      <View style={[styles.shape, styles.shapeTopLeft]} />
      <View style={[styles.shape, styles.shapeBottomLeft]} />
      <View style={[styles.shape, styles.shapeBottomRight]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={logoRedProfesional}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          {/* Check de Éxito */}
          <View style={styles.successCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="checkmark" size={50} color="white" />
            </View>
          </View>

          <Text style={styles.title}>¡Registro completado!</Text>
          <Text style={styles.subtitle}>
            Tu cuenta de profesional está lista
          </Text>

          {/* TARJETA DE RESUMEN (Lo que faltaba) */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <FontAwesome5
                name="user-tie"
                size={30}
                color={COLORS.primaryBlue}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {nombre || "Usuario Profesional"}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Profesional verificado</Text>
              </View>
            </View>
          </View>

          <Text style={styles.footerText}>
            Ya puedes empezar a recibir solicitudes de clientes en Cochabamba.
          </Text>

          {/* BOTONES DE ACCIÓN */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => router.replace("/(profesional)/perfil")}
          >
            <Text style={styles.mainButtonText}>Ver mi perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace("/(profesional)")}
          >
            <Text style={styles.secondaryButtonText}>Ir al inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  logoContainer: { alignItems: "center", marginTop: 40, marginBottom: 10 },
  logo: { width: SCREEN_WIDTH * 0.5, height: 100 },
  content: { alignItems: "center", paddingHorizontal: 30 },

  // Estilo del Check
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  innerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A4670",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textGray,
    marginTop: 5,
    marginBottom: 25,
  },

  // Estilo de la Tarjeta de Perfil
  profileCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  profileInfo: {
    flex: 1, // Esto permite que el texto use el espacio restante
    justifyContent: "center",
  },
  profileName: { fontSize: 18, fontWeight: "bold", color: "#1A4670" },
  badge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  badgeText: { color: "#92400E", fontSize: 12, fontWeight: "700" },

  footerText: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: "center",
    marginBottom: 35,
  },

  // Botones
  mainButton: {
    backgroundColor: COLORS.accentGold,
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },
  mainButtonText: { color: "#1A4670", fontSize: 16, fontWeight: "bold" },

  secondaryButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primaryBlue,
  },
  secondaryButtonText: {
    color: COLORS.primaryBlue,
    fontSize: 16,
    fontWeight: "bold",
  },

  // Figuras de fondo
  shape: { position: "absolute", zIndex: -1, opacity: 0.4 },
  shapeTopLeft: {
    top: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3E5AB",
  },
  shapeBottomLeft: {
    bottom: 20,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#5D89BA",
  },
  shapeBottomRight: {
    bottom: -30,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.accentGold,
  },
});
