import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Session } from "@supabase/supabase-js"; // Importación de tipo útil
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { supabase } from "../lib/supabase";

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

  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // 1. Escuchar el estado de autenticación una sola vez al montar
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setIsAuthReady(true);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Controlar la navegación y restricciones basadas en los segmentos y el rol
  useEffect(() => {
    // Si las fuentes no han cargado o Supabase no ha determinado si hay sesión, esperamos.
    if (!loaded || !isAuthReady) return;

    const rootSegment = segments[0];

    // --- LÓGICA SI NO HAY SESIÓN (Modo Invitado / Público) ---
    if (!session) {
      // INCLUIDO: "(invitado)" ahora es una ruta pública permitida
      const publicGroups = ["HU-00", "HU-01", "HU-02", "index", "(invitado)"];
      const isTryingToEnterProtected = !publicGroups.includes(rootSegment);

      if (isTryingToEnterProtected) {
        router.replace("/");
      }
      return;
    }

    // --- LÓGICA SI SÍ HAY SESIÓN (Roles Protegidos) ---
    const checkRoleAndRedirect = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("perfiles")
          .select("rol")
          .eq("id", session.user.id)
          .single();

        if (profileError) throw profileError;

        const userRol = profile?.rol;

        if (userRol === "Profesional") {
          const allowedHUs = [
            "HU-18",
            "HU-15",
            "HU-12",
            "HU-03",
            "HU-04",
            "HU-05",
            "HU-06",
            "HU-07",
            "HU-08",
            "HU-09",
            "HU-10",
            "HU-11",
            "HU-13",
            "HU-14",
            "HU-15",
            "HU-16",
            "HU-17",
            "HU-19",
            "HU-20",
            "chat",
          ];
          const isAllowed =
            rootSegment === "(profesional)" || allowedHUs.includes(rootSegment);

          if (!isAllowed) {
            router.replace("/(profesional)");
          }
        } else if (userRol === "Cliente") {
          const allowedHUs = [
            "HU-03",
            "HU-04",
            "HU-05",
            "HU-06",
            "HU-07",
            "HU-08",
            "HU-09",
            "HU-10",
            "HU-11",
            "HU-13",
            "HU-14",
            "HU-15",
            "HU-16",
            "HU-17",
            "HU-18",
            "chat",
          ];
          const isAllowed =
            rootSegment === "(cliente)" || allowedHUs.includes(rootSegment);

          if (!isAllowed) {
            router.replace("/(cliente)");
          }
        } else if (userRol === "Administrador") {
          const allowedHUs = [
            "HU-03",
            "HU-04",
            "HU-05",
            "HU-06",
            "HU-07",
            "HU-08",
            "HU-09",
            "HU-10",
            "HU-11",
            "HU-13",
            "HU-14",
            "HU-15",
            "HU-16",
            "HU-17",
            "HU-18",
            "HU-19",
            "HU-20",
            "HU-21",
            "HU-22",
            "HU-23",
            "HU-24",
            "HU-25",
            "HU-26",
            "chat",
          ];
          const isAllowed =
            rootSegment === "(admin)" || allowedHUs.includes(rootSegment);

          if (!isAllowed) {
            router.replace("/(admin)");
          }
        }
      } catch (err) {
        console.error("Error verificando rol:", err);
      }
    };

    checkRoleAndRedirect();
  }, [loaded, isAuthReady, session, segments]);

  // Ocultar SplashScreen cuando todo esté listo
  useEffect(() => {
    if (loaded && isAuthReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isAuthReady]);

  if (!loaded || !isAuthReady) return null;

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
        {/* Pantallas principales del sistema */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(invitado)" />
        <Stack.Screen name="(cliente)" />
        <Stack.Screen name="(profesional)" />
        <Stack.Screen name="(admin)" />

        {/* RUTAS EXTERNAS (HUs) */}
        <Stack.Screen
          name="HU-18/solicitudDetalle"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HU-02/login"
          options={{ title: "Iniciar Sesión" }}
        />

        {/* Modales */}
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
