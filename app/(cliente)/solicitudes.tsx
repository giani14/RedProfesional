import { supabase } from "@/lib/supabase"; // Importa tu cliente de Supabase
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react"; // Añadimos useEffect
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#FBBF24",
  textMain: "#123F78",
  textSecondary: "#6B7280",
  bgLight: "#F9FAFB",
  white: "#FFFFFF",
  pendingBg: "#FEF3C7",
  pendingText: "#92400E",
  activeBg: "#DBEAFE",
  activeText: "#1E40AF",
};

export default function PedidosScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pendientes"); // En minúsculas para coincidir con la BD
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Ajustamos el nombre del estado para que coincida con la base de datos
      let estadoDB = activeTab.toLowerCase();
      if (estadoDB === "pendientes") estadoDB = "pendiente"; // Corrección de plural a singular

      const { data, error } = await supabase
        .from("solicitudes_servicio")
        .select(
          `
          id,
          proyecto,
          descripcion_problema,
          estado,
          fecha_solicitud
        `,
        )
        .eq("cliente_id", user.id)
        .eq("estado", estadoDB) // Enviamos el valor corregido
        .order("fecha_solicitud", { ascending: false });

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (error: any) {
      // Esto mostrará el error detallado en tu consola para saber qué falló exactamente
      console.error("Error detallado:", error.message, error.details);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  // 2. Ejecutar la carga cuando cambie la pestaña o al iniciar
  useEffect(() => {
    fetchSolicitudes();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSolicitudes();
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={30} color="#CBD5E1" />
        </View>
        <View style={styles.info}>
          <Text style={styles.profeName}>
            {item.profesionales_info?.nombre_completo || "Profesional"}
          </Text>
          <Text style={styles.profeService}>
            {item.proyecto || "Servicio solicitado"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.estado === "pendientes"
              ? styles.badgePending
              : styles.badgeActive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.estado === "pendientes"
                    ? COLORS.pendingText
                    : COLORS.activeText,
              },
            ]}
          >
            {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.footerRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.footerDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        {/* El monto vendrá de la tabla propuestas_servicio en el siguiente paso */}
        <Text style={styles.footerPrice}>Pendiente de Cotización</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBlue}
      />

      <View style={styles.blueHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>RedProfesional</Text>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.tabsContainer}>
        {["Pendientes", "En Proceso", "Finalizados"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab.toLowerCase() && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.toLowerCase())}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.toLowerCase() && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
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
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No tienes solicitudes en este estado.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.bgLight },

  // Estilo del Header Azul
  blueHeader: { backgroundColor: COLORS.primaryBlue, paddingBottom: 15 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },

  // Estilo de Pestañas
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: { flex: 1, paddingVertical: 15, alignItems: "center" },
  activeTab: { borderBottomWidth: 3, borderBottomColor: COLORS.accentGold },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  activeTabText: { color: COLORS.primaryBlue },

  // Tarjetas de Pedido mejoradas
  listPadding: { padding: 20 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, marginLeft: 15 },
  profeName: { fontSize: 16, fontWeight: "bold", color: COLORS.primaryBlue },
  profeService: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgePending: { backgroundColor: COLORS.pendingBg },
  badgeActive: { backgroundColor: COLORS.activeBg },
  statusText: { fontSize: 11, fontWeight: "bold" },

  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 4 },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerDate: { fontSize: 13, color: COLORS.textSecondary },
  footerPrice: { fontSize: 15, fontWeight: "bold", color: COLORS.primaryBlue },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
