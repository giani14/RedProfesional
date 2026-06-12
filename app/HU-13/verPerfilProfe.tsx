import { supabase } from "@/lib/supabase";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  primaryBlue: "#123F78",
  accentGold: "#FBBF24",
  textMain: "#111827",
  textSecondary: "#6B7280",
  bgLight: "#F3F4F6",
  white: "#FFFFFF",
  starGold: "#FBBF24",
  imgTagBg: "#DBEAFE",
  imgTagText: "#1E40AF",
  pdfTagBg: "#FEE2E2",
  pdfTagText: "#991B1B",
};

// Función para obtener las iniciales del nombre completo
const obtenerIniciales = (nombre: string) => {
  if (!nombre) return "??";
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
};

export default function VerPerfilProfesional() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [perfil, setPerfil] = useState<any>(null);
  const [portafolio, setPortafolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados añadidos para hidratación dinámica desde la BD
  const [rating, setRating] = useState({ promedio: 5.0, total: 0 });
  const [listaEspecialidades, setListaEspecialidades] = useState<string[]>([]);

  useEffect(() => {
    if (id) cargarTodo();
  }, [id]);

  const cargarTodo = async () => {
    try {
      setLoading(true);

      // 1. QUERY CORREGIDA: Trae perfiles, info técnica, categorías puente y ratings con nombres reales de la BD
      const { data: perfilData, error: pError } = await supabase
        .from("perfiles")
        .select(
          `
          *, 
          profesionales_info (
            *,
            profesional_categorias (
              categorias (
                nombre
              )
            ),
            profesionales_rating (
              promedio,
              total_reviews
            )
          )
        `,
        )
        .eq("id", id)
        .single();

      if (pError) throw pError;
      setPerfil(perfilData);

      // Procesar información de especialidades/categorías relacionales
      const infoTecnica =
        perfilData?.profesionales_info?.[0] || perfilData?.profesionales_info;

      if (infoTecnica) {
        // Extraer categorías asignadas
        const cats =
          infoTecnica.profesional_categorias
            ?.map((pc: any) => pc.categorias?.nombre)
            .filter(Boolean) || [];

        // Si no tiene categorías en el puente, usamos el string 'titulo_especialidad' cortado por comas
        if (cats.length > 0) {
          setListaEspecialidades(cats);
        } else if (infoTecnica.titulo_especialidad) {
          setListaEspecialidades([infoTecnica.titulo_especialidad]);
        } else {
          setListaEspecialidades(["Especialista General"]);
        }

        // Extraer ratings reales corregidos de la BD
        const rData = infoTecnica.profesionales_rating?.[0] || {};
        setRating({
          promedio: rData.promedio ?? 5.0,
          total: rData.total_reviews ?? 0,
        });
      }

      // 2. QUERY PORTAFOLIO
      const { data: portaData, error: portaError } = await supabase
        .from("portafolios")
        .select("*")
        .eq("profesional_id", id)
        .limit(3);

      if (portaError) throw portaError;
      setPortafolio(portaData || []);
    } catch (err) {
      console.error("Error cargando perfil completo:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  // Desestructuración limpia de la información técnica extraída
  const infoMedica = Array.isArray(perfil?.profesionales_info)
    ? perfil?.profesionales_info[0]
    : perfil?.profesionales_info;

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER AZUL OSCURO */}
      <View style={styles.blueHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Perfil completo</Text>
            <TouchableOpacity>
              <Ionicons name="share-social-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* TARJETA PRINCIPAL (HERO) */}
        <View style={styles.whiteCard}>
          <View style={styles.heroRow}>
            {/* CAMBIO AQUÍ: Renderizado condicional del Avatar (Foto o Iniciales) */}
            {perfil?.avatar_url ? (
              <Image
                source={{ uri: perfil.avatar_url }}
                style={styles.mainAvatar}
              />
            ) : (
              <View style={styles.avatarIniciales}>
                <Text style={styles.textoIniciales}>
                  {obtenerIniciales(perfil?.nombre_completo)}
                </Text>
              </View>
            )}
            <View style={styles.heroInfo}>
              <Text style={styles.nameText}>
                {perfil?.nombre_completo || "Profesional de Confianza"}
              </Text>
              <Text style={styles.professionText}>
                {listaEspecialidades.join(", ")}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#3B82F6" />
                <Text style={styles.locationText}>
                  {perfil?.ciudad || perfil?.ubicacion || "Cochabamba"}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={COLORS.starGold} />
                <Text style={styles.ratingText}>
                  {rating.promedio === 5 ? "5.0" : rating.promedio.toFixed(1)}{" "}
                  <Text style={styles.reviewsText}>
                    ({rating.total}{" "}
                    {rating.total === 1 ? "opinión" : "opiniones"})
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.shortBio}>
            {infoMedica?.descripcion ||
              "Profesional comprometido con la calidad y el cumplimiento en cada proyecto."}
          </Text>

          {/* STATS GRID DINÁMICO */}
          <View style={styles.statsGrid}>
            <StatItem
              val={
                infoMedica?.experiencia
                  ? `${infoMedica.experiencia} años`
                  : "0 años"
              }
              lab="Años de experiencia"
            />
            <StatItem val="--" lab="Servicios realizados" />
            <StatItem val="100%" lab="Clientes satisfechos" />
            <StatItem val="24 h" lab="Respuesta promedio" />
          </View>
        </View>

        {/* SECCIÓN EXPERIENCIA */}
        <SectionItem
          icon={
            <Feather name="briefcase" size={20} color={COLORS.primaryBlue} />
          }
          title="Experiencia"
        >
          <Text style={styles.expHighlight}>
            {infoMedica?.experiencia || "0"} años de trayectoria
          </Text>
          <Text style={styles.secText}>
            Trayectoria profesional certificada en la plataforma ofreciendo
            cobertura en {perfil?.ciudad || "Cochabamba"}.
          </Text>
        </SectionItem>

        {/* SECCIÓN ESPECIALIDADES DINÁMICAS */}
        <SectionItem
          icon={
            <Ionicons
              name="star-outline"
              size={20}
              color={COLORS.primaryBlue}
            />
          }
          title="Especialidades"
        >
          <View style={styles.chipsRow}>
            {listaEspecialidades.map((c, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{c}</Text>
              </View>
            ))}
          </View>
        </SectionItem>

        {/* SECCIÓN PORTAFOLIO */}
        <View style={styles.whiteCardSection}>
          <View style={styles.sectionTitleRow}>
            <Ionicons
              name="images-outline"
              size={20}
              color={COLORS.primaryBlue}
            />
            <Text style={styles.sectionTitleText}>Portafolio</Text>
          </View>
          <Text style={styles.sectionSubText}>
            Proyectos y trabajos realizados
          </Text>

          {portafolio.length === 0 ? (
            <Text
              style={[styles.secText, { marginLeft: 28, fontStyle: "italic" }]}
            >
              No hay proyectos registrados en el portafolio aún.
            </Text>
          ) : (
            portafolio.map((item, index) => (
              <View key={index} style={styles.portItem}>
                <Image
                  source={{
                    uri:
                      item.url_previsualizacion ||
                      "https://via.placeholder.com/150",
                  }}
                  style={styles.portImg}
                />
                <View style={styles.portContent}>
                  <Text style={styles.portTitle} numberOfLines={2}>
                    {item.titulo}
                  </Text>
                  <View style={styles.tagDateRow}>
                    <View
                      style={[
                        styles.tag,
                        item.tipo === "pdf" ? styles.tagPdf : styles.tagImg,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          item.tipo === "pdf"
                            ? { color: COLORS.pdfTagText }
                            : { color: COLORS.imgTagText },
                        ]}
                      >
                        {item.tipo === "pdf" ? "PDF" : "Imagen"}
                      </Text>
                    </View>
                    <Text style={styles.portDate}>
                      {item.fecha_formateada || "Reciente"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}

          {portafolio.length > 0 && (
            <TouchableOpacity style={styles.fullWidthGrayBtn}>
              <Text style={styles.grayBtnText}>
                Ver todo el portafolio ({portafolio.length})
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={COLORS.primaryBlue}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* SECCIÓN RESEÑAS */}
        <View style={styles.whiteCardSection}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="star" size={20} color={COLORS.starGold} />
            <Text style={styles.sectionTitleText}>Reseñas de clientes</Text>
          </View>
          <View style={styles.reviewMainRow}>
            <Text style={styles.bigRating}>
              {rating.promedio === 5 ? "5.0" : rating.promedio.toFixed(1)} de 5
            </Text>
            <Text style={styles.reviewSub}>
              ({rating.total} {rating.total === 1 ? "opinión" : "opiniones"})
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name={
                    i <= Math.round(rating.promedio) ? "star" : "star-outline"
                  }
                  size={14}
                  color={COLORS.starGold}
                />
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.fullWidthGrayBtn}>
            <Text style={styles.grayBtnText}>Ver todas las opiniones</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.primaryBlue}
            />
          </TouchableOpacity>
        </View>

        {/* BOTONES DE ACCIÓN FINALES */}
        <View style={styles.actionArea}>
          <TouchableOpacity
            style={styles.btnGold}
            onPress={() =>
              router.push({
                pathname: "/HU-15/solicitudServicio",
                params: { id: perfil?.id },
              })
            }
          >
            <Ionicons
              name="send"
              size={20}
              color={COLORS.primaryBlue}
              style={{ transform: [{ rotate: "-45deg" }] }}
            />
            <Text style={styles.btnGoldText}>Enviar solicitud de servicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() =>
              alert(`Iniciando chat con ${perfil?.nombre_completo}...`)
            }
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color={COLORS.primaryBlue}
            />
            <Text style={styles.btnOutlineText}>Contactar</Text>
          </TouchableOpacity>

          <View style={styles.verifyRow}>
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color={COLORS.primaryBlue}
            />
            <Text style={styles.verifyTxt}>
              RedProfesional verifica la identidad y experiencia de los
              profesionales.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const StatItem = ({ val, lab }: any) => (
  <View style={styles.statBox}>
    <Text style={styles.statVal}>{val}</Text>
    <Text style={styles.statLab}>{lab}</Text>
  </View>
);

const SectionItem = ({ icon, title, children }: any) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionTitleRow}>
      {icon}
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  blueHeader: { backgroundColor: COLORS.primaryBlue, paddingBottom: 15 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600" },
  whiteCard: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  heroRow: { flexDirection: "row", alignItems: "center" },
  mainAvatar: { width: 85, height: 85, borderRadius: 42.5 },
  heroInfo: { flex: 1, marginLeft: 15 },
  nameText: { fontSize: 20, fontWeight: "bold", color: COLORS.textMain },
  professionText: { fontSize: 15, color: COLORS.textSecondary, marginTop: 2 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  locationText: { color: COLORS.textSecondary, fontSize: 13 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  ratingText: { fontWeight: "bold", fontSize: 14 },
  reviewsText: { fontWeight: "normal", color: COLORS.textSecondary },
  shortBio: {
    color: COLORS.textMain,
    lineHeight: 20,
    fontSize: 14,
    marginTop: 15,
    textAlign: "left",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 20,
  },
  statBox: { width: "23%", alignItems: "center" },
  statVal: { fontWeight: "bold", color: COLORS.primaryBlue, fontSize: 14 },
  statLab: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  sectionCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
  },
  expHighlight: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
    marginBottom: 4,
  },
  secText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "500" },
  whiteCardSection: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  sectionSubText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 28,
    marginBottom: 15,
  },
  portItem: { flexDirection: "row", marginBottom: 15 },
  portImg: { width: 100, height: 75, borderRadius: 10 },
  portContent: { flex: 1, marginLeft: 12, justifyContent: "center" },
  portTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  tagDateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagImg: { backgroundColor: COLORS.imgTagBg },
  tagPdf: { backgroundColor: COLORS.pdfTagBg },
  tagText: { fontSize: 10, fontWeight: "bold" },
  portDate: { fontSize: 11, color: COLORS.textSecondary },
  fullWidthGrayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
    gap: 5,
  },
  grayBtnText: { color: COLORS.primaryBlue, fontWeight: "600", fontSize: 13 },
  reviewMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  bigRating: { fontSize: 16, fontWeight: "bold", color: COLORS.primaryBlue },
  reviewSub: { fontSize: 13, color: COLORS.textSecondary },
  starsRow: { flexDirection: "row", gap: 2 },
  actionArea: { padding: 20, gap: 12 },
  btnGold: {
    backgroundColor: COLORS.accentGold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  btnGoldText: { color: COLORS.primaryBlue, fontWeight: "bold", fontSize: 16 },
  btnOutline: {
    borderWidth: 2,
    borderColor: COLORS.primaryBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  btnOutlineText: {
    color: COLORS.primaryBlue,
    fontWeight: "bold",
    fontSize: 16,
  },
  verifyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 10,
    gap: 10,
  },
  verifyTxt: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  }, // Añade esto a tus estilos actuales:
  avatarIniciales: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "#123F78", // El mismo azul oscuro primaryBlue
    justifyContent: "center",
    alignItems: "center",
  },
  textoIniciales: {
    color: "#FFFFFF",
    fontSize: 28, // Tamaño ideal para que resalte dentro del círculo de 85px
    fontWeight: "bold",
  },
});
