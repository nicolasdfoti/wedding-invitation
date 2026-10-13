export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateRequired(value) {
  return value !== undefined && value !== null && value.toString().trim() !== '';
}

export function validateMinLength(value, min) {
  return value.toString().trim().length >= min;
}

export function validateMaxLength(value, max) {
  return value.toString().trim().length <= max;
}

export function validateName(name) {
  const errors = [];
  if (!validateRequired(name)) {
    errors.push('El nombre es obligatorio');
  } else if (!validateMinLength(name, 2)) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  } else if (!validateMaxLength(name, 100)) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }
  return errors;
}

export function validateAttendance(attendance) {
  const validOptions = ['true', 'false'];
  if (!validateRequired(attendance)) {
    return ['Debes seleccionar una opción'];
  }
  if (!validOptions.includes(attendance)) {
    return ['Opción de asistencia inválida'];
  }
  return [];
}

export function validateMessage(message) {
  const errors = [];
  if (message && !validateMaxLength(message, 500)) {
    errors.push('El mensaje no puede exceder 500 caracteres');
  }
  return errors;
}

export function validateCantidadPersonas(cantidad) {
  const errors = [];
  if (!validateRequired(cantidad)) {
    errors.push('La cantidad de personas es obligatoria');
  } else {
    const num = Number(cantidad);
    if (isNaN(num) || !Number.isInteger(num)) {
      errors.push('La cantidad debe ser un número entero');
    } else if (num < 1) {
      errors.push('Debe haber al menos 1 persona');
    } else if (num > 20) {
      errors.push('La cantidad máxima es 20 personas');
    }
  }
  return errors;
}

export function validateRestricciones(restricciones) {
  const errors = [];
  if (restricciones && !validateMaxLength(restricciones, 500)) {
    errors.push('Las restricciones no pueden exceder 500 caracteres');
  }
  return errors;
}

export function validateRSVPForm(formData) {
  const errors = {
    nombre: validateName(formData.nombre),
    cantidadPersonas: validateCantidadPersonas(formData.cantidadPersonas),
    asistencia: validateAttendance(formData.asistencia),
    restricciones: validateRestricciones(formData.restricciones),
    mensaje: validateMessage(formData.mensaje),
  };

  const hasErrors = Object.values(errors).some(arr => arr.length > 0);
  return { errors, hasErrors, isValid: !hasErrors };
}

export function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}