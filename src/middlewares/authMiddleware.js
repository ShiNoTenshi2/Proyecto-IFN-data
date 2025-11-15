// PROYECTO-IFN-DATA/brigadas-service/middlewares/authMiddleware.js
import supabase from '../config/database.js'; 
import authSupabase from '../config/authSupabase.js'; 

/**
 * Middleware para verificar JWT de Supabase
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Token de autenticación requerido' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Token faltante' 
      });
    }

    // ⭐ IMPORTANTE: Validar token contra el proyecto AUTH
    const { data: { user }, error } = await authSupabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('❌ Token inválido:', error?.message);
      return res.status(401).json({ 
        error: 'Token inválido o expirado',
        message: error?.message || 'No se pudo verificar el token'
      });
    }

    console.log('✅ Token válido para usuario:', user.email);

    // ⭐ Obtener datos del usuario desde la BD de AUTH (proyecto AUTH)
    const { data: usuarioData, error: dbError } = await authSupabase
      .from('usuarios')
      .select('id, rol, nombre, correo, estado')
      .eq('correo', user.email)
      .single();

    if (dbError || !usuarioData) {
      console.log('❌ Usuario no encontrado en BD AUTH');
      return res.status(401).json({ 
        error: 'Usuario no encontrado',
        message: 'No existe un usuario registrado con este correo'
      });
    }

    if (usuarioData.estado === 'suspendido') {
      return res.status(403).json({ 
        error: 'Usuario suspendido',
        message: 'Tu cuenta ha sido suspendida'
      });
    }

    console.log('✅ Autenticación exitosa:', usuarioData.rol);

    // Agregar usuario al request
    req.user = {
      id: usuarioData.id,
      email: usuarioData.correo,
      rol: usuarioData.rol,
      nombre: usuarioData.nombre
    };
    
    next();
  } catch (error) {
    console.error('💥 Error en requireAuth:', error);
    return res.status(401).json({ 
      error: 'Error de autenticación',
      message: error.message
    });
  }
};

/**
 * Middleware para verificar que el usuario es AdminPro
 */
export const requireAdminPro = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autorizado',
      message: 'Debe estar autenticado' 
    });
  }

  if (req.user.rol !== 'AdminPro') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Se requiere rol AdminPro',
      rol_actual: req.user.rol
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario es AdminBrigadas
 */
export const requireAdminBrigadas = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autorizado',
      message: 'Debe estar autenticado' 
    });
  }

  if (req.user.rol !== 'AdminBrigadas') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Se requiere rol AdminBrigadas',
      rol_actual: req.user.rol
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario es Brigadista
 */
export const requireBrigadista = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autorizado',
      message: 'Debe estar autenticado' 
    });
  }

  if (req.user.rol !== 'Brigadista') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Se requiere rol Brigadista',
      rol_actual: req.user.rol
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario es Admin (Pro o Brigadas)
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autorizado',
      message: 'Debe estar autenticado' 
    });
  }

  if (!['AdminPro', 'AdminBrigadas'].includes(req.user.rol)) {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Se requiere rol de administrador',
      rol_actual: req.user.rol
    });
  }

  next();
};