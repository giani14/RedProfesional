import { supabase } from "@/lib/supabase";
import { Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker"; // <-- IMPORTE EL PICKER
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#EAB308",
  textMain: "#1F2937",
  textSecondary: "#6B7280",
  inputBg: "#F9FAFB",
  inputBorder: "#E5E7EB",
};

export default function EnviarSolicitud() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [profe, setProfe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [servicio, setServicio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [presupuesto, setPresupuesto] = useState("");

  // NUEVOS ESTADOS PARA MANEJAR EL CALENDARIO
  const [fechaObjeto, setFechaObjeto] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (id) cargarDatosProfe();
  }, [id]);

  const cargarDatosProfe = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("perfiles")
        .select("*, profesionales_info(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProfe(data);
    } catch (err) {
      console.error("Error cargando profe:", err);
    } finally {
      setLoading(false);
    }
  };

  // MANEJADOR AL SELECCIONAR LA FECHA
  const onFechaChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios"); // En iOS se mantiene abierto, en Android se cierra
    if (selectedDate) {
      setFechaObjeto(selectedDate);
    }
  };

  // FORMATEADOR DE FECHA EN TEXTO (DD/MM/AAAA)
  const formatFechaTexto = (date: Date | null) => {
    if (!date) return "Selecciona una fecha";
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const handleContinue = () => {
    if (!servicio.trim() || !descripcion.trim()) {
      alert("Por favor completa los campos de servicio y descripción.");
      return;
    }

    router.push({
      pathname: "/HU-15/revisarSolicitud",
      params: {
        id: id,
        nombre: profe?.nombre_completo,
        especialidad: profe?.profesionales_info?.titulo_especialidad,
        ciudad: profe?.ciudad || "Cochabamba",
        avatar: profe?.avatar_url,
        servicio: servicio,
        descripcion: descripcion,
        presupuesto: presupuesto,
        fecha: formatFechaTexto(fechaObjeto), // Pasa la fecha formateada como string
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER AZUL CLÁSICO */}
      <View style={styles.blueHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>RedProfesional</Text>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.mainTitle}>Enviar solicitud de servicio</Text>

        {/* TARJETA DEL PROFESIONAL SELECCIONADO */}
        <Text style={styles.sectionLabel}>Profesional</Text>
        <View style={styles.profeCard}>
          <Image
            source={{
              uri: profe?.avatar_url || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />
          <View style={styles.profeInfo}>
            <Text style={styles.profeName}>{profe?.nombre_completo}</Text>
            <Text style={styles.profeTitle}>
              {profe?.profesionales_info?.titulo_especialidad}
            </Text>
            <View style={styles.row}>
              <Ionicons name="location" size={14} color={COLORS.primaryBlue} />
              <Text style={styles.locText}>
                {profe?.ciudad || "Cochabamba"}
              </Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="star" size={14} color={COLORS.accentGold} />
              <Text style={styles.ratingText}>
                4.8{" "}
                <Text
                  style={{ fontWeight: "normal", color: COLORS.textSecondary }}
                >
                  (32)
                </Text>
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.mainTitle}>Detalles de la solicitud</Text>

        {/* FORMULARIO */}
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Servicio solicitado</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Ej: Instalación de tablero"
              value={servicio}
              onChangeText={setServicio}
              style={styles.input}
            />
            <Ionicons
              name="chevron-down"
              size={20}
              color={COLORS.textSecondary}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Descripción de tu solicitud</Text>
          <TextInput
            placeholder="Describe tu necesidad, objetivos y requisitos del servicio..."
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
            maxLength={500}
          />
          <Text style={styles.charCount}>{descripcion.length}/500</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>
            Presupuesto estimado <Text style={styles.optional}>(opcional)</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Ingresa tu presupuesto"
              keyboardType="numeric"
              value={presupuesto}
              onChangeText={setPresupuesto}
              style={styles.input}
            />
            <Text style={styles.currency}>Bs.</Text>
          </View>
        </View>

        {/* CAMPO DE FECHA MODIFICADO CON SELECCIONADOR INTERACTIVO */}
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>
            Fecha estimada <Text style={styles.optional}>(opcional)</Text>
          </Text>
          <TouchableOpacity
            style={styles.inputWrapper}
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={[
                styles.input,
                { textAlignVertical: "center" },
                !fechaObjeto && { color: COLORS.textSecondary },
              ]}
            >
              {formatFechaTexto(fechaObjeto)}
            </Text>
            <Feather name="calendar" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* COMPONENTE EXPO DATETIMEPICKER MODAL */}
        {showDatePicker && (
          <DateTimePicker
            value={fechaObjeto || new Date()}
            mode="date"
            display="default"
            onChange={onFechaChange}
            minimumDate={new Date()} // <-- ESTO BLOQUEA LAS FECHAS ANTERIORES A HOY
          />
        )}

        <TouchableOpacity style={styles.btnContinue} onPress={handleContinue}>
          <Text style={styles.btnText}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  blueHeader: { backgroundColor: COLORS.primaryBlue, paddingBottom: 15 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 20 },
  mainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
    marginBottom: 10,
  },

  // Tarjeta Profe
  profeCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: 25,
    alignItems: "center",
  },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  profeInfo: { marginLeft: 15, flex: 1 },
  profeName: { fontSize: 18, fontWeight: "bold", color: COLORS.primaryBlue },
  profeTitle: { fontSize: 14, color: COLORS.textSecondary, marginVertical: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  locText: { fontSize: 13, color: COLORS.textSecondary },
  ratingText: { fontSize: 13, fontWeight: "bold", color: COLORS.textMain },

  // Formulario
  formGroup: { marginBottom: 20 },
  inputLabel: { fontWeight: "bold", color: COLORS.textMain, marginBottom: 8 },
  optional: { fontWeight: "normal", color: COLORS.textSecondary },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  input: { flex: 1, fontSize: 15, color: COLORS.textMain },
  textArea: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    padding: 15,
    height: 120,
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  currency: { fontWeight: "bold", color: COLORS.textMain },

  btnContinue: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  btnText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
