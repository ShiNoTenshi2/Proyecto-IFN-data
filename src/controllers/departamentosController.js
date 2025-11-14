// brigadas-service/controllers/departamentosController.js
import DepartamentosModel from '../models/departamentosModel.js';

class DepartamentosController {

  // GET /api/departamentos
  static async getAll(_req, res) {
    try {
      const departamentos = await DepartamentosModel.getAll();
      res.json(departamentos);
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/departamentos/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const departamento = await DepartamentosModel.getById(id);
      
      if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
      }

      res.json(departamento);
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/departamentos/codigo/:codigo
  static async getByCodigo(req, res) {
    try {
      const { codigo } = req.params;
      const departamento = await DepartamentosModel.getByCodigo(codigo);
      
      if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
      }

      res.json(departamento);
    } catch (error) {
      console.error('Error en getByCodigo:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default DepartamentosController;