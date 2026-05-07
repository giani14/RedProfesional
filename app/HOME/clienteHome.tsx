import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
//import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

// 1. Definición de Colores
const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  white: "#FFFFFF",
  textGray: "#6B7280",
  cardBlue: "#DBEAFE",
  cardYellow: "#FEF3C7",
  cardGreen: "#D1FAE5",
  cardPurple: "#EDE9FE",
};

// 2. Interfaces para TypeScript (Fuera de las funciones)
interface MenuCardProps {
  title: string;
  desc: string;
  icon: any;
  bgColor: string;
  iconColor: string;
  isFontAwesome?: boolean;
  onPress?: () => void;
}

interface TabItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onPress?: () => void;
}

// 3. Componentes de apoyo corregidos
function MenuCard({
  title,
  desc,
  icon,
  bgColor,
  iconColor,
  isFontAwesome = false,
  onPress,
}: MenuCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bgColor }]}
      onPress={onPress}
    >
      <View style={styles.iconCircle}>
        {isFontAwesome ? (
          <FontAwesome5 name={icon} size={22} color={iconColor} />
        ) : (
          <Ionicons name={icon} size={26} color={iconColor} />
        )}
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

// Actualiza TabItem
function TabItem({ icon, label, active = false, onPress }: TabItemProps) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={active ? "#2563EB" : "#9CA3AF"} />
      <Text style={[styles.tabLabel, active && { color: "#2563EB" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// 4. Pantalla Principal
export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    nombre: string;
    rol: string;
  } | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // 4. Obtener el ID del usuario actual de la sesión
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 5. Consultar los datos en la tabla 'perfiles'
        const { data, error } = await supabase
          .from("perfiles")
          .select("nombre_completo, rol")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserData({
            nombre: data.nombre_completo,
            rol: data.rol,
          });
        }
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga mientras obtiene los datos
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Superior */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>
          Red<Text style={{ color: COLORS.accentGold }}>Profesional</Text>
        </Text>
        <TouchableOpacity>
          <Ionicons
            name="notifications-outline"
            size={26}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Perfil del Usuario */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>
              ¡Bienvenido, {userData?.nombre || "Usuario"}!
            </Text>

            <View
              style={[
                styles.roleBadge,
                userData?.rol === "Cliente" && { backgroundColor: "#E1E9F4" },
              ]}
            >
              <Text style={styles.roleText}>{userData?.rol || "Sin rol"}</Text>
            </View>

            <Text style={styles.descriptionText}>
              {userData?.rol === "Cliente"
                ? "Encuentra a los mejores profesionales para tus proyectos."
                : "Gestiona tu perfil y ofrece tus servicios a clientes."}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Accesos rápidos</Text>

        {/* Grid de Tarjetas */}
        <View style={styles.grid}>
          <View style={styles.row}>
            <MenuCard
              title="Mi perfil"
              desc="Edita tus datos y habilidades"
              icon="briefcase"
              bgColor={COLORS.cardBlue}
              iconColor="#1E40AF"
              onPress={() => router.push("./clientePerfil")}
            />
            <MenuCard
              title="Mis proyectos"
              desc="Administra tus proyectos"
              icon="file-alt"
              bgColor={COLORS.cardYellow}
              iconColor="#92400E"
              isFontAwesome
            />
          </View>

          <View style={styles.row}>
            <MenuCard
              title={
                userData?.rol === "Cliente"
                  ? "Buscar expertos"
                  : "Buscar clientes"
              }
              desc="Encuentra oportunidades"
              icon="search"
              bgColor={COLORS.cardGreen}
              iconColor="#065F46"
            />
            <MenuCard
              title="Mensajes"
              desc="Comunícate con otros"
              icon="chatbubble-outline"
              bgColor={COLORS.cardPurple}
              iconColor="#5B21B6"
            />
          </View>
        </View>
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={styles.bottomTab}>
        <TabItem icon="home" label="Inicio" active />
        <TabItem icon="folder-outline" label="Proyectos" />
        <TabItem icon="chatbox-outline" label="Mensajes" />
        <TabItem
          icon="person-outline"
          label="Perfil"
          onPress={() => router.push("./clientePerfil")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
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
  scrollContent: { padding: 20, paddingBottom: 100 },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: { width: 85, height: 85, borderRadius: 42.5, marginRight: 15 },
  profileInfo: { flex: 1 },
  welcomeText: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  roleBadge: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginVertical: 4,
  },
  roleText: { color: COLORS.primaryBlue, fontWeight: "bold", fontSize: 12 },
  descriptionText: { color: COLORS.textGray, fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  grid: { width: "100%" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  card: {
    width: "48%",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    height: 160,
    justifyContent: "center",
  },
  iconCircle: { marginBottom: 10 },
  cardTitle: { fontWeight: "bold", fontSize: 15, color: "#1F2937" },
  cardDesc: {
    color: COLORS.textGray,
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  bottomTab: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    width: "100%",
  },
  tabItem: { flex: 1, alignItems: "center" },
  tabLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
});
