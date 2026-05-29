import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
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
  onlineGreen: "#10B981",
};

interface ChatItemProps {
  id: string;
  nombre: string;
  ultimoMensaje: string;
  fecha: string;
  leido: boolean;
  onPress: () => void;
}

const ChatItem = ({
  nombre,
  ultimoMensaje,
  fecha,
  leido,
  onPress,
}: ChatItemProps) => (
  <TouchableOpacity
    style={styles.chatCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.avatarContainer}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{nombre.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.onlineStatus} />
    </View>

    <View style={styles.chatInfo}>
      <View style={styles.chatHeaderRow}>
        <Text style={[styles.userName, !leido && styles.unreadText]}>
          {nombre}
        </Text>
        <Text style={styles.chatDate}>{fecha}</Text>
      </View>
      <Text
        style={[styles.lastMessage, !leido && styles.unreadMessageText]}
        numberOfLines={1}
      >
        {ultimoMensaje}
      </Text>
    </View>

    {!leido && <View style={styles.unreadDot} />}
  </TouchableOpacity>
);

export default function MensajesProfesional() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    // Simulación de carga de chats desde Supabase
    const loadChats = async () => {
      setLoading(true);
      // Aquí iría tu query a la tabla de conversaciones/mensajes
      const mockChats = [
        {
          id: "1",
          nombre: "Marvin Anghelo",
          ultimo: "¿Podemos revisar el avance del módulo 4?",
          fecha: "10:30 AM",
          leido: false,
        },
        {
          id: "2",
          nombre: "Soporte Técnico",
          ultimo: "Tu cuenta ha sido verificada con éxito.",
          fecha: "Ayer",
          leido: true,
        },
        {
          id: "3",
          nombre: "Juan Pérez",
          ultimo: "Gracias por el presupuesto, lo revisaré.",
          fecha: "Lunes",
          leido: true,
        },
      ];
      setChats(mockChats);
      setLoading(false);
    };

    loadChats();
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Mensajes",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.primaryBlue },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      {/* Buscador */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.textGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar chats con clientes..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={COLORS.textGray}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ChatItem
              id={item.id}
              nombre={item.nombre}
              ultimoMensaje={item.ultimo}
              fecha={item.fecha}
              leido={item.leido}
              onPress={() =>
  router.push({
    pathname: "/HU-19/ChatScreen" as any,
    params: {
      conversationId: item.id,
      nombre: item.nombre,
    },
  })
}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={80}
                color={COLORS.borderGray}
              />
              <Text style={styles.emptyText}>No tienes mensajes aún.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchSection: {
    padding: 15,
    backgroundColor: COLORS.primaryBlue,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.textDark,
  },
  listContent: { paddingBottom: 20 },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  avatarContainer: { position: "relative" },
  avatarCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: COLORS.white, fontSize: 20, fontWeight: "bold" },
  onlineStatus: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.onlineGreen,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  chatInfo: { flex: 1, marginLeft: 15 },
  chatHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: { fontSize: 16, color: COLORS.textDark, fontWeight: "500" },
  unreadText: { fontWeight: "bold", color: "#000" },
  chatDate: { fontSize: 12, color: COLORS.textGray },
  lastMessage: { fontSize: 14, color: COLORS.textGray },
  unreadMessageText: { color: COLORS.textDark, fontWeight: "600" },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryBlue,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textGray,
  },
});
