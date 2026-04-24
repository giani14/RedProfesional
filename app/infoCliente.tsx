import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

const logoRedProfesional = require("../assets/images/RedProfesional-removebg.png");

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#E4A01C",
  bgColor: "#F5F5F5",
  textDarkBlue: "#123F78",
  textBodyGrey: "#6B7280",
  inputBg: "#FFFFFF",
  inputBorder: "#D1D5DB",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Componente para el Stepper (Indicador de pasos)
const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: "Rol" },
    { id: 2, label: "Información" },
    { id: 3, label: "Confirmar" },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 30,
      }}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor:
                  currentStep === step.id ? COLORS.accentGold : "#D1D5DB",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                {step.id}
              </Text>
            </View>
            <Text
              style={{
                marginTop: 5,
                fontSize: 12,
                color:
                  currentStep === step.id
                    ? COLORS.accentGold
                    : COLORS.textBodyGrey,
                fontWeight: currentStep === step.id ? "bold" : "normal",
              }}
            >
              {step.label}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              style={{
                width: 60,
                height: 2,
                backgroundColor: "#D1D5DB",
                marginBottom: 15,
                marginHorizontal: 10,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
    // tus otros estilos aquí...
  },
  label: {
    fontWeight: "bold",
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
});

export default function AdditionalInfoScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  useEffect(() => {
    const cargarDatosCliente = async () => {
      try {
        // 1. Obtener el usuario autenticado
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 2. Consultar el nombre en la tabla 'perfiles'
          const { data, error } = await supabase
            .from("perfiles")
            .select("nombre_completo")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          if (data) {
            setNombre(data.nombre_completo);
          }
        }
      } catch (error: any) {
        console.error("Error al cargar datos del cliente:", error.message);
      }
    };

    cargarDatosCliente();
  }, []);
  const [empresa, setEmpresa] = useState("MG Soluciones");
  const [areaInteres, setAreaInteres] = useState("");
  const handleNextStep = () => {
    // Validamos que los campos no estén vacíos si es necesario
    if (!nombre) {
      alert("Por favor ingresa tu nombre");
      return;
    }

    router.push({
      pathname: "/confirCliente",
      params: {
        nombre: nombre,
        empresa: empresa || "Particular",
        areaInteres: areaInteres, // Asegúrate de tener este estado
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primaryBlue }}>
        <View style={{ flex: 1, backgroundColor: COLORS.bgColor }}>
          {/* Header Azul */}
          <View
            style={{
              backgroundColor: COLORS.primaryBlue,
              paddingHorizontal: 20,
              paddingBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <Text
                style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "600" }}
              >
                Completar información
              </Text>
              <View style={{ width: 26 }} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          >
            {/* 1. Stepper */}
            <Stepper currentStep={2} />

            <View
              style={{ alignItems: "center", marginBottom: 10, marginTop: -10 }}
            >
              <Image
                source={logoRedProfesional}
                style={{
                  width: SCREEN_WIDTH * 0.5, // Ajusta el ancho al 70% de la pantalla
                  height: 120, // Altura fija inicial
                }}
                resizeMode="contain"
              />
            </View>

            {/* 3. Título de sección */}
            <View style={{ alignItems: "center", marginBottom: 30 }}>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "800",
                  color: COLORS.textDarkBlue,
                  marginBottom: 10,
                }}
              >
                Información adicional
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: COLORS.textBodyGrey,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Cuéntanos un poco más para personalizar tu experiencia.
              </Text>
            </View>

            {/* 4. Resumen de Rol seleccionado */}
            <View
              style={{
                backgroundColor: "#F3E5AB80", // Color crema suave
                borderRadius: 16,
                padding: 15,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 30,
              }}
            >
              <View
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 23,
                  backgroundColor: "#4285F4",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 15,
                }}
              >
                <FontAwesome name="user" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.textBodyGrey }}>
                  Rol seleccionado:
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: COLORS.textDarkBlue,
                  }}
                >
                  Cliente
                </Text>
              </View>
            </View>

            {/* 5. Formulario */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  color: COLORS.textDarkBlue,
                  marginBottom: 8,
                }}
              >
                Nombre completo
              </Text>
              <TextInput
                style={{
                  backgroundColor: COLORS.inputBg,
                  borderWidth: 1,
                  borderColor: COLORS.inputBorder,
                  borderRadius: 12,
                  padding: 15,
                  fontSize: 16,
                }}
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  color: COLORS.textDarkBlue,
                  marginBottom: 8,
                }}
              >
                Empresa (opcional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: COLORS.inputBg,
                  borderWidth: 1,
                  borderColor: COLORS.inputBorder,
                  borderRadius: 12,
                  padding: 15,
                  fontSize: 16,
                }}
                value={empresa}
                onChangeText={setEmpresa}
              />
            </View>

            <View style={{ marginBottom: 30 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  color: COLORS.textDarkBlue,
                  marginBottom: 8,
                }}
              >
                Área de interés
              </Text>

              {/* El contenedor del Input */}
              <View>
                <TextInput
                  style={{
                    backgroundColor: COLORS.inputBg,
                    borderWidth: 1,
                    borderColor: COLORS.inputBorder,
                    borderRadius: 12,
                    padding: 15,
                    fontSize: 16,
                    color: "#333",
                  }}
                  placeholder="Ej. Tecnología, Salud, etc. o nose"
                  value={areaInteres}
                  onChangeText={setAreaInteres}
                />
              </View>
            </View>

            {/* 6. Botón Continuar */}
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.accentGold,
                paddingVertical: 18,
                borderRadius: 15,
                alignItems: "center",
              }}
              onPress={handleNextStep}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}
              >
                Continuar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}
