import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

// Configuración de la ruta inicial
export const unstable_settings = {
  initialRouteName: "index",
};

// Mantenemos la Splash Screen visible hasta que carguen las fuentes
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Manejo de errores de carga de fuentes
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Ocultar Splash Screen cuando todo esté listo
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      {/* 
        Forzamos la StatusBar a estilo 'light' para que resalte sobre el fondo azul 
        que estamos usando en RedProfesional.
      */}
      <StatusBar style="light" backgroundColor="#1A4670" />

      <Stack
        screenOptions={{
          // Estilo global para los encabezados de la app
          headerStyle: {
            backgroundColor: "#1A4670",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitleAlign: "center",
          headerShown: false, // Por defecto oculto, lo activamos solo donde sea necesario
        }}
      >
        {/* Pantalla principal de acceso/entrada */}
        <Stack.Screen name="index" />

        {/* Grupos de roles: Gestionan sus propios layouts internamente */}
        <Stack.Screen name="(cliente)" />
        <Stack.Screen name="(profesional)" />
        <Stack.Screen name="(admin)" />

        {/* Módulos de Historias de Usuario (Login, etc.) */}
        <Stack.Screen
          name="HU-02/login"
          options={{ title: "Iniciar Sesión" }}
        />

        {/* Configuración para Modales */}
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Detalles",
          }}
        />
      </Stack>
    </>
  );
}
