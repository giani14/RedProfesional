import { Ionicons } from "@expo/vector-icons";
import {
  Stack,
  useLocalSearchParams,
  useRouter
} from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- COLORES CORPORATIVOS ---
const COLORS = {
  primary: "#1A3B63", // Azul oscuro del Header
  accent: "#F9B934", // Amarillo del botón
  background: "#F3F4F6", // Gris claro de fondo
  success: "#10B981", // Verde del check
  successBg: "#D1FAE5", // Verde muy claro de fondo del check
  textPrimary: "#1A3B63", // Azul oscuro para textos principales
  textSecondary: "#6B7280", // Gris para textos secundarios
  cardBg: "#E8F0F8", // Azul muy pálido para la tarjeta de usuario
};

// --- COMPONENTE PRINCIPAL ---
export default function EstadoUsuarioScreen() {
  const router = useRouter();

  const { id, nombre, avatar_url, estado } = useLocalSearchParams();
  const getSiglas = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1A3B63" // Usando el azul de tu diseño
        translucent={true}
      />

      {/* Ajuste para la barra de estado del teléfono */}
      <View style={styles.safeAreaSpacing} />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIcon}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de usuarios</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* --- CUERPO CENTRAL --- */}
      <View style={styles.contentBody}>
        {/* Checkmark de éxito */}
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={50} color="#10B981" />
        </View>

        {/* Mensajes de éxito */}
        <Text style={styles.statusTitle}>Usuario actualizado</Text>
        <Text style={styles.statusSubtitle}>
          Los cambios se guardaron correctamente.
        </Text>

        {/* --- TARJETA DE PERFIL DE USUARIO DINÁMICA --- */}
        <View style={styles.userCard}>
          <View style={styles.userCardContent}>
            {/* Lógica de Foto o Siglas */}
            {avatar_url ? (
              <Image
                source={{ uri: avatar_url as string }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: "#1A3B63",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 20 }}
                >
                  {nombre
                    ? (nombre as string)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)
                    : "U"}
                </Text>
              </View>
            )}

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{nombre || "Usuario"}</Text>
              {/* --- LÓGICA DE TEXTO DINÁMICO --- */}
              <Text
                style={[
                  styles.userStatus,
                  { color: estado === "activo" ? "#10B981" : "#EF4444" }, // Opcional: Cambiar color de texto
                ]}
              >
                {estado === "activo" ? "Cuenta activada" : "Cuenta suspendida"}
              </Text>
            </View>
          </View>
        </View>

        {/* --- BOTONES DE ACCIÓN --- */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            // Reemplaza para limpiar el historial y asegurar que al volver se recarguen los datos
            router.replace("../gestionarUsuarios"); // Ajusta a tu ruta real de la lista
          }}
        >
          <Text style={styles.primaryButtonText}>Volver a usuarios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()} // Regresa a detalles sin perder el ID
        >
          <Text style={styles.secondaryButtonText}>Perfil del usuario</Text>
        </TouchableOpacity>
      </View>

      {/* Decoración inferior (Réplica de las ondas en la imagen) */}
      <View style={styles.bottomDecorations} pointerEvents="none">
        <View
          style={[
            styles.bottomWaveBlue,
            {
              position: "absolute",
              bottom: -50,
              left: -50,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "#A5C4D4",
              opacity: 0.5,
            },
          ]}
        />
        <View
          style={[
            styles.bottomWaveYellow,
            {
              position: "absolute",
              bottom: -100,
              right: -20,
              width: 250,
              height: 250,
              borderRadius: 125,
              backgroundColor: "#FDE68A",
              opacity: 0.5,
            },
          ]}
        />
      </View>
    </View>
  );
}

// --- ESTILOS (MÉTODO FLEXBOX PARA RÉPLICA EXACTA) ---
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  safeAreaSpacing: {
    height: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: COLORS.primary,
  },
  header: {
    height: 70,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    zIndex: 10,
  },
  headerIcon: { padding: 5 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  contentBody: {
    flex: 1,
    justifyContent: "center", // Centrado vertical
    alignItems: "center", // Centrado horizontal
    paddingHorizontal: 25,
    zIndex: 5,
  },

  // Icono de éxito (checkmark)
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45, // Círculo perfecto
    backgroundColor: COLORS.successBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30, // Espacio inferior
    elevation: 2, // Sombra suave en Android
    shadowColor: COLORS.success, // Sombra suave en iOS
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },

  // Textos de estado
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  statusSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 20,
  },

  // Tarjeta de perfil del usuario (Réplica exacta)
  userCard: {
    backgroundColor: COLORS.cardBg, // Fondo azul pálido
    width: "100%",
    borderRadius: 15, // Bordes redondeados
    padding: 15,
    marginBottom: 35,
    elevation: 1, // Sombra muy sutil
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  userCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5, // Círculo perfecto
    marginRight: 15,
    borderWidth: 2,
    borderColor: "white", // Borde blanco del avatar
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "bold", color: COLORS.textPrimary },
  userStatus: {
    fontSize: 13,
    //color: COLORS.textSecondary,
    marginTop: 2,
  },
  chevronIcon: { marginLeft: 10 },

  // Botón Principal (Amarillo corporativo)
  primaryButton: {
    backgroundColor: COLORS.accent,
    width: "100%",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2, // Sombra para darle profundidad
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  primaryButtonText: {
    color: COLORS.textPrimary, // Texto en azul oscuro sobre amarillo
    fontSize: 16,
    fontWeight: "bold",
  },

  // Botón Secundario (Estilo transparente con borde azul oscuro)
  secondaryButton: {
    backgroundColor: "transparent",
    width: "100%",
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.textPrimary, // Borde azul oscuro
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.textPrimary, // Texto en azul oscuro
    fontSize: 16,
    fontWeight: "bold",
  },

  // Ondas decorativas inferiores (Para replicar la imagen)
  bottomDecorations: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200, // Aumenta esto para que los círculos no se corten
    zIndex: 1,
    overflow: "hidden", // Esto asegura que no se salgan de la pantalla del cel
  },
  bottomWaveBlue: {
    position: "absolute",
    bottom: 0,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#6D9BC1", // Azul claro suave
    opacity: 0.6,
  },
  bottomWaveYellow: {
    position: "absolute",
    bottom: 0,
    right: -20,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#FDE08D", // Amarillo suave
    opacity: 0.7,
  },
  // Añade esto a tus estilos para el círculo de iniciales
  avatarPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: COLORS.primary, // Azul oscuro
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
