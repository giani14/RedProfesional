import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

interface UsuarioDetalle {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
  estado: string;
  creado_at: string;
  avatar_url?: string;
  telefono?: string;
  ultimo_acceso?: string;
}

// --- PANTALLA PRINCIPAL DE DETALLE ---
export default function DetalleUsuarioScreen() {
  const router = useRouter();
  // Estado para controlar el modal de suspensión
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [activarModalVisible, setActivarModalVisible] = useState(false);
  const { id } = useLocalSearchParams();
  const [usuario, setUsuario] = useState<UsuarioDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      // Esta función se dispara cada vez que la pantalla vuelve a estar en primer plano
      if (id) {
        fetchDetalleUsuario(); // Llama a tu función que trae los datos de Supabase
      }
    }, [id]) // Solo se recrea si el ID del usuario cambia
  );

  async function fetchDetalleUsuario() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setUsuario(data);
    } catch (error: any) {
      console.error("Error cargando detalle:", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <ActivityIndicator size="large" color="#1A3B63" style={{ flex: 1 }} />
    );

  const handleConfirmarSuspension = async () => {
    try {
      // 1. Actualizar el estado en Supabase
      const { error } = await supabase
        .from("perfiles")
        .update({ estado: "suspendido" })
        .eq("id", usuario?.id);

      if (error) throw error;

      // 2. Cerrar el modal de confirmación
      setSuspendModalVisible(false);

      // 3. Navegar a la pantalla de confirmación final
      // Pasamos el nombre por si quieres mostrarlo en la siguiente pantalla
      router.push({
        pathname: "/estUsuario",
        params: { nombre: usuario?.nombre_completo, estado: "suspendido" },
      });
    } catch (error: any) {
      console.error("Error al suspender:", error.message);
      alert("Hubo un error al procesar la suspensión.");
    }
  };

  const handleConfirmarActivacion = async () => {
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ estado: 'activo' })
        .eq('id', usuario?.id);

      if (error) throw error;

      // Actualizamos la UI localmente
      setUsuario(prev => prev ? { ...prev, estado: 'activo' } : null);
      setActivarModalVisible(false);
      
      // Navegamos a la pantalla de éxito con el nuevo estado
      router.push({
        pathname: "/estUsuario",
        params: { nombre: usuario?.nombre_completo, estado: 'activo' }
      });
    } catch (error: any) {
      alert("No se pudo activar la cuenta.");
    }
  };

  const getSiglas = (fullName: string) => {
    if (!fullName) return "U";
    return fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1A3B63"
        translucent={true}
      />

      {/* Ajuste para la barra de estado */}
      <View style={styles.safeAreaSpacing} />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de usuario</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* --- PERFIL Y ESTADO DINÁMICO --- */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {/* Contenedor del Avatar con estilo unificado */}
            <View style={styles.detailAvatarContainer}>
              <Text style={styles.detailAvatarText}>
                {usuario?.nombre_completo 
                  ? usuario.nombre_completo.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) 
                  : "U"}
              </Text>
            </View>

            {/* Badge de estado corregido con tus colores */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    usuario?.estado === "activo" ? "#D1FAE5" : "#FEE2E2",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color: usuario?.estado === "activo" ? "#10B981" : "#EF4444",
                  },
                ]}
              >
                {usuario?.estado
                  ? usuario.estado.charAt(0).toUpperCase() + usuario.estado.slice(1)
                  : "Cargando..."}
              </Text>
            </View>
          </View>
          
          <Text style={styles.profileName}>
            {usuario?.nombre_completo || "Cargando..."}
          </Text>
        </View>

        {/* --- TARJETA DE INFORMACIÓN CON DATOS DE BASE DE DATOS --- */}
        <View style={styles.infoCard}>
          {/* Correo */}
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="mail-outline" size={22} color="#1A3B63" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Correo electrónico</Text>
              <Text style={styles.infoValue}>{usuario?.email}</Text>
            </View>
          </View>

          {/* Teléfono (OBSERVACIÓN: Manejo de columna inexistente) */}
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="call-outline" size={22} color="#1A3B63" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text
                style={
                  usuario?.telefono ? styles.infoValue : styles.noPhoneText
                }
              >
                {usuario?.telefono || "No tiene teléfono registrado"}
              </Text>
            </View>
          </View>

          {/* Rol */}
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name="account-search-outline"
                size={24}
                color="#1A3B63"
              />
            </View>
            <View>
              <Text style={styles.infoLabel}>Rol</Text>
              <View
                style={[
                  styles.roleTag,
                  {
                    backgroundColor:
                      usuario?.rol === "Cliente" ? "#FDE08D" : "#D1E3F8",
                  },
                ]}
              >
                <Text style={styles.roleTagText}>{usuario?.rol}</Text>
              </View>
            </View>
          </View>

          {/* Fecha Registro Formateada */}
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar-outline" size={22} color="#1A3B63" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Fecha de registro</Text>
              <Text style={styles.infoValue}>
                {usuario?.creado_at
                  ? new Date(usuario.creado_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* --- ACTIVIDAD RECIENTE --- */}
        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        <View style={styles.activityCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="time-outline" size={22} color="#1A3B63" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Último acceso</Text>
              <Text style={styles.infoValue}>
                {/* Puedes conectar esto con una columna 'ultimo_acceso' si la tienes */}
                {usuario?.ultimo_acceso || "Sin registros recientes"}
              </Text>
            </View>
          </View>
        </View>

        {/* --- BOTONES DE ACCIÓN --- */}
        <TouchableOpacity style={styles.editButton}>
          <Ionicons
            name="create-outline"
            size={20}
            color="#1A3B63"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.editButtonText}>Editar información</Text>
        </TouchableOpacity>

        {/* --- BOTÓN DE ACCIÓN CONDICIONAL --- */}
        {usuario?.estado === 'suspendido' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.activarButton]}
            onPress={() => setActivarModalVisible(true)} // Necesitarás un nuevo modal o reutilizar el actual
          >
            <Ionicons name="play-circle-outline" size={24} color="#10B981" />
            <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Activar cuenta</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.suspenderButton]}
            onPress={() => setSuspendModalVisible(true)}
          >
            <Ionicons name="pause-outline" size={24} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Suspender cuenta</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* --- MODAL DE SUSPENSIÓN --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={suspendModalVisible}
        onRequestClose={() => setSuspendModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.warningIconCircle}>
              <Ionicons name="alert-outline" size={40} color="#EF4444" />
            </View>

            <Text style={styles.confirmTitle}>Suspender cuenta</Text>
            <Text style={styles.confirmSubtitle}>
              El usuario {usuario?.nombre_completo} no podrá iniciar sesión
              hasta que su cuenta sea activada nuevamente.
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmarSuspension}
            >
              <Text style={styles.confirmButtonText}>Confirmar suspensión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSuspendModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* --- MODAL DE ACTIVACIÓN --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={activarModalVisible}
        onRequestClose={() => setActivarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={[styles.warningIconCircle, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle-outline" size={40} color="#10B981" />
            </View>

            <Text style={styles.confirmTitle}>Activar cuenta</Text>
            <Text style={styles.confirmSubtitle}>
              El usuario {usuario?.nombre_completo} podrá acceder nuevamente a todas las funciones del sistema.
            </Text>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: '#10B981' }]} // Verde para activar
              onPress={handleConfirmarActivacion}
            >
              <Text style={[styles.confirmButtonText, { color: 'white' }]}>Confirmar activación</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setActivarModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- ESTILOS (MODIFICADOS PARA RÉPLICA EXACTA) ---
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
  backButton: { padding: 5 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  body: { flex: 1, paddingHorizontal: 20 },
  profileSection: { alignItems: "center", marginTop: 30, marginBottom: 25 },
  avatarWrapper: { 
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // Necesario para posicionar el badge de estado
    marginBottom: 10, 
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "white",
  },
  statusBadge: {
    position: "absolute", // Lo posicionamos sobre la foto
    right: -10,
    top: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white", // Borde blanco para que no se mezcle con el fondo
  },
  statusBadgeText: { color: "#10B981", fontWeight: "bold", fontSize: 12 },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A3B63",
    textAlign: "center",
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: "#F0F7FF", // Azul pálido exacto
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    // Sombra sutil para dar profundidad
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 20 },
  iconBox: { width: 45, alignItems: "center" },
  infoLabel: { fontSize: 13, color: "#666", fontWeight: "600" },
  infoValue: { fontSize: 15, color: "#333", fontWeight: "700", marginTop: 2 },
  roleTag: {
    backgroundColor: "#FDE08D",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  roleTagText: { color: "#1A3B63", fontWeight: "bold", fontSize: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  activityCard: {
    backgroundColor: "#E8F0F8",
    borderRadius: 15,
    padding: 20,
    paddingBottom: 0,
    marginBottom: 30,
  },
  editButton: {
    flexDirection: "row",
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1A3B63",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  editButtonText: { color: "#1A3B63", fontSize: 16, fontWeight: "bold" },
  suspendButton: {
    flexDirection: "row",
    height: 55,
    borderRadius: 12,
    backgroundColor: "#FEE2E2", // Fondo rojo suave sin borde
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  suspendButtonText: { color: "#EF4444", fontSize: 16, fontWeight: "bold" },

  // --- ESTILOS DEL MODAL (ESTA ES LA CLAVE DE LA RÉPLICA) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente oscuro
    justifyContent: "flex-end", // <--- IMPORTANTE: Empuja el modal hacia ABAJO
    alignItems: "center",
  },
  confirmModalContent: {
    backgroundColor: "white",
    width: "100%", // <--- IMPORTANTE: Ocupa todo el ancho
    // Solo redondeamos las esquinas superiores, las inferiores se quedan rectas
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingTop: 30,
    paddingBottom: 40, // Más espacio abajo para que no se corte en teléfonos modernos
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 }, // Sombra hacia arriba
    shadowOpacity: 0.25,
    shadowRadius: 5,
    alignItems: "center", // <--- Centra los elementos horizontalmente (icono, títulos)
    justifyContent: "center", // <--- Ayuda a centrar verticalmente si el modal crece
    flexDirection: "column", // <--- Asegura que se apilen uno debajo del otro
  },
  warningIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FEE2E2", // Fondo rojo claro
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A3B63",
    marginBottom: 10,
  },
  confirmSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: "#F3B33D", // Color mostaza de la imagen
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmButtonText: {
    color: "#1A3B63",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1A3B63",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#1A3B63",
    fontWeight: "600",
  },
  noPhoneText: {
    fontSize: 14,
    color: "#9CA3AF", // Gris más claro
    fontStyle: "italic",
    marginTop: 2,
  },
  roleTagCliente: { backgroundColor: "#FDE08D" },
  roleTagProfesional: { backgroundColor: "#D1E3F8" },
  activarButton: {
    backgroundColor: '#D1FAE5', // Fondo verde claro
    borderColor: '#10B981',     // Borde verde esmeralda
    borderWidth: 1,
  },
  suspenderButton: {
    backgroundColor: '#FEE2E2', // Fondo rojo claro que ya tienes
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Dentro de tu StyleSheet.create
  detailAvatarContainer: {
    width: 90, // Tamaño más grande para el detalle
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1A3B63", // El azul marino oscuro de tu identidad visual
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3, // Borde blanco más grueso para resaltar
    borderColor: "white",
    elevation: 6, // Sombra para dar profundidad
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  detailAvatarText: {
    color: "white",
    fontSize: 32, // Letras grandes y legibles
    fontWeight: "bold",
  },
});
