import { Feather } from '@expo/vector-icons';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const url = Linking.useLinkingURL();

  const validations = useMemo(() => {
    return {
      length: password.length >= 8,
      upper: /[A-ZÁÉÍÓÚÑ]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordIsValid =
    validations.length &&
    validations.upper &&
    validations.number &&
    validations.special;

  const createSessionFromUrl = async (incomingUrl: string) => {
    try {
      const { params, errorCode } = QueryParams.getQueryParams(incomingUrl);

      console.log('URL RECIBIDA:', incomingUrl);
      console.log('PARAMS:', params);

      if (errorCode) {
        setGeneralError('El enlace de recuperación no es válido.');
        return;
      }

      const access_token = params.access_token as string | undefined;
      const refresh_token = params.refresh_token as string | undefined;

      if (!access_token || !refresh_token) {
        setGeneralError(
          'No se recibieron los tokens del enlace. Abre nuevamente el enlace del correo.'
        );
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        setGeneralError(error.message);
        return;
      }

      setSessionReady(true);
      setGeneralError('');
    } catch (error) {
      console.log('ERROR PROCESANDO URL:', error);
      setGeneralError('No se pudo procesar el enlace de recuperación.');
    }
  };

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url);
    }
  }, [url]);

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setConfirmError('');
    setGeneralError('');

    let hasError = false;

    if (!password.trim()) {
      setPasswordError('La nueva contraseña es obligatoria.');
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmError('Debes confirmar la contraseña.');
      hasError = true;
    }

    if (hasError) return;

    if (!passwordIsValid) {
      setPasswordError('La contraseña no cumple los requisitos de seguridad.');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden.');
      return;
    }

    if (!sessionReady) {
      setGeneralError(
        'No existe una sesión de recuperación activa. Abre nuevamente el enlace del correo.'
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setGeneralError(error.message);
        return;
      }

      router.replace('/password-updated');
    } catch (error) {
      console.log('ERROR UPDATE PASSWORD:', error);
      setGeneralError('Ocurrió un error al actualizar la contraseña.');
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
              <Text style={styles.headerText}>Nueva contraseña</Text>
            </View>

            <View style={styles.content}>
              <Image
                source={require('../assets/images/logo-redprofesional.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>Crea una nueva contraseña</Text>
              <Text style={styles.subtitle}>
                Ingresa una contraseña segura para recuperar el acceso a tu cuenta.
              </Text>

              {!!generalError && <Text style={styles.errorText}>{generalError}</Text>}

              <Text style={styles.label}>Nueva contraseña</Text>
              <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                <Feather name="lock" size={20} color="#1E3A5F" />
                <TextInput
                  placeholder="Ingresa tu nueva contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>
              {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

              <View style={styles.rulesBox}>
                <Text style={styles.ruleText}>{validations.length ? '✅' : '⬜'} Al menos 8 caracteres</Text>
                <Text style={styles.ruleText}>{validations.upper ? '✅' : '⬜'} Una mayúscula</Text>
                <Text style={styles.ruleText}>{validations.number ? '✅' : '⬜'} Un número</Text>
                <Text style={styles.ruleText}>{validations.special ? '✅' : '⬜'} Un carácter especial</Text>
              </View>

              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={[styles.inputContainer, confirmError ? styles.inputError : null]}>
                <Feather name="lock" size={20} color="#1E3A5F" />
                <TextInput
                  placeholder="Confirma tu nueva contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Feather
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>
              {!!confirmError && <Text style={styles.errorText}>{confirmError}</Text>}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleUpdatePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#1E3A5F" />
                ) : (
                  <Text style={styles.buttonText}>Guardar nueva contraseña</Text>
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
  rulesBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  ruleText: { fontSize: 12, color: '#374151', marginBottom: 4 },
  button: {
    backgroundColor: '#F4B400',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
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