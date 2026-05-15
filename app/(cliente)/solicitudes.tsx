import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primaryBlue: "#123F78", // Azul corporativo de RedProfesional
  accentGold: "#FBBF24", // Dorado para indicadores de pestaña
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
  const [activeTab, setActiveTab] = useState("Pendientes");
  const [solicitudes, setSolicitudes] = useState<any[]>([]);

  // Simulación de carga de datos (Sustituir con tu consulta a Supabase)
  const MOCK_DATA = [
    {
      id: "1",
      nombre: "Carlos Mendoza",
      especialidad: "Desarrollo Web",
      status: "Pendiente",
      fecha: "15 Mayo",
      monto: "2500 Bs",
    },
    {
      id: "2",
      nombre: "Juan Pérez",
      servicio: "Instalación Eléctrica",
      status: "En Proceso",
      fecha: "10 Mayo",
      monto: "500 Bs",
    },
  ];

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={30} color="#CBD5E1" />
        </View>
        <View style={styles.info}>
          <Text style={styles.profeName}>{item.nombre || item.profe}</Text>
          <Text style={styles.profeService}>
            {item.especialidad || item.servicio}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === "Pendiente"
              ? styles.badgePending
              : styles.badgeActive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "Pendiente"
                ? { color: COLORS.pendingText }
                : { color: COLORS.activeText },
            ]}
          >
            {item.status}
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
          <Text style={styles.footerDate}>{item.fecha}</Text>
        </View>
        <Text style={styles.footerPrice}>{item.monto}</Text>
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

      {/* HEADER AZUL SUPERIOR (Waybar integrado) */}
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

      {/* TABS DE NAVEGACIÓN */}
      <View style={styles.tabsContainer}>
        {["Pendientes", "En Proceso", "Finalizados"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={MOCK_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
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
});
