import { supabase } from "@/lib/supabase";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: perfil } = await supabase
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
      {/* 
          No necesitamos Stack.Screen ni StatusBar aquí, 
          ya que el (admin)/_layout.tsx se encarga de eso.
      */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* --- SECCIÓN DE BIENVENIDA --- */}
        <View style={styles.welcomeSection}>
          <View style={styles.avatarContainer}>
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

        {/* Tarjeta: Gestionar Usuarios -> Navega a la Tab de Usuarios */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push("/(admin)/usuarios")}
        >
          <View style={styles.cardIconContainer}>
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

        {/* Tarjeta: Gestionar Categorías -> Navega a la Tab de Categorías */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push("/(admin)/categorias")}
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

        {/* Tarjeta: Perfil -> Navega a la Tab de Perfil */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push("/(admin)/perfil")}
        >
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
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F9FAFB" },
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
    backgroundColor: "#FDE08D",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EBB934",
  },
  welcomeTextContainer: { flex: 1 },
  welcomeTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  welcomeSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginBottom: 25 },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E5", // Crema de tu imagen
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2, // Sombra suave en Android
    shadowColor: "#000", // Sombra en iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1A3B63" },
  cardSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
});
