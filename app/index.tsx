import { supabase } from "@/lib/supabase"; // Ajusta según tu estructura
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión y rol inicial
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        await fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Escuchar cambios de estado (Login/Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await fetchUserRole(session.user.id);
        } else {
          setRole(null);
          setLoading(false);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Función para consultar el rol en tu base de datos
  const fetchUserRole = async (userId: string) => {
    try {
      // Ajusta 'perfiles' y 'rol' a los nombres reales de tu tabla en Supabase
      const { data, error } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", userId)
        .single();

      if (data) setRole(data.rol);
    } catch (error) {
      console.error("Error obteniendo rol:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FFB100" />
      </View>
    );
  }

  // --- LÓGICA DE REDIRECCIÓN INTELIGENTE ---

  // Si no hay sesión, al Login
  if (!session) {
    //return <Redirect href="/HU-00/Bienvenida" />;
    return <Redirect href="/HU-02/login" />;
  }

  // Si hay sesión, redirigir según el Rol
  switch (role) {
    case "Administrador":
      return <Redirect href="/(admin)" />;
    case "Profesional":
      return <Redirect href="/(profesional)" />;
    case "Cliente":
    default:
      return <Redirect href="/(cliente)" />;
  }
}
