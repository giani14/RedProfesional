import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    ScrollView,
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
  successText: "#047857",
  borderGray: "#E5E7EB",
};

interface Solicitud {
  id: string;
  profesional_id: string;
  estado: string;
  fecha_solicitud: string;
  proyecto: string;
  perfiles: {
    nombre_completo: string;
    avatar_url?: string;
    ubicacion?: string;
    rol?: string;
  };
}

export default function ServicioFinalizado() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [yaCalificado, setYaCalificado] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchData();
        checkSiYaFueCalificado();
      }
    }, [id])
  );

  async function checkSiYaFueCalificado() {
    try {
      const localCheck = await AsyncStorage.getItem(`calificada_${id}`);
      if (localCheck === "true") setYaCalificado(true);
    } catch (e) {
      console.log("Error leyendo AsyncStorage:", e);
    }
  }

  async function fetchData() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("solicitudes_servicio")
        .select("id, profesional_id, estado, fecha_solicitud, proyecto, perfiles:profesional_id (nombre_completo, avatar_url, ubicacion, rol)")
        .eq("id", id)
        .single();

      if (error) throw error;
      setSolicitud(data as unknown as Solicitud);
    } catch (error: any) {
      console.error("Error obteniendo solicitud:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const estadoSeguro = solicitud?.estado?.toLowerCase().trim();
  const esFinalizado = estadoSeguro === "finalizado" || estadoSeguro === "finalizada";

  const irACalificar = () => {
    if (!solicitud) return;
    
    const p = solicitud.perfiles;
    const nombreReal = p?.nombre_completo || "Profesional";
    const avatarReal = p?.avatar_url || "";
    // Se adapta al esquema: Si no hay especialidad, se usa ubicacion o rol. Jamás texto fijo irrelevante.
    const especialidadReal = p?.ubicacion || p?.rol || "Especialista";

    router.push(
      `/HU-21/calificar?id=${solicitud.id}&profesional_id=${solicitud.profesional_id}&nombre=${encodeURIComponent(nombreReal)}&avatar_url=${encodeURIComponent(avatarReal)}&especialidad=${encodeURIComponent(especialidadReal)}` as Href
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      <View style={{ height: Platform.OS === "android" ? StatusBar.currentHeight : 0, backgroundColor: COLORS.primaryBlue }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de solicitud</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.mainTitle}>Servicio finalizado</Text>

        <View style={styles.card}>
          <View style={styles.estadoBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.successText} />
            <Text style={styles.estadoText}>Finalizado</Text>
          </View>

          <Text style={styles.label}>Profesional</Text>
          <Text style={styles.value}>{solicitud?.perfiles?.nombre_completo || "Cargando..."}</Text>

          <Text style={styles.label}>Servicio</Text>
          <Text style={styles.value}>{solicitud?.proyecto || "Proyecto"}</Text>

          <Text style={styles.label}>Fecha finalización</Text>
          <Text style={styles.value}>{solicitud?.fecha_solicitud ? new Date(solicitud.fecha_solicitud).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : ""}</Text>
        </View>

        {yaCalificado ? (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={COLORS.textGray} />
            <Text style={styles.infoText}>Este servicio ya fue calificado.</Text>
          </View>
        ) : !esFinalizado ? (
          <View style={styles.infoBanner}>
            <Ionicons name="time" size={20} color={COLORS.accentGold} />
            <Text style={styles.infoText}>El servicio se encuentra en proceso. Podrás calificarlo al finalizar.</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={irACalificar}>
            <Text style={styles.primaryBtnText}>Calificar servicio</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
          <Text style={styles.secondaryBtnText}>Ver detalles del servicio</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { height: 70, backgroundColor: COLORS.primaryBlue, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 20 },
  mainTitle: { fontSize: 24, fontWeight: "bold", color: COLORS.textDark, marginBottom: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 },
  estadoBadge: { flexDirection: "row", backgroundColor: COLORS.successBg, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignItems: "center", marginBottom: 20 },
  estadoText: { color: COLORS.successText, fontWeight: "bold", marginLeft: 6, fontSize: 13 },
  label: { fontSize: 13, color: COLORS.textGray, fontWeight: "600", marginBottom: 4 },
  value: { fontSize: 16, color: COLORS.textDark, fontWeight: "bold", marginBottom: 15 },
  infoBanner: { flexDirection: "row", backgroundColor: COLORS.white, padding: 15, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.borderGray, marginBottom: 15 },
  infoText: { marginLeft: 10, color: COLORS.textGray, flex: 1, fontSize: 14, fontWeight: "500" },
  primaryBtn: { backgroundColor: COLORS.accentGold, paddingVertical: 15, borderRadius: 12, alignItems: "center", marginTop: 10 },
  primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
  secondaryBtn: { backgroundColor: "transparent", paddingVertical: 15, borderRadius: 12, alignItems: "center", marginTop: 10, borderWidth: 1, borderColor: COLORS.borderGray },
  secondaryBtnText: { color: COLORS.textDark, fontSize: 15, fontWeight: "600" },
});