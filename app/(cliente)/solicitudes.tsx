import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primaryBlue: "#123F78",
  textMain: "#123F78",
  textSecondary: "#6B7280",
  bgLight: "#F9FAFB",
  white: "#FFFFFF",
  pendingBg: "#FEF3C7",
  pendingText: "#92400E",
  acceptedBg: "#D1FAE5",
  acceptedText: "#065F46",
  rejectedBg: "#FEE2E2",
  rejectedText: "#991B1B",
};
const estadoStyles: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  pendiente: {
    bg: COLORS.pendingBg,
    color: COLORS.pendingText,
    label: "Pendiente",
  },
  // Añadimos este bloque optimizado:
  revisando: {
    bg: "#E0F2FE", // Azul claro de fondo
    color: "#0369A1", // Azul oscuro para el texto
    label: "Revisando",
  },
  en_proceso: { bg: "#DBEAFE", color: "#1E40AF", label: "En Proceso" },
  aceptada: {
    bg: COLORS.acceptedBg,
    color: COLORS.acceptedText,
    label: "Aceptada",
  },
  rechazada: {
    bg: COLORS.rejectedBg,
    color: COLORS.rejectedText,
    label: "Rechazada",
  },
  finalizado: {
    bg: COLORS.acceptedBg,
    color: COLORS.acceptedText,
    label: "Finalizado",
  },
};
export default function PedidosScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Todas");
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const tieneNotificaciones = false;

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("solicitudes_servicio")
        .select(
          `
          id, 
          proyecto, 
          estado, 
          fecha_solicitud,
          profesional_id,
          perfiles!profesional_id (nombre_completo)
        `,
        )
        .eq("cliente_id", user.id);

      // Lógica de filtrado mejorada
      if (activeTab === "Pendientes") {
        // Mostramos tanto las nuevas como las que ya se están revisando
        query = query.in("estado", ["pendiente", "revisando"]);
      } else if (activeTab !== "Todas") {
        const estadoFiltro = activeTab.toLowerCase().replace("s", "");
        query = query.eq("estado", estadoFiltro);
      }

      const { data, error } = await query.order("fecha_solicitud", {
        ascending: false,
      });

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (error: any) {
      console.error("Error en la consulta:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [activeTab]);
  const onRefresh = () => {
    setRefreshing(true);
    fetchSolicitudes();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar Solicitud",
      "¿Estás seguro de que quieres borrar esta solicitud?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("solicitudes_servicio")
              .delete()
              .eq("id", id);
            if (!error) {
              setSolicitudes(solicitudes.filter((s) => s.id !== id));
            }
          },
        },
      ],
    );
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (estadoStyles[s]) {
      return { bg: estadoStyles[s].bg, text: estadoStyles[s].color };
    }
    return { bg: COLORS.pendingBg, text: COLORS.pendingText };
  };

  const renderItem = ({ item }: any) => {
    // Usamos el diccionario global que ya tienes definido arriba para los colores
    const configEstado =
      estadoStyles[item.estado?.toLowerCase()] || estadoStyles["pendiente"];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/HU-18/solicitudDetalle",
            params: { id: item.id },
          })
        }
        onLongPress={() => handleDelete(item.id)}
        delayLongPress={1000}
        activeOpacity={0.7}
      >
        <View style={styles.cardRow}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={28} color="#CBD5E1" />
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeaderLine}>
              <Text style={styles.profeName} numberOfLines={1}>
                {item.perfiles?.nombre_completo || "Profesional"}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: configEstado.bg },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: configEstado.color }]}
                >
                  {configEstado.label}
                </Text>
              </View>
            </View>

            <Text style={styles.profeService} numberOfLines={1}>
              {item.proyecto}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.footerDate}>
                {item.fecha_solicitud
                  ? new Date(item.fecha_solicitud).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Fecha pendiente"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primaryBlue}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBlue}
      />

      {/* Header Estilo Nuevo */}
      <View style={styles.blueHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity>
              <Ionicons name="menu" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>RedProfesional</Text>
            <TouchableOpacity
              onPress={() => router.push("/HU-17/notificacionCliente")}
            >
              <Ionicons name="notifications-outline" size={26} color="white" />
              {tieneNotificaciones && <View style={styles.notifDot} />}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentBody}>
        <Text style={styles.sectionTitle}>Mis solicitudes</Text>

        {/* Chips de Filtro */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {["Todas", "Pendientes", "Aceptadas", "Rechazadas"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.chip, activeTab === tab && styles.activeChip]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.chipText,
                    activeTab === tab && styles.activeChipText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primaryBlue}
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={solicitudes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchSolicitudes}
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No hay solicitudes para mostrar.
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.bgLight },
  blueHeader: { backgroundColor: COLORS.primaryBlue, paddingBottom: 10 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },

  contentBody: { flex: 1, paddingTop: 20 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginLeft: 20,
    marginBottom: 20,
  },

  // Estilo Chips
  chipsContainer: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
    height: 40,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeChip: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
  chipText: { color: COLORS.textSecondary, fontWeight: "500" },
  activeChipText: { color: COLORS.white },

  // Tarjetas según la nueva imagen
  listPadding: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    // Sombra suave
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardRow: { flexDirection: "row" },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { flex: 1, marginLeft: 15 },
  cardHeaderLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  profeName: { fontSize: 17, fontWeight: "bold", color: COLORS.textMain },
  profeService: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "bold" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  footerDate: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "500" },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: COLORS.textSecondary,
  },
  notifDot: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#EAB308", // Dorado como tus colores principales
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primaryBlue,
  },
});
