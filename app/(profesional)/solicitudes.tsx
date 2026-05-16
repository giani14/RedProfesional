import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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
  background: "#F8FAFC", // Un gris más limpio como la imagen
  textDark: "#1E293B",
  textGray: "#64748B",
  chipInactive: "#F1F5F9",
  borderLight: "#E2E8F0",
  pendingBg: "#FEF3C7",
  pendingText: "#D97706",
  acceptedBg: "#DCFCE7",
  acceptedText: "#15803D",
  rejectedBg: "#FEE2E2",
  rejectedText: "#B91C1C",
};

type EstadoSolicitud = "pendiente" | "aceptada" | "rechazada";

interface Solicitud {
  id: string;
  estado: EstadoSolicitud;
  fecha_solicitud: string;
  proyecto: string;
  perfiles: {
    nombre_completo: string;
    avatar_url?: string;
  };
}

const FILTROS = ["Todas", "Pendientes", "Aceptadas", "Rechazadas"] as const;
type Filtro = (typeof FILTROS)[number];

const estadoStyles: Record<
  EstadoSolicitud,
  { bg: string; color: string; label: string }
> = {
  pendiente: {
    bg: COLORS.pendingBg,
    color: COLORS.pendingText,
    label: "Pendiente",
  },
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
};

function formatearFecha(fechaIso: string): string {
  if (!fechaIso) return "";
  const fecha = new Date(fechaIso);
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

  // SOLUCIÓN: Usamos un estado para la imagen. Empezamos con una imagen por defecto
  const [imageUri, setImageUri] = useState<string>(
    "https://via.placeholder.com/150/F1F5F9/94A3B8?text=%20",
  ); // Un placeholder gris limpio

  useEffect(() => {
    // Si la base de datos nos da una URL real, actualizamos el estado
    if (
      item.perfiles.avatar_url &&
      item.perfiles.avatar_url.startsWith("http")
    ) {
      setImageUri(item.perfiles.avatar_url);
    }
  }, [item.perfiles.avatar_url]);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      {/* 1. Contenedor del Avatar - SIEMPRE presente y alineado */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.avatarImg}
          onError={() => {
            // Si la URL real falla, volvemos a poner el placeholder para no romper el diseño
            setImageUri(
              "https://via.placeholder.com/150/F1F5F9/94A3B8?text=%20",
            );
          }}
        />

        {/* Si la URL es la por defecto, mostramos el icono de persona encima para que se vea igual a los otros */}
        {imageUri.includes("via.placeholder.com") && (
          <View style={styles.iconOverlay}>
            <Ionicons name="person" size={24} color="#94A3B8" />
          </View>
        )}
      </View>

      {/* 2. Contenedor de Información (Central) */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.perfiles.nombre_completo}
        </Text>
        <Text style={styles.cardProject} numberOfLines={1}>
          {item.proyecto}
        </Text>
        <Text style={styles.cardDate}>
          {formatearFecha(item.fecha_solicitud)}
        </Text>
      </View>

      {/* 3. Contenedor Derecho (Badge y Flecha) */}
      <View style={styles.cardRight}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>
            {badge.label}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#94A3B8"
          style={{ marginTop: 8 }}
        />
      </View>
    </TouchableOpacity>
  );
}
export default function SolicitudesProfesional() {
  const router = useRouter();
  const [filtroActivo, setFiltroActivo] = useState<Filtro>("Todas");
  const [items, setItems] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const solicitudesMostrar = useMemo(() => {
    if (filtroActivo === "Todas") return items;
    const mapa: Record<string, EstadoSolicitud> = {
      Pendientes: "pendiente",
      Aceptadas: "aceptada",
      Rechazadas: "rechazada",
    };
    return items.filter((s) => s.estado === mapa[filtroActivo]);
  }, [filtroActivo, items]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  async function fetchData() {
    try {
      setIsLoading(true);
      const { data, error } = (await supabase
        .from("solicitudes_servicio")
        .select(
          "id, estado, fecha_solicitud, proyecto, perfiles(nombre_completo, avatar_url)",
        )
        .order("fecha_solicitud", { ascending: false })) as unknown as {
        data: Solicitud[];
        error: any;
      };

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header (Como en la imagen) */}
      <View style={styles.customHeader}>
        <TouchableOpacity>
          <Ionicons name="menu-outline" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>RedProfesional</Text>
        <TouchableOpacity>
          <Ionicons
            name="notifications-outline"
            size={26}
            color={COLORS.white}
          />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Solicitudes recibidas</Text>

        <View style={{ height: 50, marginBottom: 10 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {FILTROS.map((f) => {
              const activo = f === filtroActivo;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, activo && styles.chipActive]}
                  onPress={() => setFiltroActivo(f)}
                >
                  <Text
                    style={[styles.chipText, activo && styles.chipTextActive]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primaryBlue}
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={solicitudesMostrar}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SolicitudCard
                item={item}
                onPress={() =>
                  router.push({
                    pathname: "/HU-18/solicitudDetalle",
                    params: { id: item.id },
                  })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  customHeader: {
    backgroundColor: COLORS.primaryBlue,
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerLogo: { color: "white", fontSize: 20, fontWeight: "bold" },
  notifDot: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#EAB308",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primaryBlue,
  },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 20,
  },
  filtersRow: { flexDirection: "row", gap: 10, paddingRight: 20 },
  chip: {
    paddingHorizontal: 20,
    height: 38,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  chipActive: { backgroundColor: "#1E293B", borderColor: "#1E293B" },
  chipText: { color: "#64748B", fontWeight: "600", fontSize: 14 },
  chipTextActive: { color: COLORS.white },
  listContent: { paddingBottom: 20, paddingTop: 10 },
  //bmñkbnxñn
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16, // Aseguramos el padding horizontal
    paddingVertical: 12, // Aseguramos el padding vertical
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    height: 100, // Fijamos la altura para uniformidad total
  },
  avatarContainer: {
    // CLAVE: Un contenedor rígido para el alineamiento perfecto
    width: 55,
    height: 55,
    marginRight: 15, // Espacio generoso antes del texto
    position: "relative",
  },
  avatarImg: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#F1F5F9", // Fondo gris de respaldo
  },
  iconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Asegura que el icono esté encima
  },
  cardInfo: {
    flex: 1,
    justifyContent: "center",
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A4670",
    marginBottom: 2,
  },
  cardProject: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  cardDate: { fontSize: 12, color: "#64748B" },
  cardRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 10, // Espacio antes del badge
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "bold" },
});
