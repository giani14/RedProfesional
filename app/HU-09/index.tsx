import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type ArchivoPortafolio = {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
};

type TrabajoGuardado = {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  archivos: ArchivoPortafolio[];
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function HU09SubirPortafolio() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [archivos, setArchivos] = useState<ArchivoPortafolio[]>([]);
  const [subiendo, setSubiendo] = useState(false);

  const [trabajosGuardados, setTrabajosGuardados] = useState<TrabajoGuardado[]>(
    []
  );
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [mostrarExito, setMostrarExito] = useState(false);

  const seleccionarArchivo = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (resultado.canceled) return;

      const archivosValidos: ArchivoPortafolio[] = [];

      for (const file of resultado.assets) {
        if (file.size && file.size > MAX_FILE_SIZE) {
          Alert.alert(
            "Archivo muy grande",
            `${file.name} supera el tamaño máximo permitido de 5 MB.`
          );
          continue;
        }

        archivosValidos.push({
          name: file.name,
          uri: file.uri,
          mimeType: file.mimeType,
          size: file.size,
        });
      }

      setArchivos((prev) => [...prev, ...archivosValidos]);
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar el archivo.");
    }
  };

  const eliminarArchivo = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const subirPortafolio = () => {
    if (!titulo.trim()) {
      Alert.alert("Campo obligatorio", "Debes ingresar el título del trabajo.");
      return;
    }

    if (!descripcion.trim()) {
      Alert.alert("Campo obligatorio", "Debes ingresar una descripción.");
      return;
    }

    if (!categoria.trim()) {
      Alert.alert("Campo obligatorio", "Debes ingresar una categoría.");
      return;
    }

    if (archivos.length === 0) {
      Alert.alert(
        "Archivo requerido",
        "Debes agregar al menos una imagen o documento."
      );
      return;
    }

    const nuevoTrabajo: TrabajoGuardado = {
      id: Date.now(),
      titulo,
      descripcion,
      categoria,
      archivos: [...archivos],
    };

    setSubiendo(true);

    setTimeout(() => {
      setTrabajosGuardados((prev) => [nuevoTrabajo, ...prev]);

      setTitulo("");
      setDescripcion("");
      setCategoria("");
      setArchivos([]);

      setSubiendo(false);
      setMostrarFormulario(false);
      setMostrarExito(true);

      Alert.alert(
        "Portafolio subido",
        "Tu trabajo fue agregado correctamente al portafolio."
      );
    }, 800);
  };

  const abrirFormulario = () => {
    setMostrarFormulario(true);
    setMostrarExito(false);
  };

  const volver = () => {
    if (!mostrarFormulario && trabajosGuardados.length > 0) {
      setMostrarFormulario(true);
      setMostrarExito(false);
      return;
    }

    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={volver}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.topTitle}>
          {mostrarFormulario ? "Subir portafolio" : "Mi portafolio"}
        </Text>

        <View style={styles.emptyIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!mostrarFormulario && (
          <View style={styles.portfolioCard}>
            {mostrarExito && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  ✓ Portafolio agregado con éxito
                </Text>

                <TouchableOpacity onPress={() => setMostrarExito(false)}>
                  <Text style={styles.successClose}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>VB</Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Valeska Ballesteros</Text>
                <Text style={styles.profileJob}>Electricista</Text>
                <Text style={styles.profileLocation}>Cochabamba</Text>
              </View>

              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push("/(profesional)/perfil")}
              >
                <Text style={styles.profileButtonText}>Ver mi perfil</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.portfolioHeader}>
              <View>
                <Text style={styles.portfolioTitle}>Mi portafolio</Text>
                <Text style={styles.portfolioSubtitle}>
                  Tus trabajos publicados
                </Text>
              </View>

              <Text style={styles.portfolioCount}>
                {trabajosGuardados.length} trabajo(s)
              </Text>
            </View>

            {trabajosGuardados.map((trabajo) => {
              const primerArchivo = trabajo.archivos[0];
              const esImagen = primerArchivo?.mimeType?.includes("image");

              return (
                <View key={trabajo.id} style={styles.portfolioItem}>
                  <View style={styles.portfolioImageBox}>
                    {esImagen ? (
                      <Image
                        source={{ uri: primerArchivo.uri }}
                        style={styles.portfolioImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.portfolioImageText}>PDF</Text>
                    )}
                  </View>

                  <View style={styles.portfolioItemInfo}>
                    <Text style={styles.portfolioItemTitle} numberOfLines={1}>
                      {trabajo.titulo}
                    </Text>

                    <Text style={styles.portfolioItemCategory}>
                      {trabajo.categoria}
                    </Text>

                    <Text style={styles.portfolioItemFiles}>
                      {trabajo.archivos.length} archivo(s)
                    </Text>
                  </View>

                  <Text style={styles.arrowText}>›</Text>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.addAnotherButton}
              onPress={abrirFormulario}
            >
              <Text style={styles.addAnotherText}>Agregar otro trabajo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewProfileButton}
              onPress={() => router.push("/(profesional)/perfil")}
            >
              <Text style={styles.viewProfileText}>Ver mi perfil</Text>
            </TouchableOpacity>
          </View>
        )}

        {mostrarFormulario && (
          <>
            <View style={styles.logoBox}>
              <Image
                source={require("../../assets/images/RedProfesional-removebg.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Agrega trabajos a tu portafolio</Text>

            <Text style={styles.subtitle}>
              Sube imágenes o documentos para mostrar tu experiencia.
            </Text>

            <View style={styles.formCard}>
              <Text style={styles.label}>Título del trabajo</Text>
              <TextInput
                style={styles.input}
                placeholder="Instalación eléctrica residencial"
                placeholderTextColor="#9CA3AF"
                value={titulo}
                onChangeText={setTitulo}
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Proyecto de instalación completa de cableado, tableros y luminarias para vivienda familiar."
                placeholderTextColor="#9CA3AF"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
              />

              <Text style={styles.label}>Categoría</Text>
              <TextInput
                style={styles.input}
                placeholder="Electricidad"
                placeholderTextColor="#9CA3AF"
                value={categoria}
                onChangeText={setCategoria}
              />

              <Text style={styles.label}>Archivos del portafolio</Text>

              <View style={styles.uploadBox}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={seleccionarArchivo}
                >
                  <Text style={styles.uploadIcon}>↑</Text>
                  <Text style={styles.uploadText}>
                    Agregar imágenes o documentos
                  </Text>
                </TouchableOpacity>

                {archivos.map((archivo, index) => (
                  <View key={`${archivo.name}-${index}`} style={styles.fileItem}>
                    <View style={styles.fileIconBox}>
                      <Text style={styles.fileIcon}>
                        {archivo.mimeType?.includes("pdf") ? "PDF" : "IMG"}
                      </Text>
                    </View>

                    <Text style={styles.fileName} numberOfLines={1}>
                      {archivo.name}
                    </Text>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => eliminarArchivo(index)}
                    >
                      <Text style={styles.removeText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <Text style={styles.formatText}>
                Formatos permitidos: JPG, PNG, PDF
              </Text>

              <TouchableOpacity
                style={[styles.submitButton, subiendo && styles.disabledButton]}
                onPress={subirPortafolio}
                disabled={subiendo}
              >
                <Text style={styles.submitText}>
                  {subiendo ? "Subiendo..." : "Subir portafolio"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6FA",
  },
  topBar: {
    height: 88,
    backgroundColor: "#003B73",
    paddingTop: 34,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "300",
    marginTop: -6,
  },
  topTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  emptyIcon: {
    width: 28,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  logoBox: {
    alignItems: "center",
    marginTop: 18,
  },
  logo: {
    width: 150,
    height: 72,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#003B73",
    textAlign: "center",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 82,
    textAlignVertical: "top",
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#3B82F6",
    backgroundColor: "#F8FBFF",
    borderRadius: 12,
    padding: 12,
  },
  uploadButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  uploadIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EAF2FF",
    color: "#2563EB",
    textAlign: "center",
    lineHeight: 30,
    fontWeight: "900",
    fontSize: 18,
  },
  uploadText: {
    marginTop: 6,
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 13,
  },
  fileItem: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  fileIconBox: {
    width: 34,
    height: 30,
    borderRadius: 7,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  fileIcon: {
    fontSize: 10,
    fontWeight: "900",
    color: "#EF4444",
  },
  fileName: {
    flex: 1,
    color: "#374151",
    fontSize: 13,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "#6B7280",
    fontSize: 18,
    marginTop: -2,
  },
  formatText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 11,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: "#F9B000",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 18,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitText: {
    color: "#003B73",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 15,
  },

  portfolioCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  successBox: {
    backgroundColor: "#E8F8EC",
    borderWidth: 1,
    borderColor: "#B7E4C7",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  successText: {
    color: "#15803D",
    fontWeight: "800",
    flex: 1,
  },
  successClose: {
    color: "#166534",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#1A4670",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 22,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1F2937",
  },
  profileJob: {
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 3,
  },
  profileLocation: {
    color: "#6B7280",
    marginTop: 3,
  },
  profileButton: {
    borderWidth: 1,
    borderColor: "#1A4670",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  profileButtonText: {
    color: "#1A4670",
    fontWeight: "800",
    fontSize: 12,
  },
  portfolioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F2937",
  },
  portfolioSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  portfolioCount: {
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 12,
  },
  portfolioItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  portfolioImageBox: {
    width: 70,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  portfolioImage: {
    width: "100%",
    height: "100%",
  },
  portfolioImageText: {
    color: "#374151",
    fontWeight: "900",
  },
  portfolioItemInfo: {
    flex: 1,
  },
  portfolioItemTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1F2937",
  },
  portfolioItemCategory: {
    color: "#1A4670",
    fontWeight: "700",
    marginTop: 4,
  },
  portfolioItemFiles: {
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 4,
  },
  arrowText: {
    fontSize: 28,
    color: "#1A4670",
  },
  addAnotherButton: {
    backgroundColor: "#F9B000",
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 8,
  },
  addAnotherText: {
    textAlign: "center",
    fontWeight: "900",
    color: "#1A4670",
  },
  viewProfileButton: {
    borderWidth: 1,
    borderColor: "#1A4670",
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 10,
  },
  viewProfileText: {
    textAlign: "center",
    fontWeight: "900",
    color: "#1A4670",
  },
});