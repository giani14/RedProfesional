import { supabase } from "@/lib/supabase";

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
  categoria_id: string | null;
  portada_url: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Sube un archivo usando FormData, el método más estable y compatible
 * con Android para evitar fallos de red (Network Request Failed).
 */
export async function subirArchivoPortafolio(
  userId: string,
  archivo: ArchivoSeleccionado,
): Promise<ArchivoPortafolioDB> {
  // 1. Sanitizar el nombre del archivo
  const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${userId}/${Date.now()}-${nombreLimpio}`;

  // 2. Construir FormData nativo para transporte binario
  const formData = new FormData();
  formData.append("file", {
    uri: archivo.uri,
    name: nombreLimpio,
    type: archivo.mimeType || "application/octet-stream",
  } as any);

  // 3. Subida al bucket 'portafolios' (en minúsculas según tu panel)
  const { error } = await supabase.storage
    .from("portafolios")
    .upload(path, formData, {
      contentType: archivo.mimeType || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    console.error("Error directo en el método upload de Supabase:", error);
    throw error;
  }

  // 4. Obtener URL pública
  const { data } = supabase.storage.from("portafolios").getPublicUrl(path);

  return {
    name: archivo.name,
    path,
    url: data.publicUrl,
    mimeType: archivo.mimeType,
    size: archivo.size,
  };
}

/**
 * Inserta de manera secuencial los datos en las dos tablas del esquema:
 * 1º Guarda el Portafolio y obtiene su ID.
 * 2º Registra el adjunto en la tabla intermedia vinculada.
 */
export async function crearPortafolio(params: {
  profesional_id: string; // 👈 Mapeado correctamente para TypeScript
  titulo: string;
  descripcion: string;
  categoriaId: string | null;
  archivos: ArchivoSeleccionado[];
}): Promise<any> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("No se pudo obtener el usuario autenticado.");
    }

    // PASO UNO: Insertar los datos base en la tabla principal 'portafolios'
    const { data: nuevoPortafolio, error: errorPortafolio } = await supabase
      .from("portafolios")
      .insert([
        {
          profesional_id: params.profesional_id,
          titulo: params.titulo,
          descripcion: params.descripcion,
          // Si params.categoriaId no es un UUID válido, mándalo como null
          // para evitar el error 22P02 "invalid input syntax for type uuid"
          categoria_id:
            params.categoriaId && params.categoriaId.includes("-")
              ? params.categoriaId
              : null,
          portada_url: null,
        },
      ])
      .select()
      .single();

    if (errorPortafolio) {
      console.error(
        "Error al insertar en la tabla portafolios:",
        errorPortafolio,
      );
      throw errorPortafolio;
    }

    // PASO DOS: Subir el archivo e insertarlo en la tabla secundaria
    if (params.archivos && params.archivos.length > 0 && nuevoPortafolio) {
      const archivoParaSubir = params.archivos[0];

      const archivoSubido = await subirArchivoPortafolio(
        user.id,
        archivoParaSubir,
      );

      // CORREGIDO: Se cambió 'portolio_archivos' a 'portafolio_archivos' (nombre real de tu tabla)
      const { error: errorArchivo } = await supabase
        .from("portafolio_archivos")
        .insert([
          {
            portafolio_id: nuevoPortafolio.id,
            archivo_url: archivoSubido.url,
            tipo: archivoParaSubir.mimeType || "application/octet-stream",
          },
        ]);

      if (errorArchivo) {
        console.error(
          "Error al registrar en portafolio_archivos:",
          errorArchivo,
        );
        throw errorArchivo;
      }

      // Colocar la primera imagen cargada como portada del trabajo
      if (archivoParaSubir.mimeType?.startsWith("image/")) {
        await supabase
          .from("portafolios")
          .update({ portada_url: archivoSubido.url })
          .eq("id", nuevoPortafolio.id);

        nuevoPortafolio.portada_url = archivoSubido.url;
      }
    }

    return nuevoPortafolio;
  } catch (error) {
    console.error("Error global en el flujo de crearPortafolio:", error);
    throw error;
  }
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
  categoriaId: string | null;
  archivos: ArchivoPortafolioDB[];
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No hay usuario autenticado.");
  }

  const { data, error = null } = await supabase
    .from("portafolios")
    .update({
      titulo: params.titulo,
      descripcion: params.descripcion,
      categoria_id: params.categoriaId,
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
  const paths = params.archivos.map((archivo) => archivo.path).filter(Boolean);

  if (paths.length > 0) {
    // CORREGIDO: Ajustado a 'portafolios' en minúsculas para mantener consistencia
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
