import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Definición de tipos para el contenido a moderar
interface ModeracionItem {
  id: string;
  tipo: "comentario" | "perfil" | "portafolio";
  titulo: string;
  descripcion: string;
  autor: string;
  estado: "pendiente" | "reportado" | "aprobado";
  fecha: string;
}

export default function ModeracionScreen() {
  const [filtro, setFiltro] = useState<"pendiente" | "reportado" | "aprobado">(
    "pendiente",
  );
  const [items, setItems] = useState<ModeracionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Totales (estáticos por ahora o puedes calcularlos del fetch)
  const totales = { pendientes: 12, reportados: 8, aprobados: 23 };

  useEffect(() => {
    fetchModeracionData();
  }, [filtro]);

  async function fetchModeracionData() {
    try {
      setLoading(true);
      // Aquí conectarás con tu tabla de base de datos real (ej: 'reportes' o 'moderacion')
      // Por ahora simulamos la carga para que veas el diseño idéntico
      const { data, error } = await supabase
        .from("moderacion")
        .select("*")
        .eq("estado", filtro);

      if (!error && data) {
        setItems(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }: { item: ModeracionItem }) => {
    // Configuración visual según el tipo
    const config = {
      comentario: { icon: "comment-text-outline", color: "#60A5FA" },
      perfil: { icon: "account-outline", color: "#A78BFA" },
      portafolio: { icon: "briefcase-outline", color: "#34D399" },
    };

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        {/* Icono Circular Izquierdo */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: config[item.tipo].color + "20" },
          ]}
        >
          <MaterialCommunityIcons
            name={config[item.tipo].icon as any}
            size={28}
            color={config[item.tipo].color}
          />
        </View>

        {/* Contenido Central */}
        <div id="content-container" style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.rowHeader}>
            <Text style={styles.itemTypeText}>
              {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}{" "}
              {item.tipo === "perfil" ? "profesional pendiente" : ""}
            </Text>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      item.estado === "reportado" ? "#EF4444" : "#F59E0B",
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {item.estado === "pendiente" ? "Pendiente" : "Reportado"}
              </Text>
            </View>
          </View>

          <Text style={styles.itemTitle}>{item.titulo}</Text>
          <Text style={styles.itemSubtitle} numberOfLines={2}>
            {item.descripcion}
          </Text>

          <View style={styles.rowFooter}>
            <Text style={styles.footerText}>
              Registrado por <Text style={styles.boldText}>{item.autor}</Text>
            </Text>
            <Text style={styles.footerText}>Hace {item.fecha}</Text>
          </View>
        </div>

        {/* Flecha Derecha */}
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.mainTitle}>Contenido pendiente</Text>

      {/* Barra de Filtros (Pestañas) */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filtro === "pendiente" && styles.filterTabActive,
          ]}
          onPress={() => setFiltro("pendiente")}
        >
          <Text
            style={[
              styles.filterTabText,
              filtro === "pendiente" && styles.filterTabTextActive,
            ]}
          >
            Pendientes{" "}
            <Text style={styles.badgeCount}>{totales.pendientes}</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filtro === "reportado" && styles.filterTabActive,
          ]}
          onPress={() => setFiltro("reportado")}
        >
          <Text
            style={[
              styles.filterTabText,
              filtro === "reportado" && styles.filterTabTextActive,
            ]}
          >
            Reportados{" "}
            <Text style={styles.badgeCountGray}>{totales.reportados}</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filtro === "aprobado" && styles.filterTabActive,
          ]}
          onPress={() => setFiltro("aprobado")}
        >
          <Text
            style={[
              styles.filterTabText,
              filtro === "aprobado" && styles.filterTabTextActive,
            ]}
          >
            Aprobados{" "}
            <Text style={styles.badgeCountGray}>{totales.aprobados}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1A3B63"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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

  // Estilos de la Barra de Filtros
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
  filterTabActive: { backgroundColor: "#1A3B63" },
  filterTabText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  filterTabTextActive: { color: "#FFF" },
  badgeCount: { color: "#FFF", fontWeight: "bold" },
  badgeCountGray: { color: "#9CA3AF" },

  // Estilos de las Tarjetas
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
  statusText: { fontSize: 12, color: "#6B7280" },
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
});
