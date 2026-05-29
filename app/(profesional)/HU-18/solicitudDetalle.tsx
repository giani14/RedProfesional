import { AttachmentItem } from "@/components/solicitud/AttachmentItem";
import { ConfirmacionModal } from "@/components/solicitud/ConfirmacionModal";
import { InfoSection } from "@/components/solicitud/InfoSection";
import { ProfileCard } from "@/components/solicitud/ProfileCard";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  background: "#F3F4F6",
  textDark: "#1F2937",
  textGray: "#6B7280",
  danger: "#DC2626",
  successBg: "#D1FAE5",
  successText: "#047857",
  dangerBg: "#FEE2E2",
};

interface Solicitud {
  id: string;
  cliente_id: string;
  profesional_id: string;
  estado: string;
  descripcion_problema: string;
  fecha_solicitud: string;
  actualizado_at: string;
  proyecto: string;
  presupuesto: string;
  fecha_estimada: string;
  descripcion_de_rechazo: string | null;
  fecha_aceptada_rechazada: string | null;
  perfiles: {
    ubicacion: string;
    nombre_completo: string;
  };
}

const SOLICITUD_MOCK = {
  cliente: {
    nombre: "María Fernández",
    rol: "Cliente",
  },
  servicio: "Desarrollo de página web",
  descripcion:
    "Necesito una página web para mi negocio con secciones de inicio, servicios, sobre nosotros y contacto. El estilo debe ser moderno y responsivo.",
  presupuesto: "S/. 2,500 - 3,000",
  fecha: "10 de mayo de 2026 a las 10:30",
  archivos: [{ nombre: "requisitos_proyecto.pdf" }],
};

const formatearFecha = (fechaStr: string, locale: string = "es-ES"): string => {
  const fecha = new Date(`${fechaStr}T00:00:00`);
  if (isNaN(fecha.getTime())) {
    return "Fecha no válida";
  }
  const opciones: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return new Intl.DateTimeFormat(locale, opciones).format(fecha);
};

