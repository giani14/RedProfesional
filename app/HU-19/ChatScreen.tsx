import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function ChatScreen() {
  const { nombre, conversationId } =
  useLocalSearchParams();

  const [mensaje, setMensaje] = useState("");

  const [mensajes, setMensajes] = useState([
    {
      id: "1",
      texto: "Hola",
      mio: false,
    },
    {
      id: "2",
      texto: "Hola, ¿cómo estás?",
      mio: true,
    },
  ]);

  const enviarMensaje = async () => {
  if (!mensaje.trim()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("mensajes")
    .insert({
      conversacion_id: conversationId,
      emisor_id: user.id,
      contenido: mensaje,
      texto: mensaje,
    });

  if (error) {
    console.log(error);
    return;
  }

  setMensajes([
    ...mensajes,
    {
      id: Date.now().toString(),
      texto: mensaje,
      mio: true,
    },
  ]);

  setMensaje("");
};

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <Text style={styles.nombre}>
          {nombre}
        </Text>
      </View>

      <FlatList
        data={mensajes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 15,
        }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.burbuja,
              item.mio
                ? styles.mensajeMio
                : styles.mensajeOtro,
            ]}
          >
            <Text>{item.texto}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={mensaje}
          onChangeText={setMensaje}
        />

        <TouchableOpacity
          style={styles.boton}
          onPress={enviarMensaje}
        >
          <Ionicons
            name="send"
            size={22}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  header: {
    backgroundColor: "#1A4670",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 15,
  },

  nombre: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  burbuja: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "75%",
  },

  mensajeMio: {
    backgroundColor: "#DCFCE7",
    alignSelf: "flex-end",
  },

  mensajeOtro: {
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#DDD",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 10,
  },

  boton: {
    backgroundColor: "#1A4670",
    marginLeft: 10,
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 10,
  },
});