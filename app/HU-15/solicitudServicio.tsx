import { supabase } from "@/lib/supabase";
import { Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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

// Helper para obtener iniciales en caso de que no tenga avatar
const obtenerIniciales = (nombre: string) => {
  if (!nombre) return "??";
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
};

export default function EnviarSolicitud() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [profe, setProfe] = useState<any>(null);
  const [infoTecnica, setInfoTecnica] = useState<any>(null);
  const [rating, setRating] = useState({ promedio: 5.0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [servicio, setServicio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [presupuesto, setPresupuesto] = useState("");

  // Estados para manejar el calendario
  const [fechaObjeto, setFechaObjeto] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (id) cargarDatosProfe();
  }, [id]);

  const cargarDatosProfe = async () => {
    try {
      setLoading(true);
      // Query corregida para traer ratings reales
      const { data, error } = await supabase
        .from("perfiles")
        .select(
          `
          *, 
          profesionales_info(
            *,
            profesionales_rating(
              promedio,
              total_reviews
            )
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      setProfe(data);

      // Manejo seguro del objeto anidado
      const info = Array.isArray(data?.profesionales_info)
        ? data?.profesionales_info[0]
        : data?.profesionales_info;

      setInfoTecnica(info);

      if (info?.profesionales_rating) {
        const rData = Array.isArray(info.profesionales_rating)
          ? info.profesionales_rating[0]
          : info.profesionales_rating;

        setRating({
          promedio: rData?.promedio ?? 5.0,
          total: rData?.total_reviews ?? 0,
        });
      }
    } catch (err) {
      console.error("Error cargando profe:", err);
    } finally {
      setLoading(false);
    }
  };

  const onFechaChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFechaObjeto(selectedDate);
    }
  };

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
        especialidad: infoTecnica?.titulo_especialidad || "Especialista",
        ciudad: profe?.ciudad || "Cochabamba",
        avatar: profe?.avatar_url || "",
        servicio: servicio,
        descripcion: descripcion,
        presupuesto: presupuesto,
        fecha: fechaObjeto ? fechaObjeto.toISOString() : "", // Enviamos formato ISO estándar para base de datos
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
          {profe?.avatar_url ? (
            <Image source={{ uri: profe.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarIniciales}>
              <Text style={styles.textoIniciales}>
                {obtenerIniciales(profe?.nombre_completo)}
              </Text>
            </View>
          )}

          <View style={styles.profeInfo}>
            <Text style={styles.profeName}>{profe?.nombre_completo}</Text>
            <Text style={styles.profeTitle}>
              {infoTecnica?.titulo_especialidad || "Especialista General"}
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
                {rating.total > 0 ? rating.promedio.toFixed(1) : "5.0"}{" "}
                <Text
                  style={{ fontWeight: "normal", color: COLORS.textSecondary }}
                >
                  ({rating.total} {rating.total === 1 ? "opinión" : "opiniones"}
                  )
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

        {/* CALENDARIO INTERACTIVO */}
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

        {showDatePicker && (
          <DateTimePicker
            value={fechaObjeto || new Date()}
            mode="date"
            display="default"
            onChange={onFechaChange}
            minimumDate={new Date()}
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
  avatarIniciales: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  textoIniciales: { color: "#FFFFFF", fontSize: 26, fontWeight: "bold" },
  profeInfo: { marginLeft: 15, flex: 1 },
  profeName: { fontSize: 18, fontWeight: "bold", color: COLORS.primaryBlue },
  profeTitle: { fontSize: 14, color: COLORS.textSecondary, marginVertical: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  locText: { fontSize: 13, color: COLORS.textSecondary },
  ratingText: { fontSize: 13, fontWeight: "bold", color: COLORS.textMain },
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
