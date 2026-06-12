import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function ProfesionalLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1A4670", // Color del texto cuando está activo
        tabBarInactiveTintColor: "#64748B", // Color del texto cuando está inactivo
        tabBarStyle: {
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
          elevation: 8, // Sombra para Android
          shadowColor: "#000", // Sombra para iOS
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      {/* INICIO */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />

      {/* PROYECTOS (REEMPLAZA A BUSCAR) */}
      <Tabs.Screen
        name="proyecto"
        options={{
          title: "Proyectos ",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={focused ? "briefcase" : "briefcase-outline"}
                size={22}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />

      {/* SOLICITUDES (EL ICONO DE LA IMAGEN) */}
      <Tabs.Screen
        name="solicitudes"
        options={{
          title: "Solicitudes",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={focused ? "copy" : "copy-outline"}
                size={22}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />

      {/* MENSAJES */}
      <Tabs.Screen
        name="mensajes"
        options={{
          title: "Mensajes",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={focused ? "chatbubble" : "chatbubble-outline"}
                size={22}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />

      {/* PERFIL */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />
      {/* --- EL TRUCO ESTÁ AQUÍ --- */}
      {/* Ocultamos la carpeta HU-18 de la barra inferior */}
      <Tabs.Screen
        name="calificar"
        options={{
          href: null, // <--- Esto hace que desaparezca de la barra de navegación
        }}
      />
      {/* --- EL TRUCO ESTÁ AQUÍ --- */}
      {/* Ocultamos la carpeta HU-18 de la barra inferior */}
      <Tabs.Screen
        name="calificacionEnviada"
        options={{
          href: null, // <--- Esto hace que desaparezca de la barra de navegación
        }}
      />
      {/* --- EL TRUCO ESTÁ AQUÍ --- */}
      {/* Ocultamos la carpeta HU-18 de la barra inferior */}
      <Tabs.Screen
        name="servicioFinalizado"
        options={{
          href: null, // <--- Esto hace que desaparezca de la barra de navegación
        }}
      />
      <Tabs.Screen
        name="centroDeAyuda"
        options={{
          href: null, // <--- Esto hace que desaparezca de la barra de navegación
        }}
      />
      <Tabs.Screen
        name="privacidad"
        options={{
          href: null, // <--- Esto hace que desaparezca de la barra de navegación
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 30,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: "#1A4670", // Azul oscuro idéntico a tu imagen
  },
});
