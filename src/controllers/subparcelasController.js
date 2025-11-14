// brigadas-service/controllers/subparcelasController.js
import SubparcelasModel from '../models/subparcelasModel.js';

class SubparcelasController {

  // GET /api/subparcelas/conglomerado/:conglomerado_id
  static async getByConglomerado(req, res) {
    try {
      const { conglomerado_id } = req.params;
      const subparcelas = await SubparcelasModel.getByConglomerado(conglomerado_id);
      res.json(subparcelas);
    } catch (error) {
      console.error('Error en getByConglomerado:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/subparcelas/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const subparcela = await SubparcelasModel.getById(id);
      
      if (!subparcela) {
        return res.status(404).json({ error: 'Subparcela no encontrada' });
      }

      res.json(subparcela);
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/subparcelas/:id
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // No permitir actualizar ciertos campos
      delete updates.id;
      delete updates.conglomerado_fk;
      delete updates.created_at;

      const subparcela = await SubparcelasModel.getById(id);
      if (!subparcela) {
        return res.status(404).json({ error: 'Subparcela no encontrada' });
      }

      const subparcelaActualizada = await SubparcelasModel.update(id, updates);

      res.json({
        message: 'Subparcela actualizada exitosamente',
        subparcela: subparcelaActualizada
      });

    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/subparcelas/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const subparcela = await SubparcelasModel.getById(id);
      if (!subparcela) {
        return res.status(404).json({ error: 'Subparcela no encontrada' });
      }

      await SubparcelasModel.delete(id);

      res.json({ message: 'Subparcela eliminada exitosamente' });

    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default SubparcelasController;