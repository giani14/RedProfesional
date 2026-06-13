import { supabase } from "@/lib/supabase";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", userId)
        .maybeSingle(); // Usamos maybeSingle() para que no explote si la fila está creándose

      if (data && data.rol !== undefined) {
        setRole(data.rol);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Error obteniendo rol en Index:", error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#FFB100" />
      </View>
    );
  }

  // --- LÓGICA DE REDIRECCIÓN INTELIGENTE CORREGIDA ---

  // 1. Si no hay sesión activa, mandamos a la bienvenida nativa
  if (!session) {
    return <Redirect href="/HU-00/Bienvenida" />;
  }

  // 2. Si hay sesión pero el rol es NULL o vacío (Es su primera vez con Google)
  if (!role) {
    console.log(
      "Sesión activa detectada en Index pero sin rol. Enviando a selección de rol...",
    );
    return <Redirect href="/HU-05/selRol" />;
  }

  // 3. Si ya es su segunda vez y tiene rol aclarado, lo mandamos a su Home real
  const cleanRole = role.toLowerCase().trim();

  switch (cleanRole) {
    case "administrador":
    case "admin":
      return <Redirect href="/(admin)" />;
    case "profesional":
      return <Redirect href="/(profesional)" />;
    case "cliente":
      return <Redirect href="/(cliente)" />;
    default:
      // Salvaguarda por si tiene guardado un rol inválido o en mayúsculas raras
      return <Redirect href="/HU-05/selRol" />;
  }
}
