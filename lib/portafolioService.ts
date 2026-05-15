import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

export type ArchivoSeleccionado = {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
};

export type ArchivoPortafolioDB = {
  name: string;
  path: string;
  url: string;
  mimeType?: string;
  size?: number;
};

export type PortafolioDB = {
  id: string;
  profesional_id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  archivos: ArchivoPortafolioDB[];
  portada_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function subirArchivoPortafolio(
  userId: string,
  archivo: ArchivoSeleccionado
): Promise<ArchivoPortafolioDB> {
  const base64 = await FileSystem.readAsStringAsync(archivo.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const nombreLimpio = archivo.name.replace(/\s+/g, "_");
  const path = `${userId}/${Date.now()}-${nombreLimpio}`;

  const { error } = await supabase.storage
    .from("portafolios")
    .upload(path, decode(base64), {
      contentType: archivo.mimeType || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("portafolios").getPublicUrl(path);

  return {
    name: archivo.name,
    path,
    url: data.publicUrl,
    mimeType: archivo.mimeType,
    size: archivo.size,
  };
}

export async function crearPortafolio(params: {
  titulo: string;
  descripcion: string;
  categoria: string;
  archivos: ArchivoSeleccionado[];
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No hay usuario autenticado.");
  }

  const archivosSubidos = await Promise.all(
    params.archivos.map((archivo) => subirArchivoPortafolio(user.id, archivo))
  );

  const { data, error } = await supabase
    .from("portafolios")
    .insert({
      profesional_id: user.id,
      titulo: params.titulo,
      descripcion: params.descripcion,
      categoria: params.categoria,
      archivos: archivosSubidos,
      portada_url: archivosSubidos[0]?.url || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as PortafolioDB;
}

export async function listarMisPortafolios() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No hay usuario autenticado.");
  }

  const { data, error } = await supabase
    .from("portafolios")
    .select("*")
    .eq("profesional_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as PortafolioDB[];
}

export async function actualizarPortafolio(params: {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  archivos: ArchivoPortafolioDB[];
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No hay usuario autenticado.");
  }

  const { data, error } = await supabase
    .from("portafolios")
    .update({
      titulo: params.titulo,
      descripcion: params.descripcion,
      categoria: params.categoria,
      archivos: params.archivos,
      portada_url: params.archivos[0]?.url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .eq("profesional_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as PortafolioDB;
}

export async function eliminarPortafolio(params: {
  id: string;
  archivos: ArchivoPortafolioDB[];
}) {
  const paths = params.archivos
    .map((archivo) => archivo.path)
    .filter(Boolean);

  if (paths.length > 0) {
    await supabase.storage.from("portafolios").remove(paths);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No hay usuario autenticado.");
  }

  const { error } = await supabase
    .from("portafolios")
    .delete()
    .eq("id", params.id)
    .eq("profesional_id", user.id);

  if (error) {
    throw error;
  }
}