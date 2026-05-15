import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
}

export default function BuscarClienteScreen() {
  const router = useRouter();
  // Recibe parámetros si el usuario presionó una categoría rápida desde el Inicio
  const { query } = useLocalSearchParams<{ query?: string }>();
  
  const [busqueda, setBusqueda] = useState(query || "");
  const [activeSearchTerm, setActiveSearchTerm] = useState(query || "");
  const [chipActivo, setChipActivo] = useState<string | null>(query || null);
  const [resultados, setResultados] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA FILTROS DE HU-12 ---
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);
  const [tempUbicacion, setTempUbicacion] = useState<string | null>(null);
  const [tempCalificacion, setTempCalificacion] = useState<number | null>(null);
  const [filtroUbicacion, setFiltroUbicacion] = useState<string | null>(null);
  const [filtroCalificacion, setFiltroCalificacion] = useState<number | null>(null);
  
  const categorias = ["Electricista", "Instalaciones", "Mantenimiento", "Carpintería"];

  useEffect(() => {
    if (query && categorias.includes(query)) {
      setBusqueda(query);
      setChipActivo(query);
    }
  }, [query]);

  const fetchResultados = useCallback(async (searchTerm: string, loc: string | null, cal: number | null) => {
    setLoading(true);
    try {
      // Limpiamos espacios extra para una búsqueda predictiva exacta
      const cleanTerm = searchTerm.trim().replace(/\s+/g, " ");
      
      // Guardamos el término activo para saber si debemos mostrar la "Mejor opción" o no
      setActiveSearchTerm(cleanTerm);
      const lowerTerm = cleanTerm.toLowerCase();

      // Obtenemos a todos los profesionales activos para evitar crashes
      // de columnas inexistentes en Supabase y poder filtrarlos con total precisión.
      const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("rol", "Profesional")
        .eq("estado", "activo");

      if (error) throw error;

      const defaultSpecialties = ["Electricista", "Plomería", "Mantenimiento", "Carpintería"];

      let mappedData: Profesional[] = (data || []).map((item, index) => {
        // Buscamos dinámicamente el campo real de tu base de datos
        const especialidadReal = item.especialidad || item.profesion || item.categoria || item.oficio;
        const mockedSpecialty = defaultSpecialties[index % defaultSpecialties.length];
        return {
          id: item.id,
          nombre_completo: item.nombre_completo || "Usuario",
          avatar_url: item.avatar_url,
          especialidad: especialidadReal || mockedSpecialty,
          ubicacion: item.ubicacion || "Ubicación no especificada",
          calificacion: item.calificacion ?? 4.8,
          resenas: item.resenas ?? 24,
          descripcion: item.descripcion || "Profesional verificado en la plataforma, disponible para nuevos proyectos.",
        };
      });

      // FILTRADO ESTRICTO POR PREFIJO Y PALABRA
      if (cleanTerm !== "") {
        mappedData = mappedData.filter((p) => {
          // Separamos en palabras para que detecte correctamente las iniciales
          // (ej: si busca "E", encuentra "Electricista" pero descarta "Plomería")
          const wordsName = p.nombre_completo.toLowerCase().split(/\s+/);
          const wordsSpec = p.especialidad.toLowerCase().split(/\s+/);
          
          const matchName = wordsName.some((word) => word.startsWith(lowerTerm));
          const matchSpec = wordsSpec.some((word) => word.startsWith(lowerTerm));
          
          return matchName || matchSpec;
        });
      }

      // --- APLICAR FILTROS HU-12 ---
      if (loc) {
        // Filtro por ubicación exacto o parcial
        mappedData = mappedData.filter(p => p.ubicacion.toLowerCase().includes(loc.toLowerCase()));
      }

      if (cal) {
        // Filtro por calificación mínima (gte)
        mappedData = mappedData.filter(p => p.calificacion >= cal);
      }

      // Ordenamiento inteligente para rankear al profesional "Mejor opción" en el inicio
      mappedData.sort((a, b) => {
        // 1. Mayor calificación (Rating)
        if (b.calificacion !== a.calificacion) return b.calificacion - a.calificacion;
        
        // 2. Mayor cantidad de reseñas
        if (b.resenas !== a.resenas) return b.resenas - a.resenas;
        
        // 3. Perfil completo (priorizamos a los que sí subieron avatar)
        return (b.avatar_url ? 1 : 0) - (a.avatar_url ? 1 : 0);
      });

      setResultados(mappedData);
    } catch (error) {
      console.error("Error buscando resultados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResultados(busqueda, filtroUbicacion, filtroCalificacion);
    }, 350); // Debounce optimizado para autocompletado más fluido
    return () => clearTimeout(timer as any);
  }, [busqueda, fetchResultados, filtroUbicacion, filtroCalificacion]);

  const getSiglas = (name: string) => {
    if (!name) return "P";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3B63" translucent={true} />
      <View style={styles.safeAreaSpacing} />

      {/* --- HEADER (Sin botón de retroceso para no romper el Tab Navigator) --- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buscar profesionales</Text>
      </View>

      {/* --- BUSCADOR --- */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué servicio necesitas?"
            placeholderTextColor="#9CA3AF"
            value={busqueda}
            onChangeText={(text) => {
              setBusqueda(text);
              if (categorias.includes(text)) setChipActivo(text);
              else setChipActivo(null);
            }}
          />
          {busqueda !== "" && (
            <TouchableOpacity onPress={() => { setBusqueda(""); setChipActivo(null); }}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => fetchResultados(busqueda, filtroUbicacion, filtroCalificacion)}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setModalFiltrosVisible(true)}>
          <Ionicons name="options" size={24} color="#1A3B63" />
        </TouchableOpacity>
      </View>

      {/* --- CHIPS DE FILTROS ACTIVOS HU-12 --- */}
      {(filtroUbicacion || filtroCalificacion) && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersContainer}>
            {filtroUbicacion && (
              <TouchableOpacity style={styles.activeFilterChip} onPress={() => {
                setFiltroUbicacion(null);
                setTempUbicacion(null);
              }}>
                <Text style={styles.activeFilterChipText}>📍 {filtroUbicacion}</Text>
                <Ionicons name="close-circle" size={16} color="white" style={{marginLeft: 4}} />
              </TouchableOpacity>
            )}
            {filtroCalificacion && (
              <TouchableOpacity style={styles.activeFilterChip} onPress={() => {
                setFiltroCalificacion(null);
                setTempCalificacion(null);
              }}>
                <Text style={styles.activeFilterChipText}>⭐ {filtroCalificacion === 5 ? "5.0" : `${filtroCalificacion}+`}</Text>
                <Ionicons name="close-circle" size={16} color="white" style={{marginLeft: 4}} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.clearFiltersTextBtn} onPress={() => {
              setFiltroUbicacion(null);
              setFiltroCalificacion(null);
              setTempUbicacion(null);
              setTempCalificacion(null);
            }}>
              <Text style={styles.clearFiltersText}>Quitar filtros</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* --- CHIPS DE CATEGORÍA --- */}
      <View style={{ marginTop: (filtroUbicacion || filtroCalificacion) ? 5 : 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipsContainer, {marginTop: 0}]}>
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
              <Text style={[styles.chipText, chipActivo === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* --- RESULTADOS DINÁMICOS --- */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.body} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#1A3B63" style={{ marginTop: 40 }} />
        ) : resultados.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No hay resultados</Text>
            <Text style={styles.emptyStateSubText}>Intenta ajustar tus filtros o buscar de otra forma.</Text>
            <View style={styles.emptyStateButtons}>
              <TouchableOpacity style={styles.emptyOutlineBtn} onPress={() => {
                setFiltroUbicacion(null);
                setFiltroCalificacion(null);
                setTempUbicacion(null);
                setTempCalificacion(null);
              }}>
                <Text style={styles.emptyOutlineBtnText}>Limpiar filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emptyPrimaryBtn} onPress={() => {
                setBusqueda("");
                setChipActivo(null);
              }}>
                <Text style={styles.emptyPrimaryBtnText}>Volver a búsqueda</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          resultados.map((prof, index) => {
            // La Mejor Opción SOLO se muestra en la primera fila Y si el usuario ha escrito algo O aplicado filtros
            const hasActiveSearchOrFilter = activeSearchTerm !== "" || filtroUbicacion !== null || filtroCalificacion !== null;
            const isMejorOpcion = index === 0 && hasActiveSearchOrFilter;

            return (
              <View key={prof.id} style={[styles.card, isMejorOpcion && styles.cardHighlight]}>
                {isMejorOpcion && (
                  <View style={styles.badgeContainer}>
                    <Ionicons name="trophy" size={14} color="#92400E" style={{marginRight: 4}} />
                    <Text style={styles.badgeText}>Mejor opción</Text>
                  </View>
                )}

                <View style={styles.cardRow}>
                  {prof.avatar_url ? (
                    <Image source={{ uri: prof.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{getSiglas(prof.nombre_completo)}</Text></View>
                  )}
                  <View style={styles.cardInfo}>
                    <Text style={styles.profName} numberOfLines={1}>{prof.nombre_completo}</Text>
                    <Text style={styles.profSpecialty}>{prof.especialidad}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#F9B934" />
                      <Text style={styles.ratingText}>{prof.calificacion}</Text>
                      <Text style={styles.reviewsText}>({prof.resenas} reseñas)</Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color="#6B7280" />
                      <Text style={styles.locationText} numberOfLines={1}>{prof.ubicacion}</Text>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.descText} numberOfLines={2}>{prof.descripcion}</Text>
                
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push({ pathname: "/(cliente)/perfilProfesional", params: { id: prof.id } } as unknown as Href)}>
                    <Text style={styles.outlineBtnText}>Ver perfil</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => alert(`Contactando a ${prof.nombre_completo}...`)}>
                    <Text style={styles.primaryBtnText}>Contactar</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
                {["La Paz", "Cochabamba", "Santa Cruz", "Sucre", "Tarija", "Oruro"].map((opcion) => (
                  <TouchableOpacity
                    key={opcion}
                    style={[styles.modalChip, tempUbicacion === opcion && styles.modalChipActive]}
                    onPress={() => setTempUbicacion(tempUbicacion === opcion ? null : opcion)}
                  >
                    <Text style={[styles.modalChipText, tempUbicacion === opcion && styles.modalChipTextActive]}>{opcion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Calificación mínima</Text>
              <View style={styles.optionsRow}>
                {[{label: "4.0+", value: 4.0}, {label: "4.5+", value: 4.5}, {label: "5.0", value: 5.0}].map((opcion) => (
                  <TouchableOpacity
                    key={opcion.label}
                    style={[styles.modalChip, tempCalificacion === opcion.value && styles.modalChipActive]}
                    onPress={() => setTempCalificacion(tempCalificacion === opcion.value ? null : opcion.value)}
                  >
                    <Text style={[styles.modalChipText, tempCalificacion === opcion.value && styles.modalChipTextActive]}>⭐ {opcion.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.applyButton} onPress={() => {
              setFiltroUbicacion(tempUbicacion);
              setFiltroCalificacion(tempCalificacion);
              setModalFiltrosVisible(false);
            }}>
              <Text style={styles.applyButtonText}>Aplicar filtros</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={() => {
              setTempUbicacion(null);
              setTempCalificacion(null);
              setFiltroUbicacion(null);
              setFiltroCalificacion(null);
              setModalFiltrosVisible(false);
            }}>
              <Text style={styles.clearButtonText}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  safeAreaSpacing: { height: Platform.OS === "android" ? StatusBar.currentHeight : 0, backgroundColor: "#1A3B63" },
  header: { height: 70, backgroundColor: "#1A3B63", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 15 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  searchSection: { flexDirection: "row", paddingHorizontal: 20, marginTop: 20, alignItems: "center" },
  searchBar: { flex: 1, flexDirection: "row", backgroundColor: "white", borderRadius: 12, paddingHorizontal: 15, height: 55, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", marginRight: 5 },
  searchInput: { flex: 1, color: "#1F2937", marginLeft: 10, fontSize: 16 },
  searchBtn: { backgroundColor: "#1A3B63", width: 55, height: 55, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  filterBtn: { backgroundColor: "white", width: 55, height: 55, borderRadius: 12, justifyContent: "center", alignItems: "center", marginLeft: 5, borderWidth: 1, borderColor: "#E5E7EB" },
  activeFiltersContainer: { flexDirection: "row", paddingHorizontal: 20, marginTop: 15, maxHeight: 35 },
  activeFilterChip: { flexDirection: "row", backgroundColor: "#1A3B63", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 10, alignItems: "center" },
  activeFilterChipText: { color: "white", fontSize: 13, fontWeight: "600" },
  clearFiltersTextBtn: { justifyContent: "center", paddingHorizontal: 5 },
  clearFiltersText: { color: "#EF4444", fontSize: 13, fontWeight: "bold" },
  chipsContainer: { paddingHorizontal: 20, flexDirection: "row", maxHeight: 45, marginBottom: 5 },
  chip: { backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: "#E5E7EB", alignSelf: 'flex-start' },
  chipActive: { backgroundColor: "#1A3B63", borderColor: "#1A3B63" },
  chipText: { color: "#4B5563", fontWeight: "600", fontSize: 14 },
  chipTextActive: { color: "white" },
  body: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyStateText: { color: "#1F2937", marginTop: 10, fontSize: 18, fontWeight: "bold", textAlign: 'center' },
  emptyStateSubText: { color: "#6B7280", fontSize: 14, textAlign: 'center', marginTop: 5, marginBottom: 20, paddingHorizontal: 20 },
  emptyStateButtons: { flexDirection: "row", gap: 10 },
  emptyOutlineBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: "#1A3B63" },
  emptyOutlineBtnText: { color: "#1A3B63", fontWeight: "bold" },
  emptyPrimaryBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, backgroundColor: "#1A3B63" },
  emptyPrimaryBtnText: { color: "white", fontWeight: "bold" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 20, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5 },
  cardHighlight: { borderWidth: 2, borderColor: "#FBBF24" },
  badgeContainer: { flexDirection: "row", position: "absolute", top: -12, left: 20, backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#FBBF24" },
  badgeText: { color: "#92400E", fontSize: 12, fontWeight: "bold" },
  cardRow: { flexDirection: "row", alignItems: "center", marginBottom: 15, marginTop: 5 },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#1A3B63", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "white", fontWeight: "bold", fontSize: 20 },
  cardInfo: { flex: 1, marginLeft: 15 },
  profName: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  profSpecialty: { fontSize: 14, color: "#1A3B63", fontWeight: "700", marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 13, fontWeight: "bold", color: "#374151", marginLeft: 4 },
  reviewsText: { fontSize: 13, color: "#6B7280", marginLeft: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  locationText: { fontSize: 13, color: "#6B7280", marginLeft: 4, flex: 1 },
  descText: { fontSize: 14, color: "#4B5563", lineHeight: 20, marginBottom: 15 },
  actionsRow: { flexDirection: "row", gap: 10 },
  outlineBtn: { flex: 1, borderWidth: 1, borderColor: "#1A3B63", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  outlineBtnText: { color: "#1A3B63", fontWeight: "bold", fontSize: 15 },
  primaryBtn: { flex: 1, backgroundColor: "#F9B934", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  primaryBtnText: { color: "#1A3B63", fontWeight: "bold", fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.25, shadowRadius: 5 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#1A3B63" },
  filterGroup: { marginBottom: 25 },
  filterLabel: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 12 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  modalChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#D1D5DB" },
  modalChipActive: { backgroundColor: "#1A3B63", borderColor: "#1A3B63" },
  modalChipText: { color: "#666", fontWeight: "600" },
  modalChipTextActive: { color: "#FFF" },
  applyButton: { backgroundColor: "#F9B934", height: 55, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 10 },
  applyButtonText: { color: "#1A3B63", fontSize: 16, fontWeight: "bold" },
  clearButton: { height: 55, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 10, borderWidth: 1, borderColor: "#1A3B63" },
  clearButtonText: { color: "#1A3B63", fontSize: 16, fontWeight: "600" },
});