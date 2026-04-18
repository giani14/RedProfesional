import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Button,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function NuevaCategoriaScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;

    // Aquí luego conectarás con backend
    console.log({ name, description });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title="boton" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva categoría</Text>

        <View style={{ width: 22 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Imagen decorativa */}
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/logo.png")} // cambia la ruta
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Crear nueva categoría</Text>
        <Text style={styles.subtitle}>
          Completa la información para registrar una nueva categoría.
        </Text>

        {/* Nombre */}
        <Text style={styles.label}>Nombre de la categoría</Text>
        <TextInput
          placeholder="Ej. Inteligencia Artificial"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* Descripción */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Descripción (opcional)</Text>
          <Text style={styles.counter}>{description.length}/120</Text>
        </View>

        <TextInput
          placeholder="Describe brevemente qué incluye esta categoría"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
          maxLength={120}
        />

        {/* Botón */}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Guardar categoría</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
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
