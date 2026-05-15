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
  uri?: string;
  mimeType?: string;
  size?: number;
};

type PortafolioItem = {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  archivos: ArchivoPortafolio[];
  imagenUri?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function HU10EditarEliminarPortafolio() {
  const [items, setItems] = useState<PortafolioItem[]>([
    {
      id: 1,
      titulo: "Instalación eléctrica completa",
      descripcion:
        "Instalación eléctrica completa en vivienda unifamiliar. Incluye cableado, tableros de distribución, puesta a tierra y luminarias.",
      categoria: "Electricidad",
      archivos: [
        { name: "foto_proyecto_01.jpg", mimeType: "image/jpeg" },
        { name: "certificado_trabajo.pdf", mimeType: "application/pdf" },
      ],
    },
    {
      id: 2,
      titulo: "Iluminación LED comercial",
      descripcion:
        "Instalación de luminarias LED en ambiente comercial con optimización de consumo eléctrico.",
      categoria: "Electricidad",
      archivos: [
        { name: "iluminacion_led.jpg", mimeType: "image/jpeg" },
        { name: "reporte_led.pdf", mimeType: "application/pdf" },
      ],
    },
    {
      id: 3,
      titulo: "Tablero eléctrico trifásico",
      descripcion:
        "Montaje y mantenimiento de tablero eléctrico trifásico para ambiente industrial.",
      categoria: "Electricidad",
      archivos: [
        { name: "tablero_trifasico.jpg", mimeType: "image/jpeg" },
        { name: "plano_tablero.pdf", mimeType: "application/pdf" },
      ],
    },
  ]);

  const [modo, setModo] = useState<"lista" | "editar">("lista");
  const [mensajeExito, setMensajeExito] = useState("");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [tituloEditado, setTituloEditado] = useState("");
  const [descripcionEditada, setDescripcionEditada] = useState("");
  const [categoriaEditada, setCategoriaEditada] = useState("");
  const [archivosEditados, setArchivosEditados] = useState<ArchivoPortafolio[]>(
    []
  );
  const [imagenEditadaUri, setImagenEditadaUri] = useState<string | undefined>(
    undefined
  );

  const iniciarEdicion = (item: PortafolioItem) => {
    setEditandoId(item.id);
    setTituloEditado(item.titulo);
    setDescripcionEditada(item.descripcion);
    setCategoriaEditada(item.categoria);
    setArchivosEditados(item.archivos);
    setImagenEditadaUri(item.imagenUri);
    setMensajeExito("");
    setModo("editar");
  };

  const limpiarEdicion = () => {
    setEditandoId(null);
    setTituloEditado("");
    setDescripcionEditada("");
    setCategoriaEditada("");
    setArchivosEditados([]);
    setImagenEditadaUri(undefined);
  };

  const seleccionarNuevoArchivo = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (resultado.canceled) return;

      const nuevosArchivos: ArchivoPortafolio[] = [];

      for (const file of resultado.assets) {
        if (file.size && file.size > MAX_FILE_SIZE) {
          Alert.alert(
            "Archivo muy grande",
            `${file.name} supera el tamaño máximo permitido de 5 MB.`
          );
          continue;
        }

        nuevosArchivos.push({
          name: file.name,
          uri: file.uri,
          mimeType: file.mimeType,
          size: file.size,
        });

        if (file.mimeType?.includes("image")) {
          setImagenEditadaUri(file.uri);
        }
      }

      setArchivosEditados((prev) => [...prev, ...nuevosArchivos]);
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar el nuevo archivo.");
    }
  };

  const quitarArchivoEditado = (index: number) => {
    setArchivosEditados((prev) => prev.filter((_, i) => i !== index));
  };

  const guardarCambios = () => {
    if (!tituloEditado.trim()) {
      Alert.alert("Campo obligatorio", "Debes ingresar el título del trabajo.");
      return;
    }

    if (!descripcionEditada.trim()) {
      Alert.alert("Campo obligatorio", "Debes ingresar la descripción.");
      return;
    }

    if (!categoriaEditada.trim()) {
      Alert.alert("Campo obligatorio", "Debes ingresar la categoría.");
      return;
    }

    if (archivosEditados.length === 0) {
      Alert.alert(
        "Archivo requerido",
        "El trabajo debe tener al menos un archivo asociado."
      );
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === editandoId
          ? {
              ...item,
              titulo: tituloEditado,
              descripcion: descripcionEditada,
              categoria: categoriaEditada,
              archivos: archivosEditados,
              imagenUri: imagenEditadaUri,
            }
          : item
      )
    );

    limpiarEdicion();
    setModo("lista");
    setMensajeExito("Portafolio actualizado correctamente");
  };

  const confirmarEliminar = (id: number) => {
    Alert.alert(
      "Eliminar trabajo",
      "¿Estás seguro de eliminar este trabajo del portafolio?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => eliminarTrabajo(id),
        },
      ]
    );
  };

  const eliminarTrabajo = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    limpiarEdicion();
    setModo("lista");
    setMensajeExito("Trabajo eliminado correctamente");
  };

  const volver = () => {
    if (modo === "editar") {
      limpiarEdicion();
      setModo("lista");
      return;
    }

    router.back();
  };

  const renderImagenTrabajo = (item: PortafolioItem) => {
    if (item.imagenUri) {
      return (
        <Image
          source={{ uri: item.imagenUri }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      );
    }

    return <Text style={styles.itemImageText}>IMG</Text>;
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={volver}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.topTitle}>
          {modo === "editar" ? "Editar portafolio" : "Mi portafolio"}
        </Text>

        <View style={styles.emptyIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {modo === "editar" && (
          <>
            <View style={styles.logoBox}>
              <Image
                source={require("../../assets/images/RedProfesional-removebg.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Actualiza o elimina tu trabajo</Text>
            <Text style={styles.subtitle}>
              Edita la información y archivos de tu proyecto.
            </Text>

            <View style={styles.formCard}>
              <Text style={styles.label}>Título del trabajo</Text>
              <TextInput
                style={styles.input}
                value={tituloEditado}
                onChangeText={setTituloEditado}
                placeholder="Instalación eléctrica completa"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descripcionEditada}
                onChangeText={setDescripcionEditada}
                placeholder="Describe el trabajo realizado"
                placeholderTextColor="#9CA3AF"
                multiline
              />

              <Text style={styles.label}>Categoría</Text>
              <TextInput
                style={styles.input}
                value={categoriaEditada}
                onChangeText={setCategoriaEditada}
                placeholder="Electricidad"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Archivos del portafolio</Text>

              <View style={styles.uploadBox}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={seleccionarNuevoArchivo}
                >
                  <Text style={styles.uploadIcon}>↑</Text>
                  <Text style={styles.uploadText}>
                    Agregar imágenes o documentos
                  </Text>
                </TouchableOpacity>

                {archivosEditados.map((archivo, index) => (
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
                      onPress={() => quitarArchivoEditado(index)}
                    >
                      <Text style={styles.removeText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <Text style={styles.formatText}>
                Formatos permitidos: JPG, PNG, PDF
              </Text>

              <TouchableOpacity style={styles.saveButton} onPress={guardarCambios}>
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteLargeButton}
                onPress={() => editandoId && confirmarEliminar(editandoId)}
              >
                <Text style={styles.deleteLargeText}>Eliminar trabajo</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {modo === "lista" && (
          <View style={styles.portfolioCard}>
            {!!mensajeExito && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✓ {mensajeExito}</Text>

                <TouchableOpacity onPress={() => setMensajeExito("")}>
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
                {items.length} trabajo(s)
              </Text>
            </View>

            {items.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>No tienes trabajos</Text>
                <Text style={styles.emptyText}>
                  Actualmente no existen trabajos registrados en tu portafolio.
                </Text>
              </View>
            ) : (
              items.map((item) => (
                <View key={item.id} style={styles.portfolioItem}>
                  <View style={styles.itemImageBox}>
                    {renderImagenTrabajo(item)}
                  </View>

                  <View style={styles.portfolioItemInfo}>
                    <Text style={styles.portfolioItemTitle} numberOfLines={2}>
                      {item.titulo}
                    </Text>

                    <Text style={styles.portfolioItemCategory}>
                      {item.categoria}
                    </Text>

                    <Text style={styles.portfolioItemFiles}>
                      {item.archivos.length} archivo(s)
                    </Text>
                  </View>

                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.editIconButton}
                      onPress={() => iniciarEdicion(item)}
                    >
                      <Text style={styles.editIconText}>✎</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteIconButton}
                      onPress={() => confirmarEliminar(item.id)}
                    >
                      <Text style={styles.deleteIconText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            <TouchableOpacity
              style={styles.addAnotherButton}
              onPress={() => router.push("/HU-09")}
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
  paddingTop: 18,
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
  marginTop: 14,
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
    minHeight: 90,
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
  saveButton: {
    backgroundColor: "#F9B000",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 18,
  },
  saveButtonText: {
    color: "#003B73",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 15,
  },
  deleteLargeButton: {
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 10,
  },
  deleteLargeText: {
    color: "#EF4444",
    textAlign: "center",
    fontWeight: "900",
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
  itemImageBox: {
    width: 82,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemImageText: {
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
  itemActions: {
    alignItems: "center",
    justifyContent: "space-between",
    height: 62,
    marginLeft: 8,
  },
  editIconButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  editIconText: {
    color: "#2563EB",
    fontSize: 20,
    fontWeight: "900",
  },
  deleteIconButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIconText: {
    fontSize: 17,
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
  emptyBox: {
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1F2937",
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
});