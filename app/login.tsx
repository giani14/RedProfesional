import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

// --- COMPONENTE DEL LOGOTIPO REDPROFESIONAL (SIN CAMBIOS) ---
const RedProfesionalLogo = () => {
  return (
    <View style={logoStyles.container}>
      <View style={logoStyles.backgroundCircles}>
        <View
          style={[
            logoStyles.circle,
            {
              backgroundColor: "#F9B934",
              width: 70,
              height: 70,
              top: 0,
              left: 30,
            },
          ]}
        />
        <View
          style={[
            logoStyles.circle,
            {
              backgroundColor: "#FDCB5D",
              width: 50,
              height: 50,
              top: 40,
              left: 70,
            },
          ]}
        />
        <View
          style={[
            logoStyles.circle,
            {
              backgroundColor: "#2D5C8A",
              width: 30,
              height: 30,
              top: 10,
              right: 10,
              opacity: 0.6,
            },
          ]}
        />
        <View style={logoStyles.diagonalLine} />
      </View>
      <View style={logoStyles.textContainer}>
        <Text style={logoStyles.redText}>Red</Text>
        <Text style={logoStyles.profesionalText}>Profesional</Text>
      </View>
    </View>
  );
};

// --- PANTALLA PRINCIPAL DE LOGIN ---
export default function LoginScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    // Verificamos el rol en la tabla 'perfiles' que vimos en tu Supabase
    const { data: perfil, error: perfilError } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", data.user.id)
      .single();

    if (perfil?.rol === "Administrador") {
      setLoading(false);
      router.replace("/homeAdmin");
    } else {
      setLoading(false);
      Alert.alert("Acceso denegado", "No tienes permisos de administrador.");
      await supabase.auth.signOut(); // Cerramos sesión por seguridad
    }
  }

  return (
    // Contenedor principal con el color azul del header para la barra de estado
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* StatusBar configurada para integrarse al diseño */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1A3B63"
        translucent={true}
      />

      {/* Este View crea el espacio necesario para que no choque con la waybar */}
      <View style={styles.safeAreaSpacing} />

      {/* Header Azul */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Iniciar sesión</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Cuerpo de la pantalla */}
      <ScrollView
        style={styles.bodyBackground}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoMargin}>
          <RedProfesionalLogo />
        </View>

        {/* Textos de Bienvenida */}
        <Text style={styles.welcomeTitle}>Bienvenido de nuevo</Text>
        <Text style={styles.welcomeSubtitle}>
          Ingresa tus credenciales para continuar
        </Text>

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#1A3B63"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="ejemplo@correo.com"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#1A3B63"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!passwordVisible}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>

          {/* Olvidaste tu contraseña */}
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón Ingresar */}
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.8}
            onPress={signInWithEmail} // La función que valida en Supabase
            disabled={loading} // Evita clics dobles mientras carga
          >
            {loading ? (
              <ActivityIndicator color="#1A3B63" />
            ) : (
              <Text style={styles.loginButtonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          {/* Separador "o" */}
          <View style={styles.separatorContainer}>
            <View style={styles.line} />
            <Text style={styles.separatorText}>o</Text>
            <View style={styles.line} />
          </View>

          {/* Botón Google */}
          <TouchableOpacity style={styles.googleButton}>
            <FontAwesome5
              name="google"
              size={20}
              color="#DB4437"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Registro */}
          <View style={styles.registerContainer}>
            <Text style={styles.noAccountText}>¿No tienes cuenta? </Text>
            <TouchableOpacity>
              <Text style={styles.registerText}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Decoración inferior */}
      <View style={styles.bottomDecorations}>
        <View style={styles.bottomWaveBlue} />
        <View style={styles.bottomWaveYellow} />
      </View>
    </View>
  );
}

// --- ESTILOS ---

const logoStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 110,
    width: "100%",
  },
  backgroundCircles: { position: "absolute", width: "80%", height: "100%" },
  circle: { position: "absolute", borderRadius: 100 },
  diagonalLine: {
    position: "absolute",
    width: 2,
    height: 90,
    backgroundColor: "#3878B3",
    top: 10,
    right: "35%",
    transform: [{ rotate: "45deg" }],
  },
  textContainer: { flexDirection: "row", zIndex: 10, marginTop: 20 },
  redText: { fontSize: 32, fontWeight: "bold", color: "#D85C31" },
  profesionalText: { fontSize: 32, fontWeight: "bold", color: "#1A3B63" },
});

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#1A3B63", // Azul oscuro para que la barra de estado coincida
  },
  safeAreaSpacing: {
    height: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#1A3B63",
  },
  header: {
    height: 60,
    backgroundColor: "#1A3B63",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600" },
  backButton: { padding: 5 },
  bodyBackground: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Volvemos al gris claro para el contenido
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  logoMargin: { marginTop: 30, marginBottom: 10 },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A3B63",
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 25,
  },
  form: { width: "100%" },
  label: { fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 20,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#333", fontSize: 15 },
  forgotButton: {
    alignSelf: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#F9B934",
    borderRadius: 8,
    marginBottom: 25,
  },
  forgotText: { color: "#1A3B63", fontWeight: "600", fontSize: 13 },
  loginButton: {
    backgroundColor: "#F9B934",
    height: 55,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  loginButtonText: { color: "#1A3B63", fontSize: 18, fontWeight: "bold" },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  line: { flex: 1, height: 1, backgroundColor: "#D1D5DB" },
  separatorText: { marginHorizontal: 10, color: "#333", fontWeight: "bold" },
  googleButton: {
    flexDirection: "row",
    height: 55,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1A3B63",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButtonText: { color: "#1A3B63", fontSize: 16, fontWeight: "600" },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  noAccountText: { color: "#666", fontSize: 15 },
  registerText: {
    color: "#1A3B63",
    fontSize: 15,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  bottomDecorations: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: -1,
  },
  bottomWaveBlue: {
    position: "absolute",
    bottom: -20,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#6D9BC1",
    opacity: 0.5,
  },
  bottomWaveYellow: {
    position: "absolute",
    bottom: -30,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#FDE08D",
    opacity: 0.6,
  },
});
