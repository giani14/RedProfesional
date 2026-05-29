import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
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
  successGreenCircle: "#D1FAE5",
  successGreenIcon: "#10B981",
  textMain: "#1F2937",
  textSecondary: "#4B5563",
  bgLight: "#F9FAFB",
  white: "#FFFFFF",
};

export default function SolicitudEnviada2() {
  const router = useRouter();
  // Recibimos el nombre del profesional para personalizar el mensaje
  const { nombre } = useLocalSearchParams();

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBlue}
      />

      {/* HEADER AZUL CLÁSICO */}
      <View style={styles.blueHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.replace("/(cliente)")}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>RedProfesional</Text>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.content}>
        {/* ICONO DE ÉXITO (Doble círculo verde) */}
        <View style={styles.successContainer}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="checkmark" size={60} color="white" />
            </View>
          </View>
        </View>

        {/* MENSAJES CENTRALES */}
        <Text style={styles.title}>¡Solicitud enviada!</Text>

        <Text style={styles.subtitle}>
          Tu solicitud ha sido enviada exitosamente a{" "}
          <Text style={styles.boldText}>{nombre || "el profesional"}</Text>.
        </Text>

        <Text style={styles.description}>
          El profesional revisará tu solicitud y te responderá pronto.
        </Text>
      </View>

      {/* BOTONES DE ACCIÓN INFERIORES */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/(cliente)/solicitudes" as any)}
        >
          <Text style={styles.btnPrimaryText}>Ver mis solicitudes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.replace("/(cliente)")}
        >
          <Text style={styles.btnSecondaryText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  blueHeader: {
    backgroundColor: COLORS.primaryBlue,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  successContainer: {
    marginBottom: 30,
  },
  outerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.successGreenCircle,
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.successGreenIcon,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: "bold",
    color: COLORS.primaryBlue,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
    gap: 15,
  },
  btnPrimary: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  btnPrimaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnSecondary: {
    backgroundColor: "white",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primaryBlue,
  },
  btnSecondaryText: {
    color: COLORS.primaryBlue,
    fontSize: 16,
    fontWeight: "bold",
  },
});
