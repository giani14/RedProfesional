import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';


export default function TabLayout() {


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFB100', // Color amarillo de tu marca
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          backgroundColor: '#FFFFFF',
        },
        headerShown: false, // Oculta la barra superior para un diseño limpio
      }}>
      
      {/* Pestaña de Inicio */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* Pestaña de Perfil (usando 'two' que es tu archivo actual) */}
      <Tabs.Screen
        name="two" 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />

      {/* Ocultamos otras rutas que no deben aparecer en la barra inferior */}
      <Tabs.Screen
        name="perfil"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="EditarDatosPersonales"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
