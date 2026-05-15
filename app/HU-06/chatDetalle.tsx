import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primaryBlue: "#123F78",
  bgLight: "#F3F4F6",
  white: "#FFFFFF",
  myBubble: "#123F78",
  profeBubble: "#E5E7EB",
};

export default function ChatDetalle() {
  const router = useRouter();
  const { nombre } = useLocalSearchParams(); // Recibe el nombre del profesional
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  // Chats de simulación para pruebas
  const [mensajes, setMensajes] = useState([
    {
      id: "1",
      texto: "¡Hola! He visto tu solicitud para el proyecto.",
      emisor: "profe",
      fecha: "10:00 AM",
    },
    {
      id: "2",
      texto: "Hola, sí. ¿Cuándo podrías empezar?",
      emisor: "yo",
      fecha: "10:02 AM",
    },
    {
      id: "3",
      texto: "Podría pasar el lunes por la mañana para revisar los detalles.",
      emisor: "profe",
      fecha: "10:05 AM",
    },
  ]);

  const enviarMensaje = () => {
    if (nuevoMensaje.trim().length === 0) return;

    const mensaje = {
      id: Math.random().toString(),
      texto: nuevoMensaje,
      emisor: "yo",
      fecha: "Ahora",
    };

    setMensajes([...mensajes, mensaje]);
    setNuevoMensaje("");
  };

  const renderMensaje = ({ item }: any) => (
    <View
      style={[
        styles.bubbleContainer,
        item.emisor === "yo"
          ? styles.myBubbleContainer
          : styles.profeBubbleContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          item.emisor === "yo" ? styles.myBubble : styles.profeBubble,
        ]}
      >
        <Text
          style={[
            styles.mensajeTexto,
            item.emisor === "yo" ? { color: "white" } : { color: "#1F2937" },
          ]}
        >
          {item.texto}
        </Text>
        <Text
          style={[
            styles.fechaTexto,
            item.emisor === "yo" ? { color: "#D1D5DB" } : { color: "#6B7280" },
          ]}
        >
          {item.fecha}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBlue}
      />

      {/* HEADER AZUL */}
      <View style={styles.blueHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{nombre || "Chat"}</Text>
              <Text style={styles.headerStatus}>En línea</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="call-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={mensajes}
        renderItem={renderMensaje}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
      />

      {/* ENTRADA DE TEXTO */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={28} color={COLORS.primaryBlue} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={nuevoMensaje}
            onChangeText={setNuevoMensaje}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={enviarMensaje}>
            <Ionicons
              name="send"
              size={24}
              color="white"
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F9FAFB" },
  blueHeader: { backgroundColor: COLORS.primaryBlue, paddingBottom: 10 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 15,
  },
  headerInfo: { flex: 1 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  headerStatus: { color: "#10B981", fontSize: 12, fontWeight: "600" },

  chatList: { padding: 20, paddingBottom: 10 },
  bubbleContainer: { marginBottom: 15, flexDirection: "row", width: "100%" },
  myBubbleContainer: { justifyContent: "flex-end" },
  profeBubbleContainer: { justifyContent: "flex-start" },

  bubble: { maxWidth: "80%", padding: 12, borderRadius: 18 },
  myBubble: { backgroundColor: COLORS.myBubble, borderBottomRightRadius: 4 },
  profeBubble: {
    backgroundColor: COLORS.profeBubble,
    borderBottomLeftRadius: 4,
  },

  mensajeTexto: { fontSize: 15, lineHeight: 20 },
  fechaTexto: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },

  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  attachBtn: { marginRight: 10 },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: COLORS.primaryBlue,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
