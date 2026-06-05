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
  archivos: [{ nombre: "requisitos_proyecto.pdf" }],
};

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

export default function SolicitudDetalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<Solicitud | null>(null);
  const [isCliente, setIsCliente] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [estado, setEstado] = useState<string>("");

  const [modalAceptar, setModalAceptar] = useState(false);
  const [modalRechazar, setModalRechazar] = useState(false);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  async function fetchData() {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("solicitudes_servicio")
        .select(
          `
          *,
          perfiles:cliente_id (nombre_completo, ubicacion),
          profesional:profesional_id (nombre_completo, ubicacion)
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data && user) {
        const soyCliente = data.cliente_id === user.id;
        setIsCliente(soyCliente);

        if (!soyCliente && data.estado?.toLowerCase() === "pendiente") {
          await supabase
            .from("solicitudes_servicio")
            .update({ estado: "revisando" })
            .eq("id", id);
          data.estado = "revisando";
        }

        setItems(data);
        setEstado(data.estado);
      }
    } catch (error: any) {
      console.error("Error obteniendo datos:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const cancelarSolicitud = async () => {
    Alert.alert("Cancelar", "¿Seguro que deseas cancelar esta solicitud?", [
      { text: "No" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("solicitudes_servicio")
            .update({ estado: "cancelado" })
            .eq("id", id);
          if (!error) router.back();
        },
      },
    ]);
  };

  const confirmarAceptar = async () => {
    try {
      setIsLoading(true);
      const fechaActualISO = new Date().toISOString();

      // 1. Primero aseguramos la solicitud (Esto es lo que ya funcionaba)
      const { error: errorSolicitud } = await supabase
        .from("solicitudes_servicio")
        .update({
          estado: "aceptada",
          fecha_aceptada_rechazada: fechaActualISO,
        })
        .eq("id", id);

      if (errorSolicitud) throw errorSolicitud;

      // 2. Intentamos crear el chat en un bloque separado para que no rompa lo anterior
      try {
        const { data: chatExistente } = await supabase
          .from("chats")
          .select("id")
          .eq("solicitud_id", id)
          .maybeSingle();

        if (!chatExistente) {
          await supabase.from("chats").insert([
            {
              solicitud_id: id,
              cliente_id: items?.cliente_id,
              profesional_id: items?.profesional_id,
            },
          ]);
        }
      } catch (chatErr) {
        console.log(
          "El chat no se creó, probablemente por políticas RLS:",
          chatErr,
        );
        // No lanzamos error aquí para que la solicitud sí quede como 'aceptada'
      }

      setEstado("aceptada");
      await fetchData();
    } catch (error: any) {
      // Este catch ahora solo atrapará errores de la SOLICITUD
      Alert.alert("Error", "No se pudo actualizar la solicitud.");
    } finally {
      setModalAceptar(false);
      setIsLoading(false);
    }
  };
  const confirmarRechazar = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("solicitudes_servicio")
        .update({
          estado: "rechazada",
          descripcion_de_rechazo: motivoRechazo,
          fecha_aceptada_rechazada: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      setEstado("rechazada");
      await fetchData();
    } catch (error: any) {
      console.error("Error al rechazar:", error.message);
    } finally {
      setModalRechazar(false);
      setMotivoRechazo("");
      setIsLoading(false);
    }
  };

  const confirmarFinalizar = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("solicitudes_servicio")
        .update({
          estado: "finalizado",
          actualizado_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      setEstado("finalizado");
      await fetchData();
    } catch (error: any) {
      console.error("Error al finalizar:", error.message);
    } finally {
      setModalFinalizar(false);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
          <Text style={styles.loadingText}>Procesando cambios...</Text>
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
        <TouchableOpacity
          onPress={() => router.push("/HU-17/notificacionCliente")}
        >
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
          estado={estado || "pendiente"}
        />

        <InfoSection
          label="Servicio"
          value={items?.proyecto || "Cargando..."}
        />
        <InfoSection
          label="Descripción"
          value={items?.descripcion_problema || "Cargando..."}
        />
        <InfoSection
          label="Presupuesto"
          value={items?.presupuesto ? `${items.presupuesto} $` : "Por acordar"}
        />
        <InfoSection
          label="Fecha estimada de entrega"
          value={formatearFechaReal(items?.fecha_estimada || "")}
        />

        <InfoSection label="Archivos adjuntos">
          {SOLICITUD_MOCK.archivos.map((a) => (
            <AttachmentItem key={a.nombre} nombre={a.nombre} />
          ))}
        </InfoSection>

        {(estado === "pendiente" || estado === "revisando") && (
          <View style={styles.actions}>
            {isCliente ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.btnAceptar,
                    { backgroundColor: COLORS.accentGold },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/HU-15/solicitudServicio",
                      params: { id: items?.id, editMode: "true" },
                    })
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.btnAceptarText}>Editar solicitud</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnRechazar}
                  onPress={cancelarSolicitud}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={COLORS.danger}
                  />
                  <Text style={styles.btnRechazarText}>Cancelar solicitud</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.btnAceptar}
                  onPress={() => setModalAceptar(true)}
                >
                  <Ionicons name="checkmark" size={20} color={COLORS.white} />
                  <Text style={styles.btnAceptarText}>Aceptar solicitud</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnRechazar}
                  onPress={() => setModalRechazar(true)}
                >
                  <Ionicons name="close" size={20} color={COLORS.danger} />
                  <Text style={styles.btnRechazarText}>Rechazar solicitud</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {estado === "aceptada" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btnChat}
              onPress={async () => {
                if (!id) return;
                try {
                  setIsLoading(true);
                  let { data, error } = await supabase
                    .from("chats")
                    .select("id")
                    .eq("solicitud_id", id)
                    .maybeSingle();
                  if (!data) {
                    const { data: nChat } = await supabase
                      .from("chats")
                      .insert([
                        {
                          solicitud_id: id,
                          cliente_id: items?.cliente_id,
                          profesional_id: items?.profesional_id,
                        },
                      ])
                      .select("id")
                      .single();
                    data = nChat;
                  }
                  if (data) router.push(`/chat/${data.id}`); // Navegación limpia
                } catch (err) {
                  Alert.alert("Error", "No se pudo conectar al chat.");
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
              <Text style={styles.textBtnChat}>Ir al chat</Text>
            </TouchableOpacity>

            {!isCliente && (
              <TouchableOpacity
                style={styles.btnFinalizar}
                onPress={() => setModalFinalizar(true)}
              >
                <Ionicons
                  name="checkmark-done"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.btnAceptarText}>Finalizar servicio</Text>
              </TouchableOpacity>
            )}

            <View
              style={[styles.banner, { backgroundColor: COLORS.successBg }]}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.successText}
              />
              <Text style={[styles.bannerText, { color: COLORS.successText }]}>
                Solicitud aceptada el{" "}
                {formatearFechaReal(items?.fecha_aceptada_rechazada || "")}
              </Text>
            </View>
          </View>
        )}

        {estado === "finalizado" && (
          <View style={[styles.banner, { backgroundColor: COLORS.successBg }]}>
            <Ionicons
              name="checkmark-done-circle"
              size={20}
              color={COLORS.successText}
            />
            <Text style={[styles.bannerText, { color: COLORS.successText }]}>
              Servicio finalizado el{" "}
              {formatearFechaReal(items?.actualizado_at || "")}
            </Text>
          </View>
        )}

        {estado === "rechazada" && (
          <View style={[styles.banner, { backgroundColor: COLORS.dangerBg }]}>
            <Ionicons name="close-circle" size={20} color={COLORS.danger} />
            <Text style={[styles.bannerText, { color: COLORS.danger }]}>
              Solicitud rechazada el{" "}
              {formatearFechaReal(items?.fecha_aceptada_rechazada || "")}
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
  loadingText: { fontSize: 14, color: COLORS.textGray, fontWeight: "600" },
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
  btnChat: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  textBtnChat: { color: COLORS.white, fontSize: 15, fontWeight: "bold" },
  btnFinalizar: {
    backgroundColor: "#10B981",
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
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  bannerText: { fontSize: 13, fontWeight: "600", flex: 1 },
});
