import { Ionicons, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

const COLORS = {
  primaryBlue: "#123F78", // Tu azul corporativo
  inactiveGrey: "#9CA3AF",
  white: "#ffffff",
  border: "#F3F4F6",
};

export default function ClienteLayout() {
  return (
    <Tabs
      screenOptions={{
        // Color activo ajustado a tu azul principal
        tabBarActiveTintColor: COLORS.primaryBlue,
        tabBarInactiveTintColor: COLORS.inactiveGrey,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: 75, // Un poco más de altura para mejor ergonomía
          paddingBottom: 15,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 15,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11, // Tamaño refinado para que los 5 iconos quepan bien
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: COLORS.primaryBlue,
        },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      {/* 1. INICIO */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Octicons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 2. BUSCAR */}
      <Tabs.Screen
        name="buscar"
        options={{
          title: "Buscar",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 3. SOLICITUDES (Implementado en el centro) */}
      <Tabs.Screen
        name="solicitudes"
        options={{
          title: "Solicitudes",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "file-document" : "file-document-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 4. MENSAJES */}
      <Tabs.Screen
        name="mensajes"
        options={{
          title: "Mensajes",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubble-ellipses" : "chatbubble-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 5. PERFIL */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      {/* --- EL TRUCO ESTÁ AQUÍ --- */}
      {/* Ocultamos la carpeta HU-18 de la barra inferior */}
      <Tabs.Screen
        name="chat"
        options={{
          href: null, // <--- Esto hace que desaparezca de la barra de navegación
        }}
      />
      {/* --- EL TRUCO ESTÁ AQUÍ --- */}
      {/* Ocultamos la carpeta HU-18 de la barra inferior */}
      <Tabs.Screen
        name="Conversación"
        options={{
          href: null, // <--- Esto hace que desaparezca de la barra de navegación
        }}
      />
    </Tabs>
  );
}
