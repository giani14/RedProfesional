import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Importación corregida para evitar el Warning de deprecación
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primaryBlue: "#123F78",
  textMain: "#1F2937",
  textSecondary: "#6B7280",
  bgLight: "#F9FAFB",
  white: "#FFFFFF",
};

export default function MensajesScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarConversaciones();

    /* PREPARATIVO PARA CONEXIÓN REAL (REALTIME):
      Este bloque permitirá que la bandeja de entrada se actualice sola cuando 
      alguien te envíe un mensaje sin necesidad de recargar.
    */
    /*
    const channel = supabase
      .channel('db-mensajes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'mensajes' 
      }, () => {
        cargarConversaciones(); // Recarga la lista ante cualquier cambio real
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    */
  }, []);

  const cargarConversaciones = async () => {
    try {
      setLoading(true);

      /* LOGICA PARA CONEXIÓN REAL CON BASE DE DATOS:
        Una vez creada la vista 'conversaciones_view' en Supabase, 
        descomenta el siguiente bloque y borra los datos mock.
      */
      /*
      const { data, error } = await supabase
        .from("conversaciones_view")
        .select("*")
        .order("ultimo_mensaje_fecha", { ascending: false });

      if (error) throw error;
      setChats(data || []);
      */

      // --- DATOS DE SIMULACIÓN (Activos para evitar error PGRST205) ---
      const mockConversaciones = [
        {
          id: "1",
          profe_nombre: "Carlos Mendoza",
          profe_avatar: "https://via.placeholder.com/150",
          ultimo_mensaje: "¡Claro! El lunes a las 9:00 AM estaré por allá.",
          fecha_relativa: "12:30",
          unread_count: 2,
          online: true,
        },
        {
          id: "2",
          profe_nombre: "Juan Pérez",
          profe_avatar: "https://via.placeholder.com/150",
          ultimo_mensaje: "Ya recibí tu solicitud de servicio.",
          fecha_relativa: "Ayer",
          unread_count: 0,
          online: false,
        },
      ];

      setChats(mockConversaciones);
    } catch (err) {
      console.error("Error al cargar chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderChatItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() =>
        router.push({
          pathname: "/HU-06/chatDetalle",
          params: { conversationId: item.id, nombre: item.profe_nombre },
        })
      }
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.profe_avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineBadge} />}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.profeName} numberOfLines={1}>
            {item.profe_nombre}
          </Text>
          <Text style={styles.chatTime}>{item.fecha_relativa}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              item.unread_count > 0 && styles.unreadText,
            ]}
            numberOfLines={1}
          >
            {item.ultimo_mensaje}
          </Text>
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCountText}>{item.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBlue}
      />

      {/* Header unificado con RedProfesional */}
      <View style={styles.blueHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mensajes</Text>
            <TouchableOpacity>
              <Ionicons name="search-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.textSecondary}>
              No hay conversaciones activas.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.white },
  blueHeader: { backgroundColor: COLORS.primaryBlue, paddingBottom: 15 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },

  listContent: { paddingVertical: 5 },
  chatCard: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    alignItems: "center",
  },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "white",
  },
  chatInfo: { flex: 1, marginLeft: 15 },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  profeName: { fontSize: 16, fontWeight: "bold", color: COLORS.textMain },
  chatTime: { fontSize: 12, color: COLORS.textSecondary },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 10,
  },
  unreadText: { color: COLORS.textMain, fontWeight: "700" },
  unreadBadge: {
    backgroundColor: COLORS.primaryBlue,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadCountText: { color: "white", fontSize: 10, fontWeight: "bold" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  textSecondary: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
});
