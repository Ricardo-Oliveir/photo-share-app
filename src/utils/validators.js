// src/utils/validators.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
export function validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push("A senha deve ter pelo menos 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("A senha deve conter pelo menos uma letra maiúscula");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("A senha deve conter pelo menos uma letra minúscula");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("A senha deve conter pelo menos um número");
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validate name (at least 3 characters)
 * @param {string} name - Name to validate
 * @returns {boolean}
 */
export function validateName(name) {
    return name && name.trim().length >= 3;
}

/**
 * Validate form (email, password, passwordConfirm, name)
 * @param {object} formData - { email, password, passwordConfirm, name }
 * @returns {object} - { isValid: boolean, errors: object }
 */
export function validateForm(formData) {
    const errors = {};

    // Validate email
    if (!formData.email) {
        errors.email = "Email é obrigatório";
    } else if (!validateEmail(formData.email)) {
        errors.email = "Email inválido";
    }

    // Validate name
    if (!formData.name) {
        errors.name = "Nome é obrigatório";
    } else if (!validateName(formData.name)) {
        errors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    // Validate password
    if (!formData.password) {
        errors.password = "Senha é obrigatória";
    } else {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            errors.password = passwordValidation.errors.join("; ");
        }
    }

    // Validate password confirmation
    if (formData.passwordConfirm !== undefined) {
        if (!formData.passwordConfirm) {
            errors.passwordConfirm = "Confirmação de senha é obrigatória";
        } else if (formData.password !== formData.passwordConfirm) {
            errors.passwordConfirm = "As senhas não conferem";
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}
