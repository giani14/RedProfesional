import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DatosActua() {
  const router = useRouter();
  // Recibimos los datos para mostrarlos en el resumen
  const { nombre, correo, telefono } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Azul */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Datos actualizados</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Checkmark Verde */}
        <View style={styles.checkContainer}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={60} color="#4CAF50" />
          </View>
        </View>

        <Text style={styles.mainTitle}>¡Datos actualizados!</Text>
        <Text style={styles.subtitle}>
          Tu información ha sido guardada correctamente.
        </Text>

        {/* Card de Información */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={20} color="#1A4670" />
            </View>
            <View>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.value}>{nombre || "No especificado"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="email" size={20} color="#1A4670" />
            </View>
            <View>
              <Text style={styles.label}>Correo</Text>
              <Text style={styles.value}>{correo || "No especificado"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={20} color="#1A4670" />
            </View>
            <View>
              <Text style={styles.label}>Teléfono</Text>
              <Text style={styles.value}>{telefono || "No especificado"}</Text>
            </View>
          </View>
        </View>

        {/* Botón de Acción */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/HU-04/miPerfil")} // Ajusta esta ruta a tu perfil principal
        >
          <Text style={styles.buttonText}>Ver a mi perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#1A4670",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  checkContainer: {
    marginBottom: 20,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 10,
    borderColor: "#C8E6C9",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A4670",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: "#DDE7F2",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    marginBottom: 40,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  label: {
    fontSize: 12,
    color: "#757575",
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    backgroundColor: "#F0B323",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#1A4670",
    fontSize: 16,
    fontWeight: "bold",
  },
});
