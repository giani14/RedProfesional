import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
//import { SafeAreaView } from "react-native-safe-area-context";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

// Paleta de colores exacta de RedProfesional
const COLORS = {
  primaryBlue: "#1A4670", // El azul marino superior
  accentGold: "#EAB308", // El amarillo del logo y botón
  bgColor: "#F3F4F6", // Fondo gris muy claro
  white: "#FFFFFF",
  textGray: "#6B7280",
  textBlue: "#1E3A8A", // El azul de los textos de enlaces
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validaciones básicas
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa correo y contraseña");
      return;
    }

    setLoading(true);

    try {
      // 2. Intentar iniciar sesión
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert("Error de inicio de sesión", error.message);

        return;
      }

      // 3. Si la cuenta es válida, redirigir a selRol
      if (data.user) {
        console.log("Login exitoso");
        // .replace evita que el usuario pueda volver atrás al login con el botón del celular
        router.replace("/selRol");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Iniciar sesión</Text>
        <View style={{ width: 4 }} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Fondo del cuerpo para el color gris claro */}
          <View style={styles.contentBody}>
            {/* 2. Logo de RedProfesional (Usa el logo correcto) */}
            <Image
              source={require("../assets/images/react-logo.png")} // <--- Asegúrate de tener este archivo
              style={styles.logo}
              resizeMode="contain"
            />

            {/* 3. Textos de Bienvenida */}
            <Text style={styles.welcomeTitle}>¡Bienvenido de nuevo!</Text>
            <Text style={styles.welcomeSubtitle}>
              Ingresa tus credenciales para continuar
            </Text>

            {/* 4. Formulario */}
            <View style={styles.form}>
              {/* Campo Correo */}
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.primaryBlue}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Campo Contraseña */}
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primaryBlue}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.textGray}
                  />
                </TouchableOpacity>
              </View>

              {/* Botón "¿Olvidaste tu contraseña?" (Borde amarillo, texto azul) */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              {/* Botón Principal "Ingresar" (Fondo amarillo) */}
              <TouchableOpacity
                style={[styles.mainButton, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.mainButtonText}>
                  {loading ? "Cargando..." : "Ingresar"}
                </Text>
              </TouchableOpacity>

              {/* Separador */}
              <View style={styles.separatorContainer}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>o</Text>
                <View style={styles.separatorLine} />
              </View>

              {/* Botón de Google (Contorno lineal) */}
              <TouchableOpacity style={styles.googleButton}>
                <FontAwesome
                  name="google"
                  size={20}
                  color="#DB4437"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.googleButtonText}>
                  Continuar con Google
                </Text>
              </TouchableOpacity>

              {/* Footer con Enlace de Registro */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.push("/selRol")}>
                  <Text style={styles.registerLink}>Regístrate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBlue },
  header: {
    height: 80,
    backgroundColor: COLORS.primaryBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30, // Para iOS
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  scrollContent: { flexGrow: 1, backgroundColor: COLORS.primaryBlue },
  contentBody: {
    flex: 1,
    backgroundColor: COLORS.bgColor,
    borderTopLeftRadius: 30, // Curva superior opcional para diseño
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 40,
    alignItems: "center",
  },
  logo: { width: 180, height: 60, marginBottom: 20 },
  welcomeTitle: { fontSize: 26, fontWeight: "bold", color: COLORS.primaryBlue },
  welcomeSubtitle: { fontSize: 14, color: COLORS.textGray, marginTop: 5 },
  form: { width: "100%", marginTop: 30 },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 20,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  forgotPassword: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: COLORS.accentGold,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: COLORS.textBlue,
    fontWeight: "bold",
    fontSize: 14,
  },
  mainButton: {
    backgroundColor: COLORS.accentGold,
    borderRadius: 15,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  mainButtonText: {
    color: COLORS.primaryBlue,
    fontSize: 18,
    fontWeight: "bold",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: "#D1D5DB" },
  separatorText: {
    marginHorizontal: 10,
    color: COLORS.textGray,
    fontWeight: "bold",
  },
  googleButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.primaryBlue,
    borderRadius: 15,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  googleButtonText: {
    color: COLORS.primaryBlue,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: { flexDirection: "row", justifyContent: "center", marginBottom: 40 },
  footerText: { color: COLORS.textGray, fontSize: 14 },
  registerLink: { color: COLORS.textBlue, fontWeight: "bold", fontSize: 14 },
});
