import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 60) / 2;
const DRAWER_WIDTH = width * 0.78;

// Accesos del menú lateral: replican la barra inferior + opciones adicionales
const MENU_ITEMS: {
  icon: any;
  label: string;
  route: string;
}[] = [
  { icon: "home-outline", label: "Inicio", route: "/(profesional)" },
  { icon: "briefcase-outline", label: "Proyectos", route: "/(profesional)/proyecto" },
  { icon: "copy-outline", label: "Solicitudes", route: "/(profesional)/solicitudes" },
  { icon: "chatbubble-outline", label: "Mensajes", route: "/(profesional)/mensajes" },
  { icon: "person-outline", label: "Perfil", route: "/(profesional)/perfil" },
  { icon: "help-circle-outline", label: "Centro de ayuda", route: "/(profesional)/centroDeAyuda" },
  { icon: "shield-checkmark-outline", label: "Privacidad", route: "/(profesional)/privacidad" },
];

const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  white: "#FFFFFF",
  textGray: "#6B7280",
  textDark: "#1F2937",
  cardBlue: "#DBEAFE",
  cardYellow: "#FEF3C7",
  cardGreen: "#DCFCE7",
  cardPurple: "#F3E8FF",
  danger: "#DC2626",
};

interface QuickAccessProps {
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

function QuickAccessCard({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: QuickAccessProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardIconCircle}>
        <Ionicons name={icon} size={28} color={COLORS.primaryBlue} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

export default function ProfesionalIndex() {
  const [loading, setLoading] = useState(true);
  const [tieneAvisosNuevos, setTieneAvisosNuevos] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userData, setUserData] = useState<{
    nombre: string;
    rol: string;
    avatar_url?: string;
  } | null>(null);

  // Posición horizontal del panel lateral (oculto a la izquierda por defecto)
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    fetchUserProfile();
    validarNotificacionesPendientes();
  }, []);

  const abrirMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const cerrarMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const navegarDesdeMenu = (route: string) => {
    cerrarMenu();
    // Pequeña espera para que la animación de cierre se perciba antes de navegar
    setTimeout(() => router.push(route as any), 180);
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("perfiles")
          .select("nombre_completo, rol, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setUserData({
          nombre: data?.nombre_completo || "Profesional",
          rol: data?.rol || "Profesional",
          avatar_url: data?.avatar_url,
        });
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  // Consulta ligera para ver si existen filas sin leer dirigidas a este usuario
  const validarNotificacionesPendientes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { count, error } = await supabase
          .from("notificaciones")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", user.id)
          .eq("leido", false);

        if (!error && count !== null) {
          setTieneAvisosNuevos(count > 0);
        }
      }
    } catch (err) {
      console.log("Error leyendo estado de campana:", err);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Menú lateral deslizable (drawer) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={cerrarMenu}
        statusBarTranslucent
      >
        <View style={styles.drawerOverlay}>
          {/* Zona oscura: al tocar fuera se cierra el menú */}
          <Pressable style={styles.drawerBackdrop} onPress={cerrarMenu} />

          <Animated.View
            style={[
              styles.drawerPanel,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* Cabecera del menú con datos del profesional */}
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
                {userData?.nombre || "Profesional"}
              </Text>
              <View style={styles.drawerRoleBadge}>
                <Text style={styles.drawerRoleText}>
                  {userData?.rol || "Profesional"}
                </Text>
              </View>
            </View>

            {/* Opciones de navegación */}
            <ScrollView contentContainerStyle={styles.drawerItems}>
              {MENU_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.drawerItem}
                  activeOpacity={0.7}
                  onPress={() => navegarDesdeMenu(item.route)}
                >
                  <View style={styles.drawerItemIcon}>
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={COLORS.primaryBlue}
                    />
                  </View>
                  <Text style={styles.drawerItemLabel}>{item.label}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Header con Menu y Notificaciones Activas */}
      <View style={styles.header}>
        <TouchableOpacity onPress={abrirMenu}>
          <Ionicons name="menu" size={30} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>
          Red<Text style={{ color: COLORS.accentGold }}>Profesional</Text>
        </Text>

        {/* Campana Enlazada a la HU-18 del Profesional */}
        <TouchableOpacity
          style={styles.notifButton}
          onPress={() => {
            setTieneAvisosNuevos(false); // Limpieza visual inmediata
            router.push("/HU-17/notificacionProfesional" as any);
          }}
        >
          <Ionicons
            name="notifications-outline"
            size={28}
            color={COLORS.white}
          />
          {tieneAvisosNuevos && <View style={styles.badgeAlerta} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Perfil del Profesional */}
        <View style={styles.welcomeSection}>
          {userData?.avatar_url ? (
            <Image
              source={{ uri: userData.avatar_url }}
              style={styles.mainAvatar}
            />
          ) : (
            <View style={[styles.mainAvatar, styles.initialsContainer]}>
              <Text style={styles.initialsText}>
                {getInitials(userData?.nombre || "")}
              </Text>
            </View>
          )}

          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>
              ¡Bienvenido,{"\n"}
              {userData?.nombre?.split(" ")[0]}!
            </Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {userData?.rol || "Profesional"}
              </Text>
            </View>

            <Text style={styles.welcomeSubtitle}>
              Administra tus trabajos, revisa tus disputas y asegura tus cobros.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Accesos rápidos</Text>

        <View style={styles.gridContainer}>
          <QuickAccessCard
            icon="person-outline"
            title="Mi perfil"
            subtitle="Edita tus datos y habilidades"
            color={COLORS.cardBlue}
            onPress={() => router.push("/(profesional)/perfil")}
          />
          <QuickAccessCard
            icon="document-text-outline"
            title="Mis proyectos"
            subtitle="Administra tus proyectos"
            color={COLORS.cardYellow}
            onPress={() => router.push("/(profesional)/proyecto")}
          />
          <QuickAccessCard
            icon="cloud-upload-outline"
            title="Subir portafolio"
            subtitle="Agrega trabajos realizados"
            color={COLORS.cardYellow}
            onPress={() => router.push("/HU-09/subirPortafolio" as any)}
          />

          <QuickAccessCard
            icon="create-outline"
            title="Editar portafolio"
            subtitle="Modifica o elimina trabajos"
            color={COLORS.cardBlue}
            onPress={() => router.push("/HU-10/editarPortafolio" as any)}
          />

          <QuickAccessCard
            icon="chatbubble-outline"
            title="Mensajes"
            subtitle="Comunícate con clientes"
            color={COLORS.cardPurple}
            onPress={() => router.push("/(profesional)/mensajes")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  loadingWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: COLORS.primaryBlue,
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  headerLogo: { color: "white", fontSize: 22, fontWeight: "bold" },
  notifButton: { position: "relative", padding: 4 },
  badgeAlerta: {
    position: "absolute",
    right: 4,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBlue,
  },
  scrollContent: { paddingBottom: 100 },
  welcomeSection: {
    flexDirection: "row",
    padding: 25,
    alignItems: "center",
  },
  mainAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  initialsContainer: {
    backgroundColor: "#1A4670",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },
  initialsText: {
    color: "#FFFFFF",
    fontSize: 40, // Bajado ligeramente de 60 para evitar cortes en iniciales dobles
    fontWeight: "bold",
    textAlign: "center",
  },
  welcomeTextContainer: { flex: 1, marginLeft: 20 },
  welcomeTitle: { fontSize: 22, fontWeight: "bold", color: COLORS.textDark },
  welcomeSubtitle: { fontSize: 13, color: COLORS.textGray, marginTop: 5 },
  roleBadge: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  roleText: { color: COLORS.primaryBlue, fontWeight: "bold", fontSize: 11 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginHorizontal: 25,
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  card: {
    width: COLUMN_WIDTH,
    height: 180,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIconCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textDark,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 11,
    color: COLORS.textGray,
    textAlign: "center",
    marginTop: 5,
  },
  // ----- Menú lateral (drawer) -----
  drawerOverlay: { flex: 1, flexDirection: "row" },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  drawerPanel: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: COLORS.white,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  drawerHeader: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  drawerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  drawerInitials: {
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  drawerInitialsText: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "bold",
  },
  drawerName: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  drawerRoleBadge: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  drawerRoleText: {
    color: COLORS.primaryBlue,
    fontWeight: "bold",
    fontSize: 11,
  },
  drawerItems: { paddingVertical: 10 },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  drawerItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.cardBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  drawerItemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
  },
});
