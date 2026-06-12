import { supabase } from "@/lib/supabase";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logoRedProfesional = require("@/assets/images/RedProfesional-removebg.png");

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#E4A01C",
  bgColor: "#F5F5F5",
  borderDefault: "#D1D5DB",
  textDarkBlue: "#123F78",
  textBodyGrey: "#6B7280",
  iconClientBg: "#1D4ED8",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface RoleCardProps {
  title: string;
  description: string;
  iconName: keyof typeof FontAwesome.glyphMap;
  iconBgColor: string;
  isSelected: boolean;
  onPress: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  description,
  iconName,
  iconBgColor,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: 24,
      padding: 24,
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 2,
      borderColor: isSelected ? COLORS.accentGold : COLORS.borderDefault,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        paddingRight: 10,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 20,
          backgroundColor: iconBgColor,
        }}
      >
        <FontAwesome name={iconName} size={32} color="#FFFFFF" />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: COLORS.textDarkBlue,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{ fontSize: 16, color: COLORS.textBodyGrey, lineHeight: 20 }}
        >
          {description}
        </Text>
      </View>
    </View>

    <Ionicons name="chevron-forward" size={24} color={COLORS.accentGold} />
  </TouchableOpacity>
);

export default function SelectRoleScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null); // <-- Almacenamos el ID aquí
  const [isLoading, setIsLoading] = useState<boolean>(false); // <-- Estado de carga general

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log("Usuario no autenticado o error de sesión:", authError);
          return;
        }

        setUserId(user.id); // Guardamos el ID para no volver a pedirlo luego

        const { data, error } = await supabase
          .from("perfiles")
          .select("nombre_completo")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          setUserName(data.nombre_completo);
        } else {
          console.log("Error al traer nombre de la tabla perfiles:", error);
        }
      } catch (err) {
        console.error("Error inesperado en fetchUserData:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleContinue = async () => {
    if (selectedRole === null) {
      alert("Por favor, selecciona tu rol para continuar.");
      return;
    }

    if (!userId) {
      alert(
        "Error de sesión: No se detectó tu ID de usuario. Reintenta ingresar.",
      );
      return;
    }

    setIsLoading(true); // Deshabilitamos interacciones previniendo doble click

    try {
      const rolTexto = selectedRole === 0 ? "Cliente" : "Profesional";

      // Guardar en Supabase
      const { error } = await supabase
        .from("perfiles")
        .update({ rol: rolTexto })
        .eq("id", userId);

      if (error) throw error;

      // Redirección limpia
      if (selectedRole === 0) {
        router.push("/HU-05/infoCliente");
      } else if (selectedRole === 1) {
        router.push("/HU-05/infoProfe");
      }
    } catch (error: any) {
      console.error("Error al actualizar el rol:", error.message);
      alert(`No se pudo guardar tu elección: ${error.message}`);
    } finally {
      setIsLoading(false); // Liberamos el estado de carga
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primaryBlue }}>
        <View style={{ flex: 1, backgroundColor: COLORS.bgColor }}>
          {/* HEADER */}
          <View
            style={{
              backgroundColor: COLORS.primaryBlue,
              paddingHorizontal: 20,
              paddingBottom: 20,
              paddingTop: Platform.OS === "android" ? 10 : 0,
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
                disabled={isLoading}
              >
                <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <Text
                style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "600" }}
              >
                Seleccionar rol
              </Text>
              <View style={{ width: 26 }} />
            </View>
          </View>

          {/* CONTENIDO */}
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingTop: 40,
              paddingBottom: 40,
            }}
          >
            {/* LOGO */}
            <View
              style={{ alignItems: "center", marginBottom: 30, marginTop: -20 }}
            >
              <Image
                source={logoRedProfesional}
                style={{ width: SCREEN_WIDTH * 0.9, height: 180 }}
                resizeMode="contain"
              />
            </View>

            {/* TEXTOS */}
            <View style={{ marginBottom: 30, marginTop: -10 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: COLORS.textDarkBlue,
                  marginBottom: 6,
                }}
              >
                {userName ? `Hola, ${userName}` : "Elige tu rol"}
              </Text>
              <Text style={{ fontSize: 16, color: COLORS.textBodyGrey }}>
                Selecciona el rol que mejor te describa.
              </Text>
            </View>

            {/* CARDS */}
            <RoleCard
              title="Cliente"
              description="Busco y contrato profesionales."
              iconName="user"
              iconBgColor={COLORS.iconClientBg}
              isSelected={selectedRole === 0}
              onPress={() => !isLoading && setSelectedRole(0)}
            />

            <RoleCard
              title="Profesional"
              description="Ofrezco mis servicios y proyectos."
              iconName="briefcase"
              iconBgColor={COLORS.accentGold}
              isSelected={selectedRole === 1}
              onPress={() => !isLoading && setSelectedRole(1)}
            />

            <View style={{ flex: 1 }} />

            {/* BOTÓN CONTINUAR */}
            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.8}
              disabled={selectedRole === null || isLoading} // Se deshabilita si está cargando
              style={{
                marginTop: 40,
                width: "100%",
                paddingVertical: 20,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: COLORS.accentGold,
                opacity: selectedRole !== null && !isLoading ? 1 : 0.6,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  style={{ fontSize: 22, fontWeight: "800", color: "#FFFFFF" }}
                >
                  Continuar
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}
