import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
  primaryBlue: "#1A4670",
  accentGold: "#EAB308",
  white: "#FFFFFF",
  textGray: "#6B7280",
  lightGray: "#F3F4F6",
  borderGray: "#E5E7EB",
};

interface FaqItemProps {
  question: string;
  answer: string;
}

interface ContactOptionProps {
  icon: any;
  label: string;
  description: string;
  onPress?: () => void;
}

const FaqItem = ({ question, answer }: FaqItemProps) => {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setOpen((prev) => !prev)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#9CA3AF"
        />
      </View>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
};

const ContactOption = ({
  icon,
  label,
  description,
  onPress,
}: ContactOptionProps) => (
  <TouchableOpacity
    style={styles.menuOption}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuLeft}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={COLORS.primaryBlue} />
      </View>
      <View style={{ flexShrink: 1 }}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

const FAQS: FaqItemProps[] = [
  {
    question: "¿Cómo recibo nuevas solicitudes de servicio?",
    answer:
      "Las solicitudes que coincidan con tus servicios aparecerán en la sección de Solicitudes. Recibirás una notificación cuando un cliente requiera tu ayuda.",
  },
  {
    question: "¿Cómo edito mi perfil profesional?",
    answer:
      "Ve a tu Perfil y selecciona 'Mi perfil profesional'. Allí podrás actualizar tu información, servicios y biografía.",
  },
  {
    question: "¿Cómo funcionan las calificaciones?",
    answer:
      "Al finalizar un servicio, el cliente puede calificarte con estrellas. El promedio de tus calificaciones se muestra en tu perfil.",
  },
  {
    question: "¿Qué hago si tengo un problema con un cliente?",
    answer:
      "Puedes contactarnos a través de las opciones de soporte de esta pantalla y nuestro equipo te ayudará a resolverlo.",
  },
];

export default function CentroDeAyuda() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>
          Red<Text style={{ color: COLORS.accentGold }}>Profesional</Text>
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconBox}>
            <Ionicons
              name="help-circle-outline"
              size={48}
              color={COLORS.primaryBlue}
            />
          </View>
          <Text style={styles.heroTitle}>Centro de ayuda</Text>
          <Text style={styles.heroSubtitle}>¿En qué podemos ayudarte hoy?</Text>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>
          {FAQS.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} />
          ))}

          <Text style={styles.sectionTitle}>Contáctanos</Text>
          <ContactOption
            icon="mail-outline"
            label="Correo electrónico"
            description="soporte@redprofesional.com"
            onPress={() => Linking.openURL("mailto:soporte@redprofesional.com")}
          />
          <ContactOption
            icon="logo-whatsapp"
            label="WhatsApp"
            description="Chatea con nuestro equipo"
            onPress={() => Linking.openURL("https://wa.me/59170000000")}
          />
          <ContactOption
            icon="call-outline"
            label="Teléfono"
            description="+591 700 00000"
            onPress={() => Linking.openURL("tel:+59170000000")}
          />

          <Text style={styles.versionText}>Versión 1.0.4 - RedProfesional</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLogo: { color: "white", fontSize: 22, fontWeight: "bold" },
  scrollContent: { paddingBottom: 100 },
  heroSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderColor: COLORS.borderGray,
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  heroTitle: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 5,
  },
  menuContainer: { paddingHorizontal: 20, marginTop: 15 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.textGray,
    marginTop: 20,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  faqItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    flexShrink: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 10,
    lineHeight: 20,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 5,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: { fontSize: 16, marginLeft: 15, color: "#374151" },
  menuDescription: {
    fontSize: 13,
    marginLeft: 15,
    color: COLORS.textGray,
    marginTop: 2,
  },
  versionText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 30,
  },
});
