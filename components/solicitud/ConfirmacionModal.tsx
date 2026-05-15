import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  titulo: string;
  descripcion: string;
  iconName?: React.ComponentProps<typeof Ionicons>["name"];
  iconColor?: string;
  iconBg?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  withInput?: boolean;
  inputValue?: string;
  onChangeInputValue?: (value: string) => void;
  inputPlaceholder?: string;
  inputMaxLength?: number;
}

export function ConfirmacionModal({
  visible,
  titulo,
  descripcion,
  iconName = "checkmark",
  iconColor = "#10B981",
  iconBg = "#D1FAE5",
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  confirmColor = "#1A4670",
  onConfirm,
  onCancel,
  withInput = false,
  inputValue = "",
  onChangeInputValue,
  inputPlaceholder = "",
  inputMaxLength = 50,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={36} color={iconColor} />
          </View>
          <Text style={styles.title}>{titulo}</Text>
          <Text style={styles.desc}>{descripcion}</Text>

          {withInput && (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={onChangeInputValue}
                placeholder={inputPlaceholder}
                placeholderTextColor="#9CA3AF"
                maxLength={inputMaxLength}
                multiline
              />
              <Text style={styles.counter}>
                {inputValue.length}/{inputMaxLength}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: confirmColor }]}
            onPress={onConfirm}
          >
            <Text style={styles.btnPrimaryText}>{confirmLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={onCancel}>
            <Text style={styles.btnSecondaryText}>{cancelLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  box: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  desc: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 18,
  },
  btnPrimary: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  btnPrimaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  btnSecondary: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  btnSecondaryText: { color: "#6B7280", fontSize: 14, fontWeight: "600" },
  inputWrapper: {
    width: "100%",
    marginBottom: 14,
  },
  input: {
    width: "100%",
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#1F2937",
    textAlignVertical: "top",
  },
  counter: {
    alignSelf: "flex-end",
    marginTop: 4,
    fontSize: 11,
    color: "#6B7280",
  },
});
