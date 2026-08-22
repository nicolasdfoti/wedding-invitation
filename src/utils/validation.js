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
  const validOptions = ['yes', 'no'];
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

export function validateRSVPForm(formData) {
  const errors = {
    name: validateName(formData.name),
    attendance: validateAttendance(formData.attendance),
    message: validateMessage(formData.message),
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