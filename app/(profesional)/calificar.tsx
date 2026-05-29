import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
  primaryBlue: "#1A3B63",
  accentGold: "#F9B934",
  white: "#FFFFFF",
  background: "#F3F4F6",
  textDark: "#1F2937",
  textGray: "#6B7280",
  borderGray: "#D1D5DB",
  danger: "#DC2626",
};

export default function CalificarServicio() {
  const router = useRouter();
  const { id, profesional_id, nombre, avatar_url, especialidad } = useLocalSearchParams<{
    id: string;
    profesional_id: string;
    nombre: string;
    avatar_url?: string;
    especialidad?: string;
  }>();

  const [rating, setRating] = useState<number>(0);
  const [comentario, setComentario] = useState<string>("");
  const [errorValidacion, setErrorValidacion] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            activeOpacity={0.7}
            onPress={() => {
              setRating(star);
              setErrorValidacion("");
            }}
            style={styles.starBtn}
          >
            <Ionicons
              name={rating >= star ? "star" : "star-outline"}
              size={48}
              color={rating >= star ? COLORS.accentGold : COLORS.borderGray}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const nombreReal = nombre || "Profesional";
  const getSiglas = (fullName: string) => {
    return fullName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const handleEnviar = async () => {
    if (rating === 0) {
      setErrorValidacion("Debe seleccionar una calificación.");
      return;
    }
    if (!id || !profesional_id) {
      alert("Error: Faltan datos obligatorios para calificar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Fallback seguro: intentamos guardar la reseña
      const resenaResp = await supabase.from("resenas").insert({
        solicitud_id: id,
        profesional_id: profesional_id,
        cliente_id: user?.id,
        calificacion: rating,
        comentario: comentario.trim(),
        creado_at: new Date().toISOString(),
      });

      // Actualizar rating del profesional (Try/Catch para evitar crasheo si columnas no existen)
      let newPromedioFixed = rating;
      let newTotalResenas = 1;
      try {
        const { data: profData } = await supabase.from("perfiles").select("calificacion, resenas").eq("id", profesional_id).single();
        let currentCalificacion = profData?.calificacion ? parseFloat(profData.calificacion) : 0;
        let currentResenas = profData?.resenas ? parseInt(profData.resenas) : 0;
        newTotalResenas = currentResenas + 1;
        newPromedioFixed = parseFloat((((currentCalificacion * currentResenas) + rating) / newTotalResenas).toFixed(1));
        
        await supabase.from("perfiles").update({ calificacion: newPromedioFixed, resenas: newTotalResenas }).eq("id", profesional_id);
      } catch (e) {
        console.log("No se pudo actualizar métricas automáticas, ignorando de forma segura.");
      }

      // Bloqueo antifraude local
      await AsyncStorage.setItem(`calificada_${id}`, "true");

      // Navegar a la pantalla de éxito
      router.replace(
        `/HU-21/calificacionEnviada?nombre=${encodeURIComponent(nombreReal)}&promedio=${newPromedioFixed}&total=${newTotalResenas}&avatar_url=${encodeURIComponent(avatar_url || "")}&especialidad=${encodeURIComponent(especialidad || "")}` as Href
      );
    } catch (error: any) {
      console.error("Error al enviar calificación:", error);
      alert("Ocurrió un error al enviar tu calificación. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      <View style={{ height: Platform.OS === "android" ? StatusBar.currentHeight : 0, backgroundColor: COLORS.primaryBlue }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting}>
          <Ionicons name="close" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calificar servicio</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.profileSection}>
          {avatar_url && avatar_url !== "null" && avatar_url !== "undefined" ? (
            <Image source={{ uri: decodeURIComponent(avatar_url) }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getSiglas(nombreReal)}</Text>
            </View>
          )}
          <Text style={styles.profName}>{nombreReal}</Text>
          <Text style={styles.profSpecialty}>{especialidad || "Especialista"}</Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.questionTitle}>¿Cómo fue tu experiencia?</Text>
          {renderStars()}
          {errorValidacion !== "" && <Text style={styles.errorText}>{errorValidacion}</Text>}
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>Comentario (Opcional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Escribe tu opinión sobre el servicio recibido..."
            placeholderTextColor={COLORS.textGray}
            multiline
            numberOfLines={4}
            maxLength={250}
            value={comentario}
            onChangeText={setComentario}
            editable={!isSubmitting}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
          onPress={handleEnviar}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryBtnText}>Enviar calificación</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 70, backgroundColor: COLORS.primaryBlue, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 20 },
  profileSection: { alignItems: "center", marginBottom: 30, marginTop: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 15 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryBlue, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  avatarInitials: { color: COLORS.white, fontSize: 32, fontWeight: "bold" },
  profName: { fontSize: 20, fontWeight: "bold", color: COLORS.textDark, marginBottom: 4 },
  profSpecialty: { fontSize: 14, color: COLORS.textGray },
  ratingSection: { backgroundColor: COLORS.white, borderRadius: 16, padding: 25, alignItems: "center", elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, marginBottom: 20 },
  questionTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark, marginBottom: 20 },
  starsContainer: { flexDirection: "row", justifyContent: "center", gap: 5 },
  starBtn: { padding: 2 },
  errorText: { color: COLORS.danger, marginTop: 15, fontWeight: "600", fontSize: 14 },
  commentSection: { marginBottom: 30 },
  commentLabel: { fontSize: 15, fontWeight: "bold", color: COLORS.textDark, marginBottom: 10 },
  textInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 15,
    color: COLORS.textDark,
  },
  primaryBtn: { backgroundColor: COLORS.accentGold, paddingVertical: 16, borderRadius: 12, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
  btnDisabled: { opacity: 0.7 },
});