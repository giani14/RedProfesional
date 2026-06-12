import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function AyudaSoporteScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manual del Administrador</Text>
      <Text style={styles.desc}>
        Aquí tienes respuestas rápidas para la gestión de la plataforma
        "RedProfesional".
      </Text>

      <View style={styles.faqBox}>
        <Ionicons name="help-circle" size={20} color="#1A4670" />
        <Text style={styles.question}>
          ¿Cómo funciona el flujo de aprobación?
        </Text>
        <Text style={styles.answer}>
          Cuando un profesional sube su certificado, entra en estado
          "pendiente". Al verificar el documento, puedes aprobar su ingreso o
          rechazarlo si el archivo es ilegible.
        </Text>
      </View>

      <View style={styles.faqBox}>
        <Ionicons name="alert-circle" size={20} color="#D32F2F" />
        <Text style={styles.question}>
          ¿Qué hacer ante un error de Storage?
        </Text>
        <Text style={styles.answer}>
          Asegúrate de comprobar que las políticas RLS (Row Level Security) del
          bucket en Supabase permitan inserciones tanto a usuarios autenticados
          como públicos si aplica.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A4670",
    marginBottom: 5,
  },
  desc: { fontSize: 14, color: "#6B7280", marginBottom: 20 },
  faqBox: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  question: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
    marginBottom: 5,
  },
  answer: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
});
