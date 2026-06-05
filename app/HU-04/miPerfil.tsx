import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MiPerfil() {
  const router = useRouter();

  const [perfil, setPerfil] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [rol, setRol] = useState("");

  const obtenerDatosPerfil = async () => {
    try {
      setCargando(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // PERFIL NORMAL
      const { data: perfilData } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // INFO PROFESIONAL
      const { data: infoProfesional } = await supabase
        .from("profesionales_info")
        .select("*")
        .eq("profesional_id", user.id)
        .single();

      if (perfilData) {
        setPerfil({
          ...perfilData,
          email: user.email,
          profesion: infoProfesional?.titulo_especialidad || "",
          experiencia: infoProfesional?.experiencia || "",
          descripcion: infoProfesional?.descripcion || "",
        });

        setRol(perfilData.rol || "cliente");
      }
    } catch (error) {
      console.log("ERROR PERFIL:", error);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      obtenerDatosPerfil();
    }, []),
  );

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1A4670" />
      </View>
    );
  }

  // =============================
  // PERFIL PROFESIONAL (CORREGIDO Y ORDENADO)
  // =============================
  if (rol.toLowerCase() === "profesional") {
    return (
      <View style={styles.contenedorPrincipal}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.headerAzul}>
          <TouchableOpacity
            onPress={() => router.push("/(cliente)/perfil")}
            style={styles.botonBack}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.tituloHeader}>Mi perfil profesional</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Info Central alineada con el formato de cliente */}
          <View style={styles.infoCentral}>
            <View style={styles.contenedorAvatar}>
              <Image
                source={{
                  uri: perfil?.avatar_url || "https://via.placeholder.com/150",
                }}
                style={styles.avatar}
              />
            </View>

            <Text style={styles.nombreUsuario}>
              {perfil?.nombre_completo || "Profesional"}
            </Text>

            {/* Badge dorado limpio sin '&&&' */}
            <View style={styles.tagProfesional}>
              <Text style={styles.tagTexto}>Profesional Verificado</Text>
            </View>

            <Text style={styles.profesionTexto}>
              {perfil?.profesion || "Profesional"}
            </Text>
          </View>

          {/* Detalles estructurados en filas idénticas a la vista cliente */}
          <View style={styles.seccionDetalles}>
            <View style={styles.filaDetalle}>
              <Ionicons
                name="briefcase-outline"
                size={24}
                color="#1A4670"
                style={styles.iconoDetalle}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.labelDetalle}>Experiencia</Text>
                <Text style={styles.valorDetalle}>
                  {perfil?.experiencia || "No especificada"} años
                </Text>
              </View>
            </View>

            <View style={styles.filaDetalle}>
              <Ionicons
                name="mail-outline"
                size={24}
                color="#1A4670"
                style={styles.iconoDetalle}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.labelDetalle}>Correo</Text>
                <Text style={styles.valorDetalle}>
                  {perfil?.email || "No registrado"}
                </Text>
              </View>
            </View>

            <View style={styles.filaDetalle}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#1A4670"
                style={styles.iconoDetalle}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.labelDetalle}>Descripción</Text>
                <Text style={styles.valorDetalle}>
                  {perfil?.descripcion || "Sin descripción"}
                </Text>
              </View>
            </View>

            <View style={styles.filaDetalle}>
              <Ionicons
                name="call-outline"
                size={24}
                color="#1A4670"
                style={styles.iconoDetalle}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.labelDetalle}>Teléfono</Text>
                <Text style={styles.valorDetalle}>
                  {perfil?.telefono || "No registrado"}
                </Text>
              </View>
            </View>

            <View style={styles.filaDetalle}>
              <Ionicons
                name="location-outline"
                size={24}
                color="#1A4670"
                style={styles.iconoDetalle}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.labelDetalle}>Ubicación</Text>
                <Text style={styles.valorDetalle}>
                  {perfil?.ubicacion || "No especificada"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.btnEditar}
            onPress={() => router.push("/HU-04/EditarPerfilProfesional")}
          >
            <Text style={styles.btnEditarTexto}>
              Editar experiencia y perfil
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // =============================
  // PERFIL CLIENTE (INTACTO)
  // =============================
  return (
    <View style={styles.contenedorPrincipal}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerAzul}>
        <TouchableOpacity
          onPress={() => router.push("/(cliente)/perfil")}
          style={styles.botonBack}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Mi perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.seccionLogo}>
          <Text style={styles.logoTexto}>
            Red<Text style={{ color: "#F0B323" }}>Profesional</Text>
          </Text>
        </View>

        <View style={styles.infoCentral}>
          <View style={styles.contenedorAvatar}>
            <Image
              source={{
                uri: perfil?.avatar_url || "https://via.placeholder.com/150",
              }}
              style={styles.avatar}
            />
            <View style={styles.badgeCheck}>
              <Ionicons name="pencil" size={12} color="white" />
            </View>
          </View>

          <Text style={styles.nombreUsuario}>
            {perfil?.nombre_completo || "Usuario"}
          </Text>

          <View style={styles.tagProfesional}>
            <Text style={styles.tagTexto}>{perfil?.rol || "Cliente"}</Text>
          </View>
        </View>

        <View style={styles.seccionDetalles}>
          <View style={styles.filaDetalle}>
            <Ionicons
              name="mail-outline"
              size={24}
              color="#1A4670"
              style={styles.iconoDetalle}
            />
            <View>
              <Text style={styles.labelDetalle}>Correo</Text>
              <Text style={styles.valorDetalle}>{perfil?.email}</Text>
            </View>
          </View>

          <View style={styles.filaDetalle}>
            <Ionicons
              name="call-outline"
              size={24}
              color="#1A4670"
              style={styles.iconoDetalle}
            />
            <View>
              <Text style={styles.labelDetalle}>Teléfono</Text>
              <Text style={styles.valorDetalle}>
                {perfil?.telefono || "No registrado"}
              </Text>
            </View>
          </View>

          <View style={styles.filaDetalle}>
            <Ionicons
              name="location-outline"
              size={24}
              color="#1A4670"
              style={styles.iconoDetalle}
            />
            <View>
              <Text style={styles.labelDetalle}>Ubicación</Text>
              <Text style={styles.valorDetalle}>
                {perfil?.ubicacion || "No especificada"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.tituloSeccion}>Mi actividad</Text>
        <View style={styles.contenedorStats}>
          <View style={styles.cajaStat}>
            <Text style={styles.numeroStat}>12</Text>
            <Text style={styles.nombreStat}>Proyectos</Text>
          </View>
          <View style={styles.cajaStat}>
            <Text style={styles.numeroStat}>8</Text>
            <Text style={styles.nombreStat}>Colaboraciones</Text>
          </View>
          <View style={styles.cajaStat}>
            <Text style={styles.numeroStat}>4.9</Text>
            <Text style={styles.nombreStat}>Calificación</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => router.push("/HU-04/EditarPerfilCliente")}
        >
          <Text style={styles.btnEditarTexto}>Editar datos personales</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAzul: {
    backgroundColor: "#1A4670",
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  botonBack: {
    marginRight: 20,
  },
  tituloHeader: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  seccionLogo: {
    alignItems: "center",
    marginTop: 20,
  },
  logoTexto: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A4670",
  },
  infoCentral: {
    alignItems: "center",
    marginTop: 20,
  },
  contenedorAvatar: {
    position: "relative",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "white",
  },
  badgeCheck: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#F0B323",
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "white",
  },
  nombreUsuario: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
  },
  tagProfesional: {
    backgroundColor: "#FFE5A0",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  tagTexto: {
    color: "#856404",
    fontWeight: "bold",
  },
  profesionTexto: {
    color: "#007AFF",
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
  seccionDetalles: {
    paddingHorizontal: 30,
    marginTop: 30,
  },
  filaDetalle: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  iconoDetalle: {
    marginRight: 20,
    marginTop: 3,
  },
  labelDetalle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  valorDetalle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 30,
    marginTop: 10,
  },
  contenedorStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  cajaStat: {
    backgroundColor: "white",
    width: "30%",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  numeroStat: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  nombreStat: {
    fontSize: 11,
    color: "#666",
    marginTop: 5,
  },
  btnEditar: {
    marginHorizontal: 30,
    marginTop: 30,
    marginBottom: 40,
    height: 55,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1A4670",
    justifyContent: "center",
    alignItems: "center",
  },
  btnEditarTexto: {
    color: "#1A4670",
    fontSize: 16,
    fontWeight: "bold",
  },
});
