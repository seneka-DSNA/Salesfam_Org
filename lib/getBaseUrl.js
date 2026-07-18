export const getBaseUrl = () => {
  // 1. Navegador (cliente): Rutas relativas.
  // El navegador ya sabe en qué URL está, así que esto evita el CORS al 100%.
  if (typeof window !== "undefined") {
    return "";
  }

  // 2. Servidor en Vercel: Usamos la URL dinámica que Vercel inyecta en cada despliegue.
  // ES VITAL añadir el "https://" usando backticks (plantillas de cadena).
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Fallback para tu servidor local
  return "http://localhost:8081";
};