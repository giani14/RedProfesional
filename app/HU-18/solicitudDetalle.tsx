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
  Linking,
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
  warningBg: "#FEF3C7",
  warningText: "#D97706",
};

interface Solicitud {
  id: string;
  cliente_id: string;
  profesional_id: string;
  estado: string;
  descripcion: string;
  fecha_solicitud: string;
  actualizado_at: string;
  proyecto: string;
  presupuesto: string;
  fecha_estimada: string;
  descripcion_de_rechazo: string | null;
  fecha_aceptada_rechazada: string | null;
  evidencia_url: string | null;
  perfiles: {
    ubicacion: string;
    nombre_completo: string;
  } | null;
  profesional?: {
    ubicacion: string;
    nombre_completo: string;
  } | null;
}

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
  const [modalDisputa, setModalDisputa] = useState(false);
  const [modalEntregar, setModalEntregar] = useState(false);

  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [motivoDisputa, setMotivoDisputa] = useState("");
  const [urlEvidencia, setUrlEvidencia] = useState("");

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
        id,
        cliente_id,
        profesional_id,
        estado,
        descripcion,
        proyecto,
        presupuesto,
        fecha_estimada,
        actualizado_at,
        fecha_solicitud,
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

        setItems(data as unknown as Solicitud);
        setEstado(data.estado);
      }
    } catch (error: any) {
      console.error("Error obteniendo datos en el detalle:", error.message);
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

      const { error: errorSolicitud } = await supabase
        .from("solicitudes_servicio")
        .update({
          estado: "aceptada",
          fecha_aceptada_rechazada: fechaActualISO,
        })
        .eq("id", id);

      if (errorSolicitud) throw errorSolicitud;

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
        console.log("Error al validar/crear chat:", chatErr);
      }

      setEstado("aceptada");
      await fetchData();
    } catch (error: any) {
      console.error("Error crítico al aceptar solicitud:", error.message);
      Alert.alert("Error", "No se pudo aceptar la solicitud.");
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

  const confirmarEntrega = async () => {
    if (!urlEvidencia.trim()) {
      Alert.alert(
        "Aviso",
        "Por favor ingresa un enlace válido para tu evidencia.",
      );
      return;
    }
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("solicitudes_servicio")
        .update({
          estado: "entregado",
          evidencia_url: urlEvidencia.trim(),
          actualizado_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      setEstado("entregado");
      await fetchData();
    } catch (error: any) {
      console.error("Error al procesar la entrega:", error.message);
      Alert.alert("Error", "No se pudo guardar la entrega.");
    } finally {
      setModalEntregar(false);
      setUrlEvidencia("");
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

  const confirmarDisputa = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("solicitudes_servicio")
        .update({
          estado: "disputa",
          descripcion_de_rechazo: motivoDisputa,
          actualizado_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      setEstado("disputa");
      await fetchData();
    } catch (error: any) {
      console.error("Error al iniciar disputa:", error.message);
      Alert.alert("Error", "No se pudo reportar la disputa.");
    } finally {
      setModalDisputa(false);
      setMotivoDisputa("");
      setIsLoading(false);
    }
  };

  const verEvidencia = () => {
    if (items?.evidencia_url) {
      Linking.openURL(items.evidencia_url).catch(() => {
        Alert.alert("Error", "No se pudo abrir el enlace de la entrega.");
      });
    } else {
      Alert.alert("Aviso", "No se encontró ningún enlace o archivo adjunto.");
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

  // Define de forma dinámica a qué perfil apuntar para la tarjeta principal
  const perfilMostrado = isCliente ? items?.profesional : items?.perfiles;

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
          nombre={
            perfilMostrado?.nombre_completo || "Usuario de RedProfesional"
          }
          rol={perfilMostrado?.ubicacion || "Cochabamba, Bolivia"}
          estado={estado || "pendiente"}
        />

        <InfoSection
          label="Servicio"
          value={items?.proyecto || "No especificado"}
        />
        <InfoSection
          label="Descripción"
          value={items?.descripcion || "Sin descripción adicional."}
        />
        <InfoSection
          label="Presupuesto"
          value={
            items?.presupuesto ? `Bs. ${items.presupuesto}` : "Por acordar"
          }
        />
        <InfoSection
          label="Fecha estimada de entrega"
          value={formatearFechaReal(items?.fecha_estimada || "")}
        />

        {items?.evidencia_url && (
          <InfoSection label="Entrega del Profesional">
            <TouchableOpacity
              style={styles.btnEvidencia}
              onPress={verEvidencia}
            >
              <Ionicons
                name="cloud-download-outline"
                size={20}
                color={COLORS.primaryBlue}
              />
              <Text style={styles.btnEvidenciaText}>
                Ver Trabajo / Archivo Entregado
              </Text>
            </TouchableOpacity>
          </InfoSection>
        )}

        <InfoSection label="Archivos adjuntos">
          {items?.evidencia_url ? (
            <AttachmentItem nombre="documento_adjunto.pdf" />
          ) : (
            <Text
              style={{
                color: COLORS.textGray,
                fontSize: 14,
                fontStyle: "italic",
                marginLeft: 4,
              }}
            >
              No se adjuntaron archivos a esta solicitud.
            </Text>
          )}
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
                  if (data) router.push(`/chat/${data.id}`);
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

            {!isCliente ? (
              <TouchableOpacity
                style={[
                  styles.btnFinalizar,
                  { backgroundColor: COLORS.accentGold },
                ]}
                onPress={() => setModalEntregar(true)}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.btnAceptarText}>
                  Entregar Trabajo Terminado
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[styles.banner, { backgroundColor: COLORS.successBg }]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.successText}
                />
                <Text
                  style={[styles.bannerText, { color: COLORS.successText }]}
                >
                  Aceptaste esta solicitud. El profesional está trabajando en
                  ella.
                </Text>
              </View>
            )}
          </View>
        )}

        {estado === "entregado" && (
          <View style={styles.actions}>
            {isCliente ? (
              <>
                <View
                  style={[
                    styles.banner,
                    { backgroundColor: COLORS.warningBg, marginBottom: 10 },
                  ]}
                >
                  <Ionicons
                    name="alert-circle"
                    size={22}
                    color={COLORS.warningText}
                  />
                  <Text
                    style={[styles.bannerText, { color: COLORS.warningText }]}
                  >
                    El profesional marcó este trabajo como terminado. Revisa la
                    entrega antes de autorizar el pago seguro.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.btnFinalizar}
                  onPress={() => setModalFinalizar(true)}
                >
                  <Ionicons
                    name="gift-outline"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.btnAceptarText}>
                    Aprobar Trabajo y Pagar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnRechazar}
                  onPress={() => setModalDisputa(true)}
                >
                  <Ionicons
                    name="warning-outline"
                    size={20}
                    color={COLORS.danger}
                  />
                  <Text style={styles.btnRechazarText}>
                    Iniciar Disputa / Reclamo
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View
                style={[styles.banner, { backgroundColor: COLORS.warningBg }]}
              >
                <Ionicons name="time" size={20} color={COLORS.warningText} />
                <Text
                  style={[styles.bannerText, { color: COLORS.warningText }]}
                >
                  Ya enviaste los entregables. Esperando la validación y
                  conformidad del cliente.
                </Text>
              </View>
            )}
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
              Servicio finalizado con éxito el{" "}
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
              {items?.descripcion_de_rechazo &&
                `\nMotivo: ${items.descripcion_de_rechazo}`}
            </Text>
          </View>
        )}

        {estado === "disputa" && (
          <View style={[styles.banner, { backgroundColor: COLORS.dangerBg }]}>
            <Ionicons name="shield-sharp" size={22} color={COLORS.danger} />
            <Text style={[styles.bannerText, { color: COLORS.danger }]}>
              Este contrato se encuentra bajo **Disputa**. El equipo de soporte
              revisará los motivos y las pruebas adjuntas para resolver el caso.
              {items?.descripcion_de_rechazo &&
                `\n\nQueja registrada: "${items.descripcion_de_rechazo}"`}
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
        visible={modalEntregar}
        titulo="Enviar Entregables del Servicio"
        descripcion="Inserta el link de la evidencia de tu trabajo (Google Drive, GitHub, Dropbox, etc.). El cliente deberá validarlo para completar el pago."
        iconName="cloud-upload"
        iconColor={COLORS.primaryBlue}
        iconBg="#E0F2FE"
        confirmColor={COLORS.primaryBlue}
        confirmLabel="Enviar Trabajo"
        onConfirm={confirmarEntrega}
        onCancel={() => {
          setModalEntregar(false);
          setUrlEvidencia("");
        }}
        withInput
        inputValue={urlEvidencia}
        onChangeInputValue={setUrlEvidencia}
        inputPlaceholder="https://link-de-tu-evidencia.com/..."
        inputMaxLength={250}
      />

      <ConfirmacionModal
        visible={modalFinalizar}
        titulo="¿Liberar pago y finalizar?"
        descripcion="Al confirmar, declaras estar 100% de acuerdo con el trabajo recibido. El dinero se transferirá de forma definitiva al profesional."
        onConfirm={confirmarFinalizar}
        onCancel={() => setModalFinalizar(false)}
      />

      <ConfirmacionModal
        visible={modalDisputa}
        titulo="¿Iniciar Disputa Contractual?"
        descripcion="Por favor, especifica detalladamente los fallos en la entrega o los acuerdos incumplidos. Un administrador mediará la situación."
        iconName="warning"
        iconColor={COLORS.danger}
        iconBg={COLORS.dangerBg}
        confirmColor={COLORS.danger}
        confirmLabel="Reportar Disputa"
        onConfirm={confirmarDisputa}
        onCancel={() => {
          setModalDisputa(false);
          setMotivoDisputa("");
        }}
        withInput
        inputValue={motivoDisputa}
        onChangeInputValue={setMotivoDisputa}
        inputPlaceholder="Escribe aquí los motivos detallados..."
        inputMaxLength={200}
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
  btnEvidencia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginTop: 4,
  },
  btnEvidenciaText: {
    color: COLORS.primaryBlue,
    fontSize: 14,
    fontWeight: "600",
  },
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
