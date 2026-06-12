import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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
  accentGold: "#EAB308",
  textMain: "#123F78",
  textBody: "#1F2937",
  textSecondary: "#6B7280",
  bgLight: "#F9FAFB",
  white: "#FFFFFF",
  cardBorder: "#E5E7EB",
};

// Helper para obtener iniciales si no hay avatar_url
const obtenerIniciales = (nombre: string) => {
  if (!nombre) return "??";
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
};

// Helper para transformar el ISO string de vuelta a un formato legible en la UI (DD/MM/AAAA)
const formatearFechaLegible = (isoString: string) => {
  if (!isoString) return "A convenir";
  try {
    const d = new Date(isoString);
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  } catch {
    return "A convenir";
  }
};

export default function RevisarSolicitud() {
  const [isSending, setIsSending] = React.useState(false);
  const router = useRouter();

  // Recibimos los datos enviados desde el formulario anterior
  const {
    id,
    nombre,
    especialidad,
    ciudad,
    avatar,
    servicio,
    descripcion,
    presupuesto,
    fecha, // Viene como ISO string (ej: "2026-06-15T00:00:00.000Z") o vacío
  } = useLocalSearchParams();

  const handleSendRequest = async () => {
    try {
      setIsSending(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "Debes iniciar sesión para enviar una solicitud.");
        return;
      }

      // Preparar el presupuesto para evitar fallos de tipos en Postgres
      const budgetValue =
        presupuesto && (presupuesto as string).trim() !== ""
          ? parseFloat(presupuesto as string)
          : null;

      // 2. Registrar en la tabla 'solicitudes_servicio'
      const { error: insertError } = await supabase
        .from("solicitudes_servicio")
        .insert([
          {
            cliente_id: user.id,
            proyecto: servicio,
            descripcion: descripcion,
            estado: "pendiente",
            profesional_id: id,
            presupuesto: budgetValue,
            fecha_estimada: fecha ? (fecha as string) : null, // <-- ¡AHORA SÍ SE GUARDA LA FECHA EN LA BD!
          },
        ]);

      if (insertError) throw insertError;

      console.log("Solicitud registrada con éxito para el profesional:", id);
      router.push("/HU-15/solicitudEnviada");
    } catch (err) {
      console.error("Error al registrar solicitud:", err);
      Alert.alert(
        "Error",
        "No pudimos procesar el registro en la base de datos.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER AZUL OSCURO */}
      <View style={styles.blueHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>RedProfesional</Text>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.mainTitle}>Revisar solicitud</Text>

        {/* SECCIÓN PROFESIONAL CORREGIDA CON AVATAR / INICIALES */}
        <Text style={styles.sectionLabel}>Profesional</Text>
        <View style={styles.profeCard}>
          {avatar ? (
            <Image source={{ uri: avatar as string }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarIniciales}>
              <Text style={styles.textoIniciales}>
                {obtenerIniciales(nombre as string)}
              </Text>
            </View>
          )}

          <View style={styles.profeInfo}>
            <Text style={styles.profeName}>{nombre || "Profesional"}</Text>
            <Text style={styles.profeTitle}>
              {especialidad || "Especialista General"}
            </Text>
            <View style={styles.row}>
              <Ionicons name="location" size={14} color={COLORS.primaryBlue} />
              <Text style={styles.locText}>{ciudad || "Cochabamba"}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="star" size={14} color={COLORS.accentGold} />
              <Text style={styles.ratingText}>
                5.0 <Text style={styles.reviewCount}>(Nuevo)</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* RESUMEN DE LA SOLICITUD */}
        <Text style={styles.mainTitle}>Resumen de la solicitud</Text>

        <View style={styles.detailGroup}>
          <Text style={styles.detailLabel}>Servicio solicitado</Text>
          <Text style={styles.detailValue}>
            {servicio || "No especificado"}
          </Text>
        </View>

        <View style={styles.detailGroup}>
          <Text style={styles.detailLabel}>Descripción</Text>
          <Text style={styles.detailValue}>
            {descripcion || "Sin descripción adicional."}
          </Text>
        </View>

        <View style={styles.detailGroup}>
          <Text style={styles.detailLabel}>Presupuesto estimado</Text>
          <Text style={styles.detailValue}>
            {presupuesto ? `Bs. ${presupuesto}` : "No definido"}
          </Text>
        </View>

        <View style={styles.detailGroup}>
          <Text style={styles.detailLabel}>Fecha estimada</Text>
          <Text style={styles.detailValue}>
            {formatearFechaLegible(fecha as string)}
          </Text>
        </View>

        {/* BOTONES DE ACCIÓN */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.btnSend, isSending && { opacity: 0.7 }]}
            onPress={handleSendRequest}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.btnSendText}>Enviar solicitud</Text>
                <Ionicons
                  name="send"
                  size={18}
                  color="white"
                  style={styles.sendIcon}
                />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnEdit}
            onPress={() => router.back()}
          >
            <Text style={styles.btnEditText}>Editar información</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.white },
  blueHeader: { backgroundColor: COLORS.primaryBlue, paddingBottom: 15 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  mainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginTop: 25,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 12,
  },
  // Tarjeta Profesional
  profeCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: { width: 85, height: 85, borderRadius: 42.5 },
  avatarIniciales: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  textoIniciales: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold" },
  profeInfo: { marginLeft: 15, flex: 1 },
  profeName: { fontSize: 18, fontWeight: "bold", color: COLORS.textMain },
  profeTitle: { fontSize: 14, color: COLORS.textSecondary, marginVertical: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  locText: { fontSize: 13, color: COLORS.textSecondary },
  ratingText: { fontSize: 13, fontWeight: "bold", color: COLORS.textBody },
  reviewCount: { fontWeight: "normal", color: COLORS.textSecondary },
  // Detalles de Solicitud
  detailGroup: { marginBottom: 22 },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  detailValue: { fontSize: 16, color: COLORS.textBody, lineHeight: 24 },
  // Acciones
  actionContainer: { marginTop: 15, gap: 12 },
  btnSend: {
    backgroundColor: COLORS.primaryBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 14,
  },
  btnSendText: { color: "white", fontSize: 16, fontWeight: "bold" },
  sendIcon: { marginLeft: 8, transform: [{ rotate: "-45deg" }] },
  btnEdit: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  btnEditText: { color: COLORS.textMain, fontSize: 16, fontWeight: "bold" },
});
