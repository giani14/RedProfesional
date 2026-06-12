import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
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
  solicitud_id?: string;
}

export default function NotificacionProfesional() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      console.error(
        "Error al obtener notificaciones del profesional:",
        error.message,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotificaciones();
  };

  const manejarPresionarNotificacion = async (item: Notificacion) => {
    try {
      if (!item.leido) {
        // Actualización optimista en BD
        await supabase
          .from("notificaciones")
          .update({ leido: true })
          .eq("id", item.id);

        // Reflejar cambio en el estado local
        setNotificaciones((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, leido: true } : n)),
        );
      }

      // Redirección al detalle de la HU-18
      if (item.solicitud_id) {
        router.push({
          pathname: "/HU-18/solicitudDetalle",
          params: { id: item.solicitud_id },
        });
      }
    } catch (error: any) {
      console.error("Error al marcar como leída:", error.message);
    }
  };

  // Mapeo visual personalizado para el perfil del Profesional
  const obtenerEstiloNotificacion = (titulo: string) => {
    const t = titulo.toLowerCase();
    if (t.includes("disputa") || t.includes("reclamo") || t.includes("⚠️")) {
      return { icono: "shield-sharp", color: "#DC2626" }; // Rojo de Alerta Crítica para disputas
    }
    if (t.includes("pago") || t.includes("finalizado") || t.includes("💰")) {
      return { icono: "cash-outline", color: "#16A34A" }; // Verde Dinero/Éxito para pagos liberados
    }
    if (t.includes("revisión") || t.includes("👀")) {
      return { icono: "eye-outline", color: "#0284C7" }; // Azul para lectura/revisión
    }
    if (t.includes("aceptada") || t.includes("🎉")) {
      return { icono: "briefcase-outline", color: COLORS.primaryBlue }; // Maletín de trabajo asignado
    }
    return { icono: "notifications", color: COLORS.primaryBlue };
  };

  const renderItem = ({ item }: { item: Notificacion }) => {
    const estilo = obtenerEstiloNotificacion(item.titulo);

    return (
      <TouchableOpacity
        style={[styles.card, !item.leido && styles.cardNoLeida]}
        activeOpacity={0.7}
        onPress={() => manejarPresionarNotificacion(item)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={estilo.icono as any} size={28} color={estilo.color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.notifTitle}>{item.titulo}</Text>
          <Text style={styles.notifMensaje}>{item.mensaje}</Text>
          <Text style={styles.notifFecha}>
            {new Date(item.created_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER CLÁSICO AZUL --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>
          Red<Text style={{ color: COLORS.accentGold }}>Profesional</Text>
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Panel de Avisos</Text>

        {loading && !refreshing ? (
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primaryBlue]}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons
                  name="folder-open-outline"
                  size={60}
                  color="#CBD5E1"
                />
                <Text style={styles.emptyText}>Bandeja de entrada vacía</Text>
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
  cardNoLeida: { borderLeftWidth: 4, borderLeftColor: COLORS.accentGold }, // Línea dorada para resaltar al profesional
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
