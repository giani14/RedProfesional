export type RootStackParamList = {
  categorias: { categoryName: string };
  NuevaCategoria: undefined;
  EditarCategoria: { id: string };
  CategoriaEliminada: { categoryName: string };
  ListaDeUsuarios: { categoryName: string };
  UserDetail: {
    name: string;
    email: string;
    phone: string;
    role: string;
    status: "Activo" | "Suspendido";
    createdAt: string;
  };
  UsuarioActivado: { name: string };
};
