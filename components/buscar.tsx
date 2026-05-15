import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
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

export default function BuscarProfesionalesScreen() {
  const router = useRouter();
  const { query } = useLocalSearchParams<{ query?: string }>();
  
  const [busqueda, setBusqueda] = useState(query || "");
  const [resultados, setResultados] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(false);
  const [chipActivo, setChipActivo] = useState<string | null>(query || null);

  const categorias = ["Electricista", "Instalaciones", "Mantenimiento"];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResultados(busqueda);
    }, 400); // Debounce de 400ms para evitar excesivas consultas
    return () => clearTimeout(timer);
  }, [busqueda]);

  const fetchResultados = async (searchTerm: string) => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from("perfiles")
        .select("*")
        .eq("rol", "Profesional")
        .eq("estado", "activo");

      // Búsqueda insensible a mayúsculas
      if (searchTerm.trim() !== "") {
        queryBuilder = queryBuilder.ilike("nombre_completo", `%${searchTerm}%`);
      }

      const { data, error } = await queryBuilder.limit(5); // Solo muestra resultados rápidos

      if (error) throw error;

      // Mapeo seguro con mock temporal para columnas inexistentes
      const mappedData: Profesional[] = (data || []).map((item) => ({
        id: item.id,
        nombre_completo: item.nombre_completo,
        avatar_url: item.avatar_url,
        especialidad: item.especialidad || "Especialidad no especificada",
        ubicacion: item.ubicacion || "Ubicación no especificada",
        calificacion: item.calificacion ?? 4.8,
        resenas: item.resenas ?? 24,
        descripcion: item.descripcion || "Profesional verificado en la plataforma, disponible para nuevos proyectos.",
      }));

      setResultados(mappedData);
    } catch (error) {
      console.error("Error buscando profesionales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarFull = () => {
    if (busqueda.trim() !== "") {
      router.push({ pathname: "/HU-11/resultados", params: { q: busqueda } } as unknown as Href);
    }
  };

  const getSiglas = (name: string) => {
    if (!name) return "P";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#1A3B63" translucent={true} />
      <View style={styles.safeAreaSpacing} />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar profesionales</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
        {/* --- BUSCADOR --- */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="¿Qué servicio necesitas?"
              placeholderTextColor="#9CA3AF"
              value={busqueda}
              onChangeText={setBusqueda}
              onSubmitEditing={handleBuscarFull}
            />
            {busqueda !== "" && (
              <TouchableOpacity onPress={() => setBusqueda("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={handleBuscarFull}>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* --- CHIPS DE CATEGORÍA --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, chipActivo === cat && styles.chipActive]}
              onPress={() => {
                setChipActivo(cat === chipActivo ? null : cat);
                setBusqueda(cat === chipActivo ? "" : cat);
              }}
            >
              <Text style={[styles.chipText, chipActivo === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- RESULTADOS RÁPIDOS --- */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Resultados de búsqueda</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#1A3B63" style={{ marginTop: 40 }} />
          ) : resultados.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No se encontraron profesionales.</Text>
            </View>
          ) : (
            resultados.map((prof) => (
              <TouchableOpacity 
                key={prof.id} 
                style={styles.card}
                onPress={() => router.push({ pathname: "/HU-11/resultados", params: { q: prof.nombre_completo } } as unknown as Href)}
              >
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
                      <View style={styles.dot} />
                      <Ionicons name="location-outline" size={14} color="#6B7280" />
                      <Text style={styles.locationText} numberOfLines={1}>{prof.ubicacion}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#1A3B63" />
                </View>
                <Text style={styles.descText} numberOfLines={2}>{prof.descripcion}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  safeAreaSpacing: { height: Platform.OS === "android" ? StatusBar.currentHeight : 0, backgroundColor: "#1A3B63" },
  header: { height: 70, backgroundColor: "#1A3B63", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15 },
  iconBtn: { padding: 5 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  body: { flex: 1 },
  searchSection: { flexDirection: "row", paddingHorizontal: 20, marginTop: 20, alignItems: "center" },
  searchBar: { flex: 1, flexDirection: "row", backgroundColor: "white", borderRadius: 12, paddingHorizontal: 15, height: 55, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", marginRight: 10 },
  searchInput: { flex: 1, color: "#1F2937", marginLeft: 10, fontSize: 16 },
  searchBtn: { backgroundColor: "#1A3B63", width: 55, height: 55, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  chipsContainer: { paddingHorizontal: 20, marginTop: 15, flexDirection: "row", maxHeight: 45 },
  chip: { backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: "#E5E7EB", alignSelf: 'flex-start' },
  chipActive: { backgroundColor: "#1A3B63", borderColor: "#1A3B63" },
  chipText: { color: "#4B5563", fontWeight: "600", fontSize: 14 },
  chipTextActive: { color: "white" },
  resultsSection: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 15 },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 40 },
  emptyStateText: { color: "#6B7280", marginTop: 10, fontSize: 16 },
  card: { backgroundColor: "white", borderRadius: 16, padding: 15, marginBottom: 15, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#1A3B63", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "white", fontWeight: "bold", fontSize: 18 },
  cardInfo: { flex: 1, marginLeft: 12 },
  profName: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  profSpecialty: { fontSize: 14, color: "#1A3B63", fontWeight: "600", marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 13, fontWeight: "bold", color: "#374151", marginLeft: 4 },
  reviewsText: { fontSize: 13, color: "#6B7280", marginLeft: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB", marginHorizontal: 6 },
  locationText: { fontSize: 13, color: "#6B7280", marginLeft: 4, flex: 1 },
  descText: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
});