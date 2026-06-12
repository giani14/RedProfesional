import { supabase } from "@/lib/supabase";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Importamos el selector de documentos de Expo
import * as DocumentPicker from "expo-document-picker";

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#E4A01C",
  bgColor: "#F5F5F5",
  textDarkBlue: "#123F78",
  textBodyGrey: "#6B7280",
  inputBg: "#FFFFFF",
  inputBorder: "#E5E7EB",
  placeholder: "#9CA3AF",
  successGreen: "#10B981",
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PROFESIONES_DATA = [
  "Ingeniero de Sistemas",
  "Ingeniero Informático",
  "Ingeniero de Software",
  "Ingeniero Civil",
  "Ingeniero Electromecánico",
  "Ingeniero Electrónico",
  "Ingeniero Industrial",
  "Ingeniero Químico",
  "Ingeniero de Alimentos",
  "Licenciado en Administración de Empresas",
  "Licenciado en Contaduría Pública (Auditor)",
  "Licenciado en Ingeniería Comercial",
  "Licenciado en Economía",
  "Licenciado en Comercio Internacional",
  "Médico Cirujano",
  "Licenciado en Enfermería",
  "Odontólogo",
  "Bioquímico y Farmacéutico",
  "Licenciado en Fisioterapia y Kinesiología",
  "Licenciado en Nutrición y Dietética",
  "Abogado",
  "Licenciado en Psicología",
  "Licenciado en Comunicación Social",
  "Licenciado en Ciencias de la Educación",
  "Licenciado en Trabajo Social",
  "Licenciado en Sociología",
  "Arquitecto",
  "Diseñador Gráfico",
  "Licenciado en Diseño de Interiores",
];

const Stepper = () => (
  <View style={styles.stepperContainer}>
    <Step number="1" label="Rol" active={false} />
    <View style={styles.stepLine} />
    <Step number="2" label="Información" active={true} />
    <View style={styles.stepLine} />
    <Step number="3" label="Confirmar" active={false} />
  </View>
);

const Step = ({
  number,
  label,
  active,
}: {
  number: string;
  label: string;
  active: boolean;
}) => (
  <View style={{ alignItems: "center" }}>
    <View
      style={[
        styles.stepCircle,
        active && { backgroundColor: COLORS.accentGold },
      ]}
    >
      <Text style={styles.stepText}>{number}</Text>
    </View>
    <Text
      style={[
        styles.stepLabel,
        active && { color: COLORS.accentGold, fontWeight: "bold" },
      ]}
    >
      {label}
    </Text>
  </View>
);

const InputGroup = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  multiline = false,
  onPress,
}: any) => (
  <View style={{ marginBottom: 18 }}>
    <Text style={styles.label}>{label}</Text>
    {onPress ? (
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>{icon}</View>
        <Text
          style={[
            styles.input,
            !value && { color: COLORS.placeholder },
            { textAlignVertical: "center" },
          ]}
        >
          {value || placeholder}
        </Text>
        <Feather
          name="chevron-down"
          size={20}
          color={COLORS.textBodyGrey}
          style={{ marginRight: 5 }}
        />
      </TouchableOpacity>
    ) : (
      <View
        style={[
          styles.inputWrapper,
          multiline && {
            height: 100,
            alignItems: "flex-start",
            paddingTop: 12,
          },
        ]}
      >
        <View style={styles.iconContainer}>{icon}</View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    )}
  </View>
);

