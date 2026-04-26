import { RootStackParamList } from "@/app/navigation/types";
import { supabase } from "@/lib/supabase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "NuevaCategoria">;

export default function NuevaCategoriaScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    navigation.goBack();

    if (!name) return Alert.alert("El nombre es obligatorio");

    setLoading(true);
    const { error } = await supabase
      .from("categorias")
      .insert([
        {
          nombre: name,
          descripcion: description,
          icono_url: "",
          activa: true,
          creado_at: new Date().toISOString(),
        },
      ])
      .select();

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Éxito", "Perfil guardado correctamente");
      setName("");
      setDescription("");
    }
  };

  const handleNameInput = (text: string) => {
    if (text.length <= 50) {
      setName(text);
    }
  };

  const handleDescriptionInput = (text: string) => {
    if (text.length <= 120) {
      setDescription(text);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nueva categoría</Text>

        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Crear nueva categoría</Text>
        <Text style={styles.subtitle}>
          Completa la información para registrar una nueva categoría.
        </Text>

        <View style={styles.labelRow}>
          <Text style={styles.label}> Nombre de la categoría (opcional)</Text>
          <Text style={styles.counter}>{name.length}/50</Text>
        </View>
        <TextInput
          placeholder="Ej. Inteligencia Artificial"
          value={name}
          onChangeText={handleNameInput}
          style={styles.input}
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>Descripción (opcional)</Text>
          <Text style={styles.counter}>{description.length}/120</Text>
        </View>

        <TextInput
          placeholder="Describe brevemente qué incluye esta categoría"
          value={description}
          onChangeText={handleDescriptionInput}
          style={[styles.input, styles.textArea]}
          multiline
          maxLength={120}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Guardar categoría</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#1e3a8a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  image: {
    width: 180,
    height: 100,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counter: {
    fontSize: 12,
    color: "#9ca3af",
  },
  button: {
    backgroundColor: "#fbbf24",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "600",
  },
  cancel: {
    textAlign: "center",
    marginTop: 12,
    color: "#2563eb",
  },
});
