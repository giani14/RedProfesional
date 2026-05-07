import { supabase } from "@/lib/supabase";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeAdminScreen() {
  const router = useRouter();
  const [nombreAdmin, setNombreAdmin] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      // 1. Obtenemos el usuario actual de la sesión
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 2. Buscamos el nombre en tu tabla 'perfiles'
        const { data: perfil, error } = await supabase
          .from("perfiles")
          .select("nombre_completo")
          .eq("id", user.id)
          .single();

        if (perfil) {
          setNombreAdmin(perfil.nombre_completo);
        }
      }
    } catch (error) {
      console.log("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* StatusBar integrada con el Header azul */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1A3B63"
        translucent={true}
      />
      <View style={styles.safeAreaSpacing} />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Text style={styles.logoRed}>Red</Text>
          <Text style={styles.logoProfesional}>Profesional</Text>
        </View>

        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications" size={24} color="white" />
          {/* Punto de notificación opcional */}
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* --- SECCIÓN DE BIENVENIDA --- */}
        <View style={styles.welcomeSection}>
          <View style={styles.avatarContainer}>
            {/* Imagen de avatar circular (replicando el estilo de la imagen) */}
            <View style={styles.avatarCircle}>
              <FontAwesome5 name="user-tie" size={40} color="#1A3B63" />
            </View>
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>
              {loading ? (
                <ActivityIndicator size="small" color="#1A3B63" />
              ) : (
                `¡Bienvenido Administrador ${nombreAdmin}!`
              )}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Gestiona los usuarios y categorías de la plataforma.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- PANEL DE ADMINISTRACIÓN --- */}
        <Text style={styles.panelTitle}>Panel de administración</Text>

        {/* Tarjeta: Gestionar Usuarios */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push("/HU-23/gestionarUsuarios")}
        >
          <View style={[styles.cardIconContainer]}>
            <MaterialCommunityIcons
              name="account-group"
              size={32}
              color="#1A3B63"
            />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Gestionar usuarios</Text>
            <Text style={styles.cardSubtitle}>
              Ver, buscar y administrar cuentas
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#1A3B63" />
        </TouchableOpacity>

        {/* Tarjeta: Gestionar Categorías */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push("/HU-25/categorias")}
        >
          <View style={styles.cardIconContainer}>
            <Ionicons name="folder" size={32} color="#EBB934" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Gestionar categorías</Text>
            <Text style={styles.cardSubtitle}>Administrar especialidades</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#1A3B63" />
        </TouchableOpacity>

        {/* Tarjeta: Editar datos personales */}
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
          <View style={styles.cardIconContainer}>
            <Ionicons name="person-circle-outline" size={32} color="#1A3B63" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Editar datos personales</Text>
            <Text style={styles.cardSubtitle}>Actualizar tu información</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#1A3B63" />
        </TouchableOpacity>
      </ScrollView>

      {/* --- TAB BAR INFERIOR (Simulado según imagen) --- */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={24} color="#3878B3" />
          <Text style={[styles.tabText, { color: "#3878B3" }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/HU-23/gestionarUsuarios")}
        >
          <Ionicons name="people-outline" size={24} color="#777" />
          <Text style={styles.tabText}>Usuarios</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/HU-25/categorias")}
        >
          <Ionicons name="folder-outline" size={24} color="#777" />
          <Text style={styles.tabText}>Categorías</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color="#777" />
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  safeAreaSpacing: {
    height: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#1A3B63",
  },
  header: {
    height: 70,
    backgroundColor: "#1A3B63",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerIcon: { padding: 5, position: "relative" },
  notificationDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    backgroundColor: "white",
    borderRadius: 4,
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logoRed: { fontSize: 22, fontWeight: "bold", color: "#D85C31" },
  logoProfesional: { fontSize: 22, fontWeight: "bold", color: "white" },
  content: { flex: 1, paddingHorizontal: 20 },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 25,
  },
  avatarContainer: { marginRight: 15 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FDE08D", // Amarillo suave de la imagen
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EBB934",
  },
  welcomeTextContainer: { flex: 1 },
  welcomeTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  welcomeSubtitle: { fontSize: 14, color: "#777", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#E0E0E0", marginBottom: 25 },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCEFC7", // Color crema/amarillo muy claro de las tarjetas
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F9E4B0",
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1A3B63" },
  cardSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },
  // Estilos de la barra inferior
  tabBar: {
    height: 70,
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingBottom: 5,
  },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabText: { fontSize: 12, marginTop: 4, color: "#777" },
});
