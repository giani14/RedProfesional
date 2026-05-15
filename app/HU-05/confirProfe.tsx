import { supabase } from "@/lib/supabase";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View
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

export default function ConfirProfeScreen() {
  const router = useRouter();
  // RECIBIMOS TODOS LOS PARÁMETROS COORDINADOS
  const {
    nombre,
    especialidad,
    experiencia,
    ubicacion,
    descripcion,
    telefono,
  } = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  const handleNextStep = async () => {
    try {
      setIsSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró una sesión activa.");

      // 1. Actualizar 'perfiles' con el Rol y la Ubicación (Ciudad)
      // Nota: Usamos 'ciudad' porque es lo que intentamos filtrar en el buscador
      const { error: perfilError } = await supabase
        .from("perfiles")
        .update({
          rol: "Profesional",
          nombre_completo: nombre,
          ciudad: ubicacion,
          telefono: telefono,
        })
        .eq("id", user.id);

      if (perfilError) throw perfilError;

      // 2. Guardar información técnica en 'profesionales_info'
      const { error: profeError } = await supabase
        .from("profesionales_info")
        .upsert({
          id: user.id,
          titulo_especialidad: especialidad,
          años_experiencia: parseInt(experiencia as string) || 0,
          biografia: descripcion,
          aprobado: true,
        });

      if (profeError) throw profeError;

      // 3. Éxito
      router.push("/HU-05/asigProfe");
    } catch (error: any) {
      console.error("Error al guardar:", error.message);
      Alert.alert(
        "Error",
        "No se pudo completar el registro: " + error.message,
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Pequeño componente para mostrar los datos en la tarjeta
  const InfoRow = ({ label, value, icon }: any) => (
    <View style={{ marginBottom: 15 }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
      >
        {icon}
        <Text
          style={{
            fontWeight: "bold",
            color: COLORS.textDarkBlue,
            marginLeft: 8,
          }}
        >
          {label}
        </Text>
      </View>
      <Text style={{ fontSize: 16, color: "#333", paddingLeft: 28 }}>
        {value || "No especificado"}
      </Text>
    </View>
  );

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
                Confirmar Registro
              </Text>
              <View style={{ width: 26 }} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Stepper Paso 3 */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginVertical: 30,
              }}
            >
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
              <View
                style={{
                  width: 30,
                  height: 2,
                  backgroundColor: "#D1D5DB",
                  marginHorizontal: 8,
                }}
              />
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
              <View
                style={{
                  width: 30,
                  height: 2,
                  backgroundColor: "#D1D5DB",
                  marginHorizontal: 8,
                }}
              />
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
            </View>

            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "900",
                  color: COLORS.textDarkBlue,
                }}
              >
                ¡Casi listo!
              </Text>
              <Text
                style={{
                  color: COLORS.textBodyGrey,
                  textAlign: "center",
                  marginTop: 5,
                }}
              >
                Verifica que todo esté correcto.
              </Text>
            </View>

            {/* Tarjeta de Resumen */}
            <View
              style={{
                backgroundColor: COLORS.cardBg,
                borderRadius: 20,
                padding: 20,
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
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: COLORS.accentGold,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <FontAwesome name="briefcase" size={20} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: COLORS.textDarkBlue,
                  }}
                >
                  Perfil Profesional
                </Text>
              </View>

              <InfoRow
                label="Nombre"
                value={nombre}
                icon={
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={COLORS.primaryBlue}
                  />
                }
              />
              <InfoRow
                label="Especialidad"
                value={especialidad}
                icon={
                  <MaterialIcons
                    name="work-outline"
                    size={18}
                    color={COLORS.primaryBlue}
                  />
                }
              />
              <InfoRow
                label="Experiencia"
                value={experiencia}
                icon={
                  <Ionicons
                    name="ribbon-outline"
                    size={18}
                    color={COLORS.primaryBlue}
                  />
                }
              />
              <InfoRow
                label="Ubicación"
                value={ubicacion}
                icon={
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={COLORS.primaryBlue}
                  />
                }
              />
              <InfoRow
                label="Teléfono"
                value={telefono}
                icon={
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color={COLORS.primaryBlue}
                  />
                }
              />

              <View style={{ marginTop: 5 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: COLORS.textDarkBlue,
                    marginBottom: 5,
                  }}
                >
                  Descripción:
                </Text>
                <Text
                  style={{
                    color: "#4B5563",
                    fontStyle: "italic",
                    backgroundColor: "#FFF",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  "{descripcion || "Sin descripción"}"
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
                Editar datos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: COLORS.accentGold,
                paddingVertical: 18,
                borderRadius: 15,
                alignItems: "center",
                marginTop: 30,
                elevation: 3,
              }}
              onPress={handleNextStep}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text
                  style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}
                >
                  Finalizar Registro
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}
