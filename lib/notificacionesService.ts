import { supabase } from "@/lib/supabase";

export type NotificacionDB = {
  id: string;
  usuario_id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  referencia_id?: string | null;
  referencia_tabla?: string | null;
  leida: boolean;
  created_at: string;
  updated_at: string;
};

export async function obtenerUsuarioActual() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("No hay usuario autenticado.");
  }

  return user;
}

export async function listarMisNotificaciones(): Promise<NotificacionDB[]> {
  const user = await obtenerUsuarioActual();

  const { data, error } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as NotificacionDB[];
}

export async function marcarNotificacionComoLeida(id: string) {
  const user = await obtenerUsuarioActual();

  const { data, error } = await supabase
    .from("notificaciones")
    .update({
      leida: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("usuario_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as NotificacionDB;
}

export async function marcarTodasComoLeidas() {
  const user = await obtenerUsuarioActual();

  const { error } = await supabase
    .from("notificaciones")
    .update({
      leida: true,
      updated_at: new Date().toISOString(),
    })
    .eq("usuario_id", user.id)
    .eq("leida", false);

  if (error) {
    throw error;
  }
}

export async function crearNotificacion(params: {
  usuario_id: string;
  titulo: string;
  mensaje: string;
  tipo?: string;
  referencia_id?: string | null;
  referencia_tabla?: string | null;
}) {
  const { data, error } = await supabase
    .from("notificaciones")
    .insert({
      usuario_id: params.usuario_id,
      titulo: params.titulo,
      mensaje: params.mensaje,
      tipo: params.tipo || "sistema",
      referencia_id: params.referencia_id || null,
      referencia_tabla: params.referencia_tabla || null,
      leida: false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as NotificacionDB;
}

export async function crearNotificacionDePrueba() {
  const user = await obtenerUsuarioActual();

  return crearNotificacion({
    usuario_id: user.id,
    titulo: "Nueva notificación de prueba",
    mensaje:
      "Esta notificación fue generada para comprobar el funcionamiento de la HU-20.",
    tipo: "prueba",
  });
}

export function formatearFechaNotificacion(fecha: string) {
  const date = new Date(fecha);

  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}