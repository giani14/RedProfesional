import { supabase } from "@/lib/supabase";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    nombre: "",
    email: "",
    rol: "Administrador",
  });
  const [loading, setLoading] = useState(true);

  // Estadísticas simuladas para el Admin
  const stats = [
    { label: "Usuarios", value: "124" },
    { label: "Reportes", value: "5" },
    { label: "Soporte", value: "12" },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: perfil, error } = await supabase
          .from("perfiles")
          .select("nombre_completo")
          .eq("id", user.id)
          .single();

        if (perfil) {
          setProfile({
            nombre: perfil.nombre_completo,
            email: user.email || "",
            rol: "Administrador del Sistema",
          });
        }
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir del sistema?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive", // En iOS esto pone el texto en rojo
          onPress: async () => {
            try {
              // 1. Cerramos sesión en Supabase (Limpia el token local)
              const { error } = await supabase.auth.signOut();

              if (error) {
                Alert.alert(
                  "Error",
                  "No se pudo cerrar la sesión correctamente.",
                );
                return;
              }

              // 2. Forzamos la redirección a tu archivo de login específico
              // Usamos replace para que el usuario no pueda volver atrás con el botón del celular
              router.replace("/HU-02/login");

              // 3. Opcional: Un mensaje de confirmación (Toast o Alert)
              console.log("Sesión cerrada exitosamente");
            } catch (err) {
              console.error("Error inesperado al salir:", err);
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A4670" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* --- CABECERA DE PERFIL --- */}
      <View style={styles.headerCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <FontAwesome5 name="user-shield" size={50} color="#1A4670" />
          </View>
        </View>

        <Text style={styles.userName}>{profile.nombre}</Text>
        <Text style={styles.userRole}>{profile.rol}</Text>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Admin Nivel 1</Text>
        </View>
      </View>

      {/* --- ESTADÍSTICAS RÁPIDAS --- */}
      <View style={styles.statsContainer}>
        {stats.map((item, index) => (
          <View key={index} style={styles.statBox}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* --- OPCIONES DE ADMINISTRADOR --- */}
      <View style={styles.optionsContainer}>
        <OptionItem
          icon="person-outline"
          label="Mi perfil"
          onPress={() => {}}
          highlight
        />
        <OptionItem
          icon="shield-checkmark-outline"
          label="Logs del sistema"
          onPress={() => {}}
        />
        <OptionItem
          icon="notifications-outline"
          label="Notificaciones globales"
          onPress={() => {}}
        />
        <OptionItem
          icon="settings-outline"
          label="Configuración técnica"
          onPress={() => {}}
        />
        <OptionItem
          icon="help-circle-outline"
          label="Ayuda y Soporte"
          onPress={() => {}}
        />
        <OptionItem
          icon="log-out-outline"
          label="Cerrar sesión"
          onPress={handleSignOut}
          isLast
          color="#D32F2F"
        />
      </View>
    </ScrollView>
  );
}

// 1. Definimos los tipos de las propiedades
interface OptionItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  highlight?: boolean;
  isLast?: boolean;
  color?: string;
}

// 2. Aplicamos la interfaz a la función
function OptionItem({
  icon,
  label,
  onPress,
  highlight = false,
  isLast = false,
  color = "#1A4670",
}: OptionItemProps) {
  // <--- Aquí le asignamos la interfaz
  return (
    <TouchableOpacity
      style={[
        styles.optionRow,
        highlight && styles.highlightedRow,
        !isLast && styles.borderBottom,
      ]}
      onPress={onPress}
    >
      <View style={styles.optionLeft}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text
          style={[
            styles.optionLabel,
            { color: color === "#1A4670" ? "#333" : color },
          ]}
        >
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#FFF",
  },
  avatarWrapper: {
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#1A4670",
  },
  userName: { fontSize: 22, fontWeight: "bold", color: "#1A4670" },
  userRole: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  badgeContainer: {
    marginTop: 10,
    backgroundColor: "#FDE08D",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: "bold", color: "#856404" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#1A4670" },
  statLabel: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  optionsContainer: { paddingHorizontal: 20, marginTop: 10 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 15,
  },
  highlightedRow: {
    backgroundColor: "#FCEFC7", // Color crema de la imagen
    borderRadius: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionLeft: { flexDirection: "row", alignItems: "center" },
  optionLabel: { marginLeft: 15, fontSize: 16, fontWeight: "500" },
});
