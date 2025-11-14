// brigadas-service/models/departamentosModel.js
import supabase from '../config/database.js';

class DepartamentosModel {
  
  static async getAll() {
    const { data, error } = await supabase
      .from('departamentos')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('departamentos')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async getByCodigo(codigo) {
    const { data, error } = await supabase
      .from('departamentos')
      .select('*')
      .eq('codigo', codigo)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
}

export default DepartamentosModel;