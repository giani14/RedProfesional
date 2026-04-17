import { AntDesign, Entypo, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../lib/supabase';

const logoImg = require('../assets/images/logo.png');

export default function RegisterScreen() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Cliente' | 'Profesional'>('Cliente');
  
  const [isSuccess, setIsSuccess] = useState(false); 
  const [securePassword, setSecurePassword] = useState(true);

  const handleRegister = async () => {
    if (!fullName) return Alert.alert("Campo obligatorio", "Por favor, ingresa tu nombre completo.");
    if (!email) return Alert.alert("Campo obligatorio", "El correo electrónico es necesario.");
    if (!password) return Alert.alert("Campo obligatorio", "Debes ingresar una contraseña.");

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return Alert.alert("Formato inválido", "Por favor, ingresa un correo electrónico válido.");
    }

    // Validación de contraseña >= 8
    if (password.length < 8) {
      return Alert.alert("Contraseña muy corta", "La contraseña debe tener al menos 8 caracteres.");
    }

    if (password !== confirmPassword) {
      return Alert.alert("Error", "Las contraseñas no coinciden.");
    }

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password 
      });

      if (error) throw error;

      if (data.user) {
        const { error: pErr } = await supabase.from('profiles').insert([
          { id: data.user.id, full_name: fullName.trim(), role: role }
        ]);
        if (pErr) throw pErr;
        setIsSuccess(true); 
      }
    } catch (err: any) {
      Alert.alert("Error de registro", err.message);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.checkCircle}>
          <AntDesign name="check" size={60} color="#4CAF50" />
        </View>
        <Text style={styles.successTitle}>¡Registro exitoso!</Text>
        <Text style={styles.successSubtitle}>Tu cuenta ha sido creada correctamente.{"\n"}Ya puedes iniciar sesión.</Text>
        <TouchableOpacity style={styles.btnMain} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.btnText}>Iniciar sesión ahora</Text>
        </TouchableOpacity>
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
        <Text style={styles.welcomeTitle}>Únete a RedProfesional</Text>
        
        <View style={styles.form}>
          {/* TEXTO CENTRADO */}
          <Text style={styles.startText}>Crea tu cuenta para comenzar</Text>

          <Text style={styles.label}>Nombre completo</Text>
          <View style={styles.inputWrap}>
            <FontAwesome5 name="user" size={16} color="#999" />
            <TextInput style={styles.input} placeholder="Jhorel Candia" onChangeText={setFullName} />
          </View>

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="email-outline" size={18} color="#999" />
            <TextInput 
              style={styles.input} 
              placeholder="ejemplo@correo.com" 
              autoCapitalize="none" 
              keyboardType="email-address"
              onChangeText={setEmail} 
            />
          </View>

          <Text style={styles.label}>Contraseña (mínimo 8 caracteres)</Text>
          <View style={styles.inputWrap}>
            <FontAwesome5 name="lock" size={16} color="#999" />
            <TextInput style={styles.input} placeholder="********" secureTextEntry={securePassword} onChangeText={setPassword} />
            <TouchableOpacity onPress={() => setSecurePassword(!securePassword)}>
              <Entypo name={securePassword ? "eye-with-line" : "eye"} size={18} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={styles.inputWrap}>
            <FontAwesome5 name="lock" size={16} color="#999" />
            <TextInput style={styles.input} placeholder="********" secureTextEntry={securePassword} onChangeText={setConfirmPassword} />
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
        </View>

        <TouchableOpacity style={styles.btnMain} onPress={handleRegister}>
          <Text style={styles.btnText}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.loginText}>
            ¿Ya tienes cuenta? <Text style={styles.loginBold}>Iniciar sesión</Text>
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footerDecorations} pointerEvents="none">
        <View style={styles.decorYellow} />
        <View style={styles.decorLightBlue} />
      </View>
      
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: 'white', position: 'relative' },
  blueBar: {
    backgroundColor: '#003366',
    paddingTop: 45, 
    paddingBottom: 15,
    alignItems: 'center',
    width: '100%',
  },
  blueBarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  scroll: { paddingHorizontal: 25, paddingTop: 10 },
  logoBox: { alignItems: 'center', height: 140, marginTop: 10, marginBottom: 5 },
  logoImg: { width: 220, height: '100%' }, 
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#003366', marginBottom: 15 },
  
  // Estilo centrado para el texto de invitación
  startText: { fontSize: 16, color: '#666', marginBottom: 10, textAlign: 'center', fontWeight: '500' },
  
  form: { marginBottom: 10 },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#444' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 15, backgroundColor: '#f9f9f9' },
  input: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 16 },
  switchContainer: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 30, height: 50, marginTop: 10, position: 'relative', overflow: 'hidden' },
  slidingBg: { position: 'absolute', width: '50%', height: '100%', backgroundColor: '#003366', borderRadius: 30 },
  switchOption: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  switchText: { fontWeight: 'bold', color: '#666' },
  textActive: { color: 'white' },
  btnMain: { backgroundColor: '#FFB800', padding: 18, borderRadius: 12, marginTop: 30, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  loginLink: { marginTop: 25, alignItems: 'center' },
  loginText: { color: '#666', fontSize: 15 },
  loginBold: { color: '#003366', fontWeight: 'bold' },
  footerDecorations: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, overflow: 'hidden', zIndex: -1 },
  decorYellow: { position: 'absolute', bottom: -50, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: '#FFB800', opacity: 0.2 },
  decorLightBlue: { position: 'absolute', bottom: -70, left: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: '#00AEEF', opacity: 0.15 },
  successContainer: { flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 30 },
  checkCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 26, fontWeight: 'bold', color: '#003366', marginBottom: 10 },
  successSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 }
});