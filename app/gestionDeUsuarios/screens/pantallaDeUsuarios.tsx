import { RootStackParamList } from "@/app/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Cliente" | "Profesional";
  status: "Activo" | "Suspendido";
}

const initialUsers: User[] = [
  {
    id: "1",
    name: "María González López",
    email: "maria.gonzalez@correo.com",
    role: "Cliente",
    status: "Activo",
  },
  {
    id: "2",
    name: "Juan Pérez García",
    email: "juan.perez@correo.com",
    role: "Profesional",
    status: "Activo",
  },
  {
    id: "3",
    name: "Ana Martínez Silva",
    email: "ana.martinez@correo.com",
    role: "Profesional",
    status: "Suspendido",
  },
  {
    id: "4",
    name: "Luis Torres Ramírez",
    email: "luis.torres@correo.com",
    role: "Cliente",
    status: "Activo",
  },
];

type Props = NativeStackScreenProps<RootStackParamList, "ListaDeUsuarios">;

export default function UsuariosScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const [users] = useState<User[]>(initialUsers);
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [query, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("UserDetail", {
            name: item.name,
            email: item.email,
            phone: "+591 700 00000",
            role: item.role,
            status: item.status,
            createdAt: "15 de marzo de 2024",
          })
        }
      >
        <View style={styles.left}>
          <Image
            source={require("@/assets/images/avatar.png")}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <View style={styles.badges}>
              <View
                style={[
                  styles.badge,
                  item.role === "Cliente" ? styles.blue : styles.gray,
                ]}
              >
                <Text style={styles.badgeText}>{item.role}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  item.status === "Activo" ? styles.green : styles.red,
                ]}
              >
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={20} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="menu" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Gestión de usuarios</Text>
        <Ionicons name="notifications-outline" size={22} color="#fff" />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9ca3af" />
        <TextInput
          placeholder="Buscar por nombre o correo..."
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setPage(1);
          }}
          style={styles.input}
        />
        <Ionicons name="options" size={18} color="#9ca3af" />
      </View>

      {/* Info */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Total: {filtered.length} usuarios</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>+ Nuevo usuario</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={paginated}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        <TouchableOpacity onPress={() => setPage((p) => Math.max(1, p - 1))}>
          <Text>{"<"}</Text>
        </TouchableOpacity>
        <Text>{page}</Text>
        <Text>{totalPages}</Text>
        <TouchableOpacity
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          <Text>{">"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    backgroundColor: "#1e3a8a",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: { color: "#fff", fontWeight: "600" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 10,
  },
  input: { flex: 1, marginHorizontal: 8 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  infoText: { color: "#6b7280" },
  button: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  buttonText: { fontWeight: "600" },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  left: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: { fontWeight: "600" },
  email: { fontSize: 12, color: "#6b7280" },

  badges: { flexDirection: "row", gap: 6, marginTop: 4 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: "600" },

  blue: { backgroundColor: "#dbeafe" },
  gray: { backgroundColor: "#e5e7eb" },
  green: { backgroundColor: "#dcfce7" },
  red: { backgroundColor: "#fee2e2" },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
  },
});
