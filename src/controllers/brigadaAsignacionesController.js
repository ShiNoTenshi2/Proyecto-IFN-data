// brigadas-service/controllers/brigadaAsignacionesController.js
import BrigadaAsignacionesModel from '../models/brigadaAsignacionesModel.js';
import BrigadaMiembrosModel from '../models/brigadaMiembrosModel.js';
import BrigadasModel from '../models/brigadasModel.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class BrigadaAsignacionesController {

  // POST /api/asignaciones/invitar
  static async asignar(req, res) {
    try {
      const { brigada_id, miembro_id } = req.body;

      if (!brigada_id || !miembro_id) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos: brigada_id, miembro_id' 
        });
      }

      // Verificar que la brigada existe
      const brigada = await BrigadasModel.getById(brigada_id);
      if (!brigada) {
        return res.status(404).json({ error: 'Brigada no encontrada' });
      }

      // Verificar que el brigadista existe
      const miembro = await BrigadaMiembrosModel.getById(miembro_id);
      if (!miembro) {
        return res.status(404).json({ error: 'Brigadista no encontrado' });
      }

      // Verificar que no esté ya asignado
      const existe = await BrigadaAsignacionesModel.existeAsignacion(brigada_id, miembro_id);
      if (existe) {
        return res.status(409).json({ 
          error: 'El brigadista ya está asignado a esta brigada' 
        });
      }

      // Crear asignación
      const asignacion = await BrigadaAsignacionesModel.asignar(brigada_id, miembro_id);

      // Enviar email de invitación
      try {
        await supabase.auth.admin.inviteUserByEmail(miembro.correo, {
          data: {
            brigada_nombre: brigada.nombre,
            brigada_id: brigada.id,
            tipo_notificacion: 'invitacion_brigada'
          }
        });
      } catch (emailError) {
        console.warn('⚠️ Error enviando invitación:', emailError.message);
      }

      res.status(201).json({
        message: 'Brigadista invitado exitosamente',
        asignacion
      });

    } catch (error) {
      console.error('Error en asignar:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/asignaciones/:brigada_id/:miembro_id/responder
  static async responder(req, res) {
    try {
      const { brigada_id, miembro_id } = req.params;
      const { aceptada, motivo_rechazo } = req.body;

      if (typeof aceptada !== 'boolean') {
        return res.status(400).json({ 
          error: 'El campo aceptada debe ser true o false' 
        });
      }

      if (!aceptada && !motivo_rechazo) {
        return res.status(400).json({ 
          error: 'Debes proporcionar un motivo al rechazar la invitación' 
        });
      }

      // Verificar que existe la asignación
      const existe = await BrigadaAsignacionesModel.existeAsignacion(brigada_id, miembro_id);
      if (!existe) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      // Responder
      const resultado = await BrigadaAsignacionesModel.responder(
        brigada_id,
        miembro_id,
        aceptada,
        motivo_rechazo
      );

      res.json({
        message: aceptada ? 'Invitación aceptada' : 'Invitación rechazada',
        asignacion: resultado
      });

    } catch (error) {
      console.error('Error en responder:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/asignaciones/:brigada_id/:miembro_id
  static async desasignar(req, res) {
    try {
      const { brigada_id, miembro_id } = req.params;

      const existe = await BrigadaAsignacionesModel.existeAsignacion(brigada_id, miembro_id);
      if (!existe) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      await BrigadaAsignacionesModel.desasignar(brigada_id, miembro_id);

      res.json({ message: 'Brigadista desasignado exitosamente' });

    } catch (error) {
      console.error('Error en desasignar:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/asignaciones/brigada/:brigada_id
  static async getByBrigada(req, res) {
    try {
      const { brigada_id } = req.params;
      const asignaciones = await BrigadaAsignacionesModel.getByBrigada(brigada_id);
      res.json(asignaciones);
    } catch (error) {
      console.error('Error en getByBrigada:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/asignaciones/miembro/:miembro_id
  static async getByMiembro(req, res) {
    try {
      const { miembro_id } = req.params;
      const asignaciones = await BrigadaAsignacionesModel.getByMiembro(miembro_id);
      res.json(asignaciones);
    } catch (error) {
      console.error('Error en getByMiembro:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/asignaciones/pendientes/:miembro_id
  static async getPendientesByMiembro(req, res) {
    try {
      const { miembro_id } = req.params;
      const invitaciones = await BrigadaAsignacionesModel.getPendientesByMiembro(miembro_id);
      res.json(invitaciones);
    } catch (error) {
      console.error('Error en getPendientesByMiembro:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default BrigadaAsignacionesController;