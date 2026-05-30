import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
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

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // 1. SI NO HAY SESIÓN: Solo permitimos Login, Registro y Bienvenida
        if (!session) {
          const publicGroups = ["HU-00", "HU-01", "HU-02", "index"];
          const isTryingToEnterProtected = !publicGroups.includes(segments[0]);

          if (isTryingToEnterProtected) {
            router.replace("/");
          }
          return;
        }

        try {
          const { data: profile, error: profileError } = await supabase
            .from("perfiles")
            .select("rol")
            .eq("id", session.user.id)
            .single();

          if (profileError) throw profileError;

          const userRol = profile?.rol;
          const currentPath = segments.join("/");
          const rootSegment = segments[0];

          // --- LÓGICA DE RUTAS EXTERNAS (HU-XX) ---

          if (userRol === "Profesional") {
            // Lista de HUs que pertenecen al profesional aunque estén afuera
            const allowedHUs = ["HU-18", "HU-15", "HU-12"];
            const isAllowed =
              rootSegment === "(profesional)" ||
              allowedHUs.includes(rootSegment);

            if (!isAllowed) {
              router.replace("/(profesional)");
            }
          } else if (userRol === "Cliente") {
            // Lista de HUs que pertenecen al cliente
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
            ];
            const isAllowed =
              rootSegment === "(cliente)" || allowedHUs.includes(rootSegment);

            if (!isAllowed) {
              router.replace("/(cliente)");
            }
          } else if (userRol === "Administrador") {
            if (rootSegment !== "(admin)") {
              router.replace("/(admin)");
            }
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

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

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
        {/* Pantallas principales */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(cliente)" />
        <Stack.Screen name="(profesional)" />
        <Stack.Screen name="(admin)" />

        {/* RUTAS EXTERNAS (HUs) - Aquí registras las carpetas que estén afuera */}
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
