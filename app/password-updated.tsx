import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PasswordUpdated() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.topShape} />
        <View style={styles.bottomLeft} />
        <View style={styles.bottomRight} />

        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Contraseña actualizada</Text>
          </View>

          <View style={styles.content}>
            <Image
              source={require('../assets/images/logo-redprofesional.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.check}>✅</Text>
            <Text style={styles.title}>¡Contraseña actualizada!</Text>
            <Text style={styles.subtitle}>
              Tu contraseña ha sido cambiada correctamente.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, width: '100%', backgroundColor: '#FFFFFF' },
  header: { backgroundColor: '#1E3A5F', paddingVertical: 20, alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  logo: { width: 160, height: 100, alignSelf: 'center', marginBottom: 10 },
  check: { textAlign: 'center', fontSize: 60, marginBottom: 10 },
  title: { textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: '#1E3A5F' },
  subtitle: { textAlign: 'center', fontSize: 14, color: '#6B7280', marginVertical: 20 },
  button: {
    backgroundColor: '#F4B400',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#1E3A5F', fontWeight: 'bold' },
  topShape: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 120,
    height: 120,
    backgroundColor: '#FDE68A',
    borderBottomRightRadius: 120,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 140,
    height: 140,
    backgroundColor: '#93C5FD',
    borderTopRightRadius: 140,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 140,
    height: 140,
    backgroundColor: '#FDE68A',
    borderTopLeftRadius: 140,
  },
});