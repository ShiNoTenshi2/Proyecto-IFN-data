// brigadas-service/controllers/brigadasController.js
import BrigadasModel from '../models/brigadasModel.js';
import ConglomeradosModel from '../models/conglomeradosModel.js';

class BrigadasController {

  // GET /api/brigadas
  static async getAll(_req, res) {
    try {
      const brigadas = await BrigadasModel.getAll();
      res.json(brigadas);
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/brigadas/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const brigada = await BrigadasModel.getConMiembros(id);
      
      if (!brigada) {
        return res.status(404).json({ error: 'Brigada no encontrada' });
      }
      
      res.json(brigada);
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/brigadas/estado/:estado
  static async getByEstado(req, res) {
    try {
      const { estado } = req.params;
      
      const estadosValidos = ['formacion', 'activa', 'completada', 'cancelada'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
          error: 'Estado inválido',
          estados_validos: estadosValidos
        });
      }
      
      const brigadas = await BrigadasModel.getByEstado(estado);
      res.json(brigadas);
    } catch (error) {
      console.error('Error en getByEstado:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/brigadas
  static async create(req, res) {
    try {
      const { nombre, conglomerado_id, fecha_inicio, fecha_fin, creado_por } = req.body;

      // Validar campos requeridos
      if (!nombre || !conglomerado_id || !creado_por) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos: nombre, conglomerado_id, creado_por' 
        });
      }

      // Verificar que el conglomerado existe y está disponible
      const conglomerado = await ConglomeradosModel.getById(conglomerado_id);
      if (!conglomerado) {
        return res.status(404).json({ error: 'Conglomerado no encontrado' });
      }

      if (conglomerado.estado !== 'aprobado') {
        return res.status(400).json({ 
          error: 'El conglomerado debe estar aprobado para crear una brigada',
          estado_actual: conglomerado.estado
        });
      }

      // Verificar que no tenga brigada asignada
      if (conglomerado.brigada && conglomerado.brigada.length > 0) {
        return res.status(400).json({ 
          error: 'El conglomerado ya tiene una brigada asignada' 
        });
      }

      // Crear brigada
      const brigada = await BrigadasModel.create({
        nombre,
        conglomerado_id,
        fecha_inicio,
        fecha_fin,
        creado_por
      });

      res.status(201).json({
        message: 'Brigada creada exitosamente',
        brigada
      });

    } catch (error) {
      console.error('Error en create:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/brigadas/:id
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // No permitir actualizar ciertos campos
      delete updates.id;
      delete updates.conglomerado_id;
      delete updates.creado_por;
      delete updates.created_at;

      const brigada = await BrigadasModel.getById(id);
      if (!brigada) {
        return res.status(404).json({ error: 'Brigada no encontrada' });
      }

      const brigadaActualizada = await BrigadasModel.update(id, updates);

      res.json({
        message: 'Brigada actualizada exitosamente',
        brigada: brigadaActualizada
      });

    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/brigadas/:id/estado
  static async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const estadosValidos = ['formacion', 'activa', 'completada', 'cancelada'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
          error: 'Estado inválido. Valores permitidos: formacion, activa, completada, cancelada' 
        });
      }

      const brigada = await BrigadasModel.getById(id);
      if (!brigada) {
        return res.status(404).json({ error: 'Brigada no encontrada' });
      }

      const brigadaActualizada = await BrigadasModel.cambiarEstado(id, estado);

      res.json({
        message: `Brigada cambiada a estado: ${estado}`,
        brigada: brigadaActualizada
      });

    } catch (error) {
      console.error('Error en cambiarEstado:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/brigadas/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const brigada = await BrigadasModel.getById(id);
      if (!brigada) {
        return res.status(404).json({ error: 'Brigada no encontrada' });
      }

      // Solo eliminar si está cancelada
      if (brigada.estado !== 'cancelada') {
        return res.status(400).json({ 
          error: 'Solo se pueden eliminar brigadas canceladas',
          sugerencia: 'Cambia el estado a cancelada primero'
        });
      }

      await BrigadasModel.delete(id);

      res.json({ message: 'Brigada eliminada exitosamente' });

    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default BrigadasController;