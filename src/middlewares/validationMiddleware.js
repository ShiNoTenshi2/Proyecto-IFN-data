// brigadas-service/middlewares/validationMiddleware.js

/**
 * Middleware: Validar campos requeridos
 */
export const validateRequired = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        campos_faltantes: missingFields
      });
    }

    next();
  };
};

/**
 * Middleware: Validar email
 */
export const validateEmail = (req, res, next) => {
  const { correo } = req.body;

  if (!correo) {
    return next();
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  next();
};

/**
 * Middleware: Validar cédula colombiana
 */
export const validateCedula = (req, res, next) => {
  const { cedula } = req.body;

  if (!cedula) {
    return next();
  }

  const cedulaRegex = /^\d{6,12}$/;

  if (!cedulaRegex.test(cedula)) {
    return res.status(400).json({ 
      error: 'Cédula inválida. Debe tener entre 6 y 12 dígitos numéricos' 
    });
  }

  next();
};

/**
 * Middleware: Validar teléfono colombiano
 */
export const validateTelefono = (req, res, next) => {
  const { telefono } = req.body;

  if (!telefono) {
    return next();
  }

  const telefonoRegex = /^3\d{9}$/;

  if (!telefonoRegex.test(telefono)) {
    return res.status(400).json({ 
      error: 'Teléfono inválido. Debe tener 10 dígitos y empezar con 3' 
    });
  }

  next();
};

/**
 * Middleware: Validar UUID
 */
export const validateUUID = (paramName = 'id') => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(uuid)) {
      return res.status(400).json({ error: `${paramName} inválido` });
    }

    next();
  };
};