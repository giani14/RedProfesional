import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

interface Usuario {
  id: string;
  nombre_completo: string;
  email: string;
  rol: "Cliente" | "Profesional";
  estado: string;
  avatar_url?: string;
}

// --- COMPONENTE DE TARJETA DE USUARIO ---
// 1. Añadimos 'onPress' a las propiedades del componente
const UserCard = ({ name, email, role, status, onPress }: any) => {
  // Función para obtener las iniciales (ej. "Marvin Pérez" -> "MP")
  const getSiglas = (fullName: string) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        {/* --- NUEVO AVATAR ESTILO ESTUSUARIO --- */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getSiglas(name)}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          <View style={styles.tagRow}>
            {/* Tag de Rol */}
            <View
              style={[
                styles.roleTag,
                { backgroundColor: role === "Cliente" ? "#FDE08D" : "#D1E3F8" },
              ]}
            >
              <Text style={styles.tagText}>{role}</Text>
            </View>

            {/* Tag de Estado con colores corregidos */}
            <View
              style={[
                styles.statusTag,
                {
                  backgroundColor:
                    status.toLowerCase() === "activo" ? "#D1FAE5" : "#FEE2E2",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      status.toLowerCase() === "activo" ? "#10B981" : "#EF4444",
                  },
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#1A3B63" />
      </View>
    </TouchableOpacity>
  );
};

export default function GestionUsuariosScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const usuariosPorPagina = 4;
  // Lógica de paginación
  const totalPaginas = Math.ceil(totalUsuarios / usuariosPorPagina);
  const inicioRango = Math.floor((paginaActual - 1) / 3) * 3 + 1;
  const paginasVisibles = Array.from(
    { length: 3 },
    (_, i) => inicioRango + i,
  ).filter((p) => p <= totalPaginas);

  const [filtroRol, setFiltroRol] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchUsuarios();
  }, [paginaActual]);

  async function fetchUsuarios() {
    try {
      setLoading(true);
      const desde = (paginaActual - 1) * usuariosPorPagina;
      const hasta = desde + usuariosPorPagina - 1;

      // Iniciamos la consulta base
      let query = supabase
        .from("perfiles")
        .select("*", { count: "exact" })
        .range(desde, hasta)
        .order("nombre_completo", { ascending: true });

      // --- APLICACIÓN DE FILTROS DINÁMICOS ---

      // 1. Filtro por Rol (Excluyendo siempre Administradores por seguridad)
      if (filtroRol === "Todos") {
        query = query.in("rol", ["Cliente", "Profesional"]);
      } else {
        query = query.eq("rol", filtroRol);
      }

      // 2. Filtro por Estado (Activo/Suspendido)
      if (filtroEstado !== "Todos") {
        query = query.eq("estado", filtroEstado.toLowerCase());
      }

      // 3. Buscador por nombre o correo
      if (busqueda.trim() !== "") {
        query = query.or(
          `nombre_completo.ilike.%${busqueda}%,email.ilike.%${busqueda}%`,
        );
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setUsuarios((data as Usuario[]) || []);
      setTotalUsuarios(count || 0);
    } catch (error: any) {
      console.error("Error filtrando usuarios:", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Reiniciamos a la página 1 cada vez que el usuario escribe algo nuevo
    setPaginaActual(1);

    // Ejecutamos la función de carga que ya tiene el filtro .ilike
    fetchUsuarios();
  }, [busqueda]); // <--- Se dispara cada vez que 'busqueda' cambia

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

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de usuarios</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* --- BUSCADOR Y FILTRO --- */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={{ marginRight: 10 }}
            />
            <TextInput
              placeholder="Buscar por nombre"
              style={styles.searchInput}
              placeholderTextColor="#999"
              value={busqueda} // Tu estado actual
              onChangeText={(text) => setBusqueda(text)} // Actualiza con cada letra
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="filter-list" size={24} color="#1A3B63" />
          </TouchableOpacity>
        </View>

        {/* --- CONTADOR DINÁMICO Y BOTÓN NUEVO --- */}
        <View style={styles.actionRow}>
          <Text style={styles.totalText}>Total: {totalUsuarios} usuarios</Text>
          <TouchableOpacity style={styles.newUserButton}>
            <Ionicons name="add" size={20} color="#1A3B63" />
            <Text style={styles.newUserText}>Nuevo usuario</Text>
          </TouchableOpacity>
        </View>

        {/* --- LISTA DE USUARIOS DINÁMICA --- */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1A3B63"
            style={{ marginTop: 20 }}
          />
        ) : (
          usuarios.map((user: any) => (
            <UserCard
              key={user.id}
              name={user.nombre_completo}
              email={user.email}
              role={user.rol}
              status={user.estado}
              // Lógica de foto: si no hay, genera una con sus iniciales (UI-Avatars)
              image={
                user.avatar_url
                  ? { uri: user.avatar_url }
                  : {
                      uri: `https://ui-avatars.com/api/?name=${user.nombre_completo}&background=random&color=fff`,
                    }
              }
              onPress={() =>
                router.push({
                  pathname: "/detalleUsuario",
                  params: { id: user.id },
                })
              }
            />
          ))
        )}

        {/* --- PAGINACIÓN FUNCIONAL < 1 2 3 > --- */}
        <View style={styles.pagination}>
          {/* Botón Atrás < */}
          <TouchableOpacity
            style={styles.pageArrow}
            onPress={() => setPaginaActual((p) => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={paginaActual === 1 ? "#CCC" : "#1A3B63"}
            />
          </TouchableOpacity>

          {/* Números Dinámicos */}
          {paginasVisibles.map((num) => (
            <TouchableOpacity
              key={num}
              style={
                paginaActual === num
                  ? styles.pageNumberActive
                  : styles.pageNumber
              }
              onPress={() => setPaginaActual(num)}
            >
              <Text
                style={
                  paginaActual === num ? styles.pageTextActive : styles.pageText
                }
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Botón Siguiente > */}
          <TouchableOpacity
            style={styles.pageArrow}
            onPress={() =>
              setPaginaActual((p) => Math.min(totalPaginas, p + 1))
            }
            disabled={paginaActual === totalPaginas}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={paginaActual === totalPaginas ? "#CCC" : "#1A3B63"}
            />
          </TouchableOpacity>
        </View>

        {/* Espacio final */}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* --- MODAL DE FILTROS --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#1A3B63" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Rol</Text>
              <View style={styles.optionsRow}>
                {["Todos", "Cliente", "Profesional"].map((opcion) => (
                  <TouchableOpacity
                    key={opcion}
                    style={[
                      styles.chip,
                      filtroRol === opcion && styles.chipActive,
                    ]}
                    onPress={() => setFiltroRol(opcion)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filtroRol === opcion && styles.chipTextActive,
                      ]}
                    >
                      {opcion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Estado</Text>
              <View style={styles.optionsRow}>
                {["Todos", "Activo", "Suspendido"].map((opcion) => (
                  <TouchableOpacity
                    key={opcion}
                    style={[
                      styles.chip,
                      filtroEstado === opcion && styles.chipActive,
                    ]}
                    onPress={() => setFiltroEstado(opcion)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filtroEstado === opcion && styles.chipTextActive,
                      ]}
                    >
                      {opcion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setPaginaActual(1);
                fetchUsuarios(); // Ejecuta la búsqueda con los filtros seleccionados
                setModalVisible(false);
              }}
            >
              <Text style={styles.applyButtonText}>Aplicar filtros</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setFiltroRol("Todos");
                setFiltroEstado("Todos");
                setBusqueda("");
                setPaginaActual(1);
                setModalVisible(false);
                // fetchUsuarios se disparará automáticamente por el useEffect si cambias estados
              }}
            >
              <Text style={styles.clearButtonText}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- ESTILOS ---
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
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15, // Ajusta según tu diseño
  },
  //avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  avatarContainer: {
    // Cambiamos de 'avatar' (Image) a un contenedor para el Placeholder
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#1A3B63", // Azul oscuro del encabezado
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "white", // Borde blanco que resalta
    // Sombra para que se vea igual de profesional
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  avatarText: {
    color: "white", // Texto blanco exacto
    fontWeight: "bold", // Negrita
    fontSize: 18, // Ajuste para que se vea claro dentro del círculo de 60px
  },
  infoContainer: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 13, color: "#777", marginBottom: 5 },
  tagRow: { flexDirection: "row" },
  roleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 10,
  },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText: { fontSize: 12, fontWeight: "bold", color: "#1A3B63" },
  statusText: { fontSize: 12, fontWeight: "bold" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  pageArrow: { padding: 10 },
  pageNumber: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semi-transparente
    justifyContent: "flex-end", // El modal sube desde abajo
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A3B63",
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  dropdownText: {
    color: "#666",
    fontSize: 15,
  },
  applyButton: {
    backgroundColor: "#F9B934",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  applyButtonText: {
    color: "#1A3B63",
    fontSize: 16,
    fontWeight: "bold",
  },
  clearButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#1A3B63",
  },
  clearButtonText: {
    color: "#1A3B63",
    fontSize: 16,
    fontWeight: "600",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 5,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  chipActive: {
    backgroundColor: "#1A3B63",
    borderColor: "#1A3B63",
  },
  chipText: {
    color: "#666",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFF",
  },
});
