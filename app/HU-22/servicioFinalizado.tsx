

//primera pantalla de acuerdo a los muckups.


import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#FBBF24",
  success: "#22C55E",
  textMain: "#111827",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  background: "#F3F4F6",
  cardBorder: "#E5E7EB",
};

// Datos de ejemplo del servicio finalizado.
// Reemplazar por la información real (props, params o consulta a Supabase).
const SERVICIO = {
  profesional: "Juan Pérez Garcia",
  servicio: "Instalación eléctrica",
  fecha: "20 de mayo de 2025",
  estado: "Servicio finalizado",
};

export default function ServicioFinalizado() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* === HEADER === */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity hitSlop={10}>
            <Ionicons name="menu" size={26} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            <Text style={{ color: "#EF4444" }}>Red</Text>
            <Text style={{ color: COLORS.accentGold }}>Profesional</Text>
          </Text>

          <TouchableOpacity hitSlop={10}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* === CONTENIDO === */}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          {/* Ícono de éxito */}
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color={COLORS.white} />
          </View>

          <Text style={styles.title}>Servicio finalizado</Text>
          <Text style={styles.subtitle}>
            Gracias por confiar en {SERVICIO.profesional}.
          </Text>

          {/* Detalles del servicio */}
          <View style={styles.details}>
            <DetailRow
              icon="person-circle-outline"
              label="Profesional"
              value={SERVICIO.profesional}
            />
            <DetailRow
              icon="construct-outline"
              label="Servicio"
              value={SERVICIO.servicio}
            />
            <DetailRow
              icon="calendar-outline"
              label="Fecha"
              value={SERVICIO.fecha}
            />
            <DetailRow
              icon="flag-outline"
              label="Estado"
              value={SERVICIO.estado}
              valueStyle={styles.estadoValue}
            />
          </View>
        </View>

        {/* Botón principal: Comentar servicio */}
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.85}
          onPress={() => router.push("/HU-22/publicarComentario")}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primaryBlue} />
          <Text style={styles.btnPrimaryText}>Comentar servicio</Text>
        </TouchableOpacity>

        {/* Botón secundario: Ver detalles del servicio */}
        <TouchableOpacity
          style={styles.btnSecondary}
          activeOpacity={0.85}
          onPress={() => router.push("/HU-18/solicitudDetalle")}
        >
          <Ionicons name="document-text-outline" size={20} color={COLORS.primaryBlue} />
          <Text style={styles.btnSecondaryText}>Ver detalles del servicio</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

type DetailRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueStyle?: object;
};

function DetailRow({ icon, label, value, valueStyle }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={22} color={COLORS.primaryBlue} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueStyle]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafe: {
    backgroundColor: COLORS.primaryBlue,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  scroll: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    elevation: 4,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  details: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textMain,
    marginLeft: 12,
  },
  detailValue: {
    flex: 1.4,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "right",
  },
  estadoValue: {
    color: COLORS.success,
    fontWeight: "700",
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.accentGold,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  btnPrimaryText: {
    color: COLORS.primaryBlue,
    fontSize: 17,
    fontWeight: "bold",
  },
  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  btnSecondaryText: {
    flex: 1,
    color: COLORS.primaryBlue,
    fontSize: 16,
    fontWeight: "700",
  },
});
