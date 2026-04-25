import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    let ok = true;

    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!email.trim()) {
      setEmailError('El correo electrónico es obligatorio.');
      ok = false;
    }

    if (!password.trim()) {
      setPasswordError('La contraseña es obligatoria.');
      ok = false;
    }

    return ok;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const emailLimpio = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailLimpio,
        password,
      });

      console.log('LOGIN DATA:', data);
      console.log('LOGIN ERROR:', error);

      if (error || !data.user) {
        setGeneralError('Correo o contraseña incorrectos. Inténtalo de nuevo.');
        return;
      }

      const { data: perfilData, error: errorPerfil } = await supabase
        .from('perfiles')
        .select('id, email, nombre_completo, rol, estado')
        .ilike('email', emailLimpio)
        .maybeSingle();

      console.log('PERFIL DATA:', perfilData);
      console.log('PERFIL ERROR:', errorPerfil);

      if (errorPerfil) {
        setGeneralError(errorPerfil.message);
        return;
      }

      if (!perfilData) {
        setGeneralError('No se encontró el perfil del usuario.');
        return;
      }

      if ((perfilData.estado || '').toLowerCase() !== 'activo') {
        setGeneralError('Tu cuenta está suspendida o inactiva.');
        await supabase.auth.signOut();
        return;
      }

      const rol = (perfilData.rol || '').toLowerCase();

      if (rol === 'profesional') {
        router.replace('/profesional-home');
      } else if (rol === 'cliente') {
        router.replace('/cliente-home');
      } else if (rol === 'admin') {
        router.replace('/admin-home');
      } else {
        router.replace('/home');
      }
    } catch (e) {
      console.log('ERROR GENERAL:', e);
      setGeneralError('Ocurrió un error inesperado al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.screen}>
          <View style={styles.topShape} />
          <View style={styles.bottomLeft} />
          <View style={styles.bottomRight} />

          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Iniciar sesión</Text>
            </View>

            <View style={styles.content}>
              <Image
                source={require('../assets/images/logo-redprofesional.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>Bienvenido de nuevo</Text>
              <Text style={styles.subtitle}>
                Ingresa tus credenciales para continuar
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

              <Text style={styles.label}>Contraseña</Text>
              <View
                style={[
                  styles.inputContainer,
                  passwordError ? styles.inputError : null,
                ]}
              >
                <Feather name="lock" size={20} color="#1E3A5F" />
                <TextInput
                  placeholder="Ingresa tu contraseña"
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
              {!!passwordError && (
                <Text style={styles.errorText}>{passwordError}</Text>
              )}

              {!!generalError && (
                <Text style={styles.errorText}>{generalError}</Text>
              )}

             <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#1E3A5F" />
                ) : (
                  <Text style={styles.buttonText}>Ingresar</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity style={styles.googleButton}>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.googleText}>Continuar con Google</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.register}>
                  ¿No tienes cuenta?{' '}
                  <Text style={styles.registerLink}>Regístrate</Text>
                </Text>
              </TouchableOpacity >
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    flexGrow: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
    backgroundColor: '#FFFFFF',
  },

  header: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 20,
    alignItems: 'center',
  },

  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  content: {
    flex: 1,
    padding: 20,
  },

  logo: {
    width: 160,
    height: 100,
    alignSelf: 'center',
    marginBottom: 10,
  },

  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
  },

  label: {
    marginBottom: 5,
    fontWeight: '500',
    color: '#111827',
  },

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

  input: {
    flex: 1,
    padding: 10,
    color: '#111827',
  },

  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },

  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginBottom: 10,
  },

  forgot: {
    textAlign: 'center',
    color: '#1D4ED8',
    marginBottom: 15,
  },

  button: {
    backgroundColor: '#F4B400',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#1E3A5F',
    fontWeight: 'bold',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },

  dividerText: {
    marginHorizontal: 10,
    color: '#6B7280',
  },

  googleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    padding: 12,
    borderRadius: 10,
  },

  googleText: {
    marginLeft: 10,
    fontWeight: '500',
  },

  register: {
    textAlign: 'center',
    marginTop: 15,
    color: '#111827',
  },

  registerLink: {
    color: '#1D4ED8',
  },

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