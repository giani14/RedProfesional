import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Profesional {
  id: string;
  nombre_completo: string;
  avatar_url?: string;
  especialidad: string;
  ubicacion: string;
  calificacion: number;
  resenas: number;
  descripcion: string;
  experiencia_anios: string;
}

const REPORT_REASONS = [
  "Comportamiento inadecuado o spam",
  "Lenguaje ofensivo o acoso",
  "Estafa o fraude",
  "No cumple con el servicio acordado",
  "Otros",
];

export default function BuscarClienteScreen() {
  const router = useRouter();
  const { query } = useLocalSearchParams<{ query?: string }>();

  const [busqueda, setBusqueda] = useState(query || "");
  const [activeSearchTerm, setActiveSearchTerm] = useState(query || "");
  const [chipActivo, setChipActivo] = useState<string | null>(query || null);
  const [resultados, setResultados] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA FILTROS HU-12 ---
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);
  const [tempUbicacion, setTempUbicacion] = useState<string | null>(null);
  const [tempCalificacion, setTempCalificacion] = useState<number | null>(null);
  const [filtroUbicacion, setFiltroUbicacion] = useState<string | null>(null);
  const [filtroCalificacion, setFiltroCalificacion] = useState<number | null>(
    null,
  );

  // ---- NUEVOS ESTADOS PARA MODO SELECCIÓN (ESTILO WHATSAPP) ----
  const [selectedProf, setSelectedProf] = useState<Profesional | null>(null);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  // ---- ESTADOS FORMULARIO DE REPORTE ----
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [sendingReport, setSendingReport] = useState(false);

  const categorias = [
    "Electricista",
    "Instalaciones",
    "Mantenimiento",
    "Carpintería",
  ];

  useEffect(() => {
    if (query && categorias.includes(query)) {
      setBusqueda(query);
      setChipActivo(query);
    }
  }, [query]);

  const fetchResultados = useCallback(
    async (searchTerm: string, loc: string | null, cal: number | null) => {
      setLoading(true);
      try {
        const cleanTerm = searchTerm.trim().replace(/\s+/g, " ");
        setActiveSearchTerm(cleanTerm);
        const lowerTerm = cleanTerm.toLowerCase();

        // 1. CORREGIDO: Campos cambiados a 'promedio' y 'total_reviews' según la vista de la BD
        const { data, error } = await supabase.from("profesionales_info")
          .select(`
            profesional_id,
            titulo_especialidad,
            descripcion,
            experiencia,
            estado_verificacion,
            perfiles!profesionales_info_profesional_id_fkey (
              nombre_completo,
              avatar_url,
              ciudad,
              ubicacion,
              estado
            ),
            profesional_categorias (
              categorias (
                nombre
              )
            ),
            profesionales_rating (
              promedio,
              total_reviews
            )
          `);

        if (error) throw error;

        let mappedData: Profesional[] = (data || [])
          .filter((item: any) => item.perfiles?.estado === "activo")
          .map((item: any) => {
            const perfil = item.perfiles || {};
            const ratingInfo = item.profesionales_rating?.[0] || {};

            // Mapeamos las categorías relacionales de la BD
            const listaCategorias =
              item.profesional_categorias
                ?.map((pc: any) => pc.categorias?.nombre)
                .filter(Boolean) || [];

            // 2. SOLUCIÓN INTEGRADA: Prioriza las categorías organizadas, pero si está vacío,
            // usa el 'titulo_especialidad' de texto plano como fallback inteligente
            const especialidadesUnidas =
              listaCategorias.length > 0
                ? listaCategorias.join(", ")
                : item.titulo_especialidad || "Especialista General";

            const expAnios = item.experiencia
              ? String(item.experiencia).replace(/[^0-9]/g, "")
              : "0";

            return {
              id: item.profesional_id,
              nombre_completo:
                perfil.nombre_completo || "Profesional de Confianza",
              avatar_url: perfil.avatar_url,
              especialidad: especialidadesUnidas,
              ubicacion: perfil.ciudad || perfil.ubicacion || "Cochabamba",
              // Ajustados también aquí los accesos a las propiedades
              calificacion: ratingInfo.promedio ?? 5.0,
              resenas: ratingInfo.total_reviews ?? 0,
              descripcion:
                item.descripcion ||
                "Profesional verificado en la plataforma, disponible para nuevos proyectos.",
              experiencia_anios: expAnios,
            };
          });

        // --- SISTEMA DE FILTRADO DINÁMICO ---
        if (cleanTerm !== "") {
          mappedData = mappedData.filter((p) => {
            const matchName = p.nombre_completo
              .toLowerCase()
              .includes(lowerTerm);
            const matchSpec = p.especialidad.toLowerCase().includes(lowerTerm);
            return matchName || matchSpec;
          });
        }

        if (loc) {
          mappedData = mappedData.filter((p) =>
            p.ubicacion.toLowerCase().includes(loc.toLowerCase()),
          );
        }

        if (cal) {
          mappedData = mappedData.filter((p) => p.calificacion >= cal);
        }

        // --- ORDENAMIENTO POR RELEVANCIA Y CALIFICACIÓN ---
        mappedData.sort((a, b) => {
          if (b.calificacion !== a.calificacion)
            return b.calificacion - a.calificacion;
          if (b.resenas !== a.resenas) return b.resenas - a.resenas;
          return (b.avatar_url ? 1 : 0) - (a.avatar_url ? 1 : 0);
        });

        setResultados(mappedData);
      } catch (error) {
        console.error("Error buscando resultados reales:", error);
      } finally {
        // 3. CORREGIDO: Se cambió 'file' por 'finally'
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResultados(busqueda, filtroUbicacion, filtroCalificacion);
    }, 350);
    return () => clearTimeout(timer as any);
  }, [busqueda, fetchResultados, filtroUbicacion, filtroCalificacion]);

  const handleProfPress = (prof: Profesional) => {
    if (selectedProf) {
      if (selectedProf.id === prof.id) {
        setSelectedProf(null);
      } else {
        setSelectedProf(prof);
      }
      setShowMenuDropdown(false);
    } else {
      router.push({
        pathname: "/HU-13/verPerfilProfe",
        params: { id: prof.id },
      } as unknown as Href);
    }
  };

  const handleProfLongPress = (prof: Profesional) => {
    setSelectedProf(prof);
    setShowMenuDropdown(false);
  };

  const cancelSelection = () => {
    setSelectedProf(null);
    setShowMenuDropdown(false);
  };

  const handleSendReport = async () => {
    if (!selectedReason) {
      Alert.alert("Error", "Por favor, selecciona un motivo para el reporte.");
      return;
    }
    if (selectedReason === "Otros" && !reportDescription.trim()) {
      Alert.alert("Error", "Por favor, detalla el motivo en la descripción.");
      return;
    }

    setSendingReport(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: chatData } = await supabase
        .from("chats")
        .select("id")
        .eq("cliente_id", user?.id)
        .eq("profesional_id", selectedProf?.id)
        .maybeSingle();

      const { error } = await supabase.from("reportes").insert([
        {
          chat_id: chatData?.id || null,
          denunciante_id: user?.id,
          denunciado_id: selectedProf?.id,
          motivo: selectedReason,
          descripcion: reportDescription.trim(),
        },
      ]);

      if (error) throw error;

      Alert.alert(
        "Reporte Enviado",
        `Tu reporte sobre ${selectedProf?.nombre_completo} ha sido registrado.`,
      );
      setReportModalVisible(false);
      cancelSelection();
    } catch (error) {
      console.error("Error al reportar profesional:", error);
      Alert.alert(
        "Error",
        "No se pudo procesar el reporte. Inténtalo de nuevo.",
      );
    } finally {
      setSendingReport(false);
    }
  };

  const getSiglas = (name: string) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1A3B63"
        translucent={true}
      />
      <View style={styles.safeAreaSpacing} />

      {/* --- HEADER DINÁMICO (ESTILO WHATSAPP) --- */}
      {selectedProf ? (
        <View style={styles.actionBar}>
          <View style={styles.actionBarLeft}>
            <TouchableOpacity onPress={cancelSelection} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.actionBarCount}>1</Text>
          </View>

          <View style={styles.actionBarRight}>
            <TouchableOpacity
              onPress={() => setShowMenuDropdown(!showMenuDropdown)}
              style={styles.iconBtn}
            >
              <Ionicons name="ellipsis-vertical" size={22} color="white" />
            </TouchableOpacity>

            {showMenuDropdown && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowMenuDropdown(false);
                    setSelectedReason("");
                    setReportDescription("");
                    setReportModalVisible(true);
                  }}
                >
                  <Text style={styles.dropdownText}>Reportar profesional</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Buscar profesionales</Text>
          </View>

          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="#¿Qué servicio necesitas?"
                placeholderTextColor="#9CA3AF"
                value={busqueda}
                onChangeText={(text) => {
                  setBusqueda(text);
                  if (categorias.includes(text)) setChipActivo(text);
                  else setChipActivo(null);
                }}
              />
              {busqueda !== "" && (
                <TouchableOpacity
                  onPress={() => {
                    setBusqueda("");
                    setChipActivo(null);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() =>
                fetchResultados(busqueda, filtroUbicacion, filtroCalificacion)
              }
            >
              <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setModalFiltrosVisible(true)}
            >
              <Ionicons name="options" size={24} color="#1A3B63" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* --- CHIPS DE FILTROS ACTIVOS HU-12 --- */}
      {!selectedProf && (filtroUbicacion || filtroCalificacion) && (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.activeFiltersContainer}
          >
            {filtroUbicacion && (
              <TouchableOpacity
                style={styles.activeFilterChip}
                onPress={() => {
                  setFiltroUbicacion(null);
                  setTempUbicacion(null);
                }}
              >
                <Text style={styles.activeFilterChipText}>
                  📍 {filtroUbicacion}
                </Text>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color="white"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            )}
            {filtroCalificacion && (
              <TouchableOpacity
                style={styles.activeFilterChip}
                onPress={() => {
                  setFiltroCalificacion(null);
                  setTempCalificacion(null);
                }}
              >
                <Text style={styles.activeFilterChipText}>
                  ⭐{" "}
                  {filtroCalificacion === 5 ? "5.0" : `${filtroCalificacion}+`}
                </Text>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color="white"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.clearFiltersTextBtn}
              onPress={() => {
                setFiltroUbicacion(null);
                setFiltroCalificacion(null);
                setTempUbicacion(null);
                setTempCalificacion(null);
              }}
            >
              <Text style={styles.clearFiltersText}>Quitar filtros</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* --- CHIPS DE CATEGORÍA --- */}
      {!selectedProf && (
        <View
          style={{ marginTop: filtroUbicacion || filtroCalificacion ? 5 : 15 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsContainer}
          >
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, chipActivo === cat && styles.chipActive]}
                onPress={() => {
                  const isActivating = chipActivo !== cat;
                  setChipActivo(isActivating ? cat : null);
                  setBusqueda(isActivating ? cat : "");
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    chipActivo === cat && styles.chipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* --- LISTA DE RESULTADOS --- */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1A3B63"
            style={{ marginTop: 40 }}
          />
        ) : resultados.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No hay resultados</Text>
            <Text style={styles.emptyStateSubText}>
              Intenta ajustar tus filtros o buscar de otra forma.
            </Text>
            <View style={styles.emptyStateButtons}>
              <TouchableOpacity
                style={styles.emptyOutlineBtn}
                onPress={() => {
                  setFiltroUbicacion(null);
                  setFiltroCalificacion(null);
                  setTempUbicacion(null);
                  setTempCalificacion(null);
                }}
              >
                <Text style={styles.emptyOutlineBtnText}>Limpiar filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emptyPrimaryBtn}
                onPress={() => {
                  setBusqueda("");
                  setChipActivo(null);
                }}
              >
                <Text style={styles.emptyPrimaryBtnText}>
                  Volver a búsqueda
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          resultados.map((prof, index) => {
            const isSelected = selectedProf?.id === prof.id;
            const hasActiveSearchOrFilter =
              activeSearchTerm !== "" ||
              filtroUbicacion !== null ||
              filtroCalificacion !== null;
            const isMejorOpcion = index === 0 && hasActiveSearchOrFilter;

            return (
              <TouchableOpacity
                key={prof.id}
                activeOpacity={0.9}
                style={[
                  styles.card,
                  isMejorOpcion && styles.cardHighlight,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => handleProfPress(prof)}
                onLongPress={() => handleProfLongPress(prof)}
                delayLongPress={500}
              >
                {isMejorOpcion && !isSelected && (
                  <View style={styles.badgeContainer}>
                    <Ionicons
                      name="trophy"
                      size={14}
                      color="#92400E"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.badgeText}>Mejor opción</Text>
                  </View>
                )}

                <View style={styles.cardRow}>
                  {prof.avatar_url && !isSelected ? (
                    <Image
                      source={{ uri: prof.avatar_url }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatarPlaceholder,
                        isSelected && styles.avatarSelected,
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {isSelected ? "✓" : getSiglas(prof.nombre_completo)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.cardInfo}>
                    <Text style={styles.profName} numberOfLines={1}>
                      {prof.nombre_completo}
                    </Text>
                    <Text style={styles.profSpecialty}>
                      {prof.especialidad}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#F9B934" />
                      <Text style={styles.ratingText}>
                        {prof.calificacion === 5
                          ? "0.0"
                          : prof.calificacion.toFixed(1)}
                      </Text>
                      <Text style={styles.reviewsText}>
                        ({prof.resenas}{" "}
                        {prof.resenas === 1 ? "reseña" : "reseñas"})
                      </Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#6B7280"
                      />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {prof.ubicacion}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.descText} numberOfLines={2}>
                  {prof.descripcion}
                </Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    disabled={!!selectedProf}
                    onPress={() =>
                      router.push({
                        pathname: "/HU-13/verPerfilProfe",
                        params: { id: prof.id },
                      } as unknown as Href)
                    }
                  >
                    <Text style={styles.outlineBtnText}>Ver perfil</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    disabled={!!selectedProf}
                    onPress={() =>
                      alert(`Contactando a ${prof.nombre_completo}...`)
                    }
                  >
                    <Text style={styles.primaryBtnText}>Contactar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* --- MODAL DE FILTROS HU-12 --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalFiltrosVisible}
        onRequestClose={() => setModalFiltrosVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setModalFiltrosVisible(false)}>
                <Ionicons name="close" size={28} color="#1A3B63" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Ubicación</Text>
              <View style={styles.optionsRow}>
                {[
                  "La Paz",
                  "Cochabamba",
                  "Santa Cruz",
                  "Sucre",
                  "Tarija",
                  "Oruro",
                ].map((opcion) => (
                  <TouchableOpacity
                    key={opcion}
                    style={[
                      styles.modalChip,
                      tempUbicacion === opcion && styles.modalChipActive,
                    ]}
                    onPress={() =>
                      setTempUbicacion(tempUbicacion === opcion ? null : opcion)
                    }
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        tempUbicacion === opcion && styles.modalChipTextActive,
                      ]}
                    >
                      {opcion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Calificación mínima</Text>
              <View style={styles.optionsRow}>
                {[
                  { label: "4.0+", value: 4.0 },
                  { label: "4.5+", value: 4.5 },
                  { label: "5.0", value: 5.0 },
                ].map((opcion) => (
                  <TouchableOpacity
                    key={opcion.label}
                    style={[
                      styles.modalChip,
                      tempCalificacion === opcion.value &&
                        styles.modalChipActive,
                    ]}
                    onPress={() =>
                      setTempCalificacion(
                        tempCalificacion === opcion.value ? null : opcion.value,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        tempCalificacion === opcion.value &&
                          styles.modalChipTextActive,
                      ]}
                    >
                      ⭐ {opcion.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setFiltroUbicacion(tempUbicacion);
                setFiltroCalificacion(tempCalificacion);
                setModalFiltrosVisible(false);
              }}
            >
              <Text style={styles.applyButtonText}>Aplicar filtros</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setTempUbicacion(null);
                setTempCalificacion(null);
                setFiltroUbicacion(null);
                setFiltroCalificacion(null);
                setModalFiltrosVisible(false);
              }}
            >
              <Text style={styles.clearButtonText}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL DE FORMULARIO DE REPORTE --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Reportar a {selectedProf?.nombre_completo}
              </Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Ionicons name="close" size={28} color="#1A3B63" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: "70%" }}
            >
              <Text style={styles.filterLabel}>Selecciona el motivo:</Text>
              <View
                style={[
                  styles.optionsRow,
                  { flexDirection: "column", gap: 8, alignItems: "stretch" },
                ]}
              >
                {REPORT_REASONS.map((reason) => {
                  const isOptionSelected = selectedReason === reason;
                  return (
                    <TouchableOpacity
                      key={reason}
                      style={[
                        styles.reportOption,
                        isOptionSelected && styles.reportOptionActive,
                      ]}
                      onPress={() => setSelectedReason(reason)}
                    >
                      <Ionicons
                        name={
                          isOptionSelected
                            ? "radio-button-on"
                            : "radio-button-off"
                        }
                        size={20}
                        color={isOptionSelected ? "#1A3B63" : "#6B7280"}
                      />
                      <Text
                        style={[
                          styles.reportOptionText,
                          isOptionSelected && styles.reportOptionTextActive,
                        ]}
                      >
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.filterLabel, { marginTop: 20 }]}>
                Descripción del motivo{" "}
                {selectedReason === "Otros" && (
                  <Text style={{ color: "#EF4444" }}>*</Text>
                )}
                :
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Explica detalladamente la situación aquí..."
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={4}
                value={reportDescription}
                onChangeText={setReportDescription}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: "#EF4444" }]}
              onPress={handleSendReport}
              disabled={sendingReport}
            >
              {sendingReport ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={[styles.applyButtonText, { color: "white" }]}>
                  Enviar Reporte
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setReportModalVisible(false)}
              disabled={sendingReport}
            >
              <Text style={styles.clearButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos faltantes para asegurar la compilación limpia
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  safeAreaSpacing: {
    height: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#1A3B63",
  },
  header: {
    height: 70,
    backgroundColor: "#1A3B63",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  actionBar: {
    height: 70,
    backgroundColor: "#1A3B63",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  actionBarLeft: { flexDirection: "row", alignItems: "center" },
  actionBarCount: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 20,
  },
  actionBarRight: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  iconBtn: { padding: 8 },
  dropdownMenu: {
    position: "absolute",
    top: 45,
    right: 5,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    width: 180,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 100,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { color: "#1F2937", fontSize: 15 },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 5,
  },
  searchInput: { flex: 1, color: "#1F2937", marginLeft: 8, fontSize: 16 },
  searchBtn: {
    backgroundColor: "#1A3B63",
    borderRadius: 12,
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  filterBtn: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  activeFilterChip: {
    flexDirection: "row",
    backgroundColor: "#1A3B63",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    marginRight: 8,
  },
  activeFilterChipText: { color: "white", fontSize: 13, fontWeight: "600" },
  clearFiltersTextBtn: { justifyContent: "center", paddingLeft: 4 },
  clearFiltersText: { color: "#1A3B63", fontSize: 13, fontWeight: "bold" },
  chipsContainer: { flexDirection: "row", paddingHorizontal: 20 },
  chip: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: "#1A3B63", borderColor: "#1A3B63" },
  chipText: { color: "#4B5563", fontSize: 14, fontWeight: "500" },
  chipTextActive: { color: "white" },
  body: { flex: 1, marginTop: 15 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHighlight: { borderColor: "#F59E0B", borderWidth: 1.5 },
  cardSelected: { backgroundColor: "#E0E7FF", borderColor: "#4F46E5" },
  badgeContainer: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
    alignItems: "center",
  },
  badgeText: { color: "#92400E", fontSize: 12, fontWeight: "bold" },
  cardRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSelected: { backgroundColor: "#4F46E5" },
  avatarText: { fontSize: 18, fontWeight: "bold", color: "#4B5563" },
  cardInfo: { flex: 1, marginLeft: 12 },
  profName: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  profSpecialty: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 4,
  },
  reviewsText: { fontSize: 12, color: "#6B7280", marginLeft: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  locationText: { fontSize: 13, color: "#6B7280", marginLeft: 4 },
  descText: { fontSize: 14, color: "#4B5563", marginTop: 12, lineHeight: 20 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
    gap: 8,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#1A3B63",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  outlineBtnText: { color: "#1A3B63", fontSize: 14, fontWeight: "600" },
  primaryBtn: {
    backgroundColor: "#1A3B63",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primaryBtnText: { color: "white", fontSize: 14, fontWeight: "600" },
  emptyState: { alignItems: "center", marginTop: 40, paddingHorizontal: 20 },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 10,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 5,
  },
  emptyStateButtons: { flexDirection: "row", marginTop: 20, gap: 10 },
  emptyOutlineBtn: {
    borderWidth: 1,
    borderColor: "#6B7280",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  emptyOutlineBtnText: { color: "#4B5563", fontWeight: "600" },
  emptyPrimaryBtn: {
    backgroundColor: "#1A3B63",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  emptyPrimaryBtnText: { color: "white", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1A3B63" },
  filterGroup: { marginBottom: 20 },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modalChip: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalChipActive: { backgroundColor: "#1A3B63", borderColor: "#1A3B63" },
  modalChipText: { color: "#4B5563", fontSize: 14 },
  modalChipTextActive: { color: "white", fontWeight: "600" },
  applyButton: {
    backgroundColor: "#1A3B63",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  applyButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  clearButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  clearButtonText: { color: "#6B7280", fontSize: 15, fontWeight: "600" },
  reportOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reportOptionActive: { borderColor: "#1A3B63", backgroundColor: "#F0F4F8" },
  reportOptionText: { marginLeft: 10, fontSize: 15, color: "#374151" },
  reportOptionTextActive: { color: "#1A3B63", fontWeight: "600" },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    height: 100,
    textAlignVertical: "top",
    color: "#1F2937",
  },
});
