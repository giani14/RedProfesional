import { RootStackParamList } from "@/app/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Types
interface Category {
  id: string;
  name: string;
  count: number;
}

const initialCategories: Category[] = [
  { id: "1", name: "Desarrollo Web", count: 25 },
  { id: "2", name: "Diseño Gráfico", count: 18 },
  { id: "3", name: "Marketing Digital", count: 32 },
  { id: "4", name: "Redes Sociales", count: 15 },
  { id: "5", name: "Fotografía", count: 12 },
  { id: "6", name: "Desarrollo Móvil", count: 20 },
];

type Props = NativeStackScreenProps<RootStackParamList, "categorias">;

export default function PantallaCategorias({ navigation }: Props) {
  // State
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const pageSize = 5;

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [inputName, setInputName] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // Derived
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, categories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // CRUD actions
  const openCreate = () => {
    setEditingCategory(null);
    setInputName("");
    //setModalVisible(true);
    navigation.navigate("NuevaCategoria");
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setInputName(cat.name);
    setModalVisible(true);
  };

  const saveCategory = () => {
    if (!inputName.trim()) return;

    if (editingCategory) {
      // Edit
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id ? { ...c, name: inputName } : c,
        ),
      );
    } else {
      // Create
      const newCat: Category = {
        id: Date.now().toString(),
        name: inputName,
        count: 0,
      };
      setCategories((prev) => [newCat, ...prev]);
    }

    setModalVisible(false);
    setInputName("");
  };

  const openDeleteModal = (cat: Category) => {
    setSelectedCategory(cat);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (!selectedCategory) return;
    navigation.navigate("CategoriaEliminada", {
      categoryName: selectedCategory.name,
    });
    setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
    setDeleteModalVisible(false);
    setSelectedCategory(null);
  };

  const renderItem: ListRenderItem<Category> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name="folder-outline" size={20} color="#2563eb" />
        </View>
        <View>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>{item.count} profesionales</Text>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de categorías</Text>
        <Ionicons name="notifications-outline" size={22} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          placeholder="Buscar categorías..."
          style={styles.input}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setPage(1);
          }}
        />
        <Ionicons name="options-outline" size={18} color="#9ca3af" />
      </View>

      {/* Info + Button */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Total: {filtered.length} categorías</Text>
        <TouchableOpacity style={styles.button} onPress={openCreate}>
          <Text style={styles.buttonText}>+ Nueva categoría</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList<Category>
        data={paginated}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        <TouchableOpacity
          style={styles.pageButton}
          onPress={() => setPage((p) => Math.max(1, p - 1))}
        >
          <Text>{"<"}</Text>
        </TouchableOpacity>
        <Text>{page}</Text>
        <Text>{totalPages}</Text>
        <TouchableOpacity
          style={styles.pageButton}
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          <Text>{">"}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
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
              ¿Estás seguro que deseas eliminar "{selectedCategory?.name}"?
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
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  input: { flex: 1, marginHorizontal: 8 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoText: { color: "#4b5563" },
  button: { backgroundColor: "#facc15", padding: 10, borderRadius: 12 },
  buttonText: { fontWeight: "600" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardLeft: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    backgroundColor: "#dbeafe",
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  title: { fontWeight: "600" },
  subtitle: { color: "#6b7280", fontSize: 12 },
  actions: { flexDirection: "row", gap: 12 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 12,
  },
  pageButton: {
    backgroundColor: "#facc15",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
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
