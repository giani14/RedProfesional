import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateForm = () => {
    let ok = true;
    setEmailError("");

    if (!email.trim()) {
      setEmailError("El correo electrónico es obligatorio.");
      ok = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Ingresa un correo electrónico válido.");
      ok = false;
    }
    return ok;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Verificamos el perfil y traemos el nombre completo
      const { data: perfil, error: fetchError } = await supabase
        .from("perfiles")
        .select("nombre_completo")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      console.log("Datos del perfil encontrado:", perfil);

      if (!perfil || !perfil.nombre_completo) {
        router.push({
          pathname: "/HU-02/correoInexiste",
          params: { emailErroneo: email.trim() },
        });
        return;
      }

      // 2. Enviamos el correo.
      // Usamos 'user_name' para que coincida con la plantilla que ya tienes.
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: "redprofesional://HU-02/nuevaContra",
          data: {
            full_name: perfil.nombre_completo, // Este es el dato que viajará a la plantilla
          },
        } as any,
      );

      if (!error) {
        Alert.alert(
          "Correo enviado",
          "Revisa tu bandeja de entrada. Haz clic en el enlace del correo para restablecer tu contraseña.",
          [{ text: "OK" }], // quitamos el on press
        );
      } else {
        Alert.alert("Error", error.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Bar azul */}
      <View style={styles.headerBar}>
        <SafeAreaView edges={["top"]} style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar contraseña</Text>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Decoraciones de fondo */}
        <View style={styles.bgDecorationContainer}>
          <View style={[styles.shape, styles.shapeBottomLeft]} />
          <View style={[styles.shape, styles.shapeBottomRight]} />
        </View>

        <View style={styles.content}>
          <Image
            source={require("@/assets/images/RedProfesional-removebg.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </Text>

          {/* Campo Correo */}
          <Text style={styles.label}>Correo electrónico</Text>
          <View
            style={[styles.inputContainer, emailError && styles.inputError]}
          >
            <MaterialIcons
              name="email"
              size={22}
              color="#1E3A5F"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="juan.perez@correo.com"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={email}
              onChangeText={(txt) => {
                setEmail(txt);
                setEmailError("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {!!emailError && (
              <MaterialIcons name="error" size={20} color="#EF4444" />
            )}
          </View>

          {/* Advertencia de error con icono debajo del input */}
          {!!emailError && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorTextInline}>{emailError}</Text>
            </View>
          )}

          {/* Botón Enviar */}
          <TouchableOpacity
            style={[styles.mainButton, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1E3A5F" />
            ) : (
              <Text style={styles.mainButtonText}>Enviar enlace</Text>
            )}
          </TouchableOpacity>

          {/* Volver al Login */}
          <TouchableOpacity
            style={styles.footerLinkContainer}
            onPress={() => router.back()}
          >
            <Text style={styles.footerLinkText}>
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerBar: {
    backgroundColor: "#1E3A5F",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 15,
    paddingTop: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginRight: 32,
  },
  scrollContent: {
    flexGrow: 1,
  },
  bgDecorationContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  shape: {
    position: "absolute",
    opacity: 0.5,
  },
  shapeBottomLeft: {
    bottom: -50,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#3B82F6",
  },
  shapeBottomRight: {
    bottom: -30,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#FDE68A",
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  logo: {
    width: "100%",
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E3A5F",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: "#1F2937",
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  errorTextInline: {
    color: "#EF4444",
    fontSize: 13,
    marginLeft: 4,
  },
  mainButton: {
    backgroundColor: "#FBBF24",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  mainButtonText: {
    color: "#1E3A5F",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#FDE68A",
  },
  footerLinkContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  footerLinkText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "bold",
  },
});
