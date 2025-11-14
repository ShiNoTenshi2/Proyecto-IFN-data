// brigadas-service/models/subparcelasModel.js
import supabase from '../config/database.js';

class SubparcelasModel {
  
  static async createForConglomerado(conglomerado_id, lat_centro, lon_centro) {
    const distancia = 0.0009; // ~100 metros
    
    const subparcelas = [
      {
        conglomerado_fk: conglomerado_id,
        codigo_subparcela: `${conglomerado_id}-CENTRO`,
        lat: lat_centro,
        lon: lon_centro,
        direccion: 'centro'
      },
      {
        conglomerado_fk: conglomerado_id,
        codigo_subparcela: `${conglomerado_id}-NORTE`,
        lat: parseFloat(lat_centro) + distancia,
        lon: lon_centro,
        direccion: 'norte'
      },
      {
        conglomerado_fk: conglomerado_id,
        codigo_subparcela: `${conglomerado_id}-SUR`,
        lat: parseFloat(lat_centro) - distancia,
        lon: lon_centro,
        direccion: 'sur'
      },
      {
        conglomerado_fk: conglomerado_id,
        codigo_subparcela: `${conglomerado_id}-ORIENTE`,
        lat: lat_centro,
        lon: parseFloat(lon_centro) + distancia,
        direccion: 'oriente'
      },
      {
        conglomerado_fk: conglomerado_id,
        codigo_subparcela: `${conglomerado_id}-OCCIDENTE`,
        lat: lat_centro,
        lon: parseFloat(lon_centro) - distancia,
        direccion: 'occidente'
      }
    ];

    const { data, error } = await supabase
      .from('subparcela')
      .insert(subparcelas)
      .select();
    
    if (error) throw error;
    return data || [];
  }

  static async getByConglomerado(conglomerado_id) {
    const { data, error } = await supabase
      .from('subparcela')
      .select('*')
      .eq('conglomerado_fk', conglomerado_id)
      .order('direccion', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('subparcela')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('subparcela')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('subparcela')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}

export default SubparcelasModel;