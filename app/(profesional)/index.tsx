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
};

interface QuickAccessProps {
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

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
  const [userData, setUserData] = useState<{
    nombre: string;
    rol: string;
    avatar_url?: string;
  } | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUserProfile();
  }, []);

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

  const getInitials = (name: string) => {
    if (!name) return "U"; // 'U' de Usuario por defecto
    const parts = name.trim().split(/\s+/); // Divide por cualquier espacio
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

      {/* Header con Menu y Notificaciones */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu}>
          <Ionicons name="menu" size={30} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>
          Red<Text style={{ color: COLORS.accentGold }}>Profesional</Text>
        </Text>
        <TouchableOpacity onPress={() => router.push("/HU-20" as any)}>
          <Ionicons
            name="notifications-outline"
            size={28}
            color={COLORS.white}
          />
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
            /* Círculo de iniciales estilizado según la imagen */
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
              <Text style={styles.roleText}>{userData?.rol || "Cliente"}</Text>
            </View>

            <Text style={styles.welcomeSubtitle}>
              Encuentra profesionales calificados para tus proyectos.
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
            icon="search-outline"
            title="Buscar clientes"
            subtitle="Encuentra oportunidades"
            color={COLORS.cardGreen}
            onPress={() => {}}
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
            style={[
              styles.drawer,
              { transform: [{ translateX: slideAnim }] },
            ]}
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
    //backgroundColor: COLORS.white,
  },
  initialsContainer: {
    backgroundColor: "#1A4670", // El azul marino del ejemplo
    justifyContent: "center", // Centrado vertical
    alignItems: "center", // Centrado horizontal
    borderRadius: 60,
  },
  initialsText: {
    color: "#FFFFFF", // Texto blanco
    fontSize: 60, // Tamaño grande para que sea bold
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
    borderTopColor: "#E5E7EB",
    paddingVertical: 8,
    paddingBottom: 30,
  },
});
