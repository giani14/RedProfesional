import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function EditarPerfilCliente() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [obteniendoGPS, setObteniendoGPS] = useState(false);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(
    "https://via.placeholder.com/150",
  );

  const [hayCambios, setHayCambios] = useState(false);
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  useEffect(() => {
  obtenerPerfil();
  }, []);

  const obtenerPerfil = async () => {
    try {
      setCargando(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        router.replace("/");
        return;
      }
      setIdUsuario(user.id);
      const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {

  setNombre(data.nombre_completo || "");
        setCorreo(user.email || "");
        setTelefono(data.telefono || "");
        setUbicacion(data.ubicacion || "");
        if (data.avatar_url) setFotoPerfil(data.avatar_url);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los datos.");
    } finally {
      setCargando(false);
    }
  };

  const obtenerUbicacionActual = async () => {
    setObteniendoGPS(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos acceso al GPS.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const stringUbicacion = `${address.city || ""}, ${address.region || ""}, ${address.country || ""}`;
        setUbicacion(stringUbicacion);
        setHayCambios(true);
      }
    } catch (error) {
      Alert.alert("Error", "No pudimos obtener la ubicación.");
    } finally {
      setObteniendoGPS(false);
    }
  };

  const telefonoValido = (tel: string) => /^[67]\d{7}$/.test(tel);

  const errores = {
    nombre: !nombre.trim(),
    telefono: !telefonoValido(telefono),
    ubicacion: !ubicacion.trim(),
  };

  const formularioInvalido =
    errores.nombre || errores.telefono || errores.ubicacion;

  const manejarGuardar = async () => {
    setIntentoGuardar(true);
    if (formularioInvalido) {
      Alert.alert("Campos incompletos", "Por favor corrige los errores.");
      return;
    }

    try {
      setGuardando(true);
      const { error } = await supabase.from("perfiles").upsert({
        id: idUsuario,
        nombre_completo: nombre.trim(),
        telefono: telefono.trim(),
        ubicacion: ubicacion.trim(),
        avatar_url: fotoPerfil,
        updated_at: new Date().toISOString(), // Corrección: ISO String para Supabase
      });

      if (!error) {
        router.push({
          pathname: "/HU-04/datosActua",
          params: { nombre, correo, telefono },
        });
      } else {
        throw error;
      }
    } catch (error: any) {
      Alert.alert("Error Técnico", error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#FFB100" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.contenedor}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitulo}>
            Editar perfil cliente
          </Text>
        </View>

        <View style={styles.cuerpo}>
          <View style={styles.seccionFoto}>
            <Image
              source={{ uri: fotoPerfil }}
              style={styles.avatar}
            />
          </View>

          <View style={styles.form}>
            
            <Text style={styles.label}>Nombre completo</Text>

<View
  style={[
    styles.inputContainer,
    intentoGuardar && errores.nombre && styles.inputErrorBorde,
  ]}
>
  <Ionicons
    name="person-outline"
    size={20}
    color={intentoGuardar && errores.nombre ? "#E74C3C" : "#666"}
  />

  <TextInput
    style={styles.input}
    value={nombre}
    onChangeText={(txt) => {
      setNombre(txt);
      setHayCambios(true);
    }}
    placeholder="Ej. Juan Pérez"
  />
</View>

{intentoGuardar && errores.nombre && (
  <Text style={styles.errorTxt}>
    El nombre es obligatorio.
  </Text>
)}

<Text style={styles.label}>Teléfono</Text>

<View
  style={[
    styles.inputContainer,
    intentoGuardar && errores.telefono && styles.inputErrorBorde,
  ]}
>
  <Ionicons
    name="call-outline"
    size={20}
    color={intentoGuardar && errores.telefono ? "#E74C3C" : "#666"}
  />

  <TextInput
    style={styles.input}
    value={telefono}
    keyboardType="phone-pad"
    onChangeText={(txt) => {
      setTelefono(txt);
      setHayCambios(true);
    }}
    placeholder="77123456"
    maxLength={8}
  />
</View>

{intentoGuardar && errores.telefono && (
  <Text style={styles.errorTxt}>
    Número no válido (8 dígitos).
  </Text>
)}

<Text style={styles.label}>Ubicación</Text>

<View
  style={[
    styles.inputContainer,
    intentoGuardar && errores.ubicacion && styles.inputErrorBorde,
  ]}
>
  <Ionicons
    name="location-outline"
    size={20}
    color={intentoGuardar && errores.ubicacion ? "#E74C3C" : "#666"}
  />

  <TextInput
    style={styles.input}
    value={ubicacion}
    onChangeText={(txt) => {
      setUbicacion(txt);
      setHayCambios(true);
    }}
    placeholder="Ciudad, País"
  />

  <TouchableOpacity
    onPress={obtenerUbicacionActual}
    disabled={obteniendoGPS}
  >
    {obteniendoGPS ? (
      <ActivityIndicator size="small" color="#FFB100" />
    ) : (
      <Ionicons name="locate" size={20} color="#007AFF" />
    )}
  </TouchableOpacity>
</View>

{intentoGuardar && errores.ubicacion && (
  <Text style={styles.errorTxt}>
    La ubicación es obligatoria.
  </Text>
)}

            <TouchableOpacity
              style={styles.btnGuardar}
              onPress={manejarGuardar}
            >
              <Text style={styles.btnTexto}>
                Guardar cambios
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );

}

const styles = StyleSheet.create({
  // Tus estilos están perfectos, mantuve la lógica de image_8d012b.png
  contenedor: { flex: 1, backgroundColor: "#FFF" },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#1A4670",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitulo: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  cuerpo: { padding: 20 },
  seccionFoto: { alignItems: "center", marginBottom: 30 },
  contenedorAvatar: { position: "relative" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
  },
  botonCamara: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFB100",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  txtCambiarFoto: { color: "#007AFF", marginTop: 10, fontWeight: "600" },
  form: { width: "100%" },
  label: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 55,
    backgroundColor: "#F9FAFB",
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#333" },
  inputErrorBorde: { borderColor: "#E74C3C", backgroundColor: "#FDEDEC" },
  errorTxt: { color: "#E74C3C", fontSize: 12, marginTop: 4, fontWeight: "500" },
  btnGuardar: {
    backgroundColor: "#FFB100",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    elevation: 2,
  },
  btnDeshabilitado: { backgroundColor: "#CCC" },
  btnTexto: { color: "white", fontSize: 16, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: "center",
    elevation: 5,
  },
  closeIcon: { alignSelf: "flex-end", marginBottom: 10 },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  btnSeguir: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1A4670",
    marginBottom: 15,
    alignItems: "center",
  },
  btnSeguirText: { color: "#1A4670", fontSize: 16, fontWeight: "bold" },
  btnDescartar: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: "#F0B323",
    alignItems: "center",
  },
  btnDescartarText: { color: "#1A4670", fontSize: 16, fontWeight: "bold" },
});
