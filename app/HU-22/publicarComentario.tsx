
//segunda pantalla de acuerdo a los muckups.

import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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

const MAX_LENGTH = 500;

// Datos de ejemplo del profesional a comentar.
// Reemplazar por la información real (props, params o consulta a Supabase).
// `foto` puede venir vacío/null; en ese caso se muestra el avatar por defecto.
const PROFESIONAL = {
  nombre: "Juan Pérez García",
  especialidad: "Electricista Profesional",
  foto: "",
};

export default function PublicarComentario() {
  const router = useRouter();
  const [comentario, setComentario] = useState("");
  // Controla si la imagen de perfil falló al cargarse para mostrar el avatar por defecto.
  const [fotoError, setFotoError] = useState(false);

  const mostrarFoto = !!PROFESIONAL.foto && !fotoError;

  const handlePublicar = () => {
    // TODO: enviar el comentario a Supabase / backend.
    router.push("/HU-22/comentarioPublicado");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* === HEADER === */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity hitSlop={10} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color={COLORS.white} />
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageTitle}>Publicar comentario</Text>

          {/* Tarjeta del profesional */}
          <View style={styles.profesionalCard}>
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
            <View style={styles.profesionalInfo}>
              <Text style={styles.profesionalNombre}>{PROFESIONAL.nombre}</Text>
              <Text style={styles.profesionalEspecialidad}>
                {PROFESIONAL.especialidad}
              </Text>
            </View>
          </View>

          {/* Comparte tu experiencia */}
          <View style={styles.experienciaRow}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color={COLORS.primaryBlue}
            />
            <View style={styles.experienciaText}>
              <Text style={styles.experienciaTitle}>Comparte tu experiencia</Text>
              <Text style={styles.experienciaSubtitle}>
                Tu opinión ayuda a otros clientes a tomar mejores decisiones.
              </Text>
            </View>
          </View>

          {/* Campo de comentario */}
          <Text style={styles.label}>Tu comentario</Text>
          <View style={styles.textAreaWrapper}>
            <TextInput
              style={styles.textArea}
              placeholder="Escribe tu experiencia con el servicio..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              maxLength={MAX_LENGTH}
              value={comentario}
              onChangeText={setComentario}
              textAlignVertical="top"
            />
            <Text style={styles.counter}>
              {comentario.length}/{MAX_LENGTH}
            </Text>
          </View>

          {/* Caja informativa */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={22} color={COLORS.primaryBlue} />
            <Text style={styles.infoText}>
              <Text style={styles.infoTextBold}>Sé claro y respetuoso. </Text>
              Tu comentario puede ser revisado antes de publicarse.
            </Text>
          </View>

          {/* Botón publicar */}
          <TouchableOpacity
            style={[styles.btnPrimary, !comentario.trim() && styles.btnDisabled]}
            activeOpacity={0.85}
            disabled={!comentario.trim()}
            onPress={handlePublicar}
          >
            <Text style={styles.btnPrimaryText}>Publicar comentario</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 18,
  },
  profesionalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
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
  profesionalInfo: {
    marginLeft: 14,
    flex: 1,
  },
  profesionalNombre: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textMain,
  },
  profesionalEspecialidad: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  experienciaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 22,
  },
  experienciaText: {
    flex: 1,
  },
  experienciaTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 4,
  },
  experienciaSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 8,
  },
  textAreaWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 22,
  },
  textArea: {
    minHeight: 120,
    fontSize: 15,
    color: COLORS.textMain,
    padding: 0,
  },
  counter: {
    alignSelf: "flex-end",
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: COLORS.infoBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  infoTextBold: {
    fontWeight: "700",
    color: COLORS.textMain,
  },
  btnPrimary: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accentGold,
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnPrimaryText: {
    color: COLORS.primaryBlue,
    fontSize: 17,
    fontWeight: "bold",
  },
});
