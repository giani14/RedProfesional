import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AdminLayout() {
  const router = useRouter();

  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    // 1. Verificación inicial de la sesión

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Si no hay sesión, lo mandamos al login de inmediato

        router.replace("/HU-02/login");
      }

      setInitializing(false);
    };

    checkSession();

    // 2. Escucha cambios en el estado de autenticación (Cierre de sesión forzoso)

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          // Si el usuario cierra sesión o el token expira, se ejecuta esto

          router.replace("/HU-02/login");
        }
      },
    );

    // Limpieza del listener al desmontar el componente

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Mientras verifica la sesión, mostramos un cargador para que no parpadee la interfaz

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,

          justifyContent: "center",

          alignItems: "center",

          backgroundColor: "#1A3B63",
        }}
      >
        <ActivityIndicator size="large" color="#white" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1A3B63", // Azul institucional
        },

        headerTintColor: "#fff",

        headerTitleStyle: {
          fontWeight: "bold",
        },

        tabBarActiveTintColor: "#1A3B63",

        tabBarInactiveTintColor: "gray",

        tabBarStyle: {
          height: 60,

          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "RedProfesional",

          tabBarLabel: "Inicio",

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="usuarios"
        options={{
          title: "Gestión de Usuarios",

          tabBarLabel: "Usuarios",

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      {/* ================= PESTAÑA CENTRAL: MODERACIÓN ================= */}
      <Tabs.Screen
        name="moderacion"
        options={{
          title: "Contenido Pendiente",
          tabBarLabel: "Moderación",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size} color={color} />
          ),
        }}
      />
      {/* =============================================================== */}
      <Tabs.Screen
        name="categorias"
        options={{
          title: "Categorías",

          tabBarLabel: "Categorías",

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Mi Perfil",

          tabBarLabel: "Perfil",

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      {/* --- RUTAS OCULTAS DE LA BARRA DE NAVEGACIÓN --- */}
      <Tabs.Screen
        name="mi-perfil-detalle"
        options={{
          href: null, // Al ser null, se oculta de la barra inferior
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notificaciones-globales"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="configuracion-tecnica"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ayuda-soporte"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
