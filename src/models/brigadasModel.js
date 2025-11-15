// brigadas-service/models/brigadasModel.js
import supabase from '../config/database.js';

class BrigadasModel {
  
  static async getAll() {
    const { data, error } = await supabase
      .from('brigada')
      .select(`
        *,
        conglomerado:conglomerado_id (
          codigo,
          lat,
          lon,
          departamentos (nombre)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('brigada')
      .select(`
        *,
        conglomerado:conglomerado_id (
          codigo,
          lat,
          lon,
          departamentos (nombre)
        )
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async create(brigada) {
    const { data, error } = await supabase
      .from('brigada')
      .insert([{
        nombre: brigada.nombre,
        conglomerado_id: brigada.conglomerado_id,
        fecha_inicio: brigada.fecha_inicio,
        fecha_fin: brigada.fecha_fin,
        creado_por: brigada.creado_por,
        estado: 'formacion'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('brigada')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async cambiarEstado(id, nuevoEstado) {
    const estadosValidos = ['formacion', 'activa', 'completada', 'cancelada'];
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error('Estado inválido');
    }

    const { data, error } = await supabase
      .from('brigada')
      .update({ 
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('brigada')
      .delete()
      .eq('id', id)
      .eq('estado', 'cancelada');
    
    if (error) throw error;
    return true;
  }

  static async getByEstado(estado) {
    const { data, error } = await supabase
      .from('brigada')
      .select(`
        *,
        conglomerado:conglomerado_id (
          codigo,
          lat,
          lon,
          departamentos (nombre)
        )
      `)
      .eq('estado', estado);
    
    if (error) throw error;
    return data || [];
  }

  static async getConMiembros(id) {
    const brigada = await this.getById(id);
    if (!brigada) return null;

    const { data: asignaciones, error } = await supabase
      .from('brigada_asignaciones')
      .select(`
        *,
        brigada_miembros (*)
      `)
      .eq('brigada_id', id);
    
    if (error) throw error;

    return {
      ...brigada,
      miembros: asignaciones || []
    };
  }
}

export default BrigadasModel;