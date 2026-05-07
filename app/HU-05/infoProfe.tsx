import { supabase } from "@/lib/supabase";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
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
  inputBorder: "#D1D5DB",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Indicador de pasos (Paso 2 activo)
const Stepper = () => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 30,
    }}
  >
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#D1D5DB",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>1</Text>
      </View>
      <Text style={{ marginTop: 5, fontSize: 12, color: COLORS.textBodyGrey }}>
        Rol
      </Text>
    </View>
    <View
      style={{
        width: 40,
        height: 2,
        backgroundColor: "#D1D5DB",
        marginBottom: 15,
        marginHorizontal: 10,
      }}
    />
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: COLORS.accentGold,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>2</Text>
      </View>
      <Text
        style={{
          marginTop: 5,
          fontSize: 12,
          color: COLORS.accentGold,
          fontWeight: "bold",
        }}
      >
        Información
      </Text>
    </View>
    <View
      style={{
        width: 40,
        height: 2,
        backgroundColor: "#D1D5DB",
        marginBottom: 15,
        marginHorizontal: 10,
      }}
    />
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#D1D5DB",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>3</Text>
      </View>
      <Text style={{ marginTop: 5, fontSize: 12, color: COLORS.textBodyGrey }}>
        Confirmar
      </Text>
    </View>
  </View>
);

export default function ProfeInfoScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [experiencia, setExperiencia] = useState("");
  useEffect(() => {
    obtenerNombreUsuario();
  }, []);

  const obtenerNombreUsuario = async () => {
    try {
      // 1. Obtener el usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 2. Buscar el nombre en la tabla perfiles usando el ID
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
      console.error("Error al obtener nombre:", error.message);
    }
  };

  const handleNextStep = () => {
    // Validamos que los campos no estén vacíos si es necesario
    if (!nombre) {
      alert("Por favor ingresa tu nombre");
      return;
    }

    router.push({
      pathname: "/HU-05/confirProfe",
      params: {
        nombre: nombre,
        titulo: especialidad || "Profesion",
        anios: experiencia || "1", // Asegúrate de tener este estado
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primaryBlue }}>
        <View style={{ flex: 1, backgroundColor: COLORS.bgColor }}>
          {/* Cabecera Azul */}
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
            <Stepper />

            {/* Logo */}
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

            {/* Títulos */}
            <View style={{ alignItems: "center", marginBottom: 25 }}>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "800",
                  color: COLORS.textDarkBlue,
                  marginBottom: 8,
                }}
              >
                Información adicional
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: COLORS.textBodyGrey,
                  textAlign: "center",
                }}
              >
                Cuéntanos un poco más para personalizar tu experiencia.
              </Text>
            </View>

            {/* Caja de Rol Seleccionado: PROFESIONAL */}
            <View
              style={{
                backgroundColor: "#F3E5AB80",
                borderRadius: 20,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 25,
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  backgroundColor: COLORS.accentGold,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 15,
                }}
              >
                <FontAwesome name="briefcase" size={24} color="#FFFFFF" />
              </View>
              <View>
                <Text style={{ fontSize: 13, color: COLORS.textBodyGrey }}>
                  Rol seleccionado:
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: COLORS.textDarkBlue,
                  }}
                >
                  Profesional
                </Text>
              </View>
            </View>

            {/* Formulario con datos de la imagen */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontWeight: "700",
                  color: COLORS.textDarkBlue,
                  marginBottom: 8,
                }}
              >
                Nombre completo
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#E9ECEF",
                  borderWidth: 1,
                  borderColor: COLORS.inputBorder,
                  borderRadius: 12,
                  padding: 15,
                  fontSize: 16,
                  color: "#495057",
                }}
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontWeight: "700",
                  color: COLORS.textDarkBlue,
                  marginBottom: 8,
                }}
              >
                Título o especialidad
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#E9ECEF",
                  borderWidth: 1,
                  borderColor: COLORS.inputBorder,
                  borderRadius: 12,
                  padding: 15,
                  fontSize: 16,
                  color: "#495057",
                }}
                placeholder="Ej. Desarrollador React Native"
                value={especialidad}
                onChangeText={setEspecialidad}
              />
            </View>

            <View style={{ marginBottom: 30 }}>
              <Text
                style={{
                  fontWeight: "700",
                  color: COLORS.textDarkBlue,
                  marginBottom: 8,
                }}
              >
                Años de experiencia
              </Text>

              <View>
                <TextInput
                  style={{
                    backgroundColor: "#E9ECEF",
                    borderWidth: 1,
                    borderColor: COLORS.inputBorder,
                    borderRadius: 12,
                    padding: 15,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  placeholder="Ej. 1"
                  value={experiencia}
                  onChangeText={setExperiencia}
                />
              </View>
            </View>

            {/* Botón Continuar */}
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.accentGold,
                paddingVertical: 18,
                borderRadius: 15,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
                elevation: 5,
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
