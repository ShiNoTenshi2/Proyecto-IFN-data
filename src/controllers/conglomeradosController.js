// brigadas-service/controllers/conglomeradosController.js
import ConglomeradosModel from '../models/conglomeradosModel.js';
import SubparcelasModel from '../models/subparcelasModel.js';
import { generateConglomeradoCode, generateRandomCoordinates } from '../utils/generateCode.js';

class ConglomeradosController {

  // GET /api/conglomerados
  static async getAll(_req, res) {
    try {
      const conglomerados = await ConglomeradosModel.getAll();
      res.json(conglomerados);
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/conglomerados/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const conglomerado = await ConglomeradosModel.getById(id);
      
      if (!conglomerado) {
        return res.status(404).json({ error: 'Conglomerado no encontrado' });
      }

      // Obtener subparcelas
      const subparcelas = await SubparcelasModel.getByConglomerado(id);
      
      res.json({
        ...conglomerado,
        subparcelas
      });
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/conglomerados/generar
  static async generar(req, res) {
    try {
      const { cantidad } = req.body;

      if (!cantidad || cantidad < 1 || cantidad > 100) {
        return res.status(400).json({ 
          error: 'Cantidad inválida. Debe estar entre 1 y 100' 
        });
      }

      const conglomerados = [];
      
      for (let i = 0; i < cantidad; i++) {
        const codigo = generateConglomeradoCode();
        const { latitud, longitud } = generateRandomCoordinates();
        
        conglomerados.push({
          codigo,
          lat: latitud,
          lon: longitud
        });
      }

      // Crear conglomerados en batch
      const conglomeradosCreados = await ConglomeradosModel.createBatch(conglomerados);

      // Crear subparcelas para cada conglomerado
      for (const cong of conglomeradosCreados) {
        await SubparcelasModel.createForConglomerado(cong.id, cong.lat, cong.lon);
      }

      res.status(201).json({
        message: `${cantidad} conglomerados generados exitosamente`,
        conglomerados: conglomeradosCreados
      });

    } catch (error) {
      console.error('Error en generar:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/conglomerados/:id/aprobar
  static async aprobar(req, res) {
    try {
      const { id } = req.params;
      const { departamento_id, asignado_por } = req.body;

      if (!departamento_id || !asignado_por) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos: departamento_id, asignado_por' 
        });
      }

      const conglomerado = await ConglomeradosModel.getById(id);
      if (!conglomerado) {
        return res.status(404).json({ error: 'Conglomerado no encontrado' });
      }

      if (conglomerado.estado !== 'pendiente') {
        return res.status(400).json({ 
          error: `No se puede aprobar un conglomerado con estado: ${conglomerado.estado}` 
        });
      }

      const conglomeradoAprobado = await ConglomeradosModel.aprobar(
        id, 
        departamento_id, 
        asignado_por
      );

      res.json({
        message: 'Conglomerado aprobado exitosamente',
        conglomerado: conglomeradoAprobado
      });

    } catch (error) {
      console.error('Error en aprobar:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/conglomerados/:id/rechazar
  static async rechazar(req, res) {
    try {
      const { id } = req.params;
      const { razon, asignado_por } = req.body;

      if (!razon || !asignado_por) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos: razon, asignado_por' 
        });
      }

      const conglomerado = await ConglomeradosModel.getById(id);
      if (!conglomerado) {
        return res.status(404).json({ error: 'Conglomerado no encontrado' });
      }

      if (conglomerado.estado !== 'pendiente') {
        return res.status(400).json({ 
          error: `No se puede rechazar un conglomerado con estado: ${conglomerado.estado}` 
        });
      }

      const conglomeradoRechazado = await ConglomeradosModel.rechazar(
        id, 
        razon, 
        asignado_por
      );

      res.json({
        message: 'Conglomerado rechazado',
        conglomerado: conglomeradoRechazado
      });

    } catch (error) {
      console.error('Error en rechazar:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/conglomerados/estado/:estado
  static async getByEstado(req, res) {
    try {
      const { estado } = req.params;
      
      const estadosValidos = ['pendiente', 'aprobado', 'rechazado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      const conglomerados = await ConglomeradosModel.getByEstado(estado);
      res.json(conglomerados);

    } catch (error) {
      console.error('Error en getByEstado:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/conglomerados/disponibles
  static async getDisponibles(_req, res) {
    try {
      const conglomerados = await ConglomeradosModel.getDisponibles();
      res.json(conglomerados);
    } catch (error) {
      console.error('Error en getDisponibles:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/conglomerados/departamento/:departamento_id
  static async getByDepartamento(req, res) {
    try {
      const { departamento_id } = req.params;
      const conglomerados = await ConglomeradosModel.getByDepartamento(departamento_id);
      res.json(conglomerados);
    } catch (error) {
      console.error('Error en getByDepartamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/conglomerados/estadisticas
  static async getEstadisticas(_req, res) {
    try {
      const estadisticas = await ConglomeradosModel.getEstadisticas();
      res.json(estadisticas);
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/conglomerados/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const conglomerado = await ConglomeradosModel.getById(id);
      if (!conglomerado) {
        return res.status(404).json({ error: 'Conglomerado no encontrado' });
      }

      // No permitir eliminar si tiene brigada asignada
      if (conglomerado.brigada && conglomerado.brigada.length > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar un conglomerado con brigada asignada' 
        });
      }

      await ConglomeradosModel.delete(id);

      res.json({ message: 'Conglomerado eliminado exitosamente' });

    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default ConglomeradosController;