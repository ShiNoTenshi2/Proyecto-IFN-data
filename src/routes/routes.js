// brigadas-service/routes/routes.js
import express from 'express';

// Controllers
import BrigadaMiembrosController from '../controllers/brigadaMiembrosController.js';
import BrigadasController from '../controllers/brigadasController.js';
import BrigadaAsignacionesController from '../controllers/brigadaAsignacionesController.js';
import ConglomeradosController from '../controllers/conglomeradosController.js';
import SubparcelasController from '../controllers/subparcelasController.js';
import DepartamentosController from '../controllers/departamentosController.js';

// Middlewares
import { 
  requireAuth, 
  requireAdminPro, 
  requireAdminBrigadas,
  requireBrigadista 
} from '../middlewares/authMiddleware.js';
import {
  validateRequired,
  validateEmail,
  validateCedula,
  validateTelefono,
  validateUUID
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

// ==================== BRIGADISTAS ====================
router.get('/brigadistas', 
  requireAuth,
  requireAdminBrigadas,
  BrigadaMiembrosController.getAll
);

router.get('/brigadistas/disponibles',
  requireAuth,
  requireAdminBrigadas,
  BrigadaMiembrosController.getDisponibles
);

router.get('/brigadistas/departamento/:departamento_id',
  requireAuth,
  requireAdminBrigadas,
  validateUUID('departamento_id'),
  BrigadaMiembrosController.getByDepartamento
);

router.get('/brigadistas/:id',
  requireAuth,
  validateUUID('id'),
  BrigadaMiembrosController.getById
);

router.post('/brigadistas/invitar',
  requireAuth,
  requireAdminBrigadas,
  validateRequired(['correo']),
  validateEmail,
  BrigadaMiembrosController.invitar
);

router.post('/brigadistas/registro',
  validateRequired(['cedula', 'nombre', 'correo', 'departamento_id']),
  validateEmail,
  validateCedula,
  validateTelefono,
  BrigadaMiembrosController.completarRegistro
);

router.put('/brigadistas/:id',
  requireAuth,
  validateUUID('id'),
  validateEmail,
  validateCedula,
  validateTelefono,
  BrigadaMiembrosController.update
);

router.put('/brigadistas/:id/suspender',
  requireAuth,
  requireAdminBrigadas,
  validateUUID('id'),
  BrigadaMiembrosController.suspend
);

router.put('/brigadistas/:id/activar',
  requireAuth,
  requireAdminBrigadas,
  validateUUID('id'),
  BrigadaMiembrosController.activate
);

router.delete('/brigadistas/:id',
  requireAuth,
  requireAdminBrigadas,
  validateUUID('id'),
  BrigadaMiembrosController.delete
);

// ==================== BRIGADAS ====================
router.get('/brigadas',
  requireAuth,
  requireAdminBrigadas,
  BrigadasController.getAll
);

router.get('/brigadas/estado/:estado',
  requireAuth,
  requireAdminBrigadas,
  BrigadasController.getByEstado
);

router.get('/brigadas/:id',
  requireAuth,
  validateUUID('id'),
  BrigadasController.getById
);

router.post('/brigadas',
  requireAuth,
  requireAdminBrigadas,
  validateRequired(['nombre', 'conglomerado_id', 'creado_por']),
  BrigadasController.create
);

router.put('/brigadas/:id',
  requireAuth,
  requireAdminBrigadas,
  validateUUID('id'),
  BrigadasController.update
);

router.put('/brigadas/:id/estado',
  requireAuth,
  requireAdminBrigadas,
  validateUUID('id'),
  validateRequired(['estado']),
  BrigadasController.cambiarEstado
);

router.delete('/brigadas/:id',
  requireAuth,
  requireAdminBrigadas,
  validateUUID('id'),
  BrigadasController.delete
);

// ==================== ASIGNACIONES ====================
router.post('/asignaciones/invitar',
  requireAuth,
  requireAdminBrigadas,
  validateRequired(['brigada_id', 'miembro_id']),
  BrigadaAsignacionesController.asignar
);

router.put('/asignaciones/:brigada_id/:miembro_id/responder',
  requireAuth,
  requireBrigadista,
  validateUUID('brigada_id'),
  validateUUID('miembro_id'),
  validateRequired(['aceptada']),
  BrigadaAsignacionesController.responder
);

router.delete('/asignaciones/:brigada_id/:miembro_id',
  requireAuth,
  requireAdminBrigadas,
  validateUUID('brigada_id'),
  validateUUID('miembro_id'),
  BrigadaAsignacionesController.desasignar
);

router.get('/asignaciones/brigada/:brigada_id',
  requireAuth,
  validateUUID('brigada_id'),
  BrigadaAsignacionesController.getByBrigada
);

router.get('/asignaciones/miembro/:miembro_id',
  requireAuth,
  validateUUID('miembro_id'),
  BrigadaAsignacionesController.getByMiembro
);

router.get('/asignaciones/pendientes/:miembro_id',
  requireAuth,
  requireBrigadista,
  validateUUID('miembro_id'),
  BrigadaAsignacionesController.getPendientesByMiembro
);

// ==================== CONGLOMERADOS ====================
router.get('/conglomerados',
  requireAuth,
  requireAdminPro,
  ConglomeradosController.getAll
);

router.get('/conglomerados/estadisticas',
  requireAuth,
  requireAdminPro,
  ConglomeradosController.getEstadisticas
);

router.get('/conglomerados/disponibles',
  requireAuth,
  ConglomeradosController.getDisponibles
);

router.get('/conglomerados/estado/:estado',
  requireAuth,
  requireAdminPro,
  ConglomeradosController.getByEstado
);

router.get('/conglomerados/departamento/:departamento_id',
  requireAuth,
  validateUUID('departamento_id'),
  ConglomeradosController.getByDepartamento
);

router.get('/conglomerados/:id',
  requireAuth,
  validateUUID('id'),
  ConglomeradosController.getById
);

router.post('/conglomerados/generar',
  requireAuth,
  requireAdminPro,
  validateRequired(['cantidad']),
  ConglomeradosController.generar
);

router.put('/conglomerados/:id/aprobar',
  requireAuth,
  requireAdminPro,
  validateUUID('id'),
  validateRequired(['departamento_id', 'asignado_por']),
  ConglomeradosController.aprobar
);

router.put('/conglomerados/:id/rechazar',
  requireAuth,
  requireAdminPro,
  validateUUID('id'),
  validateRequired(['razon', 'asignado_por']),
  ConglomeradosController.rechazar
);

router.delete('/conglomerados/:id',
  requireAuth,
  requireAdminPro,
  validateUUID('id'),
  ConglomeradosController.delete
);

// ==================== SUBPARCELAS ====================
router.get('/subparcelas/conglomerado/:conglomerado_id',
  requireAuth,
  validateUUID('conglomerado_id'),
  SubparcelasController.getByConglomerado
);

router.get('/subparcelas/:id',
  requireAuth,
  validateUUID('id'),
  SubparcelasController.getById
);

router.put('/subparcelas/:id',
  requireAuth,
  requireAdminPro,
  validateUUID('id'),
  SubparcelasController.update
);

router.delete('/subparcelas/:id',
  requireAuth,
  requireAdminPro,
  validateUUID('id'),
  SubparcelasController.delete
);

// ==================== DEPARTAMENTOS ====================
router.get('/departamentos',
  requireAuth,
  DepartamentosController.getAll
);

router.get('/departamentos/:id',
  requireAuth,
  validateUUID('id'),
  DepartamentosController.getById
);

router.get('/departamentos/codigo/:codigo',
  requireAuth,
  DepartamentosController.getByCodigo
);

export default router;