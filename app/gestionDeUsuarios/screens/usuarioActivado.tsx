import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type RootStackParamList = {
  Usuarios: undefined;
  UsuarioActivado: { name: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "UsuarioActivado">;

export default function UsuarioActivadoScreen({ navigation, route }: Props) {
  const { name } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de usuarios</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark" size={40} color="#16a34a" />
        </View>

        <Text style={styles.title}>Usuario activado</Text>
        <Text style={styles.subtitle}>
          La cuenta ha sido activada correctamente.
        </Text>

        <View style={styles.userCard}>
          <Image
            source={{ uri: "https://via.placeholder.com/50" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userStatus}>Cuenta activada</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Usuarios")}
        >
          <Text style={styles.buttonText}>Volver a usuarios</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.decorLeft} />
      <View style={styles.decorRight} />
    </SafeAreaView>
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

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  iconContainer: {
    backgroundColor: "#d1fae5",
    padding: 30,
    borderRadius: 100,
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 12,
    width: "100%",
    marginBottom: 30,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },

  userName: { fontWeight: "600" },
  userStatus: { fontSize: 12, color: "#6b7280" },

  button: {
    backgroundColor: "#fbbf24",
    padding: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },

  buttonText: { fontWeight: "600" },

  decorLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 120,
    height: 120,
    backgroundColor: "#3b82f6",
    borderTopRightRadius: 100,
  },

  decorRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 160,
    height: 120,
    backgroundColor: "#fde68a",
    borderTopLeftRadius: 100,
  },
});
