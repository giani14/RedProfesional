import { listarMisPortafolios, PortafolioDB } from "@/lib/portafolioService";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
  textDark: "#1F2937",
  textGray: "#6B7280",
  bgLight: "#F0F4F8",
  cardBg: "#FFFFFF",
  borderLight: "#E5E7EB",
};

// Componentes Reutilizables
const StatItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) => (
  <View style={styles.statItem}>
    <View style={styles.statRow}>
      <Ionicons name={icon} size={22} color={COLORS.primaryBlue} />
      <Text style={styles.statValue}>{value}</Text>
      {label === "Calificación" && (
        <Ionicons name="star" size={14} color={COLORS.accentGold} />
      )}
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const PortfolioCard = ({
  title,
  files,
  image,
}: {
  title: string;
  files: string;
  image: string | null;
}) => (
  <View style={styles.portfolioCard}>
    {image ? (
      <Image
        source={{ uri: image }}
        style={styles.portfolioImage}
        resizeMode="cover"
      />
    ) : (
      <View
        style={[
          styles.portfolioImage,
          {
            backgroundColor: COLORS.bgLight,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Ionicons
          name="document-text-outline"
          size={32}
          color={COLORS.textGray}
        />
      </View>
    )}
    <View style={styles.portfolioInfo}>
      <Text style={styles.portfolioTitle} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.portfolioFiles}>
        <Ionicons
          name="document-attach-outline"
          size={14}
          color={COLORS.primaryBlue}
        />
        <Text style={styles.portfolioFilesText}>{files}</Text>
      </View>
    </View>
  </View>
);

export default function PerfilProfesional() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [misTrabajos, setMisTrabajos] = useState<PortafolioDB[]>([]);

  useEffect(() => {
    cargarDatosCompletos();
  }, []);

  const cargarDatosCompletos = async () => {
    try {
      setLoading(true);

      // 1. Obtener el usuario autenticado desde Supabase Auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.warn("No se encontró sesión activa");
        return;
      }

      // 2. Consulta A: Extraer información general desde la tabla 'perfiles'
      const { data: generalData, error: generalError } = await supabase
        .from("perfiles")
        .select("nombre_completo, ciudad, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (generalError)
        console.error("Error en tabla perfiles:", generalError.message);

      // 3. Consulta B: Extraer información laboral/métrica desde 'profesionales_info'
      const { data: infoLaboralData, error: infoLaboralError } = await supabase
        .from("profesionales_info")
        .select("titulo_especialidad, biografia")
        .eq("profesional_id", user.id) // 👈 CORREGIDO: Se enlaza mediante profesional_id
        .maybeSingle();

      if (infoLaboralError)
        console.error("Error en profesionales_info:", infoLaboralError.message);

      // 4. Consolidamos ambos resultados en un solo objeto limpio para la UI
      setUserData({
        nombre_completo: generalData?.nombre_completo || "Usuario Profesional",
        ciudad: generalData?.ciudad || "Cochabamba, Bolivia",
        avatar_url: generalData?.avatar_url,
        titulo_especialidad:
          infoLaboralData?.titulo_especialidad || "Profesión no definida",
        biografia:
          infoLaboralData?.biografia ||
          "Profesional comprometido con la calidad y la seguridad.",
        rating: infoLaboralData?.rating || 0.0,
      });

      // 5. Traer los trabajos publicados reales desde el servicio
      const listaTrabajos = await listarMisPortafolios();
      setMisTrabajos(listaTrabajos || []);
    } catch (error) {
      console.error("Error sincronizando el perfil con la BD:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER SUPERIOR */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu-outline" size={30} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi perfil profesional</Text>
        <TouchableOpacity>
          <View>
            <Ionicons
              name="notifications-outline"
              size={26}
              color={COLORS.white}
            />
            <View style={styles.notifBadge} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD PRINCIPAL (PERFIL) */}
        <View style={styles.card}>
          <View style={styles.profileInfoRow}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    userData?.avatar_url || "https://via.placeholder.com/150",
                }}
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.editIconBadge}>
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={COLORS.primaryBlue}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.userNameText}>
                {userData?.nombre_completo}
              </Text>
              <View style={styles.subInfoRow}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={COLORS.primaryBlue}
                />
                <Text style={styles.roleText}>
                  {userData?.titulo_especialidad}
                </Text>
              </View>
              <View style={styles.subInfoRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={COLORS.textGray}
                />
                <Text style={styles.locationText}>{userData?.ciudad}</Text>
              </View>
              <Text style={styles.bioText}>{userData?.biografia}</Text>
            </View>
          </View>

          {/* ESTADÍSTICAS EN TIEMPO REAL */}
          <View style={styles.statsContainer}>
            <StatItem
              icon="medal-outline"
              label="Calificación"
              value={
                userData?.rating ? Number(userData.rating).toFixed(1) : "0.0"
              }
            />
            <View style={styles.dividerVertical} />
            <StatItem
              icon="briefcase-outline"
              label="Proyectos"
              value={`${misTrabajos.length}`}
            />
            <View style={styles.dividerVertical} />
            <StatItem
              icon="shield-checkmark-outline"
              label="Miembro"
              value="Activo"
            />
          </View>
        </View>

        {/* CARD PORTAFOLIO */}
        <View style={styles.card}>
          <View style={styles.portfolioHeader}>
            <View style={styles.portfolioTitleGroup}>
              <View style={styles.iconBoxYellow}>
                <Ionicons
                  name="briefcase"
                  size={20}
                  color={COLORS.primaryBlue}
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Mi portafolio</Text>
                <Text style={styles.sectionSubtitle}>
                  Experiencia y trabajos realizados.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.portfolioActionRow}>
            <Text style={styles.countText}>
              {misTrabajos.length} trabajo(s) publicado(s)
            </Text>
            <TouchableOpacity
              style={styles.addWorkBtn}
              onPress={() => router.push("/HU-09/subirPortafolio")}
            >
              <Text style={styles.addWorkText}>Agregar trabajo</Text>
            </TouchableOpacity>
          </View>

          {/* Render dinámico */}
          <View style={styles.portfolioGrid}>
            {misTrabajos.length > 0 ? (
              misTrabajos
                .slice(0, 2)
                .map((trabajo) => (
                  <PortfolioCard
                    key={trabajo.id}
                    title={trabajo.titulo}
                    files="Adjunto disponible"
                    image={trabajo.portada_url}
                  />
                ))
            ) : (
              <Text
                style={[
                  styles.countText,
                  { fontStyle: "italic", paddingVertical: 10 },
                ]}
              >
                Aún no has agregado trabajos a tu portafolio.
              </Text>
            )}
          </View>

          {/* BOTONES DE ACCIÓN ADICIONALES */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.outlineBtn}>
              <Ionicons
                name="create-outline"
                size={18}
                color={COLORS.primaryBlue}
              />
              <Text style={styles.outlineBtnText}>Editar perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color={COLORS.primaryBlue}
              />
              <Text style={styles.outlineBtnText}>Ver currículum</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECCIÓN HABILIDADES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Habilidades destacadas</Text>
          <View style={styles.skillsContainer}>
            {[
              "Instalaciones residenciales",
              "Circuitos industriales",
              "Seguridad eléctrica",
              "Mantenimiento",
            ].map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos se conservan idénticos debajo...
// ... Tus estilos se quedan exactamente iguales abajo

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgLight },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: COLORS.white, fontSize: 19, fontWeight: "bold" },
  notifBadge: {
    position: "absolute",
    right: 2,
    top: 2,
    backgroundColor: COLORS.accentGold,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBlue,
  },
  scrollContent: { padding: 16 },

  // Cards con estilo idéntico al diseño
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Sombra para Android
    elevation: 5,
  },

  // Perfil
  profileInfoRow: { flexDirection: "row", marginBottom: 20 },
  avatarContainer: { position: "relative" },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.bgLight,
  },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 4,
    backgroundColor: "white",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
  },
  textContainer: { flex: 1, marginLeft: 16 },
  userNameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
    marginBottom: 4,
  },
  subInfoRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  roleText: {
    color: COLORS.primaryBlue,
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 15,
  },
  locationText: { color: COLORS.textGray, marginLeft: 6, fontSize: 14 },
  bioText: {
    color: COLORS.textGray,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#F3F4F6",
    paddingTop: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  statValue: {
    fontSize: 17,
    fontWeight: "bold",
    marginHorizontal: 4,
    color: COLORS.textDark,
  },
  statLabel: { fontSize: 12, color: COLORS.textGray },
  dividerVertical: { width: 1, height: 35, backgroundColor: "#E5E7EB" },

  // Portafolio
  portfolioHeader: { marginBottom: 16 },
  portfolioTitleGroup: { flexDirection: "row", alignItems: "center" },
  iconBoxYellow: {
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 12,
    marginRight: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.primaryBlue },
  sectionSubtitle: { fontSize: 12, color: COLORS.textGray },
  portfolioActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  countText: { color: COLORS.textGray, fontSize: 14 },
  addWorkBtn: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addWorkText: { fontWeight: "bold", color: COLORS.primaryBlue, fontSize: 13 },

  // Grid
  portfolioGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  portfolioCard: {
    width: "48%",
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },
  portfolioImage: { width: "100%", height: 110 },
  portfolioInfo: { padding: 10 },
  portfolioTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 6,
  },
  portfolioFiles: { flexDirection: "row", alignItems: "center" },
  portfolioFilesText: {
    fontSize: 12,
    color: COLORS.primaryBlue,
    marginLeft: 4,
    fontWeight: "500",
  },

  // Botones Extra
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#F3F4F6",
    paddingTop: 16,
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryBlue,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    width: "48%",
    justifyContent: "center",
  },
  outlineBtnText: {
    color: COLORS.primaryBlue,
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 13,
  },

  // Habilidades
  skillsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  skillBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: { fontSize: 12, color: COLORS.primaryBlue, fontWeight: "500" },
});
