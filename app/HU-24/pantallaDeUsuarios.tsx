import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; //
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Interfaces de datos se mantienen igual
interface User {
  id: string;
  name: string;
  email: string;
  role: "Cliente" | "Profesional";
  status: "Activo" | "Suspendido";
}

interface Usuario {
  id: string;
  email: string;
  nombre_completo: string;
  rol: "Cliente" | "Profesional";
  estado: "activo" | "suspendido";
  creado_at: string;
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

export default function UsuariosScreen() {
  const router = useRouter(); // Hook para navegación
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nombre_completo.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [query, usuarios]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("perfiles").select("*");

      if (error) throw error;
      setUsuarios(data);
    } catch (error: any) {
      console.error("Error obteniendo datos:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const renderItem = ({ item }: { item: Usuario }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() =>
          // Navegación con Expo Router enviando parámetros
          router.push({
            pathname: "../HU-23/detalleUsuario", // Asegúrate de que este sea el nombre del archivo en app/
            params: {
              id: item.id,
              name: item.nombre_completo,
              email: item.email,
              phone: "+591 700 00000",
              role: item.rol,
              status: item.estado,
              createdAt: item.creado_at,
            },
          })
        }
      >
        <View style={styles.left}>
          <Image
            source={require("@/assets/images/avatar.png")}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>{item.nombre_completo}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <div style={styles.badges}>
              <View
                style={[
                  styles.badge,
                  item.rol === "Cliente" ? styles.blue : styles.gray,
                ]}
              >
                <Text style={styles.badgeText}>{item.rol}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  item.estado === "activo" ? styles.green : styles.red,
                ]}
              >
                <Text style={styles.badgeText}>{item.estado}</Text>
              </View>
            </div>
          </View>
        </View>
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={20} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="menu" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Gestión de usuarios</Text>
        <Ionicons name="notifications-outline" size={22} color="#fff" />
      </View>

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

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Total: {filtered.length} usuarios</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>+ Nuevo usuario</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={paginated}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <View style={styles.pagination}>
        <TouchableOpacity onPress={() => setPage((p) => Math.max(1, p - 1))}>
          <Text style={{ fontSize: 18 }}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>{page}</Text>
        <Text style={{ fontSize: 16 }}>de {totalPages}</Text>
        <TouchableOpacity
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          <Text style={{ fontSize: 18 }}>{">"}</Text>
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
    paddingTop: 50, // Ajuste manual por si no usas SafeAreaView aquí
  },
  headerTitle: { color: "#fff", fontWeight: "600", fontSize: 18 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: { flex: 1, marginHorizontal: 8 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: "center",
  },
  infoText: { color: "#6b7280" },
  button: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: { fontWeight: "700", color: "#1e3a8a" },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    elevation: 1,
  },
  left: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: { fontWeight: "600", fontSize: 15 },
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
    alignItems: "center",
    gap: 15,
    paddingVertical: 20,
  },
});
