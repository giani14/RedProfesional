import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#EAB308",
  textMain: "#1F2937",
  bgLight: "#F9FAFB",
};

export default function HomeInvitado() {
  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* SOLUCIÓN AL FONDO AZUL: StatusBar configurado para integrarse con el header */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBlue}
      />

      {/* Header con fondo azul que cubre la parte superior */}
      <View style={styles.header}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <Text style={styles.brandText}>
              Red<Text style={{ color: COLORS.accentGold }}>Profesional</Text>
            </Text>
            <TouchableOpacity onPress={() => router.push("/HU-02/login")}>
              <Text style={styles.loginLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bienvenida Invitado con el Avatar unificado */}
        <View style={styles.welcomeSection}>
          <View style={styles.avatarCircle}>
            {/* Ícono unificado con el perfil del invitado */}
            <Ionicons name="person" size={40} color="#CBD5E1" />
          </View>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeText}>Modo Invitado</Text>
            </View>
            <Text style={styles.subtext}>
              Encuentra los mejores profesionales para tus proyectos.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>¿Qué deseas hacer?</Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: "#E8F5E9" }]}
            onPress={() => router.push("/(cliente)/buscar")}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="search" size={30} color="#2E7D32" />
            </View>
            <Text style={styles.cardTitle}>Buscar profesional</Text>
            <Text style={styles.cardSub}>Explora expertos ahora</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: "#E3F2FD" }]}
            onPress={() => router.push("/HU-01/registrar")}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person-add" size={30} color="#1565C0" />
            </View>
            <Text style={styles.cardTitle}>Crear cuenta</Text>
            <Text style={styles.cardSub}>Para contratar y chatear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBanner}>
          <Ionicons
            name="information-circle"
            size={24}
            color={COLORS.primaryBlue}
          />
          <Text style={styles.infoText}>
            Como invitado puedes ver perfiles y portafolios, pero necesitas una
            cuenta para contactar profesionales.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.bgLight },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  brandText: { color: "white", fontSize: 20, fontWeight: "bold" },
  loginLink: {
    color: "white",
    fontWeight: "600",
    textDecorationLine: "underline",
    fontSize: 14,
  },

  scrollContent: { padding: 20 },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    gap: 15,
  },

  // Avatar unificado con el estilo de Perfil Invitado
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9", // Mismo gris suave del perfil
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  welcomeInfo: { flex: 1 },
  welcomeTitle: { fontSize: 24, fontWeight: "bold", color: COLORS.textMain },
  guestBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginVertical: 5,
  },
  guestBadgeText: { color: "#6B7280", fontSize: 12, fontWeight: "bold" },
  subtext: { color: "#6B7280", fontSize: 14, lineHeight: 20 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.textMain,
  },
  grid: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    width: (SCREEN_WIDTH - 60) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
    color: COLORS.textMain,
  },
  cardSub: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },

  infoBanner: {
    backgroundColor: "#DBEAFE",
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    gap: 12,
    marginTop: 40,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primaryBlue,
    lineHeight: 18,
  },
});
