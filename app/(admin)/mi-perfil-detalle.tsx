import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function MiPerfilDetalleScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ nombre: "", email: "", id: "" });

  useEffect(() => {
    async function getProfileDetails() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: perfil } = await supabase
            .from("perfiles")
            .select("nombre_completo")
            .eq("id", user.id)
            .single();

          setUserData({
            id: user.id,
            email: user.email || "",
            nombre: perfil?.nombre_completo || "Administrador",
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    getProfileDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A4670" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Información de Cuenta</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person-circle-outline" size={24} color="#1A4670" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <Text style={styles.value}>{userData.nombre}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={24} color="#1A4670" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <Text style={styles.value}>{userData.email}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="key-outline" size={24} color="#1A4670" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>ID de Usuario (Supabase)</Text>
            <Text style={styles.valueCode}>{userData.id}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A4670",
    marginBottom: 20,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  textGroup: { marginLeft: 15, flex: 1 },
  label: { fontSize: 12, color: "#6B7280" },
  value: { fontSize: 16, fontWeight: "500", color: "#333", marginTop: 2 },
  valueCode: {
    fontSize: 13,
    fontFamily: "monospace",
    color: "#666",
    marginTop: 2,
  },
});
