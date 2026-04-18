// src/navigation/AppNavigator.tsx

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CategoriaEliminadaScreen from "@/app/categorias/screens/categoriaEliminada";
import PantallaCategorias from "@/app/categorias/screens/categorias";
import NuevaCategoriaScreen from "@/app/categorias/screens/pantallaNuevaCategoria";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="categorias" component={PantallaCategorias} />

      <Stack.Screen name="NuevaCategoria" component={NuevaCategoriaScreen} />

      <Stack.Screen
        name="CategoriaEliminada"
        component={CategoriaEliminadaScreen}
      />
    </Stack.Navigator>
  );
}