export default function SolicitudDetalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [estado, setEstado] = useState<string>("pendiente");
  const [modalAceptar, setModalAceptar] = useState(false);
  const [modalRechazar, setModalRechazar] = useState(false);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [items, setItems] = useState<Solicitud | null>(null);
  const [fechaAceptacionRechazo, setFechaAceptacionRechazo] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (id) fetchData();
  }, [id, estado]);

  async function fetchData() {
    try {
      setIsLoading(true);
      // Corregimos la desestructuración de la promesa
      const { data, error } = await supabase
        .from("solicitudes_servicio")
        .select("*, perfiles:cliente_id (nombre_completo, ubicacion)") // Usamos el alias cliente_id
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setItems(data);
        setEstado(data.estado);
      }
    } catch (error: any) {
      console.error("Error obteniendo datos:", error.message);
    } finally {
      setIsLoading(false);
    }
  }
  // Corregimos la función de fecha para que no rompa con datos reales de la DB
  const formatearFechaReal = (fechaStr: string): string => {
    if (!fechaStr) return "Sin fecha";
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return "Fecha pendiente";

    return fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  const confirmarAceptar = async () => {
    try {
      const { error } = await supabase
        .from("solicitudes_servicio")
        .update({
          estado: "en_proceso", // El profesional acepta e inicia el trabajo
          fecha_aceptada_rechazada: new Date().toISOString(),
        })
        .eq("id", id);
      setEstado("en_proceso");
      if (error) throw error;
    } catch (error: any) {
      console.error("Error actualizando estado:", error.message);
    } finally {
      setModalAceptar(false);
    }
  };

  const confirmarRechazar = async () => {
    try {
      const { error } = await supabase
        .from("solicitudes_servicio")
        .update({
          estado: "rechazada",
          descripcion_de_rechazo: motivoRechazo,
          fecha_aceptada_rechazada: new Date().toISOString(),
        })
        .eq("id", id);
      setEstado("rechazada");
      if (error) throw error;
    } catch (error: any) {
      console.error("Error actualizando estado:", error.message);
    } finally {
      setModalRechazar(false);
      setMotivoRechazo("");
    }
  };

  const confirmarFinalizar = async () => {
    try {
      const { error } = await supabase
        .from("solicitudes_servicio")
        .update({
          estado: "finalizado", // Termina el trabajo
          actualizado_at: new Date().toISOString(),
        })
        .eq("id", id);
      setEstado("finalizado");
      if (error) throw error;
    } catch (error: any) {
      console.error("Error al finalizar servicio:", error.message);
    } finally {
      setModalFinalizar(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
          <Text style={styles.loadingText}>Cargando detalle...</Text>
        </View>
      </SafeAreaView>
    );
  }
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
        <TouchableOpacity>
          <Ionicons
            name="notifications-outline"
            size={26}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Detalle de solicitud</Text>

        <ProfileCard
          nombre={items?.perfiles?.nombre_completo || "Cargando..."}
          rol={items?.perfiles?.ubicacion || "Cargando..."}
<<<<<<< HEAD:app/(profesional)/HU-18/solicitudDetalle.tsx
          estado={items?.estado || "pendiente"}
=======
          estado={(items?.estado as any) || "pendiente"}
>>>>>>> origin/hu-21:app/HU-18/solicitudDetalle.tsx
        />

        <InfoSection
          label="Servicio solicitado"
          value={items?.proyecto || "Cargando..."}
        />
        <InfoSection
          label="Descripción"
          value={items?.descripcion_problema || "Cargando..."}
        />
        <InfoSection
          label="Presupuesto estimado"
          value={items?.presupuesto + " $" || "Cargando..."}
        />
        <InfoSection
          label="Fecha estimada"
          value={formatearFecha(items?.fecha_estimada || "")}
        />

        <InfoSection label="Archivos adjuntos">
          {SOLICITUD_MOCK.archivos.map((a) => (
            <AttachmentItem key={a.nombre} nombre={a.nombre} />
          ))}
        </InfoSection>

        {estado === "pendiente" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btnAceptar}
              onPress={() => setModalAceptar(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark" size={20} color={COLORS.white} />
              <Text style={styles.btnAceptarText}>Aceptar solicitud</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnRechazar}
              onPress={() => setModalRechazar(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={20} color={COLORS.danger} />
              <Text style={styles.btnRechazarText}>Rechazar solicitud</Text>
            </TouchableOpacity>
          </View>
        )}

        {(estado === "aceptada" || estado === "en_proceso") && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btnFinalizar}
              onPress={() => setModalFinalizar(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-done" size={20} color={COLORS.white} />
              <Text style={styles.btnAceptarText}>Finalizar servicio</Text>
            </TouchableOpacity>
          </View>
        )}

        {estado === "aceptada" && (
          <View style={[styles.banner, { backgroundColor: COLORS.successBg }]}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={COLORS.successText}
            />
            <Text style={[styles.bannerText, { color: COLORS.successText }]}>
              Solicitud aceptada el{" "}
              {formatearFecha(items?.fecha_aceptada_rechazada || "")}
            </Text>
          </View>
        )}

        {estado === "en_proceso" && (
          <View style={[styles.banner, { backgroundColor: "#DBEAFE" }]}>
            <Ionicons name="time" size={20} color="#1E40AF" />
            <Text style={[styles.bannerText, { color: "#1E40AF" }]}>
              Servicio en proceso. El cliente espera tu trabajo.
            </Text>
          </View>
        )}

        {estado === "finalizado" && (
          <View style={[styles.banner, { backgroundColor: COLORS.successBg }]}>
            <Ionicons name="checkmark-done-circle" size={20} color={COLORS.successText} />
            <Text style={[styles.bannerText, { color: COLORS.successText }]}>
              Servicio finalizado el{" "}
              {formatearFecha(items?.actualizado_at || new Date().toISOString())}
            </Text>
          </View>
        )}

        {estado === "rechazada" && (
          <View style={[styles.banner, { backgroundColor: COLORS.dangerBg }]}>
            <Ionicons name="close-circle" size={20} color={COLORS.danger} />
            <Text style={[styles.bannerText, { color: COLORS.danger }]}>
              Solicitud rechazada el{" "}
              {formatearFecha(items?.fecha_aceptada_rechazada || "")}
            </Text>
          </View>
        )}
      </ScrollView>

      <ConfirmacionModal
        visible={modalAceptar}
        titulo="¿Aceptar solicitud?"
        descripcion="Al aceptar esta solicitud, el cliente será notificado y podrás coordinar el siguiente paso del servicio."
        onConfirm={confirmarAceptar}
        onCancel={() => setModalAceptar(false)}
      />

      <ConfirmacionModal
        visible={modalRechazar}
        titulo="¿Rechazar solicitud?"
        descripcion="Al rechazar esta solicitud, el cliente será notificado. Esta acción no se puede deshacer."
        iconName="close"
        iconColor={COLORS.danger}
        iconBg={COLORS.dangerBg}
        confirmColor={COLORS.danger}
        confirmLabel="Rechazar"
        onConfirm={confirmarRechazar}
        onCancel={() => {
          setModalRechazar(false);
          setMotivoRechazo("");
        }}
        withInput
        inputValue={motivoRechazo}
        onChangeInputValue={setMotivoRechazo}
        inputPlaceholder="Describe la razón del rechazo"
        inputMaxLength={50}
      />

      <ConfirmacionModal
        visible={modalFinalizar}
        titulo="¿Finalizar servicio?"
        descripcion="Al confirmar, la solicitud pasará a estado finalizado y el cliente podrá calificar tu trabajo."
        onConfirm={confirmarFinalizar}
        onCancel={() => setModalFinalizar(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: "600",
  },
  header: {
    backgroundColor: COLORS.primaryBlue,
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headerLogo: { color: COLORS.white, fontSize: 20, fontWeight: "bold" },
  scrollContent: { padding: 16, paddingBottom: 32 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 14,
  },
  actions: { marginTop: 10, gap: 10 },
  btnAceptar: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  btnAceptarText: { color: COLORS.white, fontSize: 15, fontWeight: "bold" },
  btnFinalizar: {
    backgroundColor: "#10B981", // Verde para finalizar
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  btnRechazar: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
  },
  btnRechazarText: { color: COLORS.danger, fontSize: 15, fontWeight: "bold" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  bannerText: { fontSize: 13, fontWeight: "600", flex: 1 },
});
