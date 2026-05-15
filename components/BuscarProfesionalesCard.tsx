import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BuscarProfesionalesCard() {
  const router = useRouter();
  const categorias = ['Electricidad', 'Plomería', 'Limpieza', 'Carpintería'];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Buscar profesionales</Text>
      <Text style={styles.subtitle}>Encuentra expertos cerca de ti</Text>

      {/* Input simulado que redirige a la pantalla de búsqueda real */}
      <TouchableOpacity 
        style={styles.searchBar} 
        onPress={() => router.push('/(cliente)/buscar' as Href)}
        activeOpacity={0.9}
      >
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.icon} />
        <Text style={styles.placeholder}>¿Qué servicio necesitas?</Text>
      </TouchableOpacity>

      {/* Categorías Rápidas */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {categorias.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={styles.chip}
            onPress={() => router.push({ pathname: '/(cliente)/buscar', params: { query: cat } } as unknown as Href)}
          >
            <Text style={styles.chipText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A3B63',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 16,
  },
  icon: { marginRight: 10 },
  placeholder: { color: '#9CA3AF', fontSize: 15 },
  scroll: { flexDirection: 'row' },
  chip: { backgroundColor: '#E8F0F8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  chipText: { color: '#1A3B63', fontWeight: '600', fontSize: 13 },
});