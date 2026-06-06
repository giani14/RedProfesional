import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
  background: "#F8FAFC",
  textDark: "#1E293B",
  textGray: "#64748B",
  borderLight: "#E2E8F0",
  successGreen: "#10B981",
  dangerRed: "#EF4444",
};

const estadoStyles: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  pendiente: { bg: "#FEF3C7", color: "#D97706", label: "Pendiente" },
  revisando: { bg: "#E0F2FE", color: "#0369A1", label: "Revisando" },
  en_proceso: { bg: "#DBEAFE", color: "#1E40AF", label: "En Proceso" },
  aceptada: { bg: "#DBEAFE", color: "#1E40AF", label: "En Proceso" }, // Mapeo de compatibilidad
  rechazada: { bg: "#FEE2E2", color: "#B91C1C", label: "Rechazada" },
  finalizado: { bg: "#D1FAE5", color: "#065F46", label: "Finalizado" },
};
export default function DetallesProyecto() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [proyecto, setProyecto] = useState<any>(null);

  useEffect(() => {
    if (id) fetchDetallesProyecto();
  }, [id]);

  const fetchDetallesProyecto = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("solicitudes_servicio")
        .select(
          `
          id,
          proyecto,
          estado,
          fecha_solicitud,
          descripcion,
          presupuesto,
          perfiles:cliente_id (
            nombre_completo, 
            avatar_url
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      setProyecto(data);
    } catch (error: any) {
      console.error("Error obteniendo detalles de Supabase:", error.message);
      Alert.alert("Error", "No se pudieron cargar los detalles del proyecto.");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (
    nuevoEstado: "en_proceso" | "rechazada" | "finalizado",
  ) => {
    try {
      setActionLoading(true);

      const { error } = await supabase
        .from("solicitudes_servicio")
        .update({ estado: nuevoEstado }) // Guardará "en_proceso" o "finalizado" directamente
        .eq("id", id);

      if (error) throw error;

      let mensajeExito = "";
      if (nuevoEstado === "en_proceso") {
        mensajeExito =
          "¡Has aceptado el trabajo! El proyecto ahora está en proceso.";
      } else if (nuevoEstado === "finalizado") {
        mensajeExito =
          "¡Excelente trabajo! El proyecto ha sido marcado como finalizado.";
      } else if (nuevoEstado === "rechazada") {
        mensajeExito = "Has rechazado la solicitud.";
      }

      Alert.alert("¡Éxito!", mensajeExito, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", "No se pudo actualizar el estado: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const irAlChat = () => {
    router.push("/(profesional)/mensajes");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  const estadoNormalizado = proyecto?.estado?.toLowerCase() || "pendiente";
  const badge = estadoStyles[estadoNormalizado] || estadoStyles["pendiente"];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Detalles del Proyecto",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.primaryBlue },
          headerTintColor: COLORS.white,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tarjeta Principal de Información */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.projectTitle}>
              {proyecto?.proyecto || "Sin título"}
            </Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>
                {badge.label}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Fila del Cliente con Botón de Mensaje Elegante */}
          <View style={styles.clientRowContainer}>
            <View style={styles.infoRowLeft}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.primaryBlue}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Cliente</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {proyecto?.perfiles?.nombre_completo || "Cliente Requiriente"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.inlineChatButton}
              activeOpacity={0.7}
              onPress={irAlChat}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={20}
                color={COLORS.primaryBlue}
              />
              <Text style={styles.inlineChatText}>Enviar Mensaje</Text>
            </TouchableOpacity>
          </View>

          {/* Fila del Presupuesto */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="cash-outline"
                size={20}
                color={COLORS.primaryBlue}
              />
            </View>
            <View>
              <Text style={styles.infoLabel}>Presupuesto Estimado</Text>
              <Text style={styles.infoValue}>
                {proyecto?.presupuesto
                  ? `${proyecto.presupuesto} Bs.`
                  : "A convenir"}
              </Text>
            </View>
          </View>

          {/* Fila de la Fecha */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.primaryBlue}
              />
            </View>
            <View>
              <Text style={styles.infoLabel}>Solicitado el</Text>
              <Text style={styles.infoValue}>
                {proyecto?.fecha_solicitud
                  ? new Date(proyecto.fecha_solicitud).toLocaleDateString(
                      "es-ES",
                    )
                  : "Sin fecha"}
              </Text>
            </View>
          </View>
        </View>

        {/* Bloque de la Descripción */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descripción del Trabajo</Text>
          <Text style={styles.descriptionText}>
            {proyecto?.descripcion ||
              "El cliente no ha proporcionado una descripción detallada para este proyecto."}
          </Text>
        </View>
      </ScrollView>

      {/* FOOTER DE ACCIONES DINÁMICAS */}
      <View style={styles.footer}>
        {actionLoading ? (
          <ActivityIndicator size="small" color={COLORS.primaryBlue} />
        ) : estadoNormalizado === "pendiente" ||
          estadoNormalizado === "revisando" ? (
          // Si está pendiente o revisando: Rechazar o Aceptar
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnReject]}
              onPress={() => handleCambiarEstado("rechazada")}
            >
              <Text style={styles.btnRejectText}>Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnAccept]}
              onPress={() => handleCambiarEstado("en_proceso")}
            >
              <Text style={styles.btnAcceptText}>Aceptar Trabajo</Text>
            </TouchableOpacity>
          </View>
        ) : estadoNormalizado === "en_proceso" ||
          estadoNormalizado === "aceptada" ? (
          // CAMBIO AQUÍ: Ahora si está "en_proceso" o "aceptada", se muestran los botones correctos
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondaryBack]}
              onPress={() => router.back()}
            >
              <Text style={styles.btnSecondaryBackText}>Volver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnComplete]}
              onPress={() => {
                Alert.alert(
                  "Confirmar Finalización",
                  "¿Estás seguro de que has concluido por completo este servicio?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Sí, Finalizar",
                      onPress: () => handleCambiarEstado("finalizado"),
                    },
                  ],
                );
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={COLORS.white}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.btnCompleteText}>Finalizar Proyecto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Si ya está finalizado o rechazado: Botón simple para regresar
          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => router.back()}
          >
            <Text style={styles.btnBackText}>Volver a Proyectos</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 120 },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
    flex: 1,
    marginRight: 10,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 5,
    marginBottom: 15,
  },
  clientRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 12,
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  inlineChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  inlineChatText: {
    color: COLORS.primaryBlue,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoLabel: { fontSize: 12, color: COLORS.textGray, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "600", color: COLORS.textDark },
  descriptionSection: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  descriptionText: { fontSize: 14, color: "#475569", lineHeight: 22 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionButtonsRow: { flexDirection: "row", gap: 12 },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnReject: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  btnRejectText: { color: COLORS.dangerRed, fontWeight: "bold", fontSize: 15 },
  btnAccept: { backgroundColor: COLORS.primaryBlue },
  btnAcceptText: { color: COLORS.white, fontWeight: "bold", fontSize: 15 },

  // NUEVOS ESTILOS PARA LA CONFIGURACIÓN: VOLVER + FINALIZAR
  btnSecondaryBack: {
    flex: 0.35,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  btnSecondaryBackText: {
    color: COLORS.textDark,
    fontWeight: "bold",
    fontSize: 15,
  },
  btnComplete: {
    flex: 0.65,
    backgroundColor: COLORS.successGreen,
  },
  btnCompleteText: { color: COLORS.white, fontWeight: "bold", fontSize: 15 },

  btnBack: {
    backgroundColor: "#F1F5F9",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  btnBackText: { color: COLORS.textDark, fontWeight: "bold", fontSize: 15 },
});
