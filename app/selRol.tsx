import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Iconos vectoriales estándar para simplicidad inmediata.
import { FontAwesome, Ionicons } from "@expo/vector-icons";
// Si usas Expo Router, importa esto:
import { useRouter } from "expo-router";
//import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

// Colores exactos extraídos de la primera imagen
const COLORS = {
  primaryBlue: "#123F78", // Azul marino oscuro del header
  accentGold: "#E4A01C", // Oro/Amarillo del botón y acentos
  bgColor: "#F5F5F5", // Fondo gris muy claro
  borderDefault: "#D1D5DB", // Borde suave de las tarjetas
  textDarkBlue: "#123F78", // Texto principal (Elige tu rol)
  textBodyGrey: "#6B7280", // Texto secundario (descripciones)
  iconClientBg: "#1D4ED8", // Fondo azul para icono cliente
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Componente para una tarjeta de rol seleccionable (REESCRITO CON ESTILOS INLINE)
interface RoleCardProps {
  title: string;
  description: string;
  iconName: keyof typeof FontAwesome.glyphMap; // Tipado TypeScript seguro para FontAwesome
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
      borderRadius: 24, // Borde redondeado grande
      padding: 24,
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      // Sombra para iOS y Android
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      // Borde de resaltado si está seleccionado
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
      {/* Contenedor del Icono Redondo */}
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32, // Perfecto círculo
          alignItems: "center",
          justifyContent: "center",
          marginRight: 20,
          backgroundColor: iconBgColor,
        }}
      >
        <FontAwesome name={iconName} size={32} color="#FFFFFF" />
      </View>

      {/* Área de Texto */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800", // Muy negrita como la imagen
            color: COLORS.textDarkBlue,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: COLORS.textBodyGrey,
            lineHeight: 20,
          }}
        >
          {description}
        </Text>
      </View>
    </View>

    {/* Flecha de selección dorada a la derecha */}
    <Ionicons name="chevron-forward" size={24} color={COLORS.accentGold} />
  </TouchableOpacity>
);

export default function SelectRoleScreen() {
  const router = useRouter(); // Asegúrate de estar en un entorno Expo Router
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  // 2. Nuevo estado para almacenar el nombre del usuario
  const [userName, setUserName] = useState<string>("");
  // 3. Efecto para cargar los datos del usuario al entrar
  useEffect(() => {
    const fetchUserData = async () => {
      // 1. Obtener el usuario de la sesión actual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 2. Consultar la tabla 'perfiles'
        const { data, error } = await supabase
          .from("perfiles")
          .select("nombre_completo")
          .eq("id", user.id) // El ID debe coincidir con el de Auth
          .single();

        if (data && !error) {
          setUserName(data.nombre_completo);
        } else {
          console.log("Error al traer nombre:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleContinue = async () => {
    // 1. Validar que se haya seleccionado un rol (0 para Cliente, 1 para Profesional)
    if (selectedRole === null) {
      alert("Por favor, selecciona tu rol para continuar.");
      return;
    }

    try {
      // 2. Obtener el ID del usuario actual de la sesión
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Definir el texto del rol basado en el índice seleccionado
        const rolTexto = selectedRole === 0 ? "Cliente" : "Profesional";

        // 3. Guardar la elección en la base de datos (Tabla 'perfiles')
        const { error } = await supabase
          .from("perfiles")
          .update({ rol: rolTexto })
          .eq("id", user.id); // Filtra por el ID del usuario logueado

        if (error) throw error;

        // 4. Navegación según la elección y tus rutas actuales
        if (selectedRole === 0) {
          // Si eligió Cliente (índice 0)
          router.push("/infoCliente");
        } else if (selectedRole === 1) {
          // Si eligió Profesional (índice 1)
          router.push("/infoProfe");
        }
      }
    } catch (error: any) {
      console.error("Error al actualizar el rol:", error.message);
      alert("No se pudo guardar tu elección. Intenta de nuevo.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primaryBlue }}>
        {/* Contenedor principal de la pantalla */}
        <View style={{ flex: 1, backgroundColor: COLORS.bgColor }}>
          {/* CABECERA (Header) PERSONALIZADA AZUL */}
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
              {/* Botón de retroceso */}
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Título de la cabecera */}
              <Text
                style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "600" }}
              >
                Seleccionar rol
              </Text>

              {/* Espaciador para centrado perfecto */}
              <View style={{ width: 26 }} />
            </View>
          </View>

          {/* CONTENIDO DESLIZABLE (Para soportar diferentes tamaños de pantalla) */}
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingTop: 40,
              paddingBottom: 40,
            }}
          >
            {/* LOGO DE LA MARCA (Recreado con texto y una View para la línea) */}
            <View style={{ alignItems: "center", marginBottom: 40 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 42,
                    fontWeight: "800",
                    color: COLORS.accentGold,
                  }}
                >
                  Red
                </Text>
                <Text
                  style={{
                    fontSize: 42,
                    fontWeight: "800",
                    color: COLORS.textDarkBlue,
                  }}
                >
                  Profesional
                </Text>
              </View>
              <View
                style={{
                  marginTop: 5, // Superpone ligeramente la línea
                  width: SCREEN_WIDTH * 0.5, // 40% del ancho de pantalla
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: COLORS.accentGold,
                }}
              />
            </View>

            {/* TÍTULO Y SUBTÍTULO DE SECCIÓN */}
            <Text
              style={{
                fontSize: 32,
                fontWeight: "900", // Súper negrita
                color: COLORS.textDarkBlue,
                marginBottom: 4,
              }}
            >
              {userName ? `Hola, ${userName}` : "Elige tu rol"}
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: COLORS.textBodyGrey,
                marginBottom: 40,
              }}
            >
              {userName
                ? "Selecciona el rol que mejor te describa."
                : "Inicia sesión para continuar."}
            </Text>

            {/* TARJETA 1: CLIENTE (Tipado seguro de iconos) */}
            <RoleCard
              title="Cliente"
              description="Busco y contrato profesionales."
              iconName="user" // Nombre de icono FontAwesome
              iconBgColor={COLORS.iconClientBg}
              isSelected={selectedRole === 0}
              onPress={() => setSelectedRole(0)}
            />

            {/* TARJETA 2: PROFESIONAL */}
            <RoleCard
              title="Profesional"
              description="Ofrezco mis servicios y proyectos."
              iconName="briefcase"
              iconBgColor={COLORS.accentGold}
              isSelected={selectedRole === 1}
              onPress={() => setSelectedRole(1)}
            />

            {/* ESPACIADOR FLEXIBLE */}
            <View style={{ flex: 1 }} />

            {/* BOTÓN "CONTINUAR" AL FINAL DE LA PANTALLA */}
            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.8}
              style={{
                marginTop: 40,
                width: "100%",
                paddingVertical: 20,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                // Cambia de opacidad si no hay selección
                backgroundColor: COLORS.accentGold,
                opacity: selectedRole !== null ? 1 : 0.6,
              }}
            >
              <Text
                style={{ fontSize: 22, fontWeight: "800", color: "#FFFFFF" }}
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
