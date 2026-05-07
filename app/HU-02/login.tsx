import { supabase } from "@/lib/supabase";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

// Constantes de diseño para mantener consistencia
const COLORS = {
  primaryBlue: "#1E3A5F",
  accentGold: "#FBBF24",
  danger: "#EF4444",
  textGray: "#6B7280",
  placeholderGray: "#9CA3AF", // <--- NUEVO COLOR PARA EL PLACEHOLDER
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados de error mejorados
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const validateForm = () => {
    let newErrors = { email: "", password: "", general: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingresa un formato de correo válido.";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "La contraseña es obligatoria.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const emailLimpio = email.trim().toLowerCase();

      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: emailLimpio,
          password: password,
        },
      );

      if (authError) {
        setErrors((prev) => ({
          ...prev,
          general: "Credenciales inválidas. Verifica tu correo y contraseña.",
        }));
        setLoading(false);
        return;
      }

      const { data: perfilData, error: errorPerfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", data.user.id)
        .single();

      if (errorPerfil || !perfilData) {
        router.replace("/HU-05/selRol");
        return;
      }

      const rol = (perfilData.rol || "").toLowerCase().trim();

      if (rol === "administrador" || rol === "admin") {
        router.replace("/HOME/homeAdmin");
      } else if (rol === "cliente") {
        router.replace("/HOME/clienteHome");
      } else if (rol === "profesional") {
        router.replace("/HOME/clienteHome");
      } else {
        router.replace("/HU-05/selRol");
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        general: "Error de conexión. Inténtalo más tarde.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* SOLUCIÓN 2: StatusBar Transparente para quitar la barra negra inferior */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View style={styles.headerBar}>
        {/* SafeAreaView se encargará de dar el espacio exacto del notch/waybar */}
        <SafeAreaView
          edges={["top", "left", "right"]}
          style={styles.headerContent}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Iniciar sesión</Text>
          {/* Añadimos un View vacío para equilibrar el centrado del texto */}
          <View style={{ width: 24 }} />
        </SafeAreaView>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bgDecorationContainer}>
            <View style={[styles.shape, styles.shapeTopLeft]} />
            <View style={[styles.shape, styles.shapeBottomLeft]} />
            <View style={[styles.shape, styles.shapeBottomRight]} />
          </View>

          <View style={styles.content}>
            <Image
              source={require("@/assets/images/RedProfesional-removebg.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>¡Hola de nuevo!</Text>
            <Text style={styles.subtitle}>
              Accede a tu cuenta para continuar
            </Text>

            {/* Input Email */}
            <Text style={styles.label}>Correo electrónico</Text>
            <View
              style={[
                styles.inputContainer,
                !!errors.email && styles.inputError,
              ]}
            >
              <MaterialIcons
                name="email"
                size={20}
                color={COLORS.primaryBlue}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="correo@ejemplo.com"
                placeholderTextColor={COLORS.placeholderGray} // <--- SOLUCIÓN 1: Color legible
                style={styles.input}
                value={email}
                onChangeText={(txt) => {
                  setEmail(txt);
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {!!errors.email && (
                <MaterialIcons name="error" size={20} color={COLORS.danger} />
              )}
            </View>
            {!!errors.email && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={COLORS.danger} />
                <Text style={styles.errorTextInline}>{errors.email}</Text>
              </View>
            )}

            {/* Input Password */}
            <Text style={styles.label}>Contraseña</Text>
            <View
              style={[
                styles.inputContainer,
                !!errors.password && styles.inputError,
              ]}
            >
              <Feather
                name="lock"
                size={20}
                color={COLORS.primaryBlue}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Tu contraseña"
                placeholderTextColor={COLORS.placeholderGray} // <--- SOLUCIÓN 1: Color legible
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
                onChangeText={(txt) => {
                  setPassword(txt);
                  setErrors((p) => ({ ...p, password: "" }));
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color={COLORS.textGray}
                />
              </TouchableOpacity>
            </View>
            {!!errors.password && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={COLORS.danger} />
                <Text style={styles.errorTextInline}>{errors.password}</Text>
              </View>
            )}

            {/* Error General */}
            {!!errors.general && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning" size={18} color={COLORS.danger} />
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => router.push("/HU-02/recupeContra")}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.primaryBlue} />
              ) : (
                <Text style={styles.mainButtonText}>Ingresar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>o también</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.googleButton}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
                }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>Continuar con Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Aún no eres parte? </Text>
              <TouchableOpacity onPress={() => router.push("/HU-01/registrar")}>
                <Text style={styles.footerLink}>Únete aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SOLUCIÓN FINAL: Barra azul delgada inferior donde la navegación nativa */}
      <View style={styles.blueBottomBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.white },
  headerBar: { backgroundColor: COLORS.primaryBlue },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Ayuda a centrar el título
    paddingHorizontal: 16,
    paddingBottom: 15,
    paddingTop: 5, // Un pequeño respiro extra opcional
  },
  backButton: { padding: 4 },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1, // Esto hace que el título ocupe el centro
  },
  scrollContent: { flexGrow: 1, paddingBottom: 60 }, // Más espacio abajo para la barra
  bgDecorationContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    overflow: "hidden",
  },
  shape: { position: "absolute", opacity: 0.3 },
  shapeTopLeft: {
    top: -40,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.accentGold,
  },
  shapeBottomLeft: {
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#3B82F6",
  },
  shapeBottomRight: {
    bottom: -20,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accentGold,
  },
  content: { paddingHorizontal: 30, paddingTop: 20 },
  logo: { width: "100%", height: 100, marginBottom: 10 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primaryBlue,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#1F2937" },
  inputError: { borderColor: COLORS.danger, backgroundColor: "#FFF5F5" },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingLeft: 5,
  },
  errorTextInline: {
    color: COLORS.danger,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  errorBannerText: {
    color: COLORS.danger,
    fontSize: 13,
    marginLeft: 8,
    fontWeight: "600",
    flex: 1,
  },
  forgotContainer: { alignItems: "flex-end", marginVertical: 12 },
  forgotText: { color: "#2563EB", fontWeight: "600", fontSize: 13 },
  mainButton: {
    backgroundColor: COLORS.accentGold,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    elevation: 3,
  },
  mainButtonText: {
    color: COLORS.primaryBlue,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: { backgroundColor: "#FDE68A", elevation: 0 },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: {
    paddingHorizontal: 10,
    color: COLORS.textGray,
    fontSize: 12,
    fontWeight: "bold",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primaryBlue,
    borderRadius: 12,
    height: 50,
  },
  googleIcon: { width: 20, height: 20, marginRight: 12 },
  googleText: { color: COLORS.primaryBlue, fontSize: 14, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  footerText: { color: "#4B5563", fontSize: 14 },
  footerLink: { color: "#2563EB", fontSize: 14, fontWeight: "bold" },

  // SOLUCIÓN 2 FINAL: Estilo para la barra azul delgada inferior
  blueBottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: Platform.OS === "android" ? 15 : 20, // Altura delgada
    backgroundColor: COLORS.primaryBlue,
    zIndex: 100, // Asegura que esté por encima de las decoraciones
  },
});
