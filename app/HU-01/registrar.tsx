import { supabase } from "@/lib/supabase";
import {
  AntDesign,
  Entypo,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const logoImg = require("@/assets/images/RedProfesional-removebg.png");
const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const router = useRouter();
  // --- NUEVA FUNCIÓN DE FILTRADO PARA EL NOMBRE ---
  const handleNameChange = (text: string) => {
    // Solo permite letras (incluye tildes y ñ) y espacios
    // El símbolo ^ dentro de [] significa "todo lo que NO sea esto"
    const filteredText = text.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ ]/g, "");
    setFullName(filteredText);
  };
  // Estados de los campos
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Estados de control
  const [isSuccess, setIsSuccess] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- VALIDACIONES MEJORADAS ---
  const emailRegex = /\S+@\S+\.\S+/;
  const isEmailValid = emailRegex.test(email);

  // Requisitos: Mín 8 caracteres, una mayúscula y un número
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordStrong = password.length >= 8 && hasUpperCase && hasNumber;

  const passwordsMatch = password === confirmPassword && password !== "";

  const isFormInvalid =
    !fullName.trim() ||
    !isEmailValid ||
    !isPasswordStrong ||
    !passwordsMatch ||
    !acceptedTerms;

  const handleRegister = async () => {
    if (isFormInvalid) return;

    setLoading(true);

    try {
      // 1. Registro en Auth (Supabase maneja la creación del usuario)
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // 2. Crear perfil inicial (ROL en NULL para forzar selRol.tsx después)
        const { error: dbError } = await supabase.from("perfiles").insert([
          {
            id: data.user.id,
            nombre_completo: fullName.trim(),
            email: email.trim().toLowerCase(),
            rol: null, // Se definirá en la pantalla HU-05/selRol
          },
        ]);

        if (dbError) throw dbError;

        setIsSuccess(true);
      }
    } catch (err: any) {
      console.error("ERROR REGISTRO:", err);
      let msg = "Ocurrió un error inesperado.";

      if (err.message.includes("already registered")) {
        msg = "Este correo electrónico ya está registrado.";
      }

      Alert.alert("Error de registro", msg);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successContent}>
          <View style={styles.checkCircle}>
            <AntDesign name="check" size={80} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>¡Bienvenido!</Text>
          <Text style={styles.successSubtitle}>
            Tu cuenta ha sido creada.{"\n"}
            Ahora inicia sesión para elegir tu rol.
          </Text>
          <TouchableOpacity
            style={styles.btnMain}
            onPress={() => router.replace("/HU-02/login")}
          >
            <Text style={styles.btnText}>Ir al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.main}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#1E3A5F" />

      <View style={styles.blueBar}>
        <Text style={styles.blueBarText}>Crea tu cuenta</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoBox}>
          <Image source={logoImg} style={styles.logoImg} resizeMode="contain" />
        </View>

        <View style={styles.form}>
          <Text style={styles.welcomeTitle}>Únete a RedProfesional</Text>

          <Text style={styles.label}>Nombre completo</Text>
          <View
            style={[styles.inputWrap, !fullName.trim() && styles.inputError]}
          >
            <FontAwesome5 name="user" size={14} color="#1E3A5F" />
            <TextInput
              style={styles.input}
              placeholder="Ej: Marvin Anghelo"
              onChangeText={handleNameChange}
              value={fullName}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.label}>Correo electrónico</Text>
          <View
            style={[
              styles.inputWrap,
              email !== "" && !isEmailValid && styles.inputError,
            ]}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={18}
              color="#1E3A5F"
            />
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
            />
          </View>

          <Text style={styles.label}>
            Contraseña (8+ caracteres, 1 Mayús, 1 Núm)
          </Text>
          <View
            style={[
              styles.inputWrap,
              password !== "" && !isPasswordStrong && styles.inputError,
            ]}
          >
            <FontAwesome5 name="lock" size={14} color="#1E3A5F" />
            <TextInput
              style={styles.input}
              placeholder="********"
              secureTextEntry={securePassword}
              onChangeText={setPassword}
              value={password}
            />
            <TouchableOpacity
              onPress={() => setSecurePassword(!securePassword)}
            >
              <Entypo
                name={securePassword ? "eye-with-line" : "eye"}
                size={18}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar contraseña</Text>
          <View
            style={[
              styles.inputWrap,
              confirmPassword !== "" && !passwordsMatch && styles.inputError,
            ]}
          >
            <FontAwesome5 name="lock" size={14} color="#1E3A5F" />
            <TextInput
              style={styles.input}
              placeholder="********"
              secureTextEntry={securePassword}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <View
              style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}
            >
              {acceptedTerms && (
                <AntDesign name="check" size={14} color="white" />
              )}
            </View>
            <Text style={styles.termsLabel}>
              Acepto los términos y condiciones
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.btnMain,
            (isFormInvalid || loading) && styles.btnDisabled,
          ]}
          onPress={handleRegister}
          disabled={isFormInvalid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#1E3A5F" />
          ) : (
            <Text style={styles.btnText}>Crear cuenta ahora</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push("/HU-02/login")}
        >
          <Text style={styles.loginText}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.loginBold}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "white" },
  blueBar: {
    backgroundColor: "#1E3A5F",
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
  },
  blueBarText: { color: "white", fontSize: 18, fontWeight: "bold" },
  scroll: { paddingHorizontal: 30 },
  logoBox: { alignItems: "center", marginVertical: 20 },
  logoImg: { width: width * 0.6, height: 80 },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1E3A5F",
    marginBottom: 20,
  },
  form: { width: "100%" },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    color: "#374151",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#F9FAFB",
  },
  inputError: { borderColor: "#EF4444" },
  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 15,
    color: "#1F2937",
  },
  termsRow: { flexDirection: "row", alignItems: "center", marginTop: 25 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#1E3A5F",
    borderRadius: 5,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: { backgroundColor: "#1E3A5F" },
  termsLabel: { color: "#6B7280", fontSize: 14 },
  btnMain: {
    backgroundColor: "#FBBF24",
    padding: 18,
    borderRadius: 12,
    marginTop: 35,
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: "#FDE68A", opacity: 0.8 },
  btnText: { color: "#1E3A5F", fontWeight: "bold", fontSize: 16 },
  loginLink: { marginTop: 25, alignItems: "center" },
  loginText: { color: "#6B7280", fontSize: 14 },
  loginBold: { color: "#1E3A5F", fontWeight: "bold" },
  successContainer: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  successContent: { alignItems: "center", padding: 30 },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E3A5F",
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 40,
  },
});
