import { supabase } from "@/lib/supabase";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logoRedProfesional = require("@/assets/images/RedProfesional-removebg.png");

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#E4A01C",
  bgColor: "#F5F5F5",
  textDarkBlue: "#123F78",
  textBodyGrey: "#6B7280",
  inputBg: "#FFFFFF",
  inputBorder: "#E5E7EB",
  placeholder: "#9CA3AF",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Reutilizamos tu Stepper
const Stepper = () => (
  <View style={styles.stepperContainer}>
    <Step number="1" label="Rol" active={false} />
    <View style={styles.stepLine} />
    <Step number="2" label="Información" active={true} />
    <View style={styles.stepLine} />
    <Step number="3" label="Confirmar" active={false} />
  </View>
);

const Step = ({
  number,
  label,
  active,
}: {
  number: string;
  label: string;
  active: boolean;
}) => (
  <View style={{ alignItems: "center" }}>
    <View
      style={[
        styles.stepCircle,
        active && { backgroundColor: COLORS.accentGold },
      ]}
    >
      <Text style={styles.stepText}>{number}</Text>
    </View>
    <Text
      style={[
        styles.stepLabel,
        active && { color: COLORS.accentGold, fontWeight: "bold" },
      ]}
    >
      {label}
    </Text>
  </View>
);

const InputGroup = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  multiline = false,
}: any) => (
  <View style={{ marginBottom: 18 }}>
    <Text style={styles.label}>{label}</Text>
    <View
      style={[
        styles.inputWrapper,
        multiline && {
          height: 100,
          alignItems: "flex-start",
          paddingTop: 12,
        },
      ]}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  </View>
);

export default function ProfeInfoScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ESTADOS DEL FORMULARIO
  const [nombre, setNombre] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [ubicacion, setUbicacion] = useState("Cochabamba"); // Default según tu contexto
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("+591 ");

  useEffect(() => {
    obtenerNombreUsuario();
  }, []);

  const obtenerNombreUsuario = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("perfiles")
          .select("nombre_completo")
          .eq("id", user.id)
          .single();
        if (data) setNombre(data.nombre_completo);
      }
    } catch (error: any) {
      console.error("Error al obtener nombre:", error.message);
    }
  };

  const handleNextStep = () => {
    if (!nombre || !especialidad || !telefono) {
      Alert.alert(
        "Campos obligatorios",
        "Por favor completa tu nombre, especialidad y teléfono.",
      );
      return;
    }

    // Navegamos al paso 3 enviando todos los datos
    router.push({
      pathname: "/HU-05/confirProfe",
      params: {
        nombre,
        especialidad,
        experiencia,
        ubicacion,
        descripcion,
        telefono,
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primaryBlue }}>
        <View style={{ flex: 1, backgroundColor: COLORS.bgColor }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Completar información</Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Stepper />

            <View style={styles.infoSection}>
              <Text style={styles.mainTitle}>Información adicional</Text>
              <Text style={styles.mainSubtitle}>
                Esta información será visible para tus clientes potenciales.
              </Text>
            </View>

            {/* Inputs basados en tu imagen */}
            <InputGroup
              label="Nombre completo"
              icon={
                <Feather name="user" size={20} color={COLORS.primaryBlue} />
              }
              placeholder="Ej: Juan Pérez García"
              value={nombre}
              onChangeText={setNombre}
            />

            <InputGroup
              label="Profesión / Especialidad"
              icon={
                <Feather
                  name="briefcase"
                  size={20}
                  color={COLORS.primaryBlue}
                />
              }
              placeholder="Ej: Electricista"
              value={especialidad}
              onChangeText={setEspecialidad}
            />

            <InputGroup
              label="Experiencia"
              icon={
                <Feather name="award" size={20} color={COLORS.primaryBlue} />
              }
              placeholder="Ej: 3 años"
              value={experiencia}
              onChangeText={setExperiencia}
            />

            <InputGroup
              label="Ubicación"
              icon={
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={COLORS.primaryBlue}
                />
              }
              placeholder="Ej: Cochabamba"
              value={ubicacion}
              onChangeText={setUbicacion}
            />

            <InputGroup
              label="Descripción"
              icon={
                <MaterialIcons
                  name="description"
                  size={20}
                  color={COLORS.primaryBlue}
                />
              }
              placeholder="Describe tus servicios..."
              value={descripcion}
              onChangeText={setDescripcion}
              multiline={true}
            />

            <InputGroup
              label="Teléfono de contacto"
              icon={
                <Feather name="phone" size={20} color={COLORS.primaryBlue} />
              }
              placeholder="+591 70000000"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.btnContinue}
              onPress={handleNextStep}
            >
              <Text style={styles.btnText}>Continuar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primaryBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  stepperContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 25,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: { color: "#FFFFFF", fontWeight: "bold" },
  stepLabel: { marginTop: 5, fontSize: 12, color: COLORS.textBodyGrey },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#D1D5DB",
    marginBottom: 15,
    marginHorizontal: 10,
  },
  infoSection: { alignItems: "center", marginBottom: 25 },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textDarkBlue,
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 14,
    color: COLORS.textBodyGrey,
    textAlign: "center",
  },

  // Estilos del Formulario (Imagen)
  label: {
    fontWeight: "700",
    color: COLORS.textDarkBlue,
    marginBottom: 8,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    height: 55,
    paddingHorizontal: 15,
  },
  iconContainer: {
    width: 40,
    alignItems: "flex-start",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  btnContinue: {
    backgroundColor: COLORS.accentGold,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  btnText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
});
