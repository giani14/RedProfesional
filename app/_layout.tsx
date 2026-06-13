import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Session } from "@supabase/supabase-js";
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

  // ==========================================
  // BLOQUE 4.1: Escuchar de forma activa eventos Auth de Supabase
  // ==========================================
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setIsAuthReady(true);

        // Intercepción inmediata si se dispara un login exitoso desde OAuth/Google
        if (
          (event === "SIGNED_IN" || event === "USER_UPDATED") &&
          currentSession
        ) {
          try {
            const { data: profile } = await supabase
              .from("perfiles")
              .select("rol")
              .eq("id", currentSession.user.id)
              .maybeSingle();

            if (!profile || !profile.rol) {
              router.replace("/HU-05/selRol");
              return;
            }

            const userRol = profile.rol.toLowerCase().trim();
            if (userRol === "profesional") {
              router.replace("/(profesional)");
            } else if (userRol === "cliente") {
              router.replace("/(cliente)");
            } else if (userRol === "administrador" || userRol === "admin") {
              router.replace("/(admin)");
            }
          } catch (err) {
            console.error("Error en redirección forzada OAuth interna:", err);
          }
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ==========================================
  // BLOQUE 4.2: Guardián de rutas dinámicas por segmentos y roles
  // ==========================================
  useEffect(() => {
    if (!loaded || !isAuthReady) return;

    const rootSegment = segments[0];

    // --- ESCENARIO A: SIN SESIÓN ACTIVA ---
    if (!session) {
      const publicGroups = ["HU-00", "HU-01", "HU-02", "index", "(invitado)"];
      const isTryingToEnterProtected = !publicGroups.includes(rootSegment);

      if (isTryingToEnterProtected) {
        router.replace("/");
      }
      return;
    }

    // --- ESCENARIO B: CON SESIÓN ACTIVA (Proteger accesos) ---
    const checkRoleAndRedirect = async () => {
      try {
        // 1. Consultar el perfil de la base de datos
        const { data: profile, error: profileError } = await supabase
          .from("perfiles")
          .select("rol")
          .eq("id", session.user.id)
          .maybeSingle();

        // 2. Si hay un error o no existe la fila, lo mandamos a selección de rol
        if (profileError || !profile || !profile.rol) {
          console.warn("Perfil sin rol asignado aún.");
          if (rootSegment !== "HU-05") {
            router.replace("/HU-05/selRol");
          }
          return;
        }

        // 3. Declaramos la variable global del rol limpia
        const userRol = profile.rol.toLowerCase().trim();
        const currentSegment = rootSegment ? String(rootSegment) : "";

        // 4. REGLA DE BYPASS ESENCIAL:
        // Si ya está logueado y se encuentra en pantallas públicas (Raíz, Login, Bienvenida),
        // lo empujamos inmediatamente a su stack correspondiente.
        if (
          !currentSegment ||
          currentSegment === "HU-02" ||
          currentSegment === "index"
        ) {
          if (userRol === "profesional") router.replace("/(profesional)");
          else if (userRol === "cliente") router.replace("/(cliente)");
          else if (userRol === "administrador" || userRol === "admin")
            router.replace("/(admin)");
          return; // Aquí corta solo si estaba en index o login
        }

        // 5. --- VALIDACIONES DE MAPEO DE HUs ---
        // (Como no entró al IF de arriba, userRol sigue existiendo perfectamente aquí abajo)
        if (userRol === "profesional") {
          const allowedHUs = [
            "HU-00",
            "HU-01",
            "HU-02",
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
            "HU-16",
            "HU-17",
            "HU-19",
            "HU-20",
            "chat",
          ];
          const isAllowed =
            currentSegment === "(profesional)" ||
            allowedHUs.includes(currentSegment);
          if (!isAllowed) router.replace("/(profesional)");
        } else if (userRol === "cliente") {
          const allowedHUs = [
            "HU-00",
            "HU-01",
            "HU-02",
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
            currentSegment === "(cliente)" ||
            allowedHUs.includes(currentSegment);
          if (!isAllowed) router.replace("/(cliente)");
        } else if (userRol === "administrador" || userRol === "admin") {
          const allowedHUs = [
            "HU-00",
            "HU-01",
            "HU-02",
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
            currentSegment === "(admin)" || allowedHUs.includes(currentSegment);
          if (!isAllowed) router.replace("/(admin)");
        } else {
          if (rootSegment !== "HU-05") router.replace("/HU-05/selRol");
        }
      } catch (err) {
        console.error("Error verificando rol en el layout global:", err);
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
        <Stack.Screen name="index" />
        <Stack.Screen name="(invitado)" />
        <Stack.Screen name="(cliente)" />
        <Stack.Screen name="(profesional)" />
        <Stack.Screen name="(admin)" />

        <Stack.Screen
          name="HU-18/solicitudDetalle"
          options={{ headerShown: false }}
        />
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
