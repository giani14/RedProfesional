import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  white: "#FFFFFF",
  textGray: "#6B7280",
  textDark: "#1F2937",
  borderGray: "#E5E7EB",
};

export default function MensajesCliente() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, []),
  );

  async function fetchChats() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Consulta: Traemos el profesional y los mensajes asociados
      const { data, error } = await supabase
        .from("chats")
        .select(
          `
          id,
          profesional:profesional_id (nombre_completo),
          mensajes (texto, created_at, leido, emisor_id)
        `,
        )
        .eq("cliente_id", user.id);

      if (error) throw error;

      const formatted = (data as any[])
        .map((chat) => {
          // Ordenar mensajes localmente para asegurar que el [0] sea el más reciente
          const msgsOrdenados = chat.mensajes?.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );

          const lastMsg =
            msgsOrdenados && msgsOrdenados.length > 0 ? msgsOrdenados[0] : null;

          return {
            id: chat.id,
            nombre: chat.profesional?.nombre_completo || "Profesional",
            ultimo: lastMsg?.texto || "Inicia la conversación",
            fechaRaw: lastMsg?.created_at || new Date(0).toISOString(), // Para el sort de la lista
            fecha: lastMsg?.created_at
              ? new Date(lastMsg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            // Notificación: leido es falso solo si el último mensaje NO es mío
            leido: lastMsg
              ? lastMsg.leido === true || lastMsg.emisor_id === user.id
              : true,
          };
        })
        // ORDENAMIENTO CRÍTICO: Los chats con mensajes más recientes arriba
        .sort(
          (a, b) =>
            new Date(b.fechaRaw).getTime() - new Date(a.fechaRaw).getTime(),
        );

      setChats(formatted);
    } catch (error) {
      console.error("Error al cargar chats cliente:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.searchSection}>
        <Text style={styles.headerTitle}>Mis Mensajes</Text>
        <View style={{ height: 5 }} />

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.textGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar profesionales..."
            placeholderTextColor={COLORS.textGray}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        </View>
      ) : (
        <FlatList
          data={chats.filter((c) =>
            c.nombre.toLowerCase().includes(search.toLowerCase()),
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No tienes conversaciones activas.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatCard}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.nombre.charAt(0)}</Text>
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{item.nombre}</Text>
                  <Text style={styles.dateText}>{item.fecha}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.ultimo}
                </Text>
              </View>
              {!item.leido && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  searchSection: {
    paddingHorizontal: 20,
    backgroundColor: COLORS.primaryBlue,
    paddingBottom: 25,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 20,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 48,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: { flex: 1, marginLeft: 10, color: COLORS.textDark },
  chatCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
    alignItems: "center",
  },
  avatarCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: COLORS.white, fontSize: 22, fontWeight: "bold" },
  chatInfo: { flex: 1, marginLeft: 15 },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: { fontSize: 16, fontWeight: "700", color: COLORS.textDark },
  dateText: { fontSize: 12, color: COLORS.textGray },
  lastMessage: { color: COLORS.textGray, marginTop: 4, fontSize: 14 },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accentGold,
    marginLeft: 10,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: COLORS.textGray,
    fontSize: 16,
  },
});
