
////tercera pantalla de acuerdo a los muckups.

import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#FBBF24",
  success: "#22C55E",
  textMain: "#111827",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  background: "#F3F4F6",
  cardBorder: "#E5E7EB",
  infoBg: "#EFF6FF",
};

// Datos de ejemplo del profesional comentado.
// Reemplazar por la información real (props, params o consulta a Supabase).
// `foto` puede venir vacío/null; en ese caso se muestra el avatar por defecto.
const PROFESIONAL = {
  nombre: "Juan Pérez García",
  especialidad: "Electricista Profesional",
  foto: "",
};

const TOTAL_ESTRELLAS = 5;

// Calificación del comentario recién publicado.
// Se controla desde el código (no editable por el usuario). Admite decimales (ej. 0, 3.5, 4.2).
const CALIFICACION = 0;

export default function ComentarioPublicado() {
  const router = useRouter();
  // Controla si la imagen de perfil falló al cargarse para mostrar el avatar por defecto.
  const [fotoError, setFotoError] = useState(false);

  const mostrarFoto = !!PROFESIONAL.foto && !fotoError;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* === HEADER === */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity hitSlop={10}>
            <Ionicons name="menu" size={26} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            <Text style={{ color: "#EF4444" }}>Red</Text>
            <Text style={{ color: COLORS.accentGold }}>Profesional</Text>
          </Text>

          <TouchableOpacity hitSlop={10}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* === CONTENIDO === */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Ícono de éxito */}
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={48} color={COLORS.white} />
        </View>

        <Text style={styles.title}>¡Comentario publicado!</Text>
        <Text style={styles.subtitle}>Gracias por compartir tu experiencia.</Text>

        {/* Caja informativa */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={22} color={COLORS.primaryBlue} />
          <Text style={styles.infoText}>
            Tu comentario puede ser revisado antes de publicarse en el perfil del
            profesional.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Así se verá en el perfil del profesional</Text>

        {/* Card del comentario reciente */}
        <View style={styles.card}>
          {mostrarFoto ? (
            <Image
              source={{ uri: PROFESIONAL.foto }}
              style={styles.avatar}
              onError={() => setFotoError(true)}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={32} color={COLORS.textSecondary} />
            </View>
          )}

          <View style={styles.cardInfo}>
            <Text style={styles.cardNombre}>{PROFESIONAL.nombre}</Text>
            <Text style={styles.cardEspecialidad}>{PROFESIONAL.especialidad}</Text>

            {/* Estrellas de solo lectura, controladas por CALIFICACION */}
            <View style={styles.starsRow}>
              {Array.from({ length: TOTAL_ESTRELLAS }).map((_, i) => {
                const valor = i + 1;
                let nombre: keyof typeof Ionicons.glyphMap = "star-outline";
                if (CALIFICACION >= valor) {
                  nombre = "star";
                } else if (CALIFICACION >= valor - 0.5) {
                  nombre = "star-half";
                }
                return (
                  <Ionicons
                    key={valor}
                    name={nombre}
                    size={20}
                    color={COLORS.accentGold}
                  />
                );
              })}
              <Text style={styles.calificacionValor}>
                {CALIFICACION.toFixed(1)}
              </Text>
            </View>

            <Text style={styles.cardNota}>Calificación promedio actualizada</Text>
          </View>
        </View>

        {/* Botón: Ir a inicio */}
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.85}
          onPress={() => router.push("/")}
        >
          <Ionicons name="home-outline" size={20} color={COLORS.primaryBlue} />
          <Text style={styles.btnPrimaryText}>Ir a inicio</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafe: {
    backgroundColor: COLORS.primaryBlue,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  scroll: {
    padding: 16,
    alignItems: "center",
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 18,
    elevation: 4,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: COLORS.infoBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    width: "100%",
  },
  infoText: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.cardBorder,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    marginLeft: 14,
    flex: 1,
  },
  cardNombre: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textMain,
  },
  cardEspecialidad: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  calificacionValor: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  cardNota: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    width: "100%",
  },
  btnPrimaryText: {
    flex: 1,
    color: COLORS.primaryBlue,
    fontSize: 16,
    fontWeight: "700",
  },
});
