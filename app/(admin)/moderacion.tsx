import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ProfesionalModeracion {
  id: string; // ID único para el key (profesional_id o reporte_id)
  profesional_id: string; // ID real del usuario profesional
  titulo_especialidad: string;
  descripcion: string; // Cambiado de 'biografia' a 'descripcion' para coincidir con tus tablas
  url_certificado: string;
  estado_verificacion:
    | "No verificado"
    | "Pendiente"
    | "Verificado"
    | "Rechazado";
  perfiles: {
    nombre_completo: string;
    telefono: string;
    ciudad: string;
  } | null;
  // ---- CAMPOS PARA LA PESTAÑA REPORTADOS ----
  reporte_id?: string;
  motivo_reporte?: string;
  descripcion_reporte?: string;
  fecha_reporte?: string;
}

export default function ModeracionScreen() {
  const [filtro, setFiltro] = useState<
    "Pendiente" | "Reportados" | "Verificado"
  >("Pendiente");
  const [items, setItems] = useState<ProfesionalModeracion[]>([]);
  const [loading, setLoading] = useState(true);

  const [totales, setTotales] = useState({
    pendientes: 0,
    reportados: 0,
    aprobados: 0,
  });

  const [selectedProfe, setSelectedProfe] =
    useState<ProfesionalModeracion | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchModeracionData();
    fetchContadores();
  }, [filtro]);

  // Obtener los contadores dinámicos desde Supabase
  async function fetchContadores() {
    const { count: pend } = await supabase
      .from("profesionales_info")
      .select("*", { count: "exact", head: true })
      .in("estado_verificacion", ["Pendiente", "No verificado"]);
    const { count: rep } = await supabase
      .from("reportes")
      .select("*", { count: "exact", head: true })
      .eq("estado", "pendiente");
    const { count: verif } = await supabase
      .from("profesionales_info")
      .select("*", { count: "exact", head: true })
      .eq("estado_verificacion", "Verificado");

    setTotales({
      pendientes: pend || 0,
      reportados: rep || 0,
      aprobados: verif || 0,
    });
  }

  // Traer la data dependiendo de la sección activa
  async function fetchModeracionData() {
    try {
      setLoading(true);

      if (filtro === "Reportados") {
        // CORRECCIÓN: Consulta directa para asegurar que carga el reporte y sus relaciones
        const { data, error } = await supabase
          .from("reportes")
          .select(
            `
            id, motivo, descripcion, created_at, denunciado_id,
            perfiles (nombre_completo, telefono, ciudad),
            profesionales_info (titulo_especialidad, descripcion, url_certificado, estado_verificacion)
          `,
          )
          .eq("estado", "pendiente");

        if (error) throw error;

        const mappedReports: ProfesionalModeracion[] = (data || []).map(
          (rep: any) => ({
            id: rep.id,
            profesional_id: rep.denunciado_id,
            titulo_especialidad:
              rep.profesionales_info?.titulo_especialidad ||
              "Especialidad no definida",
            descripcion:
              rep.profesionales_info?.descripcion || "Sin descripción",
            url_certificado: rep.profesionales_info?.url_certificado || "",
            estado_verificacion:
              rep.profesionales_info?.estado_verificacion || "Rechazado",
            perfiles: {
              nombre_completo:
                rep.perfiles?.nombre_completo || "Usuario reportado",
              telefono: rep.perfiles?.telefono || "S/T",
              ciudad: rep.perfiles?.ciudad || "No especificada",
            },
            reporte_id: rep.id,
            motivo_reporte: rep.motivo,
            descripcion_reporte: rep.descripcion,
            fecha_reporte: rep.created_at,
          }),
        );

        setItems(mappedReports);
      } else {
        // Mantenemos la lógica original para Pendientes y Aprobados
        let query = supabase.from("profesionales_info").select(`
          profesional_id, titulo_especialidad, descripcion, url_certificado, estado_verificacion,
          perfiles (nombre_completo, telefono, ciudad)
        `);

        if (filtro === "Pendiente")
          query = query.in("estado_verificacion", [
            "Pendiente",
            "No verificado",
          ]);
        else query = query.eq("estado_verificacion", filtro);

        const { data, error } = await query;
        if (error) throw error;

        setItems(
          (data || []).map((item: any) => ({
            id: item.profesional_id,
            profesional_id: item.profesional_id,
            titulo_especialidad: item.titulo_especialidad,
            descripcion: item.descripcion || "Sin descripción",
            url_certificado: item.url_certificado || "",
            estado_verificacion: item.estado_verificacion,
            perfiles: item.perfiles,
          })),
        );
      }
    } catch (error: any) {
      console.error("Error cargando reportes:", error);
      Alert.alert("Error", "No se pudo sincronizar la lista de reportados.");
    } finally {
      setLoading(false);
    }
  }

  // Resolver o sancionar la cuenta impactando directamente en las tablas correspondientes
  async function handleCambiarEstado(
    profesionalId: string,
    nuevoEstado: "Verificado" | "Rechazado",
    esDescarteReporte = false,
  ) {
    try {
      setActionLoading(true);

      if (filtro === "Reportados" && selectedProfe?.reporte_id) {
        if (!esDescarteReporte) {
          // Si el Admin decide SANCTIONAR, cambiamos el estado del profesional en profesionales_info
          const { error: profError } = await supabase
            .from("profesionales_info")
            .update({ estado_verificacion: "Rechazado" })
            .eq("profesional_id", profesionalId);

          if (profError) throw profError;
        }

        // En ambos casos (Sancionar o Descartar), el reporte se marca "resuelto" para limpiarlo del feed
        const { error: repError } = await supabase
          .from("reportes")
          .update({ estado: "resuelto" })
          .eq("id", selectedProfe.reporte_id);

        if (repError) throw repError;

        Alert.alert(
          "Éxito",
          esDescarteReporte
            ? "El reporte fue descartado."
            : "El profesional fue sancionado.",
        );
      } else {
        // Flujo estándar de Aprobación/Rechazo de cuentas nuevas usando 'profesional_id'
        const { error } = await supabase
          .from("profesionales_info")
          .update({ estado_verificacion: nuevoEstado })
          .eq("profesional_id", profesionalId);

        if (error) throw error;
        Alert.alert("Éxito", `El perfil ha sido marcado como: ${nuevoEstado}`);
      }

      setSelectedProfe(null);
      fetchModeracionData();
      fetchContadores();
    } catch (error: any) {
      Alert.alert("Error", "No se pudo actualizar el estado: " + error.message);
    } finally {
      setActionLoading(false);
    }
  }

  const handleOpenCertificate = (url: string) => {
    if (!url) {
      Alert.alert("Sin archivo", "Este usuario no cargó ningún documento.");
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "No se pudo abrir el enlace del certificado.");
    });
  };

  const renderItem = ({ item }: { item: ProfesionalModeracion }) => {
    const isReporte = !!item.reporte_id;
    const colorEstado = isReporte
      ? "#EF4444"
      : item.estado_verificacion === "Verificado"
        ? "#10B981"
        : "#F59E0B";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setSelectedProfe(item)}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isReporte ? "#EF444420" : "#123F7820" },
          ]}
        >
          <MaterialCommunityIcons
            name={isReporte ? "shield-alert-outline" : "account-clock-outline"}
            size={28}
            color={isReporte ? "#EF4444" : "#123F78"}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.rowHeader}>
            <Text
              style={[
                styles.itemTypeText,
                isReporte && { color: "#EF4444", fontWeight: "700" },
              ]}
            >
              {isReporte ? "USUARIO REPORTADO" : "Perfil profesional"}
            </Text>
            <View style={styles.statusBadge}>
              <View style={[styles.dot, { backgroundColor: colorEstado }]} />
              <Text style={styles.statusText}>
                {isReporte ? "Denuncia" : item.estado_verificacion}
              </Text>
            </View>
          </View>

          <Text style={styles.itemTitle}>
            {item.perfiles?.nombre_completo || "Usuario sin nombre"}
          </Text>
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {isReporte
              ? `Motivo: ${item.motivo_reporte}`
              : item.titulo_especialidad}
          </Text>

          <View style={styles.rowFooter}>
            <Text style={styles.footerText}>
              Ciudad:{" "}
              <Text style={styles.boldText}>
                {item.perfiles?.ciudad || "No especificada"}
              </Text>
            </Text>
            <Text style={styles.footerText}>
              Tel: {item.perfiles?.telefono || "S/T"}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.mainTitle}>Panel de Control</Text>

      {/* Barra de Filtros */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filtro === "Pendiente" && styles.filterTabActive,
          ]}
          onPress={() => setFiltro("Pendiente")}
        >
          <Text
            style={[
              styles.filterTabText,
              filtro === "Pendiente" && styles.filterTabTextActive,
            ]}
          >
            Pendientes{" "}
            <Text
              style={
                filtro === "Pendiente"
                  ? styles.badgeCount
                  : styles.badgeCountGray
              }
            >
              {totales.pendientes}
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filtro === "Reportados" && styles.filterTabActive,
          ]}
          onPress={() => setFiltro("Reportados")}
        >
          <Text
            style={[
              styles.filterTabText,
              filtro === "Reportados" && styles.filterTabTextActive,
            ]}
          >
            Reportados{" "}
            <Text
              style={
                filtro === "Reportados"
                  ? styles.badgeCount
                  : styles.badgeCountGray
              }
            >
              {totales.reportados}
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filtro === "Verificado" && styles.filterTabActive,
          ]}
          onPress={() => setFiltro("Verificado")}
        >
          <Text
            style={[
              styles.filterTabText,
              filtro === "Verificado" && styles.filterTabTextActive,
            ]}
          >
            Aprobados{" "}
            <Text
              style={
                filtro === "Verificado"
                  ? styles.badgeCount
                  : styles.badgeCountGray
              }
            >
              {totales.aprobados}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista Principal */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#123F78"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          // Combina el id del item con su posición en el arreglo para asegurar unicidad absoluta
          keyExtractor={(item, index) =>
            item.id ? `${item.id}-${index}` : `fallback-key-${index}`
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No hay registros en este estado.
            </Text>
          }
        />
      )}

      {/* MODAL DETALLES DEL ADMINISTRADOR */}
      <Modal
        visible={selectedProfe !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProfe(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedProfe?.reporte_id
                  ? "Detalles de la Denuncia"
                  : "Revisión de Certificado"}
              </Text>
              <TouchableOpacity onPress={() => setSelectedProfe(null)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {selectedProfe && (
              <ScrollView
                style={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalLabel}>Profesional Reclamado:</Text>
                <Text style={styles.modalValue}>
                  {selectedProfe.perfiles?.nombre_completo}
                </Text>

                {selectedProfe.reporte_id ? (
                  <>
                    {/* ENFOQUE DE REPORTE */}
                    <Text style={[styles.modalLabel, { color: "#EF4444" }]}>
                      Motivo del Reporte:
                    </Text>
                    <Text style={[styles.modalValue, { color: "#EF4444" }]}>
                      {selectedProfe.motivo_reporte}
                    </Text>

                    <Text style={styles.modalLabel}>
                      Descripción del Cliente:
                    </Text>
                    <Text style={styles.modalBio}>
                      "
                      {selectedProfe.descripcion_reporte ||
                        "Sin detalles adicionales"}
                      "
                    </Text>

                    <View style={{ height: 20 }} />
                    <Text style={styles.modalLabel}>
                      Datos Adicionales del Profesional:
                    </Text>
                    <Text style={styles.modalValue}>
                      Especialidad: {selectedProfe.titulo_especialidad}
                    </Text>

                    <View style={styles.modalActionsRow}>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          { backgroundColor: "#6B7280" },
                        ]}
                        onPress={() =>
                          handleCambiarEstado(
                            selectedProfe.profesional_id,
                            "Verificado",
                            true,
                          )
                        }
                        disabled={actionLoading}
                      >
                        <Text style={styles.actionBtnText}>Descartar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          { backgroundColor: "#EF4444" },
                        ]}
                        onPress={() =>
                          handleCambiarEstado(
                            selectedProfe.profesional_id,
                            "Rechazado",
                            false,
                          )
                        }
                        disabled={actionLoading}
                      >
                        <Text style={styles.actionBtnText}>Sancionar</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    {/* ENFOQUE NORMAL DE CERTIFICACIÓN */}
                    <Text style={styles.modalLabel}>Especialidad:</Text>
                    <Text style={styles.modalValue}>
                      {selectedProfe.titulo_especialidad}
                    </Text>

                    <Text style={styles.modalLabel}>
                      Descripción Profesional:
                    </Text>
                    <Text style={styles.modalBio}>
                      "{selectedProfe.descripcion || "Sin descripción"}"
                    </Text>

                    <TouchableOpacity
                      style={styles.btnViewDoc}
                      onPress={() =>
                        handleOpenCertificate(selectedProfe.url_certificado)
                      }
                    >
                      <MaterialCommunityIcons
                        name="file-search-outline"
                        size={22}
                        color="#FFF"
                      />
                      <Text style={styles.btnViewDocText}>
                        Ver Documento Certificado
                      </Text>
                    </TouchableOpacity>

                    {selectedProfe.estado_verificacion === "Pendiente" && (
                      <View style={styles.modalActionsRow}>
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            { backgroundColor: "#EF4444" },
                          ]}
                          onPress={() =>
                            handleCambiarEstado(
                              selectedProfe.profesional_id,
                              "Rechazado",
                            )
                          }
                          disabled={actionLoading}
                        >
                          <Text style={styles.actionBtnText}>Rechazar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            { backgroundColor: "#10B981" },
                          ]}
                          onPress={() =>
                            handleCambiarEstado(
                              selectedProfe.profesional_id,
                              "Verificado",
                            )
                          }
                          disabled={actionLoading}
                        >
                          <Text style={styles.actionBtnText}>
                            Aprobar Cuenta
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}

                {actionLoading && (
                  <ActivityIndicator
                    color="#123F78"
                    style={{ marginTop: 15 }}
                  />
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 16 },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 15,
  },
  filterBar: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 25,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 20,
  },
  filterTabActive: { backgroundColor: "#123F78" },
  filterText: { fontSize: 13, color: "#6B7280", fontWeight: "600" }, // Añadido por seguridad
  filterTabText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  filterTabTextActive: { color: "#FFF" },
  badgeCount: { color: "#FFF", fontWeight: "bold" },
  badgeCountGray: { color: "#9CA3AF" },
  listContent: { paddingBottom: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTypeText: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  statusBadge: { flexDirection: "row", alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  statusText: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  itemTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  itemSubtitle: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 2,
    lineHeight: 18,
  },
  rowFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  footerText: { fontSize: 11, color: "#9CA3AF" },
  boldText: { fontWeight: "700", color: "#6B7280" },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 40,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#123F78" },
  modalLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 10,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 5,
  },
  modalBio: {
    fontSize: 14,
    color: "#4B5563",
    fontStyle: "italic",
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  btnViewDoc: {
    backgroundColor: "#123F78",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginVertical: 20,
  },
  btnViewDocText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
  modalActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
