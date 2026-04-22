import { RootStackParamList } from "@/app/navigation/types";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
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

interface Categorias {
  id: string;
  nombre: string;
  descripcion: string;
  icono_url: string;
  activa: boolean;
  creado_at: string;
}

type Props = NativeStackScreenProps<RootStackParamList, "categorias">;

export default function PantallaCategorias({ navigation }: Props) {
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
  }, [items]);

  async function fetchData() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("categorias").select("*");

      if (error) throw error;
      setItems(data);
    } catch (error: any) {
      console.error("Error obteniendo datos:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const openCreate = () => {
    setEditingCategory(null);
    setInputName("");

    navigation.navigate("NuevaCategoria");
  };

  const openEdit = (cat: Categorias) => {
    setEditingCategory(cat);
    setInputName(cat.nombre);
    navigation.navigate("EditarCategoria", { id: cat.id });
  };

  const saveCategory = () => {
    if (!inputName.trim()) return;

    if (editingCategory) {
      setItems((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id ? { ...c, name: inputName } : c,
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
    navigation.navigate("CategoriaEliminada", {
      categoryName: selectedCategory.nombre,
    });

    eliminarCategoria(selectedCategory.id);

    setDeleteModalVisible(false);
    setSelectedCategory(null);
  };

  const eliminarCategoria = async (id: string) => {
    try {
      const { error } = await supabase.from("categorias").delete().eq("id", id);

      if (error) throw error;
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de categorías</Text>
        <Ionicons name="notifications-outline" size={22} />
      </View>

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

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Total: {filtered.length} categorías</Text>
        <TouchableOpacity style={styles.button} onPress={openCreate}>
          <Text style={styles.buttonText}>+ Nueva categoría</Text>
        </TouchableOpacity>
      </View>

      <FlatList<Categorias>
        data={paginated}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

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
