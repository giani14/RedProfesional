import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { supabase } from "../lib/supabase"; // Asegúrate de que esta ruta sea correcta

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const segments = useSegments();
  const router = useRouter();

  // 1. Manejo de errores de carga de fuentes
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // 2. Lógica de Autenticación y Redirección por Rol
  useEffect(() => {
    if (!loaded) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Si no hay sesión, mandarlo al index/login si intenta entrar a áreas protegidas
        if (!session) {
          const inAuthGroup =
            segments[0] === "(cliente)" ||
            segments[0] === "(profesional)" ||
            segments[0] === "(admin)";
          if (inAuthGroup) {
            router.replace("/");
          }
          return;
        }

        try {
          // Consultar el rol del usuario en la tabla de perfiles
          // Nota: Asegúrate de que tu tabla se llame 'perfiles' o 'usuarios'
          const { data: profile, error: profileError } = await supabase
            .from("perfiles")
            .select("rol")
            .eq("id", session.user.id)
            .single();

          if (profileError) throw profileError;

          const userRol = profile?.rol; // Ejemplo: 'cliente', 'profesional', 'admin'
          const currentGroup = segments[0];

          // Redirección forzada basada en el ROL
          if (userRol === "Profesional" && currentGroup !== "(profesional)") {
            router.replace("/(profesional)");
          } else if (
            userRol === "Administrador" &&
            currentGroup !== "(admin)"
          ) {
            router.replace("/(admin)");
          } else if (userRol === "Cliente" && currentGroup !== "(cliente)") {
            router.replace("/(cliente)");
          }
        } catch (err) {
          console.error("Error verificando rol:", err);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loaded, segments]);

  // 3. Ocultar Splash Screen cuando las fuentes carguen
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
      <StatusBar style="light" backgroundColor="#1A4670" />

      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1A4670" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "bold" },
          headerTitleAlign: "center",
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(cliente)" />
        <Stack.Screen name="(profesional)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen
          name="HU-02/login"
          options={{ title: "Iniciar Sesión" }}
        />
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
