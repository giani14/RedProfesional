import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function EditarDatosPersonales() {
  const router = useRouter();
  const navigation = useNavigation();

  // --- ESTADOS DE DATOS ---
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [idUsuario, setIdUsuario] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(
    "https://via.placeholder.com/150",
  );

  // Para rastrear si hubo cambios y mostrar la alerta de "Descartar"
  const [hayCambios, setHayCambios] = useState(false);

  // --- CARGA INICIAL (Criterio: Mostrar datos actuales) ---
  useEffect(() => {
    obtenerPerfil();

    // Interceptar el botón "atrás" en Android
    const backAction = () => {
      if (hayCambios) {
        mostrarAlertaDescartar();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, [hayCambios]);

  const obtenerPerfil = async () => {
    try {
      setCargando(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      // Criterio: Redirigir si la sesión expiró
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
        setCorreo(user.email || ""); // El correo viene de auth.users
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

  // --- VALIDACIONES (Criterio: Formatos y campos obligatorios) ---
  const correoValido = (email: string) => /\S+@\S+\.\S+/.test(email);
  // Validación Bolivia: Celulares suelen empezar con 6 o 7 y tienen 8 dígitos
  const telefonoValido = (tel: string) => /^[67]\d{7}$/.test(tel);

  const errores = {
    nombre: !nombre.trim(),
    correo: !correoValido(correo),
    telefono: !telefonoValido(telefono),
  };

  const formularioInvalido =
    errores.nombre || errores.correo || errores.telefono;

  // --- MANEJO DE FOTO (Criterio: Cambiar foto de perfil) ---
  const seleccionarImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setFotoPerfil(result.assets[0].uri);
      setHayCambios(true);
    }
  };

  // --- GUARDADO (Criterios: Actualización, Confirmación y Errores) ---
  const manejarGuardar = async () => {
    if (formularioInvalido) return;

    try {
      setGuardando(true);
      const { error } = await supabase.from("perfiles").upsert({
        id: idUsuario,
        nombre_completo: nombre.trim(),
        telefono: telefono.trim(),
        ubicacion: ubicacion.trim(),
        avatar_url: fotoPerfil,
        updated_at: new Date(),
      });

      if (error) throw error;

      setHayCambios(false);
      Alert.alert("¡Éxito!", "Tus datos se han guardado correctamente.", [
        { text: "Ver perfil", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        "Hubo un fallo al guardar los cambios. Intenta de nuevo.",
      );
    } finally {
      setGuardando(false);
    }
  };

  // --- DESCARTAR CAMBIOS (Criterio: Confirmación antes de salir) ---
  const mostrarAlertaDescartar = () => {
    Alert.alert(
      "Descartar cambios",
      "Tienes cambios sin guardar. ¿Seguro que deseas salir?",
      [
        { text: "Seguir editando", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#FFB100" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={hayCambios ? mostrarAlertaDescartar : () => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Editar datos personales</Text>
      </View>

      <View style={styles.cuerpo}>
        {/* Foto de Perfil */}
        <View style={styles.seccionFoto}>
          <View style={styles.contenedorAvatar}>
            <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
            <TouchableOpacity
              style={styles.botonCamara}
              onPress={seleccionarImagen}
            >
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={seleccionarImagen}>
            <Text style={styles.txtCambiarFoto}>Cambiar foto</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          <Text style={styles.label}>Nombre completo *</Text>
          <View
            style={[
              styles.inputContainer,
              errores.nombre && styles.inputErrorBorde,
            ]}
          >
            <Ionicons name="person-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={(txt) => {
                setNombre(txt);
                setHayCambios(true);
              }}
              placeholder="Juan Pérez García"
            />
          </View>
          {errores.nombre && (
            <Text style={styles.errorTxt}>
              El nombre completo es obligatorio.
            </Text>
          )}

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={[styles.inputContainer, { backgroundColor: "#f0f0f0" }]}>
            <Ionicons name="mail-outline" size={20} color="#999" />
            <TextInput style={styles.input} value={correo} editable={false} />
          </View>

          <Text style={styles.label}>Teléfono *</Text>
          <View
            style={[
              styles.inputContainer,
              errores.telefono && styles.inputErrorBorde,
            ]}
          >
            <Ionicons name="call-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={telefono}
              keyboardType="phone-pad"
              onChangeText={(txt) => {
                setTelefono(txt);
                setHayCambios(true);
              }}
              placeholder="Ej: 77123456"
              maxLength={8}
            />
          </View>
          {errores.telefono && (
            <Text style={styles.errorTxt}>
              Ingresa un número de Bolivia válido (8 dígitos).
            </Text>
          )}

          <Text style={styles.label}>Ubicación</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={ubicacion}
              onChangeText={(txt) => {
                setUbicacion(txt);
                setHayCambios(true);
              }}
              placeholder="Cochabamba, Bolivia"
            />
          </View>

          {/* Botón Guardar (Criterio: Deshabilitado si es inválido) */}
          <TouchableOpacity
            style={[
              styles.btnGuardar,
              (formularioInvalido || guardando) && styles.btnDeshabilitado,
            ]}
            onPress={manejarGuardar}
            disabled={formularioInvalido || guardando}
          >
            {guardando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnTexto}>Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#FFF" },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#002B5B",
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
  label: { fontSize: 14, color: "#333", fontWeight: "bold", marginBottom: 5 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 5,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#333" },
  inputErrorBorde: { borderColor: "#E74C3C" },
  errorTxt: { color: "#E74C3C", fontSize: 12, marginBottom: 15 },
  btnGuardar: {
    backgroundColor: "#FFB100",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  btnDeshabilitado: { backgroundColor: "#CCC" },
  btnTexto: { color: "white", fontSize: 16, fontWeight: "bold" },
});
