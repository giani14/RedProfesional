import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  white: "#FFFFFF",
  textGray: "#6B7280",
  lightGray: "#F3F4F6",
  borderGray: "#E5E7EB",
};

export default function PedidosCliente() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mis pedidos</Text>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Solicitud de servicio pendiente</Text>
          <Text style={styles.text}>Estado: En revisión</Text>
          <Text style={styles.text}>Fecha: Hoy</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Servicio solicitado</Text>
          <Text style={styles.text}>Estado: Aceptado</Text>
          <Text style={styles.text}>Fecha: Reciente</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Pedido finalizado</Text>
          <Text style={styles.text}>Estado: Completado</Text>
          <Text style={styles.text}>Fecha: Anterior</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 3,
  },
});