import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [generalMessage, setGeneralMessage] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    setEmailError('');
    setGeneralError('');
    setGeneralMessage('');

    const emailLimpio = email.trim().toLowerCase();

    if (!emailLimpio) {
      setEmailError('El correo electrónico es obligatorio.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(emailLimpio, {
        redirectTo: 'redprofesional://reset-password',
      });

      if (error) {
        setGeneralError(error.message);
        return;
      }

      setGeneralMessage(
        'Se envió un enlace de recuperación a tu correo electrónico.'
      );
    } catch (e) {
      setGeneralError('Ocurrió un error al enviar el enlace de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.screen}>
          <View style={styles.topShape} />
          <View style={styles.bottomLeft} />
          <View style={styles.bottomRight} />

          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Recuperar contraseña</Text>
            </View>

            <View style={styles.content}>
              <Image
                source={require('../assets/images/logo-redprofesional.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>Recuperar contraseña</Text>
              <Text style={styles.subtitle}>
                Ingresa tu correo electrónico y te enviaremos un enlace para
                restablecer tu contraseña.
              </Text>

              <Text style={styles.label}>Correo electrónico</Text>
              <View
                style={[
                  styles.inputContainer,
                  emailError ? styles.inputError : null,
                ]}
              >
                <MaterialIcons name="email" size={20} color="#1E3A5F" />
                <TextInput
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
              {!!generalError && (
                <Text style={styles.errorText}>{generalError}</Text>
              )}
              {!!generalMessage && (
                <Text style={styles.successText}>{generalMessage}</Text>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#1E3A5F" />
                ) : (
                  <Text style={styles.buttonText}>Enviar enlace</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.backText}>Volver al inicio de sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { flexGrow: 1 },
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, width: '100%', minHeight: '100%', backgroundColor: '#FFFFFF' },
  header: { backgroundColor: '#1E3A5F', paddingVertical: 20, alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  content: { flex: 1, padding: 20 },
  logo: { width: 160, height: 100, alignSelf: 'center', marginBottom: 10 },
  title: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#1E3A5F' },
  subtitle: { textAlign: 'center', fontSize: 13, color: '#6B7280', marginBottom: 20 },
  label: { marginBottom: 5, fontWeight: '500', color: '#111827' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  input: { flex: 1, padding: 10, color: '#111827' },
  inputError: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  errorText: { color: '#DC2626', fontSize: 12, marginBottom: 10 },
  successText: { color: '#16A34A', fontSize: 12, marginBottom: 10 },
  button: {
    backgroundColor: '#F4B400',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#1E3A5F', fontWeight: 'bold' },
  backText: { textAlign: 'center', color: '#1D4ED8', marginTop: 15 },
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