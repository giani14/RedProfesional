import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  white: "#FFFFFF",
  textGray: "#6B7280",
  textDark: "#1F2937",
  borderGray: "#E5E7EB",
  danger: "#EF4444",
  selectedBg: "#EBF5FF", // Fondo azul claro para el chat seleccionado
  actionBarBg: "#111827", // Gris muy oscuro/negro para la barra superior estilo WhatsApp
};

const REPORT_REASONS = [
  "Comportamiento inadecuado o spam",
  "Lenguaje ofensivo o acoso",
  "Estafa o fraude",
  "No cumple con el servicio acordado",
  "Otros",
];

export default function MensajesCliente() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<any[]>([]);

  // ---- NUEVOS ESTADOS PARA MODO SELECCIÓN ----
  const [selectedChat, setSelectedChat] = useState<any>(null); // Guarda el objeto del chat seleccionado

  // ---- ESTADOS MENÚ DE REPORTES ----
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [sendingReport, setSendingReport] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, []),
  );

  async function fetchChats() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chats")
        .select(
          `
          id,
          profesional:profesional_id (id, nombre_completo),
          mensajes (texto, created_at, leido, emisor_id)
        `,
        )
        .eq("cliente_id", user.id);

      if (error) throw error;

      const formatted = (data as any[])
        .map((chat) => {
          const msgsOrdenados = chat.mensajes?.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );

          const lastMsg =
            msgsOrdenados && msgsOrdenados.length > 0 ? msgsOrdenados[0] : null;

          return {
            id: chat.id,
            profesional_id: chat.profesional?.id,
            nombre: chat.profesional?.nombre_completo || "Profesional",
            ultimo: lastMsg?.texto || "Inicia la conversación",
            fechaRaw: lastMsg?.created_at || new Date(0).toISOString(),
            fecha: lastMsg?.created_at
              ? new Date(lastMsg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            leido: lastMsg
              ? lastMsg.leido === true || lastMsg.emisor_id === user.id
              : true,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.fechaRaw).getTime() - new Date(a.fechaRaw).getTime(),
        );

      setChats(formatted);
    } catch (error) {
      console.error("Error al cargar chats cliente:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- MANEJO DE SELECCIÓN ---
  const handleChatPress = (chat: any) => {
    if (selectedChat) {
      // Si hay un chat seleccionado, un toque normal lo deselecciona o selecciona otro
      if (selectedChat.id === chat.id) {
        setSelectedChat(null);
      } else {
        setSelectedChat(chat);
      }
      setShowMenuDropdown(false);
    } else {
      // Si no hay selección, navega de forma normal al chat
      router.push(`/chat/${chat.id}`);
    }
  };

  const handleChatLongPress = (chat: any) => {
    setSelectedChat(chat);
    setShowMenuDropdown(false);
  };

  const cancelSelection = () => {
    setSelectedChat(null);
    setShowMenuDropdown(false);
  };

  // --- ACCIÓN DE ELIMINAR CHAT DESDE LA BARRA ---
  const handleDeleteChat = () => {
    Alert.alert(
      "Eliminar Chat",
      `¿Estás seguro de que deseas eliminar la conversación con ${selectedChat?.nombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("chats")
                .delete()
                .eq("id", selectedChat.id);

              if (error) throw error;

              setChats(chats.filter((c) => c.id !== selectedChat.id));
              cancelSelection();
              Alert.alert("Éxito", "Chat eliminado correctamente.");
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "No se pudo eliminar el chat.");
            }
          },
        },
      ],
    );
  };

  // --- ENVIAR REPORTE ---
  const handleSendReport = async () => {
    if (!selectedReason) {
      Alert.alert("Error", "Por favor, selecciona un motivo.");
      return;
    }
    if (selectedReason === "Otros" && !reportDescription.trim()) {
      Alert.alert("Error", "Por favor, detalla el motivo en la descripción.");
      return;
    }

    setSendingReport(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("reportes").insert([
        {
          chat_id: selectedChat.id,
          denunciante_id: user?.id,
          denunciado_id: selectedChat.profesional_id, // Id extraído dinámicamente del chat seleccionado
          motivo: selectedReason,
          descripcion: reportDescription.trim(),
        },
      ]);
      if (error) throw error;

      Alert.alert("Reporte Enviado", "Hemos recibido tu reporte con éxito.");
      setReportModalVisible(false);
      cancelSelection();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo enviar el reporte.");
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- BARRA DINÁMICA DE ARRIBA --- */}
      {selectedChat ? (
        // MODO SELECCIÓN (Estilo WhatsApp)
        <View style={styles.actionBar}>
          <View style={styles.actionBarLeft}>
            <TouchableOpacity onPress={cancelSelection} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.actionBarCount}>1</Text>
          </View>

          <View style={styles.actionBarRight}>
            <TouchableOpacity onPress={handleDeleteChat} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowMenuDropdown(!showMenuDropdown)}
              style={styles.iconBtn}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={22}
                color={COLORS.white}
              />
            </TouchableOpacity>

            {/* Dropdown flotante para Reportar */}
            {showMenuDropdown && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowMenuDropdown(false);
                    setReportModalVisible(true);
                  }}
                >
                  <Text style={styles.dropdownText}>
                    Reportar a profesional
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      ) : (
        // MODO NORMAL (Buscador original)
        <View style={styles.searchSection}>
          <Text style={styles.headerTitle}>Mis Mensajes</Text>
          <View style={{ height: 5 }} />
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={COLORS.textGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar profesionales..."
              placeholderTextColor={COLORS.textGray}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      )}

      {/* --- LISTA DE CHATS --- */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        </View>
      ) : (
        <FlatList
          data={chats.filter((c) =>
            c.nombre.toLowerCase().includes(search.toLowerCase()),
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No tienes conversaciones activas.
            </Text>
          }
          renderItem={({ item }) => {
            const isSelected = selectedChat?.id === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.chatCard,
                  isSelected && { backgroundColor: COLORS.selectedBg },
                ]}
                onPress={() => handleChatPress(item)}
                onLongPress={() => handleChatLongPress(item)}
                delayLongPress={500}
              >
                <View style={styles.avatarCircle}>
                  {/* Si está seleccionado, puede mostrar un check como WhatsApp, o dejas la inicial */}
                  <Text style={styles.avatarText}>
                    {isSelected ? "✓" : item.nombre.charAt(0)}
                  </Text>
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{item.nombre}</Text>
                    <Text style={styles.dateText}>{item.fecha}</Text>
                  </View>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.ultimo}
                  </Text>
                </View>
                {!item.leido && !isSelected && (
                  <View style={styles.unreadDot} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* --- MODAL DE FORMULARIO DE REPORTE --- */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Reportar a {selectedChat?.nombre}
              </Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.sectionLabel}>Selecciona el motivo:</Text>
              {REPORT_REASONS.map((reason) => {
                const isOptionSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      isOptionSelected && styles.reasonOptionSelected,
                    ]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Ionicons
                      name={
                        isOptionSelected
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={20}
                      color={
                        isOptionSelected ? COLORS.primaryBlue : COLORS.textGray
                      }
                    />
                    <Text
                      style={[
                        styles.reasonText,
                        isOptionSelected && styles.reasonTextSelected,
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <Text style={styles.sectionLabel}>
                Descripción del reporte{" "}
                {selectedReason === "Otros" && (
                  <Text style={{ color: COLORS.danger }}>*</Text>
                )}
                :
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Escribe aquí los detalles del motivo..."
                placeholderTextColor={COLORS.textGray}
                multiline={true}
                numberOfLines={4}
                value={reportDescription}
                onChangeText={setReportDescription}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setReportModalVisible(false)}
                disabled={sendingReport}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnSubmit, { backgroundColor: COLORS.danger }]}
                onPress={handleSendReport}
                disabled={sendingReport}
              >
                {sendingReport ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.btnSubmitText}>Enviar Reporte</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  /* --- Barra Normal --- */
  searchSection: {
    paddingHorizontal: 20,
    backgroundColor: COLORS.primaryBlue,
    paddingBottom: 25,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 20,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 48,
    elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 10, color: COLORS.textDark },

  /* --- NUEVA BARRA DE ACCIONES (ESTILO WHATSAPP) --- */
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.actionBarBg,
    paddingHorizontal: 15,
    height: 75,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
    zIndex: 10,
  },
  actionBarLeft: { flexDirection: "row", alignItems: "center" },
  actionBarCount: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 25,
  },
  actionBarRight: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  iconBtn: { padding: 10, marginLeft: 10 },

  /* Dropdown flotante */
  dropdownMenu: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 8,
    width: 180,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 100,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { color: COLORS.textDark, fontSize: 15 },

  /* --- Tarjetas de Chat --- */
  chatCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
    alignItems: "center",
  },
  avatarCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: COLORS.white, fontSize: 22, fontWeight: "bold" },
  chatInfo: { flex: 1, marginLeft: 15 },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: { fontSize: 16, fontWeight: "700", color: COLORS.textDark },
  dateText: { fontSize: 12, color: COLORS.textGray },
  lastMessage: { color: COLORS.textGray, marginTop: 4, fontSize: 14 },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accentGold,
    marginLeft: 10,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: COLORS.textGray,
    fontSize: 16,
  },

  /* --- Modal de reporte --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark },
  modalBody: { padding: 20 },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 12,
    marginTop: 8,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    marginBottom: 8,
  },
  reasonOptionSelected: {
    borderColor: COLORS.primaryBlue,
    backgroundColor: "#F0F4F8",
  },
  reasonText: { marginLeft: 10, fontSize: 14, color: COLORS.textDark },
  reasonTextSelected: { fontWeight: "600", color: COLORS.primaryBlue },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    color: COLORS.textDark,
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGray,
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  btnCancelText: { color: COLORS.textGray, fontWeight: "600" },
  btnSubmit: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSubmitText: { color: COLORS.white, fontWeight: "600" },
});
