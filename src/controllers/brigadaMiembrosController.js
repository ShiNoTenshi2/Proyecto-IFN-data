// brigadas-service/controllers/brigadaMiembrosController.js
import BrigadaMiembrosModel from '../models/brigadaMiembrosModel.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class BrigadaMiembrosController {

  // GET /api/brigadistas
  static async getAll(_req, res) {
    try {
      const brigadistas = await BrigadaMiembrosModel.getAll();
      res.json(brigadistas);
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/brigadistas/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const brigadista = await BrigadaMiembrosModel.getById(id);
      
      if (!brigadista) {
        return res.status(404).json({ error: 'Brigadista no encontrado' });
      }
      
      res.json(brigadista);
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/brigadistas/disponibles
  static async getDisponibles(req, res) {
    try {
      const { departamento_id } = req.query;
      const brigadistas = await BrigadaMiembrosModel.getDisponibles(departamento_id);
      res.json(brigadistas);
    } catch (error) {
      console.error('Error en getDisponibles:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/brigadistas/departamento/:departamento_id
  static async getByDepartamento(req, res) {
    try {
      const { departamento_id } = req.params;
      const brigadistas = await BrigadaMiembrosModel.getByDepartamento(departamento_id);
      res.json(brigadistas);
    } catch (error) {
      console.error('Error en getByDepartamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/brigadistas/invitar
  static async invitar(req, res) {
    try {
      const { correo } = req.body;

      if (!correo) {
        return res.status(400).json({ error: 'Correo es requerido' });
      }

      // Verificar que el correo no exista
      const existe = await BrigadaMiembrosModel.getByEmail(correo);
      if (existe) {
        return res.status(409).json({ error: 'El correo ya está registrado' });
      }

      // Enviar invitación por email con Supabase
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(correo, {
        data: { 
          tipo_usuario: 'brigadista',
          invited: true 
        },
        redirectTo: `${process.env.FRONTEND_URL}/brigadista/completar-registro`
      });

      if (error) {
        return res.status(400).json({ 
          error: 'Error enviando invitación', 
          detalles: error.message 
        });
      }

      res.json({ 
        message: 'Invitación enviada exitosamente',
        email: correo,
        userId: data.user?.id
      });

    } catch (error) {
      console.error('Error en invitar:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/brigadistas/registro
  static async completarRegistro(req, res) {
    try {
      const { cedula, nombre, correo, telefono, departamento_id, titulos, experiencia_laboral } = req.body;

      // Validar campos requeridos
      if (!cedula || !nombre || !correo || !departamento_id) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos: cedula, nombre, correo, departamento_id' 
        });
      }

      // Verificar que la cédula no exista
      const cedulaExiste = await BrigadaMiembrosModel.getByCedula(cedula);
      if (cedulaExiste) {
        return res.status(409).json({ error: 'La cédula ya está registrada' });
      }

      // Verificar que el correo no exista
      const correoExiste = await BrigadaMiembrosModel.getByEmail(correo);
      if (correoExiste) {
        return res.status(409).json({ error: 'El correo ya está registrado' });
      }

      // Crear brigadista
      const brigadista = await BrigadaMiembrosModel.create({
        cedula,
        nombre,
        correo,
        telefono: telefono || null,
        departamento_id,
        titulos: titulos || [],
        experiencia_laboral: experiencia_laboral || []
      });

      res.status(201).json({
        message: 'Registro completado exitosamente',
        brigadista
      });

    } catch (error) {
      console.error('Error en completarRegistro:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/brigadistas/:id
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // No permitir actualizar ciertos campos
      delete updates.id;
      delete updates.cedula;
      delete updates.correo;
      delete updates.created_at;

      const brigadista = await BrigadaMiembrosModel.getById(id);
      if (!brigadista) {
        return res.status(404).json({ error: 'Brigadista no encontrado' });
      }

      const brigadistaActualizado = await BrigadaMiembrosModel.update(id, updates);

      res.json({
        message: 'Brigadista actualizado exitosamente',
        brigadista: brigadistaActualizado
      });

    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/brigadistas/:id/suspender
  static async suspend(req, res) {
    try {
      const { id } = req.params;

      const brigadista = await BrigadaMiembrosModel.getById(id);
      if (!brigadista) {
        return res.status(404).json({ error: 'Brigadista no encontrado' });
      }

      if (brigadista.estado === 'suspendido') {
        return res.status(400).json({ error: 'El brigadista ya está suspendido' });
      }

      const brigadistaSuspendido = await BrigadaMiembrosModel.suspend(id);

      res.json({
        message: 'Brigadista suspendido exitosamente',
        brigadista: brigadistaSuspendido
      });

    } catch (error) {
      console.error('Error en suspend:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/brigadistas/:id/activar
  static async activate(req, res) {
    try {
      const { id } = req.params;

      const brigadista = await BrigadaMiembrosModel.getById(id);
      if (!brigadista) {
        return res.status(404).json({ error: 'Brigadista no encontrado' });
      }

      if (brigadista.estado === 'activo') {
        return res.status(400).json({ error: 'El brigadista ya está activo' });
      }

      const brigadistaActivado = await BrigadaMiembrosModel.activate(id);

      res.json({
        message: 'Brigadista activado exitosamente',
        brigadista: brigadistaActivado
      });

    } catch (error) {
      console.error('Error en activate:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/brigadistas/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const brigadista = await BrigadaMiembrosModel.getById(id);
      if (!brigadista) {
        return res.status(404).json({ error: 'Brigadista no encontrado' });
      }

      // Solo eliminar si ya está suspendido
      if (brigadista.estado !== 'suspendido') {
        return res.status(400).json({ 
          error: 'Solo se pueden eliminar brigadistas suspendidos',
          sugerencia: 'Primero suspende el brigadista con PUT /:id/suspender'
        });
      }

      await BrigadaMiembrosModel.delete(id);

      res.json({ message: 'Brigadista eliminado permanentemente' });

    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default BrigadaMiembrosController;