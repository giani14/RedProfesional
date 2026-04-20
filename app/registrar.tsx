import { AntDesign, Entypo, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../lib/supabase';

const logoImg = require('../assets/images/logo.png');
const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  
  // Estados de los campos
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Cliente' | 'Profesional'>('Cliente');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Estados de control
  const [isSuccess, setIsSuccess] = useState(false); 
  const [securePassword, setSecurePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- VALIDACIONES ---
  const emailRegex = /\S+@\S+\.\S+/;
  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && password !== '';
  
  const isFormInvalid = !fullName || !isEmailValid || !isPasswordValid || !passwordsMatch || !acceptedTerms;

  const handleRegister = async () => {
    if (isFormInvalid) return;

    setLoading(true);
    try {
      /* CORRECCIÓN CLAVE: 
         Solo llamamos a signUp. Tu TRIGGER en Supabase detectará 
         el nuevo usuario y creará la fila en 'perfiles' automáticamente.
      */
      const { data, error: authError } = await supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password,
        options: {
          // Pasamos el nombre y el rol como 'metadata' para que el Trigger los lea
          data: {
            full_name: fullName.trim(),
            role: role
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        
        setIsSuccess(true); 
      }
    } catch (err: any) {
      console.log("Error detectado:", err.message);
      let errorMessage = "No se pudo completar el registro.";
      
      if (err.message.includes("already registered")) {
        errorMessage = "Este correo ya está registrado. Intenta iniciar sesión.";
      } else {
        errorMessage = err.message;
      }

      Alert.alert("Error de registro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successContent}>
          <View style={styles.checkCircle}>
            <AntDesign name="check" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>¡Registro exitoso!</Text>
          <Text style={styles.successSubtitle}>
            Tu cuenta ha sido creada correctamente.{"\n"}
            Ya puedes acceder a RedProfesional.
          </Text>
          <TouchableOpacity style={styles.btnMain} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.btnText}>Ir al Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.main}>
      <StatusBar barStyle="light-content" backgroundColor="#003366" />
      
      <View style={styles.blueBar}>
        <Text style={styles.blueBarText}>Crea tu cuenta</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.logoBox}>
          <Image source={logoImg} style={styles.logoImg} resizeMode="contain" />
        </View>

        
        <View style={styles.form}>
          <Text style={styles.welcomeTitle}>Únete a RedProfesional</Text>

          <Text style={styles.label}>Nombre completo</Text>
          <View style={[styles.inputWrap, !fullName && styles.inputError]}>
            <FontAwesome5 name="user" size={16} color="#999" />
            <TextInput style={styles.input} placeholder="Ej: Jhorel Candia" onChangeText={setFullName} value={fullName} />
          </View>

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={[styles.inputWrap, email !== '' && !isEmailValid && styles.inputError]}>
            <MaterialCommunityIcons name="email-outline" size={18} color="#999" />
            <TextInput 
              style={styles.input} 
              placeholder="ejemplo@correo.com" 
              autoCapitalize="none" 
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
            />
          </View>

          <Text style={styles.label}>Contraseña (Mín. 8 caracteres)</Text>
          <View style={[styles.inputWrap, password !== '' && !isPasswordValid && styles.inputError]}>
            <FontAwesome5 name="lock" size={16} color="#999" />
            <TextInput 
                style={styles.input} 
                placeholder="********" 
                secureTextEntry={securePassword} 
                onChangeText={setPassword}
                value={password}
            />
            <TouchableOpacity onPress={() => setSecurePassword(!securePassword)}>
              <Entypo name={securePassword ? "eye-with-line" : "eye"} size={18} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={[styles.inputWrap, confirmPassword !== '' && !passwordsMatch && styles.inputError]}>
            <FontAwesome5 name="lock" size={16} color="#999" />
            <TextInput 
                style={styles.input} 
                placeholder="********" 
                secureTextEntry={securePassword} 
                onChangeText={setConfirmPassword}
                value={confirmPassword}
            />
          </View>

          <Text style={styles.label}>Tipo de cuenta</Text>
          <View style={styles.switchContainer}>
            <View style={[styles.slidingBg, role === 'Profesional' ? { left: '50%' } : { left: 0 }]} />
            <TouchableOpacity style={styles.switchOption} onPress={() => setRole('Cliente')}>
              <Text style={[styles.switchText, role === 'Cliente' && styles.textActive]}>Cliente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.switchOption} onPress={() => setRole('Profesional')}>
              <Text style={[styles.switchText, role === 'Profesional' && styles.textActive]}>Profesional</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.termsRow} onPress={() => setAcceptedTerms(!acceptedTerms)}>
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
              {acceptedTerms && <AntDesign name="check" size={14} color="white" />}
            </View>
            <Text style={styles.termsLabel}>Acepto los términos y condiciones</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.btnMain, (isFormInvalid || loading) && styles.btnDisabled]} 
          onPress={handleRegister}
          disabled={isFormInvalid || loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Registrarse</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? <Text style={styles.loginBold}>Iniciar sesión</Text></Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>

      <View style={styles.footerDecorations} pointerEvents="none">
        <View style={styles.decorYellow} />
        <View style={styles.decorLightBlue} />
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: 'white' },
  blueBar: { backgroundColor: '#003366', paddingTop: 50, paddingBottom: 20, alignItems: 'center' },
  blueBarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  scroll: { paddingHorizontal: 25 },
  logoBox: { alignItems: 'center', height: 100, marginVertical: 20 },
  logoImg: { width: width * 0.5, height: '100%' }, 
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#003366', marginBottom: 15 },
  form: { width: '100%', maxWidth: 500, alignSelf: 'center' },
  label: { fontWeight: 'bold', marginTop: 12, marginBottom: 5, color: '#444' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 15, backgroundColor: '#f9f9f9' },
  inputError: { borderColor: '#FF5252' },
  input: { flex: 1, paddingVertical: 10, marginLeft: 10, fontSize: 16 },
  switchContainer: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 30, height: 50, marginTop: 10, position: 'relative', overflow: 'hidden' },
  slidingBg: { position: 'absolute', width: '50%', height: '100%', backgroundColor: '#003366', borderRadius: 30 },
  switchOption: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  switchText: { fontWeight: 'bold', color: '#666' },
  textActive: { color: 'white' },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#003366', borderRadius: 6, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#003366' },
  termsLabel: { color: '#666', fontSize: 14 },
  btnMain: { backgroundColor: '#FFB800', padding: 18, borderRadius: 12, marginTop: 30, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#ccc', opacity: 0.6 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  loginLink: { marginTop: 25, marginBottom: 20, alignItems: 'center' },
  loginText: { color: '#666', fontSize: 15 },
  loginBold: { color: '#003366', fontWeight: 'bold' },
  footerDecorations: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, overflow: 'hidden', zIndex: -1 },
  decorYellow: { position: 'absolute', bottom: -50, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: '#FFB800', opacity: 0.2 },
  decorLightBlue: { position: 'absolute', bottom: -70, left: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: '#00AEEF', opacity: 0.15 },
  successContainer: { flex: 1, backgroundColor: 'white', justifyContent: 'center' },
  successContent: { alignItems: 'center', padding: 30 },
  checkCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: '#003366', marginBottom: 10 },
  successSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 }
});