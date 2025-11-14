// brigadas-service/models/conglomeradosModel.js
import supabase from '../config/database.js';

class ConglomeradosModel {
  
  static async getAll() {
    const { data, error } = await supabase
      .from('conglomerado')
      .select(`
        *,
        departamentos (nombre, codigo),
        brigada:brigada!conglomerado_id (id, nombre, estado)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('conglomerado')
      .select(`
        *,
        departamentos (nombre, codigo),
        brigada:brigada!conglomerado_id (id, nombre, estado)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async getByCodigo(codigo) {
    const { data, error } = await supabase
      .from('conglomerado')
      .select('*')
      .eq('codigo', codigo)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async create(conglomerado) {
    const { data, error } = await supabase
      .from('conglomerado')
      .insert([{
        codigo: conglomerado.codigo,
        lat: conglomerado.lat,
        lon: conglomerado.lon,
        estado: 'pendiente'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createBatch(conglomerados) {
    const records = conglomerados.map(c => ({
      codigo: c.codigo,
      lat: c.lat,
      lon: c.lon,
      estado: 'pendiente'
    }));

    const { data, error } = await supabase
      .from('conglomerado')
      .insert(records)
      .select();
    
    if (error) throw error;
    return data || [];
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('conglomerado')
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

  static async aprobar(id, departamento_id, asignado_por) {
    const { data, error } = await supabase
      .from('conglomerado')
      .update({
        estado: 'aprobado',
        departamento_id,
        asignado_por,
        razon_rechazo: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async rechazar(id, razon, asignado_por) {
    const { data, error } = await supabase
      .from('conglomerado')
      .update({
        estado: 'rechazado',
        razon_rechazo: razon,
        asignado_por,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getByEstado(estado) {
    const { data, error } = await supabase
      .from('conglomerado')
      .select(`
        *,
        departamentos (nombre, codigo),
        brigada:brigada!conglomerado_id (id, nombre, estado)
      `)
      .eq('estado', estado)
      .order('created_at', { ascending: false});
    
    if (error) throw error;
    return data || [];
  }

  static async getDisponibles() {
    const { data, error } = await supabase
      .from('conglomerado')
      .select(`
        *,
        departamentos (nombre, codigo)
      `)
      .eq('estado', 'aprobado')
      .is('brigada', null)
      .order('created_at', { ascending: false});
    
    if (error) throw error;
    return data || [];
  }

  static async getByDepartamento(departamento_id) {
    const { data, error } = await supabase
      .from('conglomerado')
      .select(`
        *,
        departamentos (nombre, codigo),
        brigada:brigada!conglomerado_id (id, nombre, estado)
      `)
      .eq('departamento_id', departamento_id)
      .eq('estado', 'aprobado')
      .order('created_at', { ascending: false});
    
    if (error) throw error;
    return data || [];
  }

  static async delete(id) {
    const { error } = await supabase
      .from('conglomerado')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  static async contarPorEstado(estado) {
    const { count, error } = await supabase
      .from('conglomerado')
      .select('*', { count: 'exact', head: true })
      .eq('estado', estado);
    
    if (error) throw error;
    return count || 0;
  }

  static async getEstadisticas() {
    const pendientes = await this.contarPorEstado('pendiente');
    const aprobados = await this.contarPorEstado('aprobado');
    const rechazados = await this.contarPorEstado('rechazado');

    return {
      pendientes,
      aprobados,
      rechazados,
      total: pendientes + aprobados + rechazados
    };
  }
}

export default ConglomeradosModel;