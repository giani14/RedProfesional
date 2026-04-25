import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Perfil() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      setCargando(true);
      // Obtenemos el usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Consultamos la tabla 'perfiles' en Supabase
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUsuario(data);
        }
      }
    } catch (error: any) {
      console.log("Error al cargar perfil:", error.message);
    } finally {
      setCargando(false);
    }
  };

  // Pantalla de carga mientras responde Supabase
  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#FFB100" />
      </View>
    );
  }

  return (
    <View style={styles.contenedorPrincipal}>
      {/* Encabezado Azul Superior */}
      <View style={styles.encabezadoAzul}>
        <Text style={styles.logoTexto}>
          Red<Text style={{ color: '#FFB100' }}>Profesional</Text>
        </Text>
        <Ionicons name="notifications-outline" size={24} color="white" />
      </View>

      <ScrollView bounces={false}>
        {/* Información del Perfil */}
        <View style={styles.seccionInfo}>
          <Image 
            source={{ uri: usuario?.avatar_url || 'https://via.placeholder.com/150' }} 
            style={styles.fotoPerfil} 
          />
          <Text style={styles.nombreUsuario}>{usuario?.nombre_completo || 'Usuario'}</Text>
          
          {/* Texto modificado: "No definido" */}
          <Text style={styles.profesion}>{usuario?.carrera || 'No definido'}</Text>
          
          {/* Etiqueta de Profesional (si aplica) */}
          {usuario?.es_profesional && (
            <View style={styles.etiquetaProfesional}>
              <Text style={styles.textoEtiqueta}>Profesional</Text>
            </View>
          )}

          {/* Estadísticas */}
          <View style={styles.contenedorStats}>
            <View style={styles.statBox}>
              <Text style={styles.statNumero}>0</Text>
              <Text style={styles.statTitulo}>Proyectos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumero}>0</Text>
              <Text style={styles.statTitulo}>Colaboraciones</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumero}>-</Text>
              <Text style={styles.statTitulo}>Calificación</Text>
            </View>
          </View>
        </View>

        {/* Menú de Configuración */}
        <View style={styles.menuOpciones}>
          <TouchableOpacity 
            style={styles.opcion}
            onPress={() => router.push('/EditarDatosPersonales')}
          >
            <View style={styles.opcionIzquierda}>
              <Ionicons name="settings-outline" size={22} color="#002B5B" />
              <Text style={styles.textoOpcion}>Configuración de perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          {/* Botón de Cerrar Sesión */}
          <TouchableOpacity 
            style={styles.opcion} 
            onPress={async () => await supabase.auth.signOut()}
          >
            <View style={styles.opcionIzquierda}>
              <Ionicons name="log-out-outline" size={22} color="#FF4D4D" />
              <Text style={[styles.textoOpcion, { color: '#FF4D4D' }]}>Cerrar sesión</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: { flex: 1, backgroundColor: 'white' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  encabezadoAzul: { 
    backgroundColor: '#002B5B', 
    height: 100, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 30 
  },
  logoTexto: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  seccionInfo: { 
    alignItems: 'center', 
    paddingVertical: 30, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  fotoPerfil: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, backgroundColor: '#EEE' },
  nombreUsuario: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  profesion: { color: '#777', fontSize: 15 },
  etiquetaProfesional: { 
    backgroundColor: '#FFB100', 
    paddingHorizontal: 15, 
    paddingVertical: 5, 
    borderRadius: 12, 
    marginTop: 10 
  },
  textoEtiqueta: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  contenedorStats: { 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-around', 
    marginTop: 30 
  },
  statBox: { alignItems: 'center' },
  statNumero: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statTitulo: { fontSize: 12, color: '#999' },
  menuOpciones: { paddingHorizontal: 20, marginTop: 15 },
  opcion: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 18, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5' 
  },
  opcionIzquierda: { flexDirection: 'row', alignItems: 'center' },
  textoOpcion: { marginLeft: 15, fontSize: 16, color: '#333', fontWeight: '500' }
});