import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Paleta de colores consistente con RedProfesional
const COLORS = {
  primaryBlue: "#123F78",
  buttonBlue: "#0052D4",
  textMain: "#1F2937",
  textSecondary: "#6B7280",
  bgLight: "#F9FAFB",
  white: "#FFFFFF",
  errorGrey: "#CBD5E1",
};

interface ErrorCargadoProps {
  onRetry: () => void; // Función para volver a intentar la carga
}

export default function ErrorCargado({ onRetry }: ErrorCargadoProps) {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER SUPERIOR */}
      <View style={styles.blueHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Perfil profesional</Text>
            <TouchableOpacity>
              <Ionicons name="share-social-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.content}>
        {/* ILUSTRACIÓN DE ERROR */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.mainCircle}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={80}
              color={COLORS.errorGrey}
            />
            {/* Badge de advertencia azul */}
            <View style={styles.warningBadge}>
              <Ionicons name="warning" size={20} color="white" />
            </View>
          </View>

          {/* Elementos decorativos (Nubes sutiles) */}
          <Ionicons
            name="cloud"
            size={24}
            color="#E2E8F0"
            style={[styles.cloud, { top: 10, left: -10 }]}
          />
          <Ionicons
            name="cloud"
            size={18}
            color="#E2E8F0"
            style={[styles.cloud, { bottom: 30, right: -5 }]}
          />
        </View>

        {/* TEXTOS DE ERROR */}
        <Text style={styles.title}>No se pudo cargar el perfil</Text>
        <Text style={styles.subtitle}>
          Intenta nuevamente en unos momentos.
        </Text>

        {/* BOTONES DE ACCIÓN */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.btnRetry}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={22} color="white" />
            <Text style={styles.btnRetryText}>Reintentar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => router.replace("/(cliente)/buscar")}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.primaryBlue} />
            <Text style={styles.btnBackText}>Volver a búsqueda</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    fontWeight: "600",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    backgroundColor: COLORS.bgLight,
  },
  illustrationWrapper: {
    marginBottom: 45,
    position: "relative",
  },
  mainCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  warningBadge: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#2563EB",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#F1F5F9",
  },
  cloud: {
    position: "absolute",
    opacity: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  btnRetry: {
    backgroundColor: COLORS.buttonBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  btnRetryText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  btnBack: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  btnBackText: {
    color: COLORS.primaryBlue,
    fontWeight: "bold",
    fontSize: 16,
  },
});
