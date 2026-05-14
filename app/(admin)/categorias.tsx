import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router"; // Importado
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Categorias {
  id: string;
  nombre: string;
  descripcion: string;
  icono_url: string;
  activa: boolean;
  creado_at: string;
}

// Eliminado: type Props = NativeStackScreenProps<...>

export default function PantallaCategorias() {
  const router = useRouter(); // Inicializado hook de navegación
  const [items, setItems] = useState<Categorias[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categorias | null>(
    null,
  );
  const [inputName, setInputName] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Categorias | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.nombre.toLowerCase().includes(q));
  }, [query, items]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => {
    fetchData();
  }, []); // Corregido: dependencia vacía para evitar bucle infinito si setItems está en fetchData

  async function fetchData() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("categorias").select("*");

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error obteniendo datos:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const openCreate = () => {
    setEditingCategory(null);
    setInputName("");
    // Navegación con Expo Router
    router.push("/HU-25/pantallaNuevaCategoria");
  };

  const openEdit = (cat: Categorias) => {
    setEditingCategory(cat);
    setInputName(cat.nombre);
    // Navegación con Expo Router enviando parámetros
    router.push({
      pathname: "/HU-25/editarCategoria",
      params: { id: cat.id },
    });
  };

  const saveCategory = () => {
    if (!inputName.trim()) return;

    if (editingCategory) {
      setItems((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id ? { ...c, nombre: inputName } : c,
        ),
      );
    } else {
      const newCat: Categorias = {
        id: Date.now().toString(),
        nombre: inputName,
        descripcion: "",
        icono_url: "",
        activa: true,
        creado_at: new Date().toISOString(),
      };
      setItems((prev) => [newCat, ...prev]);
    }

    setModalVisible(false);
    setInputName("");
  };

  const openDeleteModal = (cat: Categorias) => {
    setSelectedCategory(cat);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (!selectedCategory) return;

    // Navegación con Expo Router pasando el parámetro del nombre
    router.push({
      pathname: "/HU-25/categoriaEliminada",
      params: { categoryName: selectedCategory.nombre },
    });

    eliminarCategoria(selectedCategory.id);

    setDeleteModalVisible(false);
    setSelectedCategory(null);
  };

  const eliminarCategoria = async (id: string) => {
    try {
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) throw error;
      // Opcional: refrescar lista local
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Error eliminando categoría:", error.message);
    }
  };

  const renderItem: ListRenderItem<Categorias> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name="folder-outline" size={20} color="#2563eb" />
        </View>
        <View>
          <Text style={styles.title}>{item.nombre}</Text>
          <Text style={styles.subtitle}> 1 profesionales</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)}>
          <Ionicons name="create-outline" size={20} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openDeleteModal(item)}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1A3B63"
        translucent={true}
      />

      {/* Ajuste para la barra de estado del teléfono */}
      <View style={styles.safeAreaSpacing} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de categorías</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={{ marginRight: 10 }}
            />
            <TextInput
              placeholder="Buscar categorías..."
              style={styles.searchInput}
              placeholderTextColor="#999"
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setPage(1);
              }}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#1A3B63" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.totalText}>
            Total: {filtered.length} categorías
          </Text>
          <TouchableOpacity style={styles.newUserButton} onPress={openCreate}>
            <Ionicons name="add" size={20} color="#1A3B63" />
            <Text style={styles.newUserText}>Nueva categoría</Text>
          </TouchableOpacity>
        </View>

        <FlatList<Categorias>
          data={paginated}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.pageArrow}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={page === 1 ? "#CCC" : "#1A3B63"}
            />
          </TouchableOpacity>

          <View style={styles.pageNumberActive}>
            <Text style={styles.pageTextActive}>{page}</Text>
          </View>
          <Text style={styles.pageText}> de {totalPages}</Text>

          <TouchableOpacity
            style={styles.pageArrow}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={page === totalPages ? "#CCC" : "#1A3B63"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Los Modales se mantienen igual ya que son lógica interna del componente */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? "Editar categoría" : "Nueva categoría"}
            </Text>
            <TextInput
              placeholder="Nombre"
              value={inputName}
              onChangeText={setInputName}
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCategory}>
                <Text style={{ fontWeight: "bold" }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Ionicons name="close" size={18} />
            </TouchableOpacity>

            <View style={styles.iconWarning}>
              <Ionicons name="warning-outline" size={28} color="#ef4444" />
            </View>

            <Text style={styles.modalETitle}>Eliminar categoría</Text>

            <Text style={styles.modalText}>
              ¿Estás seguro que deseas eliminar "{selectedCategory?.nombre}"?
            </Text>

            <Text style={styles.modalSubText}>
              Esta acción no se puede deshacer.
            </Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={confirmDelete}
            >
              <Text style={styles.deleteText}>Eliminar categoría</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  safeAreaSpacing: {
    height: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#1A3B63",
  },
  header: {
    height: 70,
    backgroundColor: "#1A3B63",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600" },
  body: { flex: 1, paddingHorizontal: 15 },
  searchSection: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  searchInput: { flex: 1, color: "#333" },
  filterButton: {
    backgroundColor: "white",
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  totalText: { fontSize: 16, fontWeight: "bold", color: "#666" },
  newUserButton: {
    flexDirection: "row",
    backgroundColor: "#F9B934",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  newUserText: { color: "#1A3B63", fontWeight: "bold", marginLeft: 5 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconContainer: {
    backgroundColor: "#dbeafe",
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 13, color: "#777", marginTop: 2 },
  actions: { flexDirection: "row", gap: 12 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingBottom: 20,
  },
  pageArrow: { padding: 10 },
  pageNumberActive: {
    width: 35,
    height: 35,
    backgroundColor: "#F9B934",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  pageText: { color: "#666", fontWeight: "bold" },
  pageTextActive: { color: "#1A3B63", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeBtn: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  iconWarning: {
    backgroundColor: "#fee2e2",
    alignSelf: "center",
    padding: 16,
    borderRadius: 50,
    marginBottom: 10,
  },
  modalETitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  modalText: {
    textAlign: "center",
    marginBottom: 6,
  },
  modalSubText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  deleteText: { color: "#fff", fontWeight: "600" },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { color: "#2563eb", fontWeight: "600" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "80%",
  },
  modalTitle: { fontWeight: "bold", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  modalActions: { flexDirection: "row", justifyContent: "space-between" },
});
