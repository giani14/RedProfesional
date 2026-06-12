import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function NotificacionesGlobalesScreen() {
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const enviarAlertaGlobal = () => {
    if (!titulo || !mensaje) {
      Alert.alert(
        "Campos vacíos",
        "Por favor completa el título y mensaje de la notificación.",
      );
      return;
    }
    Alert.alert(
      "Éxito",
      "La notificación masiva ha sido enviada a todos los dispositivos.",
    );
    setTitulo("");
    setMensaje("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Enviar Notificación Push Global</Text>
      <Text style={styles.sub}>
        Este mensaje será enviado en tiempo real a todos los profesionales y
        clientes registrados en el sistema.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Título del anuncio..."
        value={titulo}
        onChangeText={setTitulo}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Escribe el cuerpo del mensaje aquí..."
        multiline
        numberOfLines={4}
        value={mensaje}
        onChangeText={setMensaje}
      />

      <TouchableOpacity style={styles.btn} onPress={enviarAlertaGlobal}>
        <Text style={styles.btnText}>Emitir Notificación Masiva</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A4670",
    marginBottom: 8,
  },
  sub: { fontSize: 14, color: "#6B7280", marginBottom: 25, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 15,
    backgroundColor: "#F9FAFB",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  btn: {
    backgroundColor: "#1A4670",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
