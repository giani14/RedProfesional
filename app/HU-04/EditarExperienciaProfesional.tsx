import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditarExperienciaProfesional() {
  const router = useRouter();

  const [especialidad, setEspecialidad] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [biografia, setBiografia] = useState("");
  const [certificacion, setCertificacion] = useState("");

  const cargarDatos = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profesionales_info")
      .select("*")
      .eq("profesional_id", user.id)
      .single();

    if (data) {
      setEspecialidad(
        data.titulo_especialidad || ""
      );

      setExperiencia(
        data.experiencia?.toString() || ""
      );

      setBiografia(data.biografia || "");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarInformacion = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profesionales_info")
      .upsert({
        profesional_id: user.id,
        titulo_especialidad: especialidad,
        experiencia: Number(experiencia),
        biografia: biografia,
      });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert(
      "Éxito",
      "Información guardada correctamente"
    );

    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Registrar experiencia
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.titulo}>
          Agrega tu experiencia profesional
        </Text>

        <Text style={styles.subtitulo}>
          Completa tu trayectoria profesional
        </Text>

        <Text style={styles.label}>
          Especialidad
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="briefcase-outline"
            size={20}
            color="#666"
          />

          <TextInput
            style={styles.input}
            value={especialidad}
            onChangeText={setEspecialidad}
            placeholder="Electricista"
          />
        </View>

        <Text style={styles.label}>
          Años de experiencia
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#666"
          />

          <TextInput
            style={styles.input}
            value={experiencia}
            onChangeText={setExperiencia}
            keyboardType="numeric"
            placeholder="5"
          />
        </View>

        <Text style={styles.label}>
          Experiencia laboral
        </Text>

        <View style={styles.textAreaContainer}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color="#666"
            style={{ marginTop: 15 }}
          />

          <TextInput
            style={styles.textArea}
            multiline
            value={biografia}
            onChangeText={setBiografia}
            placeholder="Describe tu experiencia..."
          />
        </View>

        <Text style={styles.label}>
          Certificaciones
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="ribbon-outline"
            size={20}
            color="#666"
          />

          <TextInput
            style={styles.input}
            value={certificacion}
            onChangeText={setCertificacion}
            placeholder="Instalaciones eléctricas"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={guardarInformacion}
        >
          <Text style={styles.buttonText}>
            Guardar información
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  header: {
    backgroundColor: "#1A4670",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },

  content: {
    padding: 20,
  },

  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A4670",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitulo: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },

  label: {
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 5,
    color: "#1A4670",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#F9FAFB",
    height: 55,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  textAreaContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#F9FAFB",
    minHeight: 120,
    alignItems: "flex-start",
  },

  textArea: {
    flex: 1,
    marginLeft: 10,
    height: 120,
    textAlignVertical: "top",
    paddingTop: 15,
  },

  button: {
    backgroundColor: "#F0B323",
    marginTop: 40,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#1A4670",
    fontWeight: "bold",
    fontSize: 16,
  },
});