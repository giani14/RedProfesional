import { supabase } from "@/lib/supabase";
import { Stack, useLocalSearchParams, useRouter } from "expo-router"; // Importado
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

// Eliminado: type Props = NativeStackScreenProps<...>

export default function EditarCategoriaScreen() {
  const router = useRouter(); // Hook para navegar
  const { id } = useLocalSearchParams<{ id: string }>(); // Capturar ID de la ruta

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    if (!nuevoNombre.trim()) return Alert.alert("El nombre es obligatorio");

    try {
      const { data, error } = await supabase
        .from("categorias")
        .update({ nombre: nuevoNombre, descripcion: description })
        .eq("id", id);

      if (error) throw error;

      console.log("Perfil actualizado:", data);
      router.back(); // Volver atrás con Expo Router
    } catch (error: any) {
      console.error("Error al editar:", error.message);
      Alert.alert("Error", "No se pudieron guardar los cambios");
    }
  };

  const handleNameInput = (text: string) => {
    if (text.length <= 50) {
      setNuevoNombre(text);
    }
  };

  const handleDescriptionInput = (text: string) => {
    if (text.length <= 120) {
      setDescription(text);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerTitle}>{"<"} Editar categoría</Text>
        </TouchableOpacity>
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

        <Text style={styles.title}>Editar categoría</Text>
        <Text style={styles.subtitle}>
          Modifica la información y guarda los cambios
        </Text>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Nombre de la categoría (obligatorio)</Text>
          <Text style={styles.counter}>{nuevoNombre.length}/50</Text>
        </View>
        <TextInput
          placeholder="Ej. Inteligencia Artificial"
          value={nuevoNombre}
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
          <Text style={styles.buttonText}>Guardar Cambios</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
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
    paddingTop: 50, // Ajuste para barra de estado
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
