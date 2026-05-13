import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  textGray: "#6B7280",
  textDark: "#1F2937",
  borderGray: "#E5E7EB",
  successGreen: "#10B981",
  warningOrange: "#F59E0B",
};

interface ProyectoItemProps {
  titulo: string;
  cliente: string;
  fecha: string;
  estado: "Pendiente" | "En progreso" | "Finalizado";
}

const ProyectoCard = ({
  titulo,
  cliente,
  fecha,
  estado,
}: ProyectoItemProps) => {
  const getStatusStyle = () => {
    switch (estado) {
      case "En progreso":
        return { bg: "#DBEAFE", text: "#1E40AF" };
      case "Finalizado":
        return { bg: "#D1FAE5", text: "#065F46" };
      default:
        return { bg: "#FEF3C7", text: "#92400E" };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <TouchableOpacity style={styles.projectCard} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.projectTitle} numberOfLines={1}>
          {titulo}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {estado}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.textGray} />
          <Text style={styles.infoText}>Cliente: {cliente}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textGray} />
          <Text style={styles.infoText}>Iniciado: {fecha}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.detailButton}>
        <Text style={styles.detailButtonText}>Ver detalles</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.primaryBlue} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function ProyectosProfesional() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [proyectos, setProyectos] = useState<any[]>([]);

  useEffect(() => {
    // Simulación de carga de proyectos desde Supabase
    const loadProyectos = async () => {
      setLoading(true);
      const mockProyectos = [
        {
          id: "1",
          titulo: "Desarrollo E-commerce",
          cliente: "Marvin Anghelo",
          fecha: "01/05/2026",
          estado: "En progreso",
        },
        {
          id: "2",
          titulo: "Mantenimiento de Base de Datos",
          cliente: "Sistemas UMSS",
          fecha: "20/04/2026",
          estado: "Finalizado",
        },
        {
          id: "3",
          titulo: "App Móvil Inventario",
          cliente: "Tech Bol",
          fecha: "05/05/2026",
          estado: "Pendiente",
        },
      ];
      setProyectos(mockProyectos);
      setLoading(false);
    };

    loadProyectos();
  }, []);

  const filteredData =
    filter === "Todos"
      ? proyectos
      : proyectos.filter((p) => p.estado === filter);

  const FilterTab = ({ label }: { label: string }) => (
    <TouchableOpacity
      style={[styles.filterTab, filter === label && styles.activeFilterTab]}
      onPress={() => setFilter(label)}
    >
      <Text
        style={[styles.filterText, filter === label && styles.activeFilterText]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Gestión de Proyectos",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.primaryBlue },
          headerTintColor: COLORS.white,
        }}
      />

      {/* Selector de Filtros */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterTab label="Todos" />
          <FilterTab label="Pendiente" />
          <FilterTab label="En progreso" />
          <FilterTab label="Finalizado" />
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ProyectoCard
              titulo={item.titulo}
              cliente={item.cliente}
              fecha={item.fecha}
              estado={item.estado}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="folder-open-outline"
                size={80}
                color={COLORS.borderGray}
              />
              <Text style={styles.emptyText}>
                No hay proyectos en esta categoría.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  filterContainer: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  activeFilterTab: { backgroundColor: COLORS.white },
  filterText: { color: COLORS.white, fontWeight: "600", fontSize: 13 },
  activeFilterText: { color: COLORS.primaryBlue },
  listContent: { padding: 20, paddingBottom: 100 },
  projectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.textDark,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "bold" },
  cardBody: { marginBottom: 15 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  infoText: { marginLeft: 8, color: COLORS.textGray, fontSize: 14 },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGray,
  },
  detailButtonText: {
    color: COLORS.primaryBlue,
    fontWeight: "bold",
    marginRight: 5,
  },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 10, color: COLORS.textGray, fontSize: 16 },
});
