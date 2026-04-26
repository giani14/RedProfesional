import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// --- COMPONENTE DEL LOGOTIPO (Replicando el diseño) ---
const RedProfesionalLogo = () => {
  return (
    <View style={logoStyles.container}>
      {/* Fondo de círculos abstractos (Replicando el diseño) */}
      <View style={logoStyles.backgroundCircles}>
        <View
          style={[
            logoStyles.circle,
            {
              backgroundColor: "#F9B934",
              width: 60,
              height: 60,
              top: 10,
              left: 20,
            },
          ]}
        />
        <View
          style={[
            logoStyles.circle,
            {
              backgroundColor: "#FDCB5D",
              width: 45,
              height: 45,
              top: 45,
              left: 60,
            },
          ]}
        />
        <View
          style={[
            logoStyles.circle,
            {
              backgroundColor: "#2D5C8A",
              width: 25,
              height: 25,
              top: 20,
              right: 10,
              opacity: 0.8,
            },
          ]}
        />
        {/* Línea diagonal */}
        <View style={logoStyles.diagonalLine} />
      </View>

      {/* Texto del Logotipo */}
      <View style={logoStyles.textContainer}>
        <Text style={logoStyles.redText}>Red</Text>
        <Text style={logoStyles.profesionalText}>Profesional</Text>
      </View>
    </View>
  );
};

// --- PANTALLA PRINCIPAL ---
export default function IngresarScreen() {
  const router = useRouter();
  return (
    // SafeAreaView asegura que el contenido no se corte por el notch o bordes de la pantalla
    <SafeAreaView style={styles.container}>
      {/* Configura la barra de estado superior (hora, batería) */}
      <StatusBar barStyle="light-content" backgroundColor="#1A3B63" />

      {/* Franja Azul Superior (Réplica exacta de la imagen) */}
      <View style={styles.topHeaderBar} />

      {/* Contenido Principal */}
      <View style={styles.content}>
        {/* 1. Logotipo RedProfesional */}
        <View style={styles.logoWrapper}>
          <RedProfesionalLogo />
        </View>

        {/* 2. Botón de Acción (Diseño idéntico, texto modificado a 'Ingresar') */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
      </View>

      {/* Formas Decorativas Inferiores (Réplica de las ondas de la imagen) */}
      <View style={styles.bottomDecorations}>
        <View style={styles.bottomWaveBlue} />
        <View style={styles.bottomWaveYellow} />
      </View>
    </SafeAreaView>
  );
}

// --- ESTILOS ---

// Estilos específicos para recrear el logotipo
const logoStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 250, // Ajusta el ancho base del área del logo
    height: 100,
  },
  backgroundCircles: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  circle: {
    position: "absolute",
    borderRadius: 999, // Hace que sea un círculo perfecto
  },
  diagonalLine: {
    position: "absolute",
    width: 2,
    height: 80,
    backgroundColor: "#3878B3",
    top: 15,
    right: 35,
    transform: [{ rotate: "45deg" }], // Ángulo de la línea
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    zIndex: 10, // Asegura que el texto esté sobre los círculos
  },
  redText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#D85C31", // Color naranja-rojo exacto
  },
  profesionalText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A3B63", // Color azul oscuro exacto
  },
});

// Estilos de la pantalla general y elementos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Color de fondo gris muy claro de la interfaz
  },
  topHeaderBar: {
    height: 60, // Altura aproximada de la barra azul superior
    backgroundColor: "#1A3B63", // Color azul oscuro exacto de la barra
    width: "100%",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // Centra el contenido verticalmente
    paddingHorizontal: 20,
    paddingTop: 40, // Espacio después de la barra superior
    zIndex: 1, // Asegura que el contenido esté sobre las ondas inferiores
  },
  logoWrapper: {
    marginBottom: 100, // Espacio grande entre el logo y el botón, imitando la imagen original
  },
  button: {
    backgroundColor: "#F9B934", // Color amarillo-dorado exacto del botón
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12, // Bordes redondeados idénticos
    alignItems: "center",
    justifyContent: "center",
    // Sombra para dar efecto de elevación (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    // Sombra para Android
    elevation: 3,
  },
  buttonText: {
    color: "#1A3B63", // Color de texto azul oscuro exacto dentro del botón
    fontSize: 18,
    fontWeight: "700", // Fuente negrita
  },
  // Formas decorativas inferiores
  bottomDecorations: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150, // Altura del área de decoración
    overflow: "hidden", // Corta las formas que se salen
    zIndex: 0,
  },
  bottomWaveBlue: {
    position: "absolute",
    bottom: -40,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#6D9BC1", // Color azul claro de la onda inferior
    opacity: 0.6,
  },
  bottomWaveYellow: {
    position: "absolute",
    bottom: -60,
    right: -50,
    width: 250,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FDE08D", // Color amarillo claro de la onda inferior
    opacity: 0.5,
  },
});
