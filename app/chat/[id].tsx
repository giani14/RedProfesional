import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
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
  background: "#F4F6F9",
  chatTextDark: "#1F2937",
  chatTextLight: "#FFFFFF",
  bubbleLeft: "#FFFFFF",
  bubbleRight: "#1A4670",
  textGray: "#9CA3AF",
};

interface Mensaje {
  id: string;
  texto: string;
  created_at: string;
  emisor_id: string;
  leido: boolean;
}

export default function ChatScreen() {
  const router = useRouter();
  const { id: chat_id } = useLocalSearchParams<{ id: string }>();

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [miUsuarioId, setMiUsuarioId] = useState<string | null>(null);
  const [nombreDestinatario, setNombreDestinatario] = useState("Conversación");
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const miUsuarioIdRef = useRef<string | null>(null);

  useEffect(() => {
    inicializarChat();

    const channel = supabase
      .channel(`chat:${chat_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: `chat_id=eq.${chat_id}`,
        },
        (payload) => {
          const nuevoMsg = payload.new as Mensaje;

          setMensajes((prev) => {
            if (prev.some((m) => m.id === nuevoMsg.id)) return prev;
            return [nuevoMsg, ...prev];
          });

          if (nuevoMsg.emisor_id !== miUsuarioIdRef.current) {
            marcarComoLeido(nuevoMsg.id);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mensajes",
          filter: `chat_id=eq.${chat_id}`,
        },
        (payload) => {
          const msgActualizado = payload.new as Mensaje;
          setMensajes((prev) =>
            prev.map((m) => (m.id === msgActualizado.id ? msgActualizado : m)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat_id]);

  async function inicializarChat() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setMiUsuarioId(user.id);
      miUsuarioIdRef.current = user.id;

      const { data: chatData, error: chatError } = (await supabase
        .from("chats")
        .select(
          `
          cliente_id,
          profesional_id,
          cliente:cliente_id(nombre_completo),
          profesional:profesional_id(nombre_completo)
        `,
        )
        .eq("id", chat_id)
        .single()) as any;

      if (!chatError && chatData) {
        const esCliente = chatData.cliente_id === user.id;
        const nombre = esCliente
          ? chatData.profesional?.nombre_completo
          : chatData.cliente?.nombre_completo;
        setNombreDestinatario(nombre || "Usuario RedProfesional");
      }

      const { data: mensajesData, error: msgsError } = await supabase
        .from("mensajes")
        .select("*")
        .eq("chat_id", chat_id)
        .order("created_at", { ascending: false });

      if (!msgsError && mensajesData) {
        setMensajes(mensajesData);

        const noLeidos = mensajesData.filter(
          (m) => m.emisor_id !== user.id && !m.leido,
        );
        if (noLeidos.length > 0) {
          await Promise.all(noLeidos.map((msg) => marcarComoLeido(msg.id)));
        }
      }
    } catch (err) {
      console.error("Error al inicializar el chat:", err);
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoLeido(mensajeId: string) {
    await supabase.from("mensajes").update({ leido: true }).eq("id", mensajeId);
  }

  async function enviarMensaje() {
    if (!nuevoMensaje.trim() || !miUsuarioId) return;

    const textoAEnviar = nuevoMensaje.trim();
    setNuevoMensaje("");

    const idTemporal = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const mensajeOptimista: Mensaje = {
      id: idTemporal,
      texto: textoAEnviar,
      created_at: new Date().toISOString(),
      emisor_id: miUsuarioId,
      leido: false,
    };

    setMensajes((prev) => [mensajeOptimista, ...prev]);

    try {
      const { data, error } = await supabase
        .from("mensajes")
        .insert([
          {
            chat_id: chat_id,
            emisor_id: miUsuarioId,
            texto: textoAEnviar,
            leido: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const mensajeReal = data as Mensaje;

      setMensajes((prev) => {
        if (prev.some((m) => m.id === mensajeReal.id)) {
          return prev.filter((m) => m.id !== idTemporal);
        }
        return prev.map((m) => (m.id === idTemporal ? mensajeReal : m));
      });
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setMensajes((prev) => prev.filter((m) => m.id !== idTemporal));
    }
  }

  const formatearHora = (fechaIso: string) => {
    if (!fechaIso) return "";
    const fecha = new Date(fechaIso);
    return fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Cálculo del offset vertical para evitar solapamientos con cabeceras de navegación
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{nombreDestinatario.charAt(0)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {nombreDestinatario}
          </Text>
          <Text style={styles.headerStatus}>En línea</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="call-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="videocam-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* COMPONENTE CORRECTOR DEL TECLADO PARA ANDROID E IOS */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        // Cambiamos a padding o height dependiendo de la respuesta de tu emulador/dispositivo
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primaryBlue} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={mensajes}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            inverted
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const esMio = item.emisor_id === miUsuarioId;
              return (
                <View
                  style={[
                    styles.messageRow,
                    esMio ? styles.rowRight : styles.rowLeft,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      esMio ? styles.bubbleRight : styles.bubbleLeft,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        esMio ? styles.textLight : styles.textDark,
                      ]}
                    >
                      {item.texto}
                    </Text>
                    <View style={styles.metaContainer}>
                      <Text
                        style={[
                          styles.timeText,
                          esMio ? styles.timeLight : styles.timeDark,
                        ]}
                      >
                        {formatearHora(item.created_at)}
                      </Text>
                      {esMio && (
                        <Ionicons
                          name={item.leido ? "checkmark-done" : "checkmark"}
                          size={16}
                          color={
                            item.leido ? COLORS.accentGold : COLORS.textGray
                          }
                          style={{ marginLeft: 3 }}
                        />
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* INPUT DE TEXTO FIJADO AL BORDE INFERIOR */}
        <View style={styles.inputContainer}>
          <View style={styles.textInputWrapper}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="happy-outline"
                size={24}
                color={COLORS.textGray}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Escribe algo..."
              placeholderTextColor={COLORS.textGray}
              value={nuevoMensaje}
              onChangeText={setNuevoMensaje}
              multiline
            />
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="attach-outline"
                size={24}
                color={COLORS.textGray}
                style={styles.rotateIcon}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: nuevoMensaje.trim()
                  ? COLORS.primaryBlue
                  : "#CBD5E1",
              },
            ]}
            onPress={enviarMensaje}
            disabled={!nuevoMensaje.trim()}
          >
            <Ionicons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardContainer: { flex: 1 }, // Asegura el comportamiento expansivo interno
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop:
      Platform.OS === "android" ? (RNStatusBar.currentHeight || 0) + 12 : 12,
    paddingBottom: 12,
    backgroundColor: COLORS.primaryBlue,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    elevation: 4,
  },
  backButton: { padding: 5 },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.accentGold,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  avatarText: { color: COLORS.primaryBlue, fontWeight: "bold", fontSize: 18 },
  headerInfo: { flex: 1, marginLeft: 10, justifyContent: "center" },
  headerName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 20,
  },
  headerStatus: { color: "#E2E8F0", fontSize: 12, opacity: 0.9, marginTop: 1 },
  headerIcons: {
    flexDirection: "row",
    gap: 18,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  chatContent: { paddingHorizontal: 12, paddingVertical: 10 },
  messageRow: { flexDirection: "row", marginVertical: 4, width: "100%" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    borderRadius: 16,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  bubbleLeft: { backgroundColor: COLORS.bubbleLeft, borderTopLeftRadius: 2 },
  bubbleRight: { backgroundColor: COLORS.bubbleRight, borderTopRightRadius: 2 },
  messageText: { fontSize: 15, lineHeight: 20 },
  textDark: { color: COLORS.chatTextDark },
  textLight: { color: COLORS.chatTextLight },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
    alignSelf: "flex-end",
    marginLeft: 25,
  },
  timeText: { fontSize: 10 },
  timeDark: { color: COLORS.textGray },
  timeLight: { color: "#93C5FD", opacity: 0.8 },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: COLORS.white, // Mantiene la consistencia del color de fondo al subir
  },
  textInputWrapper: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    alignItems: "center",
    paddingHorizontal: 8,
    minHeight: 48,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 16,
    color: COLORS.chatTextDark,
    paddingTop: Platform.OS === "ios" ? 12 : 6,
    paddingBottom: Platform.OS === "ios" ? 12 : 6,
  },
  iconButton: { padding: 6 },
  rotateIcon: { transform: [{ rotate: "315deg" }] },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
});
