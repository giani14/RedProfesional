import { supabase } from "@/lib/supabase";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logoRedProfesional = require("@/assets/images/RedProfesional-removebg.png");

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#E4A01C",
  bgColor: "#F5F5F5",
  textDarkBlue: "#123F78",
  textBodyGrey: "#6B7280",
  inputBg: "#FFFFFF",
  inputBorder: "#D1D5DB",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Lista de áreas de interés / profesiones predefinidas
const AREAS_INTERES = [
  "Tecnología y Sistemas",
  "Construcción y Arquitectura",
  "Salud y Bienestar",
  "Asesoría Legal y Abogacía",
  "Contabilidad y Finanzas",
  "Educación y Tutorías",
  "Marketing y Diseño Digital",
  "Servicios Técnicos (Electricidad, Plomería)",
  "Gastronomía y Eventos",
  "Otro / Particular",
];

// Componente para el Stepper (Indicador de pasos)
const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: "Rol" },
    { id: 2, label: "Información" },
    { id: 3, label: "Confirmar" },
  ];

  return (
    <View style={styles.stepperContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <View style={{ alignItems: "center" }}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor:
                    currentStep === step.id ? COLORS.accentGold : "#D1D5DB",
                },
              ]}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                {step.id}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                {
                  color:
                    currentStep === step.id
                      ? COLORS.accentGold
                      : COLORS.textBodyGrey,
                  fontWeight: currentStep === step.id ? "bold" : "normal",
                },
              ]}
            >
              {step.label}
            </Text>
          </View>
          {index < steps.length - 1 && <View style={styles.stepLine} />}
        </React.Fragment>
      ))}
    </View>
  );
};

export default function AdditionalInfoScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [areaInteres, setAreaInteres] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatosCliente = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // CORREGIDO: Usamos 'nombre_completo' tal cual está en tu tabla de Supabase
          const { data, error } = await supabase
            .from("perfiles")
            .select("nombre_completo")
            .eq("id", user.id)
            .maybeSingle();

          if (error) throw error;

          if (data && data.nombre_completo) {
            setNombre(data.nombre_completo);
          }
        }
      } catch (error: any) {
        console.error("Error al cargar datos del cliente:", error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosCliente();
  }, []);

  const handleNextStep = () => {
    if (!nombre.trim()) {
      alert("Por favor ingresa tu nombre completo.");
      return;
    }
    if (!areaInteres) {
      alert("Por favor selecciona un área de interés.");
      return;
    }

    // Navegación limpia enviando parámetros listos para el commit en la siguiente HU
    router.push({
      pathname: "/HU-05/confirCliente",
      params: {
        nombre: nombre.trim(),
        empresa: empresa.trim() || "Particular",
        areaInteres: areaInteres,
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primaryBlue }}>
        <View style={{ flex: 1, backgroundColor: COLORS.bgColor }}>
          {/* Header Azul */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Completar información</Text>
              <View style={{ width: 26 }} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          >
            {/* 1. Stepper */}
            <Stepper currentStep={2} />

            {/* 2. Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={logoRedProfesional}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* 3. Título de sección */}
            <View style={{ alignItems: "center", marginBottom: 25 }}>
              <Text style={styles.mainTitle}>Información adicional</Text>
              <Text style={styles.subTitle}>
                Cuéntanos un poco más para personalizar tu experiencia como
                cliente.
              </Text>
            </View>

            {/* 4. Resumen de Rol seleccionado */}
            <View style={styles.roleBadge}>
              <View style={styles.roleIconContainer}>
                <FontAwesome name="user" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.textBodyGrey }}>
                  Rol seleccionado:
                </Text>
                <Text style={styles.roleText}>Cliente</Text>
              </View>
            </View>

            {/* 5. Formulario */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Cargando nombre..."
                value={nombre}
                onChangeText={setNombre}
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Empresa (Opcional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej. Mi Negocio S.R.L. o Particular"
                value={empresa}
                onChangeText={setEmpresa}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>
                Área de interés / Profesión requerida
              </Text>

              {/* Botón selector que emula un Input Dropdown */}
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setModalVisible(true)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: areaInteres ? "#333" : "#9CA3AF",
                  }}
                >
                  {areaInteres || "Selecciona un área de interés..."}
                </Text>
                <FontAwesome
                  name="chevron-down"
                  size={16}
                  color={COLORS.textBodyGrey}
                />
              </TouchableOpacity>
            </View>

            {/* 6. Botón Continuar */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleNextStep}
            >
              <Text style={styles.submitButtonText}>Continuar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* MODAL DESPLEGABLE DE PROFESIONES / ÁREAS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Áreas de Interés</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={COLORS.textBodyGrey}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={AREAS_INTERES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item === areaInteres && { backgroundColor: "#E4A01C20" },
                  ]}
                  onPress={() => {
                    setAreaInteres(item);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === areaInteres && {
                        color: COLORS.accentGold,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {item}
                  </Text>
                  {item === areaInteres && (
                    <FontAwesome
                      name="check"
                      size={16}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
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
    justifyContent: "center",
    alignItems: "center",
  },
  stepLabel: {
    marginTop: 5,
    fontSize: 12,
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: "#D1D5DB",
    marginBottom: 15,
    marginHorizontal: 8,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: -10,
  },
  logo: {
    width: SCREEN_WIDTH * 0.45,
    height: 100,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textDarkBlue,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 15,
    color: COLORS.textBodyGrey,
    textAlign: "center",
    lineHeight: 20,
  },
  roleBadge: {
    backgroundColor: "#E4A01C15",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E4A01C30",
  },
  roleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  roleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textDarkBlue,
  },
  formGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontWeight: "700",
    color: COLORS.textDarkBlue,
    marginBottom: 8,
    fontSize: 14,
  },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
  },
  dropdownSelector: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: COLORS.accentGold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDarkBlue,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
});
