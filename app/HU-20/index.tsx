import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    crearNotificacionDePrueba,
    formatearFechaNotificacion,
    listarMisNotificaciones,
    marcarNotificacionComoLeida,
    marcarTodasComoLeidas,
    NotificacionDB,
} from "@/lib/notificacionesService";

const COLORS = {
  primaryBlue: "#123F78",
  yellow: "#F9B000",
  bgLight: "#F4F6FA",
  white: "#FFFFFF",
  textMain: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  green: "#16A34A",
  red: "#EF4444",
  purple: "#7C3AED",
};

export default function HU20Notificaciones() {
  const [notificaciones, setNotificaciones] = useState<NotificacionDB[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cantidadNoLeidas = useMemo(() => {
    return notificaciones.filter((item) => !item.leida).length;
  }, [notificaciones]);

  const cargarNotificaciones = async () => {
    try {
      setCargando(true);

      const data = await listarMisNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar las notificaciones.");
    } finally {
      setCargando(false);
    }
  };

  const refrescar = async () => {
    try {
      setRefrescando(true);

      const data = await listarMisNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron actualizar las notificaciones.");
    } finally {
      setRefrescando(false);
    }
  };

  const abrirNotificacion = async (notificacion: NotificacionDB) => {
    try {
      Alert.alert(notificacion.titulo, notificacion.mensaje);

      if (!notificacion.leida) {
        const actualizada = await marcarNotificacionComoLeida(notificacion.id);

        setNotificaciones((prev) =>
          prev.map((item) =>
            item.id === actualizada.id ? actualizada : item
          )
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo marcar la notificación como leída.");
    }
  };

  const marcarTodoLeido = async () => {
    if (cantidadNoLeidas === 0) {
      Alert.alert("Notificaciones", "No tienes notificaciones pendientes.");
      return;
    }

    try {
      setProcesando(true);

      await marcarTodasComoLeidas();

      setNotificaciones((prev) =>
        prev.map((item) => ({
          ...item,
          leida: true,
        }))
      );

      Alert.alert(
        "Listo",
        "Todas las notificaciones fueron marcadas como leídas."
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron marcar las notificaciones.");
    } finally {
      setProcesando(false);
    }
  };

  const crearPrueba = async () => {
    try {
      setProcesando(true);

      const nueva = await crearNotificacionDePrueba();

      setNotificaciones((prev) => [nueva, ...prev]);

      Alert.alert(
        "Notificación creada",
        "Se generó una notificación de prueba correctamente."
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        "No se pudo crear la notificación de prueba. Verifica tu sesión o las políticas RLS."
      );
    } finally {
      setProcesando(false);
    }
  };

  const obtenerIcono = (tipo: string) => {
    switch (tipo) {
      case "solicitud":
        return "document-text-outline";
      case "mensaje":
        return "chatbubble-ellipses-outline";
      case "calificacion":
        return "star-outline";
      case "comentario":
        return "chatbox-outline";
      case "estado":
        return "checkmark-circle-outline";
      case "prueba":
        return "flask-outline";
      default:
        return "notifications-outline";
    }
  };

  const obtenerColorIcono = (tipo: string) => {
    switch (tipo) {
      case "solicitud":
        return COLORS.primaryBlue;
      case "mensaje":
        return "#2563EB";
      case "calificacion":
        return COLORS.yellow;
      case "comentario":
        return COLORS.purple;
      case "estado":
        return COLORS.green;
      case "prueba":
        return "#0EA5E9";
      default:
        return COLORS.primaryBlue;
    }
  };

  const renderNotificacion = ({ item }: { item: NotificacionDB }) => {
    const iconColor = obtenerColorIcono(item.tipo);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.leida && styles.notificationUnread,
        ]}
        activeOpacity={0.85}
        onPress={() => abrirNotificacion(item)}
      >
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: `${iconColor}18`,
            },
          ]}
        >
          <Ionicons
            name={obtenerIcono(item.tipo) as any}
            size={24}
            color={iconColor}
          />
        </View>

        <View style={styles.notificationInfo}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {item.titulo}
            </Text>

            {!item.leida && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.mensaje}
          </Text>

          <View style={styles.notificationFooter}>
            <Text style={styles.notificationType}>
              {item.tipo.toUpperCase()}
            </Text>

            <Text style={styles.notificationDate}>
              {formatearFechaNotificacion(item.created_at)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBlue}
      />

      <View style={styles.header}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitle}>Notificaciones</Text>
              <Text style={styles.headerSubtitle}>
                {cantidadNoLeidas} pendiente(s)
              </Text>
            </View>

            <TouchableOpacity onPress={refrescar}>
              <Ionicons name="refresh-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryTitle}>Centro de notificaciones</Text>
          <Text style={styles.summaryText}>
            Revisa solicitudes, mensajes, calificaciones y comentarios.
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cantidadNoLeidas}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, procesando && styles.disabledButton]}
          onPress={marcarTodoLeido}
          disabled={procesando}
        >
          <Ionicons name="checkmark-done-outline" size={18} color="#123F78" />
          <Text style={styles.actionButtonText}>Marcar leídas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButtonYellow, procesando && styles.disabledButton]}
          onPress={crearPrueba}
          disabled={procesando}
        >
          <Ionicons name="add-circle-outline" size={18} color="#123F78" />
          <Text style={styles.actionButtonText}>Crear prueba</Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      ) : (
        <FlatList
          data={notificaciones}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificacion}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={refrescar} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons
                name="notifications-off-outline"
                size={52}
                color="#9CA3AF"
              />
              <Text style={styles.emptyTitle}>Sin notificaciones</Text>
              <Text style={styles.emptyText}>
                Cuando tengas solicitudes, mensajes, calificaciones o comentarios,
                aparecerán en esta sección.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingBottom: 16,
  },
  headerContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#D1D5DB",
    fontSize: 13,
    marginTop: 2,
  },
  summaryCard: {
    marginHorizontal: 18,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textMain,
  },
  summaryText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 5,
    maxWidth: 245,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.yellow,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: COLORS.primaryBlue,
    fontWeight: "900",
    fontSize: 18,
  },
  actionsRow: {
    marginHorizontal: 18,
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  actionButtonYellow: {
    flex: 1,
    backgroundColor: "#FFF3C4",
    borderWidth: 1,
    borderColor: "#F9B000",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  actionButtonText: {
    color: COLORS.primaryBlue,
    fontWeight: "800",
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 30,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notificationUnread: {
    borderColor: "#BFDBFE",
    backgroundColor: "#F8FBFF",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationTitle: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: 15,
    fontWeight: "900",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.red,
    marginLeft: 8,
  },
  notificationMessage: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9,
  },
  notificationType: {
    color: COLORS.primaryBlue,
    fontSize: 11,
    fontWeight: "900",
  },
  notificationDate: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    fontWeight: "700",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    marginTop: 50,
  },
  emptyTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 12,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});