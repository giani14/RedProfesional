import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES = [
  { id: "1", name: "Desarrollo Web", icon: "code-slash" },
  { id: "2", name: "Diseño Gráfico", icon: "color-palette" },
  { id: "3", name: "Marketing", icon: "megaphone" },
  { id: "4", name: "Redacción", icon: "create" },
];

export default function BuscarScreen() {
  const [search, setSearch] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header de Búsqueda */}
      <View style={styles.searchHeader}>
        <Text style={styles.title}>Explorar</Text>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="¿Qué profesional buscas?"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Categorías populares</Text>

        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((item) => (
            <TouchableOpacity key={item.id} style={styles.categoryCard}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as any} size={24} color="#1A4670" />
              </View>
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Espacio para resultados o recomendaciones futuras */}
        <View style={styles.emptyState}>
          <Ionicons name="briefcase-outline" size={80} color="#E5E7EB" />
          <Text style={styles.emptyText}>
            Encuentra al experto ideal para tu próximo proyecto
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  searchHeader: {
    backgroundColor: "#1A4670",
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 10,
    textAlign: "center",
    color: "#6B7280",
    paddingHorizontal: 40,
  },
});
