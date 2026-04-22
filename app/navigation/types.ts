export type RootStackParamList = {
  categorias: { categoryName: string };
  NuevaCategoria: undefined;
  EditarCategoria: { id: string };
  CategoriaEliminada: { categoryName: string };
  ListaDeUsuarios: { categoryName: string };
  UserDetail: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: "activo" | "suspendido";
    createdAt: string;
  };
  UsuarioActivado: { name: string };
};
