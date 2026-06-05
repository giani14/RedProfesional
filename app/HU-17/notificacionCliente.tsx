import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  white: "#FFFFFF",
  background: "#F8FAFC",
  textDark: "#1E293B",
  textGray: "#64748B",
};

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  created_at: string;
  leido: boolean;
}

export default function NotificacionCliente() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  async function fetchNotificaciones() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("notificaciones")
          .select("*")
          .eq("usuario_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotificaciones(data || []);
      }
    } catch (error: any) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }: { item: Notificacion }) => (
    <View style={[styles.card, !item.leido && styles.cardNoLeida]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={
            item.titulo.includes("Rechazada") ? "close-circle" : "notifications"
          }
          size={28}
          color={
            item.titulo.includes("Rechazada") ? "#DC2626" : COLORS.primaryBlue
          }
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.notifTitle}>{item.titulo}</Text>
        <Text style={styles.notifMensaje}>{item.mensaje}</Text>
        <Text style={styles.notifFecha}>
          {new Date(item.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Ocultamos el header por defecto de Expo Router para usar el nuestro personalizado */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER CLÁSICO AZUL --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>
          Red<Text style={{ color: COLORS.accentGold }}>Profesional</Text>
        </Text>
        <View style={{ width: 28 }} /> {/* Espaciador para centrar el logo */}
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Notificaciones</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primaryBlue}
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={notificaciones}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="mail-open-outline" size={60} color="#CBD5E1" />
                <Text style={styles.emptyText}>No tienes mensajes nuevos</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryBlue,
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headerLogo: { color: COLORS.white, fontSize: 20, fontWeight: "bold" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 20,
  },
  list: { paddingBottom: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  cardNoLeida: { borderLeftWidth: 4, borderLeftColor: COLORS.primaryBlue },
  iconContainer: { marginRight: 15, justifyContent: "center" },
  content: { flex: 1 },
  notifTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.textDark },
  notifMensaje: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 4,
    lineHeight: 20,
  },
  notifFecha: { fontSize: 11, color: "#94A3B8", marginTop: 8 },
  empty: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#94A3B8", marginTop: 12, fontSize: 16 },
});
