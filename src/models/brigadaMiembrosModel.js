// brigadas-service/models/brigadaMiembrosModel.js
import supabase from '../config/database.js';

class BrigadaMiembrosModel {
  
  static async getAll() {
    const { data, error } = await supabase
      .from('brigada_miembros')
      .select(`
        *,
        departamentos (nombre, codigo)
      `)
      .eq('estado', 'activo')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('brigada_miembros')
      .select(`
        *,
        departamentos (nombre, codigo)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async getByEmail(correo) {
    const { data, error } = await supabase
      .from('brigada_miembros')
      .select('*')
      .eq('correo', correo)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async getByCedula(cedula) {
    const { data, error } = await supabase
      .from('brigada_miembros')
      .select('*')
      .eq('cedula', cedula)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async getByDepartamento(departamento_id) {
    const { data, error } = await supabase
      .from('brigada_miembros')
      .select(`
        *,
        departamentos (nombre, codigo)
      `)
      .eq('departamento_id', departamento_id)
      .eq('estado', 'activo')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async create(miembro) {
    const { data, error } = await supabase
      .from('brigada_miembros')
      .insert([{
        cedula: miembro.cedula,
        nombre: miembro.nombre,
        correo: miembro.correo,
        telefono: miembro.telefono || null,
        departamento_id: miembro.departamento_id || null,
        cargo: miembro.cargo || null,
        titulos: miembro.titulos || [],
        experiencia_laboral: miembro.experiencia_laboral || [],
        estado: 'activo'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('brigada_miembros')
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

  static async suspend(id) {
    const { data, error } = await supabase
      .from('brigada_miembros')
      .update({
        estado: 'suspendido',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async activate(id) {
    const { data, error } = await supabase
      .from('brigada_miembros')
      .update({
        estado: 'activo',
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
      .from('brigada_miembros')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  static async getDisponibles(departamento_id = null) {
    let query = supabase
      .from('brigada_miembros')
      .select(`
        *,
        departamentos (nombre, codigo)
      `)
      .eq('estado', 'activo');

    if (departamento_id) {
      query = query.eq('departamento_id', departamento_id);
    }

    const { data, error } = await query.order('nombre', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
}

export default BrigadaMiembrosModel;