import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.78;

const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  white: "#FFFFFF",
  background: "#F8FAFC",
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

type EstadoSolicitud =
  | "pendiente"
  | "aceptada"
  | "rechazada"
  | "en_proceso"
  | "finalizado";

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

const formatearFecha = (fechaStr: string): string => {
  if (!fechaStr) return "Fecha pendiente";
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return "Fecha no válida";

  return fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

interface DrawerItemProps {
  icon: any;
  label: string;
  onPress: () => void;
  secondary?: boolean;
}

function DrawerItem({ icon, label, onPress, secondary }: DrawerItemProps) {
  return (
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={secondary ? 20 : 22}
        color={secondary ? COLORS.textGray : COLORS.primaryBlue}
      />
      <Text style={[styles.drawerLabel, secondary && styles.drawerLabelSecondary]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SolicitudCard({
  item,
  onPress,
}: {
  item: Solicitud;
  onPress: () => void;
}) {
  const estadoNormalizado = item.estado?.toLowerCase() || "pendiente";
  const badge = estadoStyles[estadoNormalizado] || estadoStyles["pendiente"];
  const [imageUri, setImageUri] = useState<string>(
    "https://via.placeholder.com/150/F1F5F9/94A3B8?text=%20",
  );

  useEffect(() => {
    if (item.perfiles?.avatar_url?.startsWith("http")) {
      setImageUri(item.perfiles.avatar_url);
    }
  }, [item.perfiles?.avatar_url]);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: imageUri }} style={styles.avatarImg} />
        {imageUri.includes("via.placeholder.com") && (
          <View style={styles.iconOverlay}>
            <Ionicons name="person" size={24} color="#94A3B8" />
          </View>
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.perfiles?.nombre_completo || "Cliente Requiriente"}
        </Text>
        <Text style={styles.cardProject} numberOfLines={1}>
          {item.proyecto || "Sin título"}
        </Text>
        <Text style={styles.cardDate}>
          {formatearFecha(item.fecha_solicitud)}
        </Text>
      </View>

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
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<{
    nombre: string;
    rol: string;
    avatar_url?: string;
  } | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
      callback?.();
    });
  };

  const navigateTo = (path: string) => {
    closeMenu(() => router.push(path as any));
  };

  const solicitudesMostrar = useMemo(() => {
    if (filtroActivo === "Todas") return items;

    if (filtroActivo === "Pendientes") {
      // Incluimos tanto 'pendiente' como 'revisando' para que no desaparezcan de la vista
      return items.filter(
        (s) =>
          s.estado?.toLowerCase() === "pendiente" ||
          s.estado?.toLowerCase() === "revisando",
      );
    }
    if (filtroActivo === "Rechazadas") {
      return items.filter((s) => s.estado?.toLowerCase() === "rechazada");
    }

    const mapa: Record<string, string> = {
      Aceptadas: "aceptada", // O "en_proceso" según tu lógica
      Rechazadas: "rechazada",
    };

    return items.filter((s) => s.estado?.toLowerCase() === mapa[filtroActivo]);
  }, [filtroActivo, items]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  async function fetchData() {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Datos del propio profesional para la cabecera del menú lateral
      const { data: perfilData } = await supabase
        .from("perfiles")
        .select("nombre_completo, rol, avatar_url")
        .eq("id", user.id)
        .single();
      if (perfilData) {
        setUserData({
          nombre: perfilData.nombre_completo || "Profesional",
          rol: perfilData.rol || "Profesional",
          avatar_url: perfilData.avatar_url,
        });
      }

      // FILTRO DE SEGURIDAD: Solo solicitudes dirigidas a MI ID como profesional
      const { data, error } = await supabase
        .from("solicitudes_servicio")
        .select(
          `
          id, 
          estado, 
          fecha_solicitud, 
          proyecto, 
          perfiles:cliente_id (nombre_completo, avatar_url)
        `,
        )
        .eq("profesional_id", user.id) // <--- Seguridad: Solo lo que me corresponde
        .order("fecha_solicitud", { ascending: false });

      if (error) throw error;
      setItems((data as any) || []);
    } catch (error: any) {
      console.error("Error:", error.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER AZUL (Igual a tu diseño) */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={openMenu}>
          <Ionicons name="menu-outline" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>RedProfesional</Text>
        <TouchableOpacity onPress={() => router.push("/HU-20" as any)}>
          <Ionicons name="notifications-outline" size={26} color="white" />
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

        {isLoading && !refreshing ? (
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
            // IMPLEMENTACIÓN DE RECARGA AL ARRASTRAR
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primaryBlue]}
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No tienes solicitudes pendientes.
              </Text>
            }
          />
        )}
      </View>

      {/* Menú lateral deslizable */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={() => closeMenu()}
      >
        <View style={styles.drawerOverlay}>
          <Animated.View style={[styles.drawerBackdrop, { opacity: fadeAnim }]}>
            <Pressable style={{ flex: 1 }} onPress={() => closeMenu()} />
          </Animated.View>

          <Animated.View
            style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
          >
            {/* Cabecera con foto, nombre y rol */}
            <View style={styles.drawerHeader}>
              {userData?.avatar_url ? (
                <Image
                  source={{ uri: userData.avatar_url }}
                  style={styles.drawerAvatar}
                />
              ) : (
                <View style={[styles.drawerAvatar, styles.drawerInitials]}>
                  <Text style={styles.drawerInitialsText}>
                    {getInitials(userData?.nombre || "")}
                  </Text>
                </View>
              )}
              <Text style={styles.drawerName} numberOfLines={1}>
                {userData?.nombre}
              </Text>
              <View style={styles.drawerRoleBadge}>
                <Text style={styles.drawerRoleText}>
                  {userData?.rol?.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Accesos principales */}
            <View style={styles.drawerMenu}>
              <DrawerItem
                icon="briefcase-outline"
                label="Proyectos"
                onPress={() => navigateTo("/(profesional)/proyecto")}
              />
              <DrawerItem
                icon="copy-outline"
                label="Solicitudes"
                onPress={() => navigateTo("/(profesional)/solicitudes")}
              />
              <DrawerItem
                icon="chatbubble-outline"
                label="Mensajes"
                onPress={() => navigateTo("/(profesional)/mensajes")}
              />
              <DrawerItem
                icon="person-outline"
                label="Perfil"
                onPress={() => navigateTo("/(profesional)/perfil")}
              />
            </View>

            {/* Accesos secundarios (menos notables) */}
            <View style={styles.drawerFooter}>
              <DrawerItem
                icon="help-circle-outline"
                label="Centro de ayuda"
                secondary
                onPress={() =>
                  navigateTo("/(profesional)/centro_de_ayuda/centroDeAyuda")
                }
              />
              <DrawerItem
                icon="shield-checkmark-outline"
                label="Privacidad"
                secondary
                onPress={() => navigateTo("/(profesional)/privacidad/privacidad")}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    height: 100,
  },
  avatarContainer: {
    width: 55,
    height: 55,
    marginRight: 15,
    position: "relative",
  },
  avatarImg: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#F1F5F9",
  },
  iconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cardInfo: { flex: 1, justifyContent: "center" },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A4670",
    marginBottom: 2,
  },
  cardProject: { fontSize: 14, color: "#475569", marginBottom: 4 },
  cardDate: { fontSize: 12, color: "#64748B" },
  cardRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 10,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "bold" },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: COLORS.textGray,
    fontSize: 14,
  },
  drawerOverlay: { flex: 1, flexDirection: "row" },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: COLORS.white,
    paddingTop: 50,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  drawerHeader: {
    alignItems: "center",
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primaryBlue,
  },
  drawerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  drawerInitials: {
    backgroundColor: "#13345A",
    justifyContent: "center",
    alignItems: "center",
  },
  drawerInitialsText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "bold",
  },
  drawerName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  drawerRoleBadge: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 8,
  },
  drawerRoleText: {
    color: COLORS.primaryBlue,
    fontWeight: "bold",
    fontSize: 11,
  },
  drawerMenu: { paddingTop: 10, flex: 1 },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  drawerLabel: {
    fontSize: 16,
    color: COLORS.textDark,
    marginLeft: 18,
    fontWeight: "600",
  },
  drawerLabelSecondary: {
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: "500",
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingVertical: 8,
    paddingBottom: 30,
  },
});
