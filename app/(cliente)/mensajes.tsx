import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const chatsEjemplo = [
  {
    id: "1",
    nombre: "Juan Pérez",
    ultimoMsj: "¿Cuándo empezamos el proyecto?",
    hora: "10:30 AM",
  },
  {
    id: "2",
    nombre: "Maria Gomez",
    ultimoMsj: "El presupuesto me parece bien.",
    hora: "Ayer",
  },
];

export default function MensajesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Mensajes</Text>

      <FlatList
        data={chatsEjemplo}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.msj} numberOfLines={1}>
                {item.ultimoMsj}
              </Text>
            </View>
            <Text style={styles.hora}>{item.hora}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
    paddingTop: 60,
  },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  chatCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFB100",
    justifyContent: "center",
    alignItems: "center",
  },
  chatInfo: { flex: 1, marginLeft: 15 },
  nombre: { fontWeight: "bold", fontSize: 16 },
  msj: { color: "#666", marginTop: 2 },
  hora: { fontSize: 12, color: "#999" },
});
