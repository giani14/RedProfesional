import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
  primaryBlue: "#1A3B63",
  accentGold: "#F9B934",
  white: "#FFFFFF",
  background: "#F3F4F6",
  textDark: "#1F2937",
  textGray: "#6B7280",
  successBg: "#D1FAE5",
  successText: "#10B981", 
};

export default function CalificacionEnviada() {
  const router = useRouter();
  const { nombre, promedio, total, avatar_url, especialidad } = useLocalSearchParams<{
    nombre: string;
    promedio: string;
    total: string;
    avatar_url?: string;
    especialidad?: string;
  }>();

  const nombreReal = nombre || "Profesional";
  const getSiglas = (fullName: string) => {
    return fullName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      <View style={{ height: Platform.OS === "android" ? StatusBar.currentHeight : 0, backgroundColor: COLORS.primaryBlue }} />

      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={60} color={COLORS.successText} />
        </View>

        <Text style={styles.title}>¡Calificación enviada!</Text>

        <View style={styles.statsCard}>
          {avatar_url && avatar_url !== "null" && avatar_url !== "undefined" ? (
            <Image source={{ uri: decodeURIComponent(avatar_url) }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getSiglas(nombreReal)}</Text>
            </View>
          )}
          <Text style={styles.profName}>{nombreReal}</Text>
          <Text style={styles.profSpecialty}>{especialidad || "Especialista"}</Text>
          <View style={styles.row}>
            <Ionicons name="star" size={20} color={COLORS.accentGold} />
            <Text style={styles.statValue}>{promedio || "5.0"}</Text>
            <Text style={styles.statSubText}>promedio</Text>
          </View>
          <Text style={styles.reviewCount}>{total || "1"} reseñas en total</Text>
        </View>

        <Text style={styles.thanksMessage}>Gracias por calificar el servicio.</Text>

        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.textDark} />
          <Text style={styles.warningText}>
            Este servicio ya fue calificado.{"\n"}No puede enviar otra calificación para este servicio.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace("/" as Href)} // Redirigir limpio y seguro a la raiz
        >
          <Text style={styles.primaryBtnText}>Ir al inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 25 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.successBg, justifyContent: "center", alignItems: "center", marginBottom: 30, elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 26, fontWeight: "bold", color: COLORS.textDark, marginBottom: 30 },
  statsCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 25, width: "100%", alignItems: "center", elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, marginBottom: 30 },
  avatar: { width: 70, height: 70, borderRadius: 35, marginBottom: 15 },
  avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.primaryBlue, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  avatarInitials: { color: COLORS.white, fontSize: 28, fontWeight: "bold" },
  profName: { fontSize: 18, fontWeight: "bold", color: COLORS.primaryBlue, marginBottom: 5, textAlign: "center" },
  profSpecialty: { fontSize: 14, color: COLORS.textGray, marginBottom: 15, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: "bold", color: COLORS.textDark },
  statSubText: { fontSize: 16, color: COLORS.textGray },
  reviewCount: { fontSize: 14, color: COLORS.textGray, marginTop: 5 },
  thanksMessage: { fontSize: 16, fontWeight: "600", color: COLORS.textDark, marginBottom: 20, textAlign: "center" },
  warningBox: { flexDirection: "row", backgroundColor: "#E5E7EB", padding: 15, borderRadius: 12, alignItems: "center", width: "100%" },
  warningText: { flex: 1, marginLeft: 10, fontSize: 13, color: COLORS.textDark, lineHeight: 20, fontWeight: "500" },
  footer: { padding: 20, paddingBottom: Platform.OS === "ios" ? 30 : 20 },
  primaryBtn: { backgroundColor: COLORS.primaryBlue, paddingVertical: 16, borderRadius: 12, alignItems: "center", width: "100%", elevation: 3, shadowColor: "#000", shadowOpacity: 0.2 },
  primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
});