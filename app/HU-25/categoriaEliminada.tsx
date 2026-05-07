import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router"; // Cambiado
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CategoriaEliminadaScreen() {
  const router = useRouter(); // Hook para navegar
  const { categoryName } = useLocalSearchParams<{ categoryName: string }>(); // Obtener parámetros de la ruta

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de categorías</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark" size={40} color="#16a34a" />
        </View>

        <Text style={styles.title}>Categoría eliminada</Text>

        <Text style={styles.description}>
          La categoría "{categoryName || ""}" ha sido eliminada correctamente.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("../categorias")} // Cambiado a push con la ruta de Expo Router
        >
          <Text style={styles.buttonText}>Volver a categorías</Text>
        </TouchableOpacity>
      </View>

      {/* Decorative shapes se mantienen igual */}
      <View style={styles.decorLeft} />
      <View style={styles.decorRight} />
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 45, // Ajuste para SafeAreaView en cabeceras personalizadas
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1,
  },
  iconContainer: {
    backgroundColor: "#d1fae5",
    padding: 30,
    borderRadius: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#fbbf24",
    padding: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    fontWeight: "600",
  },
  decorLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 120,
    height: 120,
    backgroundColor: "#3b82f6",
    borderTopRightRadius: 100,
    opacity: 0.8,
  },
  decorRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 160,
    height: 120,
    backgroundColor: "#fde68a",
    borderTopLeftRadius: 100,
    opacity: 0.8,
  },
});
