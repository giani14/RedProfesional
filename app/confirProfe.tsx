import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

const logoRedProfesional = require("../assets/images/RedProfesional-removebg.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#E4A01C",
  bgColor: "#F5F5F5",
  textDarkBlue: "#123F78",
  textBodyGrey: "#6B7280",
  cardBg: "#E1E9F4",
};

export default function ConfirProfeScreen() {
  const router = useRouter();
  const { nombre, titulo, anios } = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  const handleNextStep = async () => {
    try {
      setIsSaving(true);

      // 1. Obtener el usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No se encontró una sesión activa.");

      // 2. Actualizar el rol y nombre en la tabla 'perfiles'
      const { error: perfilError } = await supabase
        .from("perfiles")
        .update({
          rol: "Profesional",
          nombre_completo: nombre,
        })
        .eq("id", user.id);

      if (perfilError) throw perfilError;

      // 3. Guardar la información técnica en 'profesionales_info'
      // Nota: Usamos 'años_experiencia' como aparece en tu captura de Supabase
      const { error: profeError } = await supabase
        .from("profesionales_info")
        .upsert({
          id: user.id,
          titulo_especialidad: titulo,
          años_experiencia: parseInt(anios as string) || 0, // Convertimos a número si es necesario
          biografia: "", // Puedes dejarlo vacío o pedirlo después
          aprobado: true, // Según tu esquema vi que tienes este campo
        });

      if (profeError) throw profeError;

      // 4. Si todo salió bien, navegar a la pantalla de éxito
      router.push("/asigProfe");
    } catch (error: any) {
      console.error("Error al guardar:", error.message);
      Alert.alert(
        "Error",
        "No se pudo guardar la información: " + error.message,
      );
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primaryBlue }}>
        <View style={{ flex: 1, backgroundColor: COLORS.bgColor }}>
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
                Confirmar rol
              </Text>
              <View style={{ width: 26 }} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          >
            {/* Stepper */}
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
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "#D1D5DB",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFF" }}>1</Text>
                </View>
              </View>
              <View
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor: "#D1D5DB",
                  marginHorizontal: 10,
                }}
              />
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "#D1D5DB",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFF" }}>2</Text>
                </View>
              </View>
              <View
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor: "#D1D5DB",
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
                  <Text style={{ color: "#FFF", fontWeight: "bold" }}>3</Text>
                </View>
                <Text
                  style={{
                    color: COLORS.accentGold,
                    fontWeight: "bold",
                    fontSize: 12,
                    marginTop: 5,
                  }}
                >
                  Confirmar
                </Text>
              </View>
            </View>

            {/* Logo */}
            <View
              style={{ alignItems: "center", marginBottom: 1, marginTop: -1 }}
            >
              <Image
                source={logoRedProfesional}
                style={{
                  width: SCREEN_WIDTH * 0.6, // Ajusta el ancho al 70% de la pantalla
                  height: 120, // Altura fija inicial
                }}
                resizeMode="contain"
              />
            </View>

            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "900",
                  color: COLORS.textDarkBlue,
                  marginTop: 15,
                }}
              >
                Confirma tu información
              </Text>
              <Text
                style={{
                  color: COLORS.textBodyGrey,
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                Revisa los datos antes de completar tu registro.
              </Text>
            </View>

            {/* Tarjeta de Datos Profesional */}
            <View
              style={{
                backgroundColor: COLORS.cardBg,
                borderRadius: 20,
                padding: 25,
                marginTop: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: COLORS.accentGold,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 15,
                  }}
                >
                  <FontAwesome name="briefcase" size={22} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={{ color: COLORS.textBodyGrey, fontSize: 14 }}>
                    Rol
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: COLORS.textDarkBlue,
                    }}
                  >
                    Profesional
                  </Text>
                </View>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text
                  style={{ fontWeight: "bold", color: COLORS.textDarkBlue }}
                >
                  Nombre
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#333",
                    marginTop: 5,
                  }}
                >
                  {nombre}
                </Text>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text
                  style={{ fontWeight: "bold", color: COLORS.textDarkBlue }}
                >
                  Especialidad
                </Text>
                <Text style={{ fontSize: 16, color: "#333", marginTop: 5 }}>
                  {titulo}
                </Text>
              </View>

              <View>
                <Text
                  style={{ fontWeight: "bold", color: COLORS.textDarkBlue }}
                >
                  Experiencia
                </Text>
                <Text style={{ fontSize: 16, color: "#333", marginTop: 5 }}>
                  {anios}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 25,
              }}
              onPress={() => router.back()}
            >
              <Ionicons name="pencil" size={18} color="#4285F4" />
              <Text
                style={{ color: "#4285F4", fontWeight: "bold", marginLeft: 8 }}
              >
                Editar información
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: COLORS.accentGold,
                paddingVertical: 18,
                borderRadius: 15,
                alignItems: "center",
                marginTop: 30,
              }}
              onPress={handleNextStep}
              disabled={isSaving}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}
              >
                {isSaving ? "Guardando..." : "Confirmar y crear cuenta"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}