export default function ProfeInfoScreen() {
  const router = useRouter();

  // ESTADOS DEL FORMULARIO
  const [nombre, setNombre] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [ubicacion, setUbicacion] = useState("Cochabamba");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("+591 ");

  // NUEVO ESTADO: Guarda el archivo seleccionado del certificado
  const [certificadoFile, setCertificadoFile] = useState<any>(null);

  // ESTADOS PARA RECURSOS DINÁMICOS
  const [experienciaOpciones, setExperienciaOpciones] = useState<string[]>([]);
  const [loadingExperiencia, setLoadingExperiencia] = useState(false);

  const [modalProfesionVisible, setModalProfesionVisible] = useState(false);
  const [modalExperienciaVisible, setModalExperienciaVisible] = useState(false);

  useEffect(() => {
    obtenerNombreUsuario();
    obtenerOpcionesExperiencia();
  }, []);

  const obtenerNombreUsuario = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("perfiles")
          .select("nombre_completo")
          .eq("id", user.id)
          .single();
        if (data) setNombre(data.nombre_completo);
      }
    } catch (error: any) {
      console.error("Error al obtener nombre:", error.message);
    }
  };

  const obtenerOpcionesExperiencia = async () => {
    setLoadingExperiencia(true);
    try {
      const { data, error } = await supabase.rpc("get_enum_values", {
        enum_type_name: "rango_experiencia",
      });
      if (error || !data) {
        setExperienciaOpciones([
          "Sin experiencia",
          "1-2 años",
          "3-4 años",
          "5 y más años",
        ]);
      } else {
        setExperienciaOpciones(data);
      }
    } catch (err) {
      setExperienciaOpciones([
        "Sin experiencia",
        "1-2 años",
        "3-4 años",
        "5 y más años",
      ]);
    } finally {
      setLoadingExperiencia(false);
    }
  };

  // FUNCIÓN PARA SELECCIONAR EL CERTIFICADO DESDE EL TELÉFONO
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"], // Permitimos imágenes y PDFs
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setCertificadoFile(file);
      }
    } catch (error) {
      console.error("Error al seleccionar documento:", error);
      Alert.alert("Error", "Ocurrió un error al intentar abrir los archivos.");
    }
  };

  const handleNextStep = () => {
    if (!nombre || !especialidad || !telefono) {
      Alert.alert(
        "Campos obligatorios",
        "Por favor completa tu nombre, especialidad y teléfono.",
      );
      return;
    }

    // Pasamos el URI y nombre del archivo a la pantalla de confirmación mediante los params
    router.push({
      pathname: "/HU-05/confirProfe",
      params: {
        nombre,
        especialidad,
        experiencia: encodeURIComponent(experiencia),
        ubicacion,
        descripcion,
        telefono,
        // Mandamos los datos del archivo temporal para subirlos en el paso final
        certificadoUri: certificadoFile ? certificadoFile.uri : "",
        certificadoName: certificadoFile ? certificadoFile.name : "",
        certificadoMime: certificadoFile ? certificadoFile.mimeType : "",
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primaryBlue }}>
        <View style={{ flex: 1, backgroundColor: COLORS.bgColor }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Completar información</Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Stepper />

            <View style={styles.infoSection}>
              <Text style={styles.mainTitle}>Información adicional</Text>
              <Text style={styles.mainSubtitle}>
                Esta información será visible para tus clientes potenciales.
              </Text>
            </View>

            <InputGroup
              label="Nombre completo"
              icon={
                <Feather name="user" size={20} color={COLORS.primaryBlue} />
              }
              placeholder="Tu nombre completo"
              value={nombre}
              onChangeText={setNombre}
            />

            <InputGroup
              label="Profesión / Especialidad"
              icon={
                <Feather
                  name="briefcase"
                  size={20}
                  color={COLORS.primaryBlue}
                />
              }
              placeholder="Selecciona tu profesión"
              value={especialidad}
              onPress={() => setModalProfesionVisible(true)}
            />

            <InputGroup
              label="Experiencia"
              icon={
                <Feather name="award" size={20} color={COLORS.primaryBlue} />
              }
              placeholder={
                loadingExperiencia
                  ? "Cargando opciones..."
                  : "Selecciona tu experiencia"
              }
              value={decodeURIComponent(experiencia)}
              onPress={() => setModalExperienciaVisible(true)}
            />

            <InputGroup
              label="Ubicación"
              icon={
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={COLORS.primaryBlue}
                />
              }
              placeholder="Ej: Cochabamba"
              value={ubicacion}
              onChangeText={setUbicacion}
            />

            <InputGroup
              label="Descripción"
              icon={
                <MaterialIcons
                  name="description"
                  size={20}
                  color={COLORS.primaryBlue}
                />
              }
              placeholder="Describe tus servicios..."
              value={descripcion}
              onChangeText={setDescripcion}
              multiline={true}
            />

            <InputGroup
              label="Teléfono de contacto"
              icon={
                <Feather name="phone" size={20} color={COLORS.primaryBlue} />
              }
              placeholder="+591 70000000"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />

            {/* SECCIÓN NUEVA: CARGA DE CERTIFICADO DE PROFESIÓN O DIPLOMADO */}
            <Text style={styles.label}>Certificado/Diplomado de profesion</Text>
            <TouchableOpacity
              style={[
                styles.uploadBox,
                certificadoFile && {
                  borderColor: COLORS.successGreen,
                  backgroundColor: "#E6F4EA",
                },
              ]}
              onPress={handlePickDocument}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.uploadIconCircle,
                  certificadoFile && { backgroundColor: COLORS.successGreen },
                ]}
              >
                <Ionicons
                  name={certificadoFile ? "checkmark" : "arrow-up"}
                  size={24}
                  color="#FFFFFF"
                />
              </View>

              <Text
                style={[
                  styles.uploadMainText,
                  certificadoFile && { color: COLORS.successGreen },
                ]}
              >
                {certificadoFile
                  ? "¡Archivo seleccionado con éxito!"
                  : "Agregar imágenes o documentos"}
              </Text>

              <Text style={styles.uploadSubText}>
                {certificadoFile
                  ? certificadoFile.name
                  : "Formatos permitidos: JPG, PNG, PDF"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnContinue}
              onPress={handleNextStep}
            >
              <Text style={styles.btnText}>Continuar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* MODAL DE PROFESIONES */}
      <Modal
        visible={modalProfesionVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tu Profesión</Text>
              <TouchableOpacity onPress={() => setModalProfesionVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDarkBlue} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={PROFESIONES_DATA}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setEspecialidad(item);
                    setModalProfesionVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      especialidad === item && {
                        color: COLORS.accentGold,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {item}
                  </Text>
                  {especialidad === item && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.accentGold}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* MODAL DE EXPERIENCIA */}
      <Modal
        visible={modalExperienciaVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tu Experiencia</Text>
              <TouchableOpacity
                onPress={() => setModalExperienciaVisible(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.textDarkBlue} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={experienciaOpciones}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setExperiencia(item);
                    setModalExperienciaVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      decodeURIComponent(experiencia) === item && {
                        color: COLORS.accentGold,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {item}
                  </Text>
                  {decodeURIComponent(experiencia) === item && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.accentGold}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primaryBlue,
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  stepperContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 25,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: { color: "#FFFFFF", fontWeight: "bold" },
  stepLabel: { marginTop: 5, fontSize: 12, color: COLORS.textBodyGrey },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#D1D5DB",
    marginBottom: 15,
    marginHorizontal: 10,
  },
  infoSection: { alignItems: "center", marginBottom: 25 },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textDarkBlue,
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 14,
    color: COLORS.textBodyGrey,
    textAlign: "center",
  },
  label: {
    fontWeight: "700",
    color: COLORS.textDarkBlue,
    marginBottom: 8,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    height: 55,
    paddingHorizontal: 15,
  },
  iconContainer: { width: 40, alignItems: "flex-start" },
  input: { flex: 1, fontSize: 16, color: "#1F2937" },
  btnContinue: {
    backgroundColor: COLORS.accentGold,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 30,
    elevation: 3,
  },
  btnText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: SCREEN_HEIGHT * 0.6,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDarkBlue },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  modalItemText: { fontSize: 16, color: "#374151" },

  // 🌟 NUEVOS ESTILOS EXACTOS DE LA CAPTURA PARA CARGAR EL ARCHIVO
  uploadBox: {
    borderWidth: 2,
    borderColor: "#4285F4",
    borderStyle: "dashed", // Bordes punteados
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 5,
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadMainText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A73E8",
    textAlign: "center",
    marginBottom: 8,
  },
  uploadSubText: {
    fontSize: 14,
    color: COLORS.textBodyGrey,
    textAlign: "center",
  },
});
