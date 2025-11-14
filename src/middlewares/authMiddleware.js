// brigadas-service/middlewares/authMiddleware.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Middleware: Verificar que el usuario está autenticado
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en requireAuth:', error);
    res.status(500).json({ error: 'Error verificando autenticación' });
  }
};

/**
 * Middleware: Verificar rol específico
 */
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const userRole = req.user.user_metadata?.rol;

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'No tienes permisos para realizar esta acción',
          rol_requerido: allowedRoles,
          tu_rol: userRole || 'ninguno'
        });
      }

      next();
    } catch (error) {
      console.error('Error en requireRole:', error);
      res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
};

/**
 * Middleware: Solo AdminPro
 */
export const requireAdminPro = requireRole('AdminPro');

/**
 * Middleware: AdminPro o AdminBrigadas
 */
export const requireAdminBrigadas = requireRole('AdminPro', 'AdminBrigadas');

/**
 * Middleware: Brigadista (o superior)
 */
export const requireBrigadista = requireRole('AdminPro', 'AdminBrigadas', 'Brigadista');