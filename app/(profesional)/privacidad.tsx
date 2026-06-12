import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  white: "#FFFFFF",
  textGray: "#6B7280",
  lightGray: "#F3F4F6",
  borderGray: "#E5E7EB",
};

interface PolicySectionProps {
  icon: any;
  title: string;
  content: string;
}

const PolicySection = ({ icon, title, content }: PolicySectionProps) => (
  <View style={styles.policyCard}>
    <View style={styles.policyHeader}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={COLORS.primaryBlue} />
      </View>
      <Text style={styles.policyTitle}>{title}</Text>
    </View>
    <Text style={styles.policyContent}>{content}</Text>
  </View>
);

const POLICIES: PolicySectionProps[] = [
  {
    icon: "document-text-outline",
    title: "Información que recopilamos",
    content:
      "Recopilamos los datos que proporcionas al crear tu perfil, como tu nombre, ubicación, servicios ofrecidos y foto de perfil, además de la información generada por el uso de la aplicación.",
  },
  {
    icon: "construct-outline",
    title: "Cómo usamos tus datos",
    content:
      "Usamos tu información para conectarte con clientes, mostrar tu perfil profesional, gestionar solicitudes de servicio y mejorar tu experiencia dentro de RedProfesional.",
  },
  {
    icon: "share-social-outline",
    title: "Con quién compartimos tu información",
    content:
      "Tu información de perfil es visible para los clientes que buscan servicios. Nunca vendemos tus datos personales a terceros con fines publicitarios.",
  },
  {
    icon: "lock-closed-outline",
    title: "Seguridad de tus datos",
    content:
      "Aplicamos medidas de seguridad para proteger tu información. Tus credenciales de acceso se almacenan de forma cifrada y protegida.",
  },
  {
    icon: "person-remove-outline",
    title: "Tus derechos",
    content:
      "Puedes acceder, actualizar o eliminar tu información personal en cualquier momento desde tu perfil. También puedes solicitar la eliminación de tu cuenta contactando a soporte.",
  },
];

export default function Privacidad() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>
          Red<Text style={{ color: COLORS.accentGold }}>Profesional</Text>
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconBox}>
            <Ionicons
              name="shield-checkmark-outline"
              size={48}
              color={COLORS.primaryBlue}
            />
          </View>
          <Text style={styles.heroTitle}>Privacidad</Text>
          <Text style={styles.heroSubtitle}>
            Tu privacidad es importante para nosotros
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Política de privacidad</Text>
          {POLICIES.map((policy, index) => (
            <PolicySection
              key={index}
              icon={policy.icon}
              title={policy.title}
              content={policy.content}
            />
          ))}

          <Text style={styles.versionText}>
            Última actualización: 12 de junio de 2026
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLogo: { color: "white", fontSize: 22, fontWeight: "bold" },
  scrollContent: { paddingBottom: 100 },
  heroSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderColor: COLORS.borderGray,
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  heroTitle: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 5,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  menuContainer: { paddingHorizontal: 20, marginTop: 15 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.textGray,
    marginTop: 20,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  policyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  policyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  policyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 15,
    flexShrink: 1,
  },
  policyContent: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 20,
  },
  versionText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 30,
  },
});
