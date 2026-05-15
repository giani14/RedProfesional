import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // <--- ESTA ES LA CORRECTA
// Mantengo tus constantes de diseño del Login
const COLORS = {
  primaryBlue: "#1E3A5F",
  accentGold: "#FBBF24",
  danger: "#EF4444",
  textGray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
  chipBlue: "#DBEAFE",
  chipTextBlue: "#1E40AF",
};

export default function BuscarProfesionales() {
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProfesionales();
  }, []);

  const fetchProfesionales = async () => {
    try {
      setLoading(true);
      // Ajusta 'perfiles' al nombre real de tu tabla
      // Filtramos por rol profesional y una ciudad de ejemplo (Cochabamba)
      const { data, error, count } = await supabase
        .from("perfiles")
        .select("*", { count: "exact" })
        .eq("rol", "Profesional");
      //.eq("ciudad", "Cochabamba"); // Filtro inicial basado en tu imagen

      if (error) throw error;
      setProfesionales(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error("Error al cargar profesionales:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderProfesionalCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: item.avatar_url || "https://via.placeholder.com/150" }}
          style={styles.avatar}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>
            {item.nombre_completo || "Juan Pérez García"}
          </Text>
          <Text style={styles.professionText}>
            {item.especialidad || "Electricista"}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#3B82F6" />
            <Text style={styles.locationText}>
              {item.ciudad || "Cochabamba"}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={COLORS.accentGold} />
            <Text style={styles.ratingText}>
              {item.rating || "4.8"}{" "}
              <Text style={styles.reviewsText}>
                ({item.reviews_count || "56"})
              </Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textGray} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.verPerfilButton}
        onPress={() =>
          router.push({
            pathname: "/(cliente)/perfil",
            params: { id: item.id },
          })
        }
      >
        <Text style={styles.verPerfilText}>Ver perfil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBlue}
      />

      {/* Header azul oscuro */}
      <View style={styles.blueHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profesionales encontrados</Text>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={profesionales}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProfesionalCard}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            <Text style={styles.resultCount}>
              {total} profesionales encontrados
            </Text>

            {/* Chips de Filtro */}
            <View style={styles.filtersRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexDirection: "row" }}
              >
                <View style={styles.chip}>
                  <Ionicons
                    name="location"
                    size={14}
                    color={COLORS.chipTextBlue}
                  />
                  <Text style={styles.chipText}>Cochabamba</Text>
                  <TouchableOpacity>
                    <Ionicons
                      name="close"
                      size={14}
                      color={COLORS.chipTextBlue}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.chip}>
                  <Ionicons name="star" size={14} color={COLORS.accentGold} />
                  <Text style={styles.chipText}>4.5+</Text>
                  <TouchableOpacity>
                    <Ionicons
                      name="close"
                      size={14}
                      color={COLORS.chipTextBlue}
                    />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.filterButton}>
                <Ionicons
                  name="options-outline"
                  size={18}
                  color={COLORS.chipTextBlue}
                />
                <Text style={styles.filterButtonText}>Filtros</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.helpBanner}>
            <View style={styles.helpIconContainer}>
              <Ionicons
                name="person-add-outline"
                size={24}
                color={COLORS.primaryBlue}
              />
            </View>
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpTitle}>
                ¿No encuentras lo que buscas?
              </Text>
              <Text style={styles.helpSubtitle}>
                Publica tu solicitud y recibe propuestas.
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textGray}
            />
          </TouchableOpacity>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primaryBlue}
              style={{ marginTop: 50 }}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F9FAFB" },
  blueHeader: {
    backgroundColor: COLORS.primaryBlue,
    paddingBottom: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600" },
  scrollContent: { padding: 16 },
  resultCount: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 15,
  },

  // Estilos de los Filtros
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.chipBlue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    gap: 5,
  },
  chipText: { color: COLORS.chipTextBlue, fontWeight: "500", fontSize: 13 },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "white",
  },
  filterButtonText: {
    marginLeft: 5,
    color: COLORS.chipTextBlue,
    fontWeight: "500",
  },

  // Estilos de la Card
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    // Sombra para iOS/Android
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E5E7EB",
  },
  infoContainer: { flex: 1, marginLeft: 15 },
  nameText: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  professionText: { fontSize: 14, color: COLORS.textGray, marginVertical: 2 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 13, color: COLORS.textGray },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  ratingText: { fontSize: 13, fontWeight: "bold", color: "#111827" },
  reviewsText: { fontWeight: "normal", color: COLORS.textGray },
  arrowButton: { padding: 5 },

  verPerfilButton: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  verPerfilText: { color: "#3B82F6", fontWeight: "600", fontSize: 14 },

  // Banner Inferior
  helpBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 30,
  },
  helpIconContainer: { marginRight: 15 },
  helpTextContainer: { flex: 1 },
  helpTitle: { fontSize: 14, fontWeight: "bold", color: "#111827" },
  helpSubtitle: { fontSize: 12, color: COLORS.textGray },
});
