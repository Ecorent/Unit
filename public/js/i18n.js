export const translations = {
  en: {
    home: "Home",
    map: "Interactive map",
    maintenance: "Maintenance Requests",
    profile: "Profile",
    logout: "Log out",
    language: "Language",
    view_map: "View Map",
    map_text: "Discover available apartments near you using our interactive rental map service",
    footer: "© 2026 Ecorentusa. All rights reserved.",
    location: "Location & Directions",
    contacto: "Contact Us",
    mensaje: "Send Message",
    name_placeholder: "Full Name",
    email_placeholder: "Email",
    phone_placeholder: "Phone Number",
    message_placeholder: "Message",
    welcome_message: "Welcome to Ecorentusa",
    login: "Log In",
    signup: "Sign Up",
    login_with_google: "Log in with Google",
    signup_with_google: "Sign up with Google",
    or: "or",
    forgot_password: "Forgot my password",
    password_placeholder: "Password",
    view_details: "View Details",
    per_month: "month",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    pet_friendly: "Pet friendly",
    no_pets: "No pets allowed",
    login_subtext_login: "Log in to manage your account, access your rentals, and continue where you left off.",
    login_subtext_signup: "Create an account to start renting, manage your listings, and track your activity.",
    reset_title: "Reset your password",
    reset_subtext: "Enter the email associated with your account and we’ll send you a password reset link.",
    reset_send: "Send reset link",
    back_to_login: "Back to login",
    reset_email_sent: "If an account with that email exists, a password reset link has been sent.",
    reset_error: "Something went wrong. Please try again.",
    contact_success: "Thank you! Your inquiry has been sent.",
    google_auth_failed: "Google sign-in failed. Please try again.",
    email_already_in_use: "An account with this email already exists.",
    weak_password: "Password should be at least 6 characters.",
    signup_failed: "Sign up failed. Please try again.",
    invalid_login: "Invalid email or password.",
    sqft_unit: "sqft",
    available_now: "Available now!",
    available_from: "Available from",
    security_deposit_required: "Security deposit of {{amount}} required",
    security_deposit_not_required: "No security deposit required",
  },

  es: {
    home: "Inicio",
    map: "Mapa interactivo",
    maintenance: "Solicitudes de mantenimiento",
    profile: "Perfil",
    logout: "Cerrar sesión",
    language: "Idioma",
    view_map: "Ver mapa",
    map_text: "Descubre unidades disponibles cerca de ti utilizando nuestro mapa interactivo",
    footer: "© 2026 Ecorentusa. Todos los derechos reservados.",
    location: "Ubicación y direcciones",
    contacto: "Contáctanos",
    mensaje: "Enviar mensaje",
    name_placeholder: "Nombre completo",
    email_placeholder: "Correo electrónico",
    phone_placeholder: "Número de teléfono",
    message_placeholder: "Mensaje",
    welcome_message: "Bienvenido a Ecorentusa",
    login: "Iniciar sesión",
    signup: "Regístrate",
    login_with_google: "Iniciar sesión con Google",
    signup_with_google: "Regístrate con Google",
    or: "o",
    forgot_password: "Olvidé mi contraseña",
    password_placeholder: "Contraseña",
    view_details: "Ver detalles",
    per_month: "mes",
    bedrooms: "Habitaciones",
    bathrooms: "Baños",
    pet_friendly: "Se permiten mascotas",
    no_pets: "No se permiten mascotas",
    login_subtext_login: "Inicia sesión para administrar tu cuenta, acceder a tus rentas y continuar donde lo dejaste.",
    login_subtext_signup: "Crea una cuenta para comenzar a rentar, administrar tus propiedades y rastrear tu actividad.",
    reset_title: "Restablecer contraseña",
    reset_subtext: "Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.",
    reset_send: "Enviar enlace de restablecimiento",
    back_to_login: "Volver al inicio de sesión",
    reset_email_sent: "Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.",
    reset_error: "Algo salió mal. Inténtalo de nuevo.",
    contact_success: "¡Gracias! Tu mensaje ha sido enviado.",
    google_auth_failed: "El inicio de sesión con Google falló. Inténtalo de nuevo.",
    email_already_in_use: "Ya existe una cuenta con este correo.",
    weak_password: "La contraseña debe tener al menos 6 caracteres.",
    signup_failed: "El registro falló. Por favor intenta de nuevo.",
    invalid_login: "Correo o contraseña incorrectos.",
    sqft_unit: "pies²",
    available_now: "Disponible ahora!",
    available_from: "Disponible desde el",
    security_deposit_required: "Depósito de seguridad de {{amount}} requerido",
    security_deposit_not_required: "No se requiere depósito de seguridad",
  }
};

// Apply translations to DOM
function applyLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang]?.[key]) el.textContent = translations[lang][key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[lang]?.[key]) el.placeholder = translations[lang][key];
  });

  document.documentElement.lang = lang;
}

// Initialize i18n and listen for language changes
export function initI18n() {
  let currentLang = localStorage.getItem("lang") || "en";
  applyLanguage(currentLang);

  window.addEventListener("languageChanged", e => {
    currentLang = e.detail;
    localStorage.setItem("lang", currentLang);
    applyLanguage(currentLang);
  });
}

// Re-apply language on back/forward navigation
window.addEventListener("pageshow", () => {
  const lang = localStorage.getItem("lang") || "en";
  applyLanguage(lang);
});

// Translation helper
export function t(key) {
  const lang = localStorage.getItem("lang") || "en";
  return translations[lang]?.[key] ?? key;
}
