// src/navigation/AppNavigator.tsx

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CategoriaEliminadaScreen from "@/app/categorias/screens/categoriaEliminada";
import PantallaCategorias from "@/app/categorias/screens/categorias";
import NuevaCategoriaScreen from "@/app/categorias/screens/pantallaNuevaCategoria";
import UsuariosScreen from "@/app/gestionDeUsuarios/screens/pantallaDeUsuarios";
import DetallesScreen from "../gestionDeUsuarios/screens/detallesUsuario";
import UsuarioActivadoScreen from "../gestionDeUsuarios/screens/usuarioActivado";

import { RootStackParamList } from "@/app/navigation/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListaDeUsuarios" component={UsuariosScreen} />

      <Stack.Screen name="UserDetail" component={DetallesScreen} />

      <Stack.Screen name="UsuarioActivado" component={UsuarioActivadoScreen} />

      <Stack.Screen name="categorias" component={PantallaCategorias} />

      <Stack.Screen name="NuevaCategoria" component={NuevaCategoriaScreen} />

      <Stack.Screen
        name="CategoriaEliminada"
        component={CategoriaEliminadaScreen}
      />
    </Stack.Navigator>
  );
}
