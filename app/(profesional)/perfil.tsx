import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  accentGold: "#EAB308",
  white: "#FFFFFF",
  textGray: "#6B7280",
  lightGray: "#F3F4F6",
  borderGray: "#E5E7EB",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
};

interface StatItemProps {
  label: string;
  value: string | number;
}

interface MenuOptionProps {
  icon: any;
  label: string;
  onPress?: () => void;
  isLogout?: boolean;
}

const StatItem = ({ label, value }: StatItemProps) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuOption = ({ icon, label, onPress, isLogout }: MenuOptionProps) => (
  <TouchableOpacity
    style={[styles.menuOption, isLogout && styles.logoutOption]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuLeft}>
      <View
        style={[
          styles.iconBox,
          isLogout && { backgroundColor: COLORS.dangerLight },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={isLogout ? COLORS.danger : COLORS.primaryBlue}
        />
      </View>
      <Text
        style={[
          styles.menuLabel,
          isLogout && { color: COLORS.danger, fontWeight: "bold" },
        ]}
      >
        {label}
      </Text>
    </View>
    {!isLogout && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
  </TouchableOpacity>
);

export default function ClientePerfil() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    nombre: string;
    rol: string;
    avatar_url?: string;
    biografia?: string; // <--- AÑADE ESTA LÍNEA
    ubicacion?: string;
  } | null>(null);

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
          .select("nombre_completo, rol, avatar_url, ubicacion") // <--- Columna añadida
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setUserData({
          nombre: data.nombre_completo || "Usuario",
          rol: data.rol || "Cliente",
          avatar_url: data.avatar_url,
          biografia: "Profesional verificado", // <-- Pon un texto fijo temporal
          ubicacion: data?.ubicacion || "Cochabamba",
        });
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
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, cerrar sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            await AsyncStorage.clear();
            router.replace("/HU-02/login");
          } catch (error) {
            Alert.alert("Error", "No se pudo cerrar la sesión.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        <Text style={{ marginTop: 10, color: COLORS.primaryBlue }}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>
          Red<Text style={{ color: COLORS.accentGold }}>Profesional</Text>
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
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
            <TouchableOpacity style={styles.editPhotoBadge}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{userData?.nombre}</Text>
          <Text style={styles.userJob}>Profesional Verificado</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{userData?.rol?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatItem value="12" label="Pedidos" />
          <StatItem value="8" label="Contratos" />
          <StatItem value="4.9" label="Rating" />
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <MenuOption
            icon="person-outline"
            label="Mi perfil"
            onPress={() => router.push("/HU-04/miPerfil")}
          />
          <MenuOption
            icon="briefcase-outline"
            label="Mi perfil profesional"
            onPress={() => router.push("/HU-09/perfilProfe")}
          />
          {/*<MenuOption icon="card-outline" label="Métodos de pago" />*/}

          <Text style={styles.sectionTitle}>Soporte</Text>
          <MenuOption icon="help-circle-outline" label="Centro de ayuda" />
          <MenuOption icon="shield-checkmark-outline" label="Privacidad" />

          <View style={styles.divider} />

          <MenuOption
            icon="log-out"
            label="Cerrar sesión"
            isLogout
            onPress={handleLogout}
          />
          <Text style={styles.versionText}>Versión 1.0.4 - RedProfesional</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLogo: { color: "white", fontSize: 22, fontWeight: "bold" },
  scrollContent: { paddingBottom: 100 },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: COLORS.white,
  },
  avatarContainer: { position: "relative" },
  mainAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: COLORS.lightGray,
  },
  initialsContainer: {
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: "bold",
  },
  editPhotoBadge: {
    position: "absolute",
    bottom: 15,
    right: 5,
    backgroundColor: COLORS.primaryBlue,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    zIndex: 10,
  },
  userName: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  userJob: { fontSize: 14, color: COLORS.textGray, marginBottom: 10 },
  roleBadge: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: { color: COLORS.primaryBlue, fontWeight: "bold", fontSize: 12 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderGray,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  statLabel: { fontSize: 12, color: COLORS.textGray },
  menuContainer: { paddingHorizontal: 20, marginTop: 15 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.textGray,
    marginTop: 20,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 5,
  },
  logoutOption: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FED7D7",
    marginTop: 10,
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: { fontSize: 16, marginLeft: 15, color: "#374151" },
  divider: { height: 10 },
  versionText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 30,
  },
});
