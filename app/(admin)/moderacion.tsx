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

// Interfaz adaptada para soportar los datos de reportes
interface ProfesionalModeracion {
  id: string; // id del usuario o del reporte
  profesional_id?: string; // ID real del profesional si viene de un reporte
  titulo_especialidad: string;
  biografia: string;
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
  // ---- NUEVOS CAMPOS PARA LA PESTAÑA REPORTADOS ----
  reporte_id?: string;
  motivo_reporte?: string;
  descripcion_reporte?: string;
  fecha_reporte?: string;
}

export default function ModeracionScreen() {
  const [filtro, setFiltro] = useState<
    "Pendiente" | "Rechazado" | "Verificado"
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

  // Obtener los contadores dinámicos incluyendo la cantidad de reportes reales
  async function fetchContadores() {
    try {
      const { count: pend } = await supabase
        .from("profesionales_info")
        .select("*", { count: "exact", head: true })
        .in("estado_verificacion", ["Pendiente", "No verificado"]);

      // CONTADOR REAL: Cuenta cuántos registros activos hay en la tabla de reportes con estado pendiente
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
    } catch (err) {
      console.error("Error cargando contadores:", err);
    }
  }

  // Traer la data dependiendo de la sección activa
  async function fetchModeracionData() {
    try {
      setLoading(true);

      if (filtro === "Rechazado") {
        // 1. Traemos los reportes pendientes de la base de datos
        const { data: reportesData, error: reportesError } = await supabase
          .from("reportes")
          .select("id, motivo, descripcion, created_at, denunciado_id")
          .eq("estado", "pendiente");

        if (reportesError) throw reportesError;

        if (!reportesData || reportesData.length === 0) {
          setItems([]);
          return;
        }

        // 2. Extraemos los IDs de los denunciados
        const denunciadosIds = reportesData.map((rep) => rep.denunciado_id);

        // 3. Traemos los perfiles mapeados
        const { data: perfilesData, error: perfilesError } = await supabase
          .from("perfiles")
          .select("id, nombre_completo, telefono, ciudad")
          .in("id", denunciadosIds);

        if (perfilesError) throw perfilesError;

        // 4. Traemos la info profesional buscando por la columna 'profesional_id' (CORREGIDO DE RAÍZ)
        const { data: profesionalesData, error: profesionalesError } =
          await supabase
            .from("profesionales_info")
            .select(
              "id, profesional_id, titulo_especialidad, biografia, url_certificado, estado_verificacion",
            )
            .in("profesional_id", denunciadosIds);

        if (profesionalesError) throw profesionalesError;

        console.log("DEBUG REPORTES:", reportesData);
        console.log("DEBUG PERFILES:", perfilesData);
        console.log("DEBUG PROFESIONALES:", profesionalesData);

        // 5. Armamos el objeto final asegurando que no se rompa si faltan datos parciales
        const mappedReports: ProfesionalModeracion[] = reportesData.map(
          (rep) => {
            const perfil = perfilesData?.find(
              (p) => p.id === rep.denunciado_id,
            );
            // Buscamos la info profesional correspondiente por 'profesional_id'
            const prof = profesionalesData?.find(
              (p) => p.profesional_id === rep.denunciado_id,
            );

            return {
              id: rep.id, // ID del reporte para el key de la FlatList
              profesional_id: rep.denunciado_id,
              titulo_especialidad:
                prof?.titulo_especialidad || "Especialidad no definida",
              biografia: prof?.biografia || "Sin biografía",
              url_certificado: prof?.url_certificado || "",
              estado_verificacion:
                (prof?.estado_verificacion as any) || "Rechazado",
              perfiles: {
                nombre_completo: perfil?.nombre_completo || "Usuario reportado",
                telefono: perfil?.telefono || "S/T",
                ciudad: (perfil as any)?.ciudad || "No especificada",
              },
              reporte_id: rep.id,
              motivo_reporte: rep.motivo,
              descripcion_reporte: rep.descripcion,
              fecha_reporte: rep.created_at,
            };
          },
        );

        setItems(mappedReports);
      } else {
        // --- SECCIÓN PENDIENTES Y APROBADOS (Lógica limpia original) ---
        let query = supabase.from("profesionales_info").select(`
          id,
          titulo_especialidad,
          biografia,
          url_certificado,
          estado_verificacion,
          perfiles (
            nombre_completo,
            telefono,
            ciudad
          )
        `);

        if (filtro === "Pendiente") {
          query = query.in("estado_verificacion", [
            "Pendiente",
            "No verificado",
          ]);
        } else {
          query = query.eq("estado_verificacion", filtro);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (data) setItems(data as unknown as ProfesionalModeracion[]);
      }
    } catch (error: any) {
      console.error("Error cargando moderación:", error.message);
      Alert.alert("Error", "No se pudo sincronizar la data.");
    } finally {
      setLoading(false);
    }
  }

  // Resolver o sancionar la cuenta desde el panel (CORREGIDO)
  async function handleCambiarEstado(
    id: string,
    nuevoEstado: "Verificado" | "Rechazado",
  ) {
    try {
      setActionLoading(true);

      if (filtro === "Rechazado" && selectedProfe?.reporte_id) {
        // Si el admin decide Sancionar desde la pestaña de Reportados:
        if (nuevoEstado === "Rechazado") {
          // Cambiamos el estado del profesional a Rechazado en profesionales_info usando su columna correcta
          const { error: profError } = await supabase
            .from("profesionales_info")
            .update({ estado_verificacion: "Rechazado" })
            .eq("profesional_id", selectedProfe.profesional_id);

          if (profError) throw profError;
        }

        // Tanto si sancionas como si descartas, el reporte se marca como resuelto para limpiarlo del feed
        const { error: repError } = await supabase
          .from("reportes")
          .update({ estado: "resuelto" })
          .eq("id", selectedProfe.reporte_id);

        if (repError) throw repError;

        Alert.alert(
          "Éxito",
          nuevoEstado === "Rechazado"
            ? "El profesional fue sancionado."
            : "El reporte fue descartado.",
        );
      } else {
        // Comportamiento normal para flujos de Aprobación/Rechazo del flujo estándar
        const { error } = await supabase
          .from("profesionales_info")
          .update({ estado_verificacion: nuevoEstado })
          .eq("id", id);

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
            filtro === "Rechazado" && styles.filterTabActive,
          ]}
          onPress={() => setFiltro("Rechazado")}
        >
          <Text
            style={[
              styles.filterTabText,
              filtro === "Rechazado" && styles.filterTabTextActive,
            ]}
          >
            Reportados{" "}
            <Text
              style={
                filtro === "Rechazado"
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

      {/* Lista */}
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
          keyExtractor={(item) => item.id}
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
                <Text style={styles.modalLabel}>Profesional Acusado:</Text>
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
                          handleCambiarEstado(selectedProfe.id, "Verificado")
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
                          handleCambiarEstado(selectedProfe.id, "Rechazado")
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

                    <Text style={styles.modalLabel}>Biografía:</Text>
                    <Text style={styles.modalBio}>
                      "{selectedProfe.biografia || "Sin biografía"}"
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
                            handleCambiarEstado(selectedProfe.id, "Rechazado")
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
                            handleCambiarEstado(selectedProfe.id, "Verificado")
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
