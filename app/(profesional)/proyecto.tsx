import { supabase } from "@/lib/supabase"; // Conexión a tu Supabase
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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
  id: string; // Agregamos el ID
  titulo: string;
  cliente: string;
  fecha: string;
  estado: "Pendiente" | "En progreso" | "Finalizado";
  onPress: () => void; // Agregamos la función onPress
}

const ProyectoCard = ({
  id,
  titulo,
  cliente,
  fecha,
  estado,
  onPress, // Extraemos onPress
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

      <TouchableOpacity style={styles.detailButton} onPress={onPress}>
        <Text style={styles.detailButtonText}>Ver detalles</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.primaryBlue} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function ProyectosProfesional() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [proyectos, setProyectos] = useState<any[]>([]);

  // Mapeo para transformar los estados de la Base de Datos a los de tu UI
  const mapearEstado = (
    estadoBD: string,
  ): "Pendiente" | "En progreso" | "Finalizado" => {
    const estado = estadoBD?.toLowerCase();
    if (estado === "en_proceso" || estado === "aceptada") return "En progreso";
    if (estado === "finalizado") return "Finalizado";
    return "Pendiente"; // Para 'pendiente' o 'revisando'
  };

  const formatearFechaSimple = (fechaStr: string): string => {
    if (!fechaStr) return "Sin fecha";
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return "Fecha inválida";
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Carga asíncrona real desde Supabase usando seguridad por Profesional ID
  const loadProyectos = async () => {
    try {
      setLoading(true);

      // Obtener el usuario autenticado (Profesional)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Traemos las solicitudes/proyectos asignados al profesional
      const { data, error } = await supabase
        .from("solicitudes_servicio")
        .select(
          `
          id,
          proyecto,
          estado,
          fecha_solicitud,
          perfiles:cliente_id (nombre_completo)
        `,
        )
        .eq("profesional_id", user.id)
        .order("fecha_solicitud", { ascending: false });

      if (error) throw error;

      // Adaptar los datos de Supabase a la estructura que requiere tu ProyectoCard
      const proyectosAdaptados = (data || []).map((item: any) => ({
        id: item.id,
        titulo: item.proyecto || "Sin título",
        cliente: item.perfiles?.nombre_completo || "Cliente",
        fecha: formatearFechaSimple(item.fecha_solicitud),
        estado: mapearEstado(item.estado),
      }));

      setProyectos(proyectosAdaptados);
    } catch (error: any) {
      console.error("Error cargando proyectos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Recarga automáticamente los proyectos cada vez que la pantalla toma foco (ej. tras aceptar una solicitud)
  useFocusEffect(
    useCallback(() => {
      loadProyectos();
    }, []),
  );

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
          title: "Proyectos",
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
              id={item.id}
              titulo={item.titulo}
              cliente={item.cliente}
              fecha={item.fecha}
              estado={item.estado}
              onPress={() =>
                router.push({
                  pathname: "/HU-16/detalleProyecto", // RUTA SOLICITADA
                  params: { id: item.id }, // Enviamos el ID dinámico a la pantalla
                })
              }
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
