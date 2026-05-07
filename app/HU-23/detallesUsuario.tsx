import { RootStackParamList } from "@/app/navigation/types";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "UserDetail">;

export default function UserDetailScreen({ navigation, route }: Props) {
  const { id, name, email, phone, role, status, createdAt } = route.params;

  const [currentStatus, setCurrentStatus] = useState(status);

  const [activateModalVisible, setActivateModalVisible] = useState(false);

  const fechaDB: string = createdAt;
  const fecha = new Date(fechaDB);

  const fechaActual = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(fecha);

  const handlePrimaryAction = () => {
    if (currentStatus === "suspendido") {
      setActivateModalVisible(true);
    } else {
      setCurrentStatus("suspendido");
      cambiarEstado("suspendido");
    }
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    try {
      const { data, error } = await supabase
        .from("perfiles")
        .update({ estado: nuevoEstado })
        .eq("id", id);

      if (error) throw error;
      console.log("estado actualizado:", data);
    } catch (error) {
      console.error("Error al editar:", error);
    }
  };

  const confirmActivation = () => {
    navigation.replace("UsuarioActivado", {
      name: name,
    });
    cambiarEstado("activo");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de usuario</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <Image
            source={require("@/assets/images/avatar.png")}
            style={styles.avatar}
          />

          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <View
              style={[
                styles.statusBadge,
                currentStatus === "activo" ? styles.green : styles.red,
              ]}
            >
              <Text style={styles.statusText}>{currentStatus}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={18} />
            <View style={{ gap: 4 }}>
              <Text style={{ opacity: 0.5 }}>Correo Electronico </Text>
              <Text style={styles.text}>{email}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Ionicons name="call-outline" size={18} />
            <View style={{ gap: 4 }}>
              <Text style={{ opacity: 0.5 }}>Número de Teléfono </Text>
              <Text style={styles.text}>{phone}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Ionicons name="pricetag-outline" size={18} />
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={18} />
            <View style={{ gap: 4 }}>
              <Text style={{ opacity: 0.5 }}>Fecha de registro </Text>
              <Text style={styles.text}>{fechaActual}</Text>
            </View>
          </View>
        </View>

        {currentStatus === "suspendido" && (
          <View style={styles.warningBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#f59e0b" />
            <Text style={styles.warningText}>
              Cuenta suspendida. El usuario no puede iniciar sesión.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePrimaryAction}
        >
          <Text style={styles.primaryText}>
            {currentStatus === "activo" ? "Suspender cuenta" : "Activar cuenta"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Editar información</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={activateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setActivateModalVisible(false)}
            >
              <Ionicons name="close" size={18} />
            </TouchableOpacity>

            <View style={styles.modalIcon}>
              <Ionicons
                name="notifications-outline"
                size={28}
                color="#f59e0b"
              />
            </View>

            <Text style={styles.modalTitle}>Activar cuenta</Text>

            <Text style={styles.modalText}>
              ¿Estás seguro de que deseas activar nuevamente la cuenta de {name}
              ?
            </Text>

            <Text style={styles.modalSubText}>
              El usuario podrá iniciar sesión inmediatamente.
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => confirmActivation()}
            >
              <Text style={styles.confirmText}>Confirmar activación</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setActivateModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },

  header: {
    backgroundColor: "#1e3a8a",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: { color: "#fff", fontWeight: "600" },

  content: { padding: 16 },

  profileSection: { alignItems: "center", marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },

  nameRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { fontSize: 18, fontWeight: "bold" },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 12, fontWeight: "600" },

  green: { backgroundColor: "#dcfce7" },
  red: { backgroundColor: "#fee2e2" },

  card: {
    backgroundColor: "#dbeafe",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  text: { color: "#1f2937" },

  roleBadge: {
    backgroundColor: "#bfdbfe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roleText: { fontSize: 12, fontWeight: "600" },

  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  warningText: { flex: 1, fontSize: 12 },

  primaryButton: {
    backgroundColor: "#fbbf24",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryText: { fontWeight: "600" },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#1e3a8a",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#1e3a8a", fontWeight: "600" },

  // 🔹 Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeBtn: { position: "absolute", top: 15, right: 15 },

  modalIcon: {
    backgroundColor: "#fde68a",
    alignSelf: "center",
    padding: 16,
    borderRadius: 50,
    marginBottom: 10,
  },

  modalTitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  modalText: { textAlign: "center", marginBottom: 6 },
  modalSubText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 16,
  },

  confirmButton: {
    backgroundColor: "#fbbf24",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmText: { fontWeight: "600" },

  cancelButton: {
    borderWidth: 1,
    borderColor: "#1e3a8a",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { color: "#1e3a8a", fontWeight: "600" },
});
