import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
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
  white: "#FFFFFF",
  background: "#F3F4F6",
  textDark: "#1F2937",
  textGray: "#6B7280",
  chipInactive: "#F3F4F6",
  pendingBg: "#FEF3C7",
  pendingText: "#B45309",
  acceptedBg: "#D1FAE5",
  acceptedText: "#047857",
  rejectedBg: "#FEE2E2",
  rejectedText: "#B91C1C",
  avatarBg: "#E5E7EB",
};

type EstadoSolicitud = "pendiente" | "aceptada" | "rechazada";

interface Solicitud {
  id: string;
  cliente_id: string;
  profesional_id: string;
  estado: EstadoSolicitud;
  descripcion_problema: string;
  fecha_solicitud: string;
  actualizado_at: string;
  proyecto: string;
  perfiles: {
    nombre_completo: string;
  };
}

/*const SOLICITUDES_MOCK: Solicitud[] = [
  {
    id: "1",
    nombre: "María Fernández",
    proyecto: "Desarrollo de página web",
    fecha: "9 de mayo de 2026",
    estado: "Pendiente",
  },
  {
    id: "2",
    nombre: "Luis Rodrigo",
    proyecto: "Diseño de aplicación móvil",
    fecha: "8 de mayo de 2026",
    estado: "Pendiente",
  },
  {
    id: "3",
    nombre: "Ana Gómez",
    proyecto: "Mantenimiento de sitio web",
    fecha: "7 de mayo de 2026",
    estado: "Aceptada",
  },
  {
    id: "4",
    nombre: "Jorge Salazar",
    proyecto: "Tienda en línea",
    fecha: "5 de mayo de 2026",
    estado: "Rechazada",
  },
  {
    id: "5",
    nombre: "Paola Morales",
    proyecto: "SEO para sitio web",
    fecha: "3 de mayo de 2026",
    estado: "Pendiente",
  },
];*/

const FILTROS = ["todas", "pendientes", "aceptadas", "rechazadas"] as const;
type Filtro = (typeof FILTROS)[number];

const estadoStyles: Record<EstadoSolicitud, { bg: string; color: string }> = {
  pendiente: { bg: COLORS.pendingBg, color: COLORS.pendingText },
  aceptada: { bg: COLORS.acceptedBg, color: COLORS.acceptedText },
  rechazada: { bg: COLORS.rejectedBg, color: COLORS.rejectedText },
};

function formatearFecha(fechaIso: string): string {     
    if (!fechaIso) return "";                             
    const fecha = new Date(fechaIso.replace(" ", "T"));   
    if (isNaN(fecha.getTime())) return fechaIso;          
    return fecha.toLocaleDateString("es-ES", {            
      day: "numeric",                                     
    month: "long",                                      
    year: "numeric",                                    
  });                                                   
}  

function SolicitudCard({
  item,
  onPress,
}: {
  item: Solicitud;
  onPress: () => void;
}) {
  const badge = estadoStyles[item.estado];
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={28} color={COLORS.textGray} />
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.perfiles.nombre_completo}</Text>
        <Text style={styles.cardProject}>{item.proyecto}</Text>
        <Text style={styles.cardDate}>{formatearFecha(item.fecha_solicitud)}</Text>
      </View>

      <View style={styles.cardRight}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>
            {item.estado}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={COLORS.textGray}
          style={{ marginTop: 8 }}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function SolicitudesProfesional() {
  const router = useRouter();
  const [filtroActivo, setFiltroActivo] = useState<Filtro>("todas");

  const [items, setItems] = useState<Solicitud[]>([]);
  const [nombreCliente, setNombreCliente] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  /*const solicitudesFiltradas = useMemo(() => {
    if (filtroActivo === "Todas") return items;
    const mapa: Record<Exclude<Filtro, "Todas">, EstadoSolicitud> = {
      Pendientes: "Pendiente",
      Aceptadas: "Aceptada",
      Rechazadas: "Rechazada",
    };
    return items.filter((s) => s.estado === mapa[filtroActivo]);
  }, [filtroActivo]);*/

  const solicitudesMostrar = useMemo(() => {
    if (filtroActivo === "todas") return items;
    const mapa: Record<Exclude<Filtro, "todas">, EstadoSolicitud> = {
      pendientes: "pendiente",
      aceptadas: "aceptada",
      rechazadas: "rechazada",
    };
    return items.filter((s) => s.estado === mapa[filtroActivo]);
  }, [filtroActivo]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [router])
  );

  async function fetchData() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("solicitudes_servicio").select("*, perfiles (nombre_completo)");

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error obteniendo datos:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Solicitudes",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.primaryBlue },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      <View style={styles.body}>
        <Text style={styles.title}>Solicitudes recibidas</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTROS.map((f) => {
            const activo = f === filtroActivo;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, activo && styles.chipActive]}
                onPress={() => setFiltroActivo(f)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    activo && styles.chipTextActive,
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <FlatList
          data={solicitudesMostrar}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SolicitudCard
              item={item}
              onPress={() =>
                router.push({
                  pathname: "/(profesional)/solicitudDetalle",
                  params: { id: item.id },
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background},
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 14,
  },
  filtersScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 6,
    height: 40,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.chipInactive,
  },
  chipActive: {
    backgroundColor: COLORS.primaryBlue,
  },
  chipText: {
    color: COLORS.textGray,
    fontWeight: "600",
    fontSize: 13,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  listContent: { paddingBottom: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.avatarBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 2,
  },
  cardProject: {
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  cardRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
