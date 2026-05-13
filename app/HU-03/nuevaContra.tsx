import { supabase } from "@/lib/supabase";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

export default function NuevaContra() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Estados de validación
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Evento de Auth:", event); // Mira esto en tu terminal de Arch
      if (event === "PASSWORD_RECOVERY" || session) {
        console.log("Sesión detectada y lista para usar");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const strengthWidth = () => {
    const points = Object.values(validations).filter(Boolean).length;
    // Asegúrate de que el retorno sea un string con el símbolo %
    return `${(points / 4) * 100}%`;
  };

  const handleUpdatePassword = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      Alert.alert(
        "Sesión inválida",
        "No se detectó una sesión de recuperación activa. Por favor, abre el enlace desde tu correo nuevamente.",
      );
      return;
    }
    // 1. Validaciones básicas
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa ambos campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    const allValid = Object.values(validations).every(Boolean);
    if (!allValid) {
      Alert.alert(
        "Error",
        "La contraseña no cumple con los requisitos de seguridad.",
      );
      return;
    }

    setLoading(true);
    try {
      // Supabase detecta automáticamente la sesión activa del enlace del correo
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        router.push("/HU-03/contrActua");
      }
    } catch (err) {
      Alert.alert("Error", "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerBar}>
        <SafeAreaView edges={["top"]} style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva contraseña</Text>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require("@/assets/images/RedProfesional-removebg.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Crea una nueva contraseña</Text>
        <Text style={styles.subtitle}>Ingresa tu nueva contraseña.</Text>

        {/* Input Nueva Contraseña */}
        <Text style={styles.label}>Nueva contraseña</Text>
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#1E3A5F" />
          <TextInput
            style={styles.input}
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Feather
              name={showPass ? "eye" : "eye-off"}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressBg}>
          <View
            style={[styles.progressFill, { width: strengthWidth() as any }]}
          />
        </View>

        {/* Cuadro de validaciones */}
        <View style={styles.validationBox}>
          <Text style={styles.validationTitle}>Contraseña segura</Text>
          <View style={styles.validationList}>
            <Text style={styles.mustContain}>Debe contener:</Text>
            <ValidationItem
              label="Al menos 8 caracteres"
              isValid={validations.length}
            />
            <ValidationItem
              label="Una mayúscula"
              isValid={validations.uppercase}
            />
            <ValidationItem label="Un número" isValid={validations.number} />
            <ValidationItem
              label="Un carácter especial"
              isValid={validations.special}
            />
          </View>
        </View>

        {/* Confirmar Contraseña */}
        <Text style={styles.label}>Confirmar contraseña</Text>
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#1E3A5F" />
          <TextInput
            style={styles.input}
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Feather
              name={showConfirm ? "eye" : "eye-off"}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.mainButton, loading && { opacity: 0.7 }]}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          <Text style={styles.mainButtonText}>
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/HU-02/login")}
          style={styles.footerLink}
        >
          <Text style={styles.footerLinkText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Decoración inferior idéntica */}
      <View style={styles.footerShapes}>
        <View style={[styles.shape, styles.blueCircle]} />
        <View style={[styles.shape, styles.yellowCircle]} />
      </View>
    </View>
  );
}

// Componente pequeño para los items de validación
const ValidationItem = ({
  label,
  isValid,
}: {
  label: string;
  isValid: boolean;
}) => (
  <View style={styles.checkRow}>
    <Ionicons
      name={isValid ? "checkmark-circle" : "checkmark-circle-outline"}
      size={18}
      color={isValid ? "#10B981" : "#D1D5DB"}
    />
    <Text style={[styles.checkText, isValid && styles.checkTextActive]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "white" },
  headerBar: { backgroundColor: "#1E3A5F" },
  headerContent: { flexDirection: "row", alignItems: "center", padding: 15 },
  headerTitle: {
    color: "white",
    fontSize: 18,
    flex: 1,
    textAlign: "center",
    marginRight: 24,
  },
  content: { padding: 30, alignItems: "center" },
  logo: { width: 180, height: 60, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1E3A5F" },
  subtitle: { color: "grey", marginBottom: 25 },
  label: {
    alignSelf: "flex-start",
    fontWeight: "bold",
    marginBottom: 5,
    color: "#374151",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    height: 50,
  },
  input: { flex: 1, marginLeft: 10 },
  progressBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginBottom: 15,
  },
  progressFill: { height: "100%", backgroundColor: "#10B981", borderRadius: 3 },
  validationBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  validationTitle: { fontWeight: "bold", marginBottom: 10, color: "#1E3A5F" },
  mustContain: { fontSize: 13, color: "grey", marginBottom: 8 },
  checkRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  checkText: { marginLeft: 8, color: "#9CA3AF", fontSize: 13 },
  checkTextActive: { color: "#374151" },
  mainButton: {
    backgroundColor: "#FBBF24",
    width: "100%",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  mainButtonText: { color: "#1E3A5F", fontWeight: "bold", fontSize: 16 },
  footerLink: { marginTop: 20 },
  footerLinkText: { color: "#2563EB", fontWeight: "bold" },
  footerShapes: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 100,
    zIndex: -1,
  },
  shape: { position: "absolute", opacity: 0.6 },
  blueCircle: {
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#3B82F6",
  },
  yellowCircle: {
    bottom: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FDE68A",
  },
  validationList: {
    marginTop: 5,
    // tus otros estilos aquí
  },
});
