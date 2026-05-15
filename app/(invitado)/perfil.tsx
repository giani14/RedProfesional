import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#FBBF24",
  textMain: "#111827",
  textSecondary: "#6B7280",
  bgLight: "#F3F4F6",
  white: "#FFFFFF",
};

export default function PerfilInvitado() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER AZUL */}
      <View style={styles.blueHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SECCIÓN DE IDENTIDAD (MODO INVITADO) */}
        <View style={styles.heroCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={50} color="#CBD5E1" />
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeText}>Invitado</Text>
            </View>
          </View>
          <Text style={styles.welcomeTitle}>¡Únete a RedProfesional!</Text>
          <Text style={styles.welcomeSub}>
            Regístrate para gestionar tus servicios y contactar expertos.
          </Text>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push("/HU-01/registrar")}
          >
            <Text style={styles.btnPrimaryText}>Crear cuenta gratis</Text>
          </TouchableOpacity>
        </View>

        {/* BENEFICIOS DE TENER UNA CUENTA */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>¿Por qué registrarte?</Text>

          <View style={styles.benefitItem}>
            <View style={[styles.iconBg, { backgroundColor: "#E0E7FF" }]}>
              <Ionicons name="chatbubbles-outline" size={22} color="#4338CA" />
            </View>
            <View style={styles.benefitTextContent}>
              <Text style={styles.benefitTitle}>Chat en tiempo real</Text>
              <Text style={styles.benefitDesc}>
                Habla directamente con los profesionales para coordinar
                detalles.
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={[styles.iconBg, { backgroundColor: "#FEF3C7" }]}>
              <Feather name="list" size={22} color="#92400E" />
            </View>
            <View style={styles.benefitTextContent}>
              <Text style={styles.benefitTitle}>Gestiona tus pedidos</Text>
              <Text style={styles.benefitDesc}>
                Haz seguimiento de tus solicitudes y mantén un historial
                organizado.
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={[styles.iconBg, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="star-outline" size={22} color="#065F46" />
            </View>
            <View style={styles.benefitTextContent}>
              <Text style={styles.benefitTitle}>Califica servicios</Text>
              <Text style={styles.benefitDesc}>
                Ayuda a la comunidad calificando el trabajo de los expertos.
              </Text>
            </View>
          </View>
        </View>

        {/* BOTÓN DE LOGIN SECUNDARIO */}
        <View style={styles.loginSection}>
          <Text style={styles.loginPrompt}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push("/HU-02/login")}
          >
            <Text style={styles.btnSecondaryText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <MaterialCommunityIcons
            name="shield-check"
            size={18}
            color={COLORS.textSecondary}
          />
          <Text style={styles.footerText}>
            Tu información está segura con nosotros.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.bgLight },
  blueHeader: { backgroundColor: COLORS.primaryBlue, paddingBottom: 15 },
  headerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600" },

  scrollContent: { paddingBottom: 40 },

  heroCard: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  guestBadge: {
    position: "absolute",
    bottom: 0,
    backgroundColor: COLORS.primaryBlue,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white",
  },
  guestBadgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
    textAlign: "center",
  },
  welcomeSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },

  btnPrimary: {
    backgroundColor: COLORS.accentGold,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: COLORS.primaryBlue,
    fontWeight: "bold",
    fontSize: 16,
  },

  infoSection: { paddingHorizontal: 25, marginTop: 10 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 15,
  },
  iconBg: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitTextContent: { flex: 1 },
  benefitTitle: { fontSize: 15, fontWeight: "bold", color: COLORS.textMain },
  benefitDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  loginSection: { alignItems: "center", marginTop: 20, paddingHorizontal: 25 },
  loginPrompt: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  btnSecondary: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primaryBlue,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: COLORS.primaryBlue,
    fontWeight: "bold",
    fontSize: 15,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    gap: 8,
  },
  footerText: { fontSize: 11, color: COLORS.textSecondary },
});
