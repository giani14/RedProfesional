import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#E4A01C",
  bgColor: "#F5F5F5",
  textDarkBlue: "#123F78",
  textBodyGrey: "#6B7280",
  cardBg: "#E1E9F4", // Azul muy claro para el contenedor de datos
};

export default function ConfirClienteScreen() {
  const router = useRouter();

  const { nombre, empresa, areaInteres } = useLocalSearchParams();

  const handleNextStep = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 1. Actualizamos el nombre y el rol en la tabla 'perfiles'
        await supabase
          .from("perfiles")
          .update({
            nombre_completo: nombre,
            rol: "Cliente",
          })
          .eq("id", user.id);

        // 2. IMPORTANTE: Guardamos la info extra en 'clientes_info'
        // Usamos .upsert para que cree el registro si no existe o lo actualice
        const { error } = await supabase.from("clientes_info").upsert({
          id: user.id,
          empresa: empresa,
          area_interes: areaInteres, // Verifica que el nombre sea igual al de la DB
        });

        if (error) throw error;

        router.push("/asigCliente");
      }
    } catch (error: any) {
      console.error("Error al guardar:", error.message);
      alert("Hubo un error al guardar tu perfil. Revisa la consola.");
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

            {/* Logo y Título */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: COLORS.textDarkBlue,
                }}
              >
                RedProfesional
              </Text>
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

            {/* Tarjeta de Datos */}
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
                    backgroundColor: "#4285F4",
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

              <View style={{ marginBottom: 5 }}>
                <Text
                  style={{ fontWeight: "bold", color: COLORS.textDarkBlue }}
                >
                  Nombre
                </Text>
                <Text style={{ fontSize: 16, color: "#333", marginTop: 5 }}>
                  {nombre}{" "}
                  {/* <--- Edita aquí: Borra el nombre fijo y pon esto */}
                </Text>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text
                  style={{ fontWeight: "bold", color: COLORS.textDarkBlue }}
                >
                  Empresa
                </Text>
                <Text style={{ fontSize: 16, color: "#333", marginTop: 5 }}>
                  {empresa || "No especificada"}
                </Text>
              </View>

              <View>
                <Text
                  style={{ fontWeight: "bold", color: COLORS.textDarkBlue }}
                >
                  Área de interés
                </Text>
                <Text style={{ fontSize: 16, color: "#333", marginTop: 5 }}>
                  {areaInteres}
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
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}
              >
                Confirmar y crear cuenta
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}
