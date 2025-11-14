// brigadas-service/models/brigadaAsignacionesModel.js
import supabase from '../config/database.js';

class BrigadaAsignacionesModel {
  
  static async asignar(brigada_id, miembro_id) {
    const { data, error } = await supabase
      .from('brigada_asignaciones')
      .insert([{
        brigada_id,
        miembro_id,
        estado_invitacion: 'pendiente',
        fecha_invitacion: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async responder(brigada_id, miembro_id, aceptada, motivo_rechazo = null) {
    const { data, error } = await supabase
      .from('brigada_asignaciones')
      .update({
        estado_invitacion: aceptada ? 'aceptada' : 'rechazada',
        fecha_respuesta: new Date().toISOString(),
        motivo_rechazo: motivo_rechazo || null
      })
      .eq('brigada_id', brigada_id)
      .eq('miembro_id', miembro_id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async desasignar(brigada_id, miembro_id) {
    const { error } = await supabase
      .from('brigada_asignaciones')
      .delete()
      .eq('brigada_id', brigada_id)
      .eq('miembro_id', miembro_id);
    
    if (error) throw error;
    return true;
  }

  static async getByBrigada(brigada_id) {
    const { data, error } = await supabase
      .from('brigada_asignaciones')
      .select(`
        *,
        brigada_miembros (*)
      `)
      .eq('brigada_id', brigada_id);
    
    if (error) throw error;
    return data || [];
  }

  static async getByMiembro(miembro_id) {
    const { data, error } = await supabase
      .from('brigada_asignaciones')
      .select(`
        *,
        brigada (
          id,
          nombre,
          estado,
          fecha_inicio,
          fecha_fin,
          conglomerado:conglomerado_id (
            codigo,
            lat,
            lon,
            departamentos (nombre)
          )
        )
      `)
      .eq('miembro_id', miembro_id)
      .order('fecha_invitacion', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getPendientesByMiembro(miembro_id) {
    const { data, error } = await supabase
      .from('brigada_asignaciones')
      .select(`
        *,
        brigada (
          id,
          nombre,
          estado,
          fecha_inicio,
          fecha_fin,
          conglomerado:conglomerado_id (
            codigo,
            lat,
            lon,
            departamentos (nombre)
          )
        )
      `)
      .eq('miembro_id', miembro_id)
      .eq('estado_invitacion', 'pendiente')
      .order('fecha_invitacion', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async existeAsignacion(brigada_id, miembro_id) {
    const { data, error } = await supabase
      .from('brigada_asignaciones')
      .select('id')
      .eq('brigada_id', brigada_id)
      .eq('miembro_id', miembro_id)
      .maybeSingle();
    
    if (error) throw error;
    return data !== null;
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('brigada_asignaciones')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
}

export default BrigadaAsignacionesModel;