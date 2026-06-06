import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 60) / 2;

const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  white: "#FFFFFF",
  textGray: "#6B7280",
  textDark: "#1F2937",
  // Colores de las tarjetas (Pasteles)
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

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    nombre: string;
    rol: string;
    avatar_url?: string;
  } | null>(null);
  // Pon esto dentro de tu función SolicitudDetalle, antes del return:
  const tieneNotificaciones = false;

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
        if (data) {
          setUserData({
            nombre: data.nombre_completo || "Usuario",
            rol: data.rol || "Cliente",
            avatar_url: data.avatar_url,
          });
        }
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name || name === "Usuario") return "U";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
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

      {/* Header Estilo Imagen */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={30} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>
          Red<Text style={{ color: COLORS.accentGold }}>Profesional</Text>
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/HU-17/notificacionCliente")}
        >
          <Ionicons
            name="notifications-outline"
            size={28}
            color={COLORS.white}
          />
          {/* Punto rojo si hay notificaciones sin leer */}
          {tieneNotificaciones && <View style={styles.notifDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sección de Bienvenida */}
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
              ¡Bienvenido, {userData?.nombre?.split(" ")[0] || "Lu"}!
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userData?.rol}</Text>
            </View>
            <Text style={styles.welcomeSubtitle}>
              Encuentra profesionales calificados para tus proyectos.
            </Text>
          </View>
        </View>

        {/* Accesos Rápidos Grid */}
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>

        <View style={styles.gridContainer}>
          <QuickAccessCard
            icon="person-outline"
            title="Mi perfil"
            subtitle="Edita tus datos y preferencias"
            color={COLORS.cardBlue}
            onPress={() => router.push("/(cliente)/perfil")}
          />
          <QuickAccessCard
            icon="briefcase-outline"
            title="Mis pedidos"
            subtitle="Administra tus solicitudes"
            color={COLORS.cardYellow}
            onPress={() => router.push("/(cliente)/mensajes")}
          />
          <QuickAccessCard
            icon="search-outline"
            title="Buscar profesional"
            subtitle="Encuentra expertos ahora"
            color={COLORS.cardGreen}
            onPress={() => router.push("/(cliente)/buscar")}
          />
          <QuickAccessCard
            icon="chatbubble-outline"
            title="Mensajes"
            subtitle="Comunícate con expertos"
            color={COLORS.cardPurple}
            onPress={() => router.push("/(cliente)/mensajes")}
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
    backgroundColor: COLORS.white,
  },
  initialsContainer: {
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  initialsText: { color: COLORS.white, fontSize: 35, fontWeight: "bold" },
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
  roleText: { color: COLORS.primaryBlue, fontWeight: "bold", fontSize: 12 },
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
    // Sombra sutil
    elevation: 2,
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
  notifDot: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#EAB308", // Dorado como tus colores principales
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primaryBlue,
  },
});
