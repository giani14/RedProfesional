import { supabase } from "@/lib/supabase";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logoRedProfesional = require("@/assets/images/RedProfesional-removebg.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#E4A01C",
  bgColor: "#F5F5F5",
  textDarkBlue: "#123F78",
  textBodyGrey: "#6B7280",
  cardBg: "#E1E9F4",
};

export default function ConfirClienteScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recuperamos los parámetros limpios que enviamos desde infoCliente.tsx
  const { nombre, empresa, areaInteres } = useLocalSearchParams();

  const handleNextStep = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Sesión no encontrada. Intenta iniciar sesión nuevamente.");
        setIsSubmitting(false);
        return;
      }

      // 1. ACTUALIZACIÓN EN PERFILES (Mapeado exacto según tu imagen_ed13bf.png)
      const { error: perfilError } = await supabase
        .from("perfiles")
        .update({
          nombre_completo: nombre, // Sincronizado con tu columna real de la base de datos
          rol: "Cliente", // Mantiene consistencia con el ENUM 'tipo_rol'
        })
        .eq("id", user.id);

      if (perfilError) throw perfilError;

      // 2. INSERCIÓN / ACTUALIZACIÓN EN CLIENTES_INFO
      const { error: infoError } = await supabase.from("clientes_info").upsert(
        {
          id: user.id,
          empresa: empresa || "Particular",
          area_interes: areaInteres,
        },
        { onConflict: "id" },
      );

      if (infoError) throw infoError;

      console.log("¡Perfil de cliente completado con éxito en Supabase!");

      // 3. Redirección al siguiente paso de tu módulo
      router.push("/HU-05/asigCliente");
    } catch (error: any) {
      console.error(
        "Error crítico al guardar el perfil del cliente:",
        error.message,
      );
      alert(`Hubo un error al guardar tu perfil: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primaryBlue }}>
        <View style={{ flex: 1, backgroundColor: COLORS.bgColor }}>
          {/* Header */}
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
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={isSubmitting}
              >
                <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <Text
                style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "600" }}
              >
                Confirmar datos
              </Text>
              <View style={{ width: 26 }} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          >
            {/* Stepper - Paso 3 Activo */}
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
                style={{ width: SCREEN_WIDTH * 0.6, height: 120 }}
                resizeMode="contain"
              />
            </View>

            {/* Título */}
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
                Revisa los datos antes de completar tu registro definitivo.
              </Text>
            </View>

            {/* Tarjeta de Datos Mapeados */}
            <View
              style={{
                backgroundColor: COLORS.cardBg,
                borderRadius: 20,
                padding: 25,
                marginTop: 10,
                alignItems: "flex-start",
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
                    backgroundColor: COLORS.primaryBlue,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 15,
                  }}
                >
                  <FontAwesome name="user" size={24} color="#FFFFFF" />
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
                    Cliente
                  </Text>
                </View>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: COLORS.textDarkBlue,
                    fontSize: 14,
                  }}
                >
                  Nombre
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#333",
                    marginTop: 4,
                    fontWeight: "500",
                  }}
                >
                  {nombre || "No proporcionado"}
                </Text>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: COLORS.textDarkBlue,
                    fontSize: 14,
                  }}
                >
                  Empresa / Organización
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#333",
                    marginTop: 4,
                    fontWeight: "500",
                  }}
                >
                  {empresa || "Particular"}
                </Text>
              </View>

              <View style={{ marginBottom: 5 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: COLORS.textDarkBlue,
                    fontSize: 14,
                  }}
                >
                  Área de interés seleccionada
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#333",
                    marginTop: 4,
                    fontWeight: "500",
                  }}
                >
                  {areaInteres || "No seleccionada"}
                </Text>
              </View>
            </View>

            {/* Botón Volver a Editar */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 25,
              }}
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Ionicons name="pencil" size={18} color="#4285F4" />
              <Text
                style={{ color: "#4285F4", fontWeight: "bold", marginLeft: 8 }}
              >
                Editar información
              </Text>
            </TouchableOpacity>

            {/* Botón Confirmar con Indicador de Carga */}
            <TouchableOpacity
              style={{
                backgroundColor: isSubmitting
                  ? COLORS.textBodyGrey
                  : COLORS.accentGold,
                paddingVertical: 18,
                borderRadius: 15,
                alignItems: "center",
                marginTop: 30,
                elevation: 2,
              }}
              onPress={handleNextStep}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}
                >
                  Confirmar y crear cuenta
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}
