export const getBaseUrl = () => {
  // 1. LA MAGIA ESTÁ AQUÍ: Si estamos en el navegador (cliente), devolvemos "".
  // Esto hace que las llamadas sean relativas (ej: fetch("/api/user")) 
  // y elimina los errores de CORS para siempre.
  if (typeof window !== "undefined") {
    return "";
  }

  // 2. Si estamos en el servidor de Vercel (Producción real).
  // Nota: Vercel inyecta la variable VERCEL_URL automáticamente, no tienes que crearla tú.
  if (process.env.VERCEL_URL) {
    return "https://salesfam.com";
  }

  // 3. Fallback para tu servidor local (tanto npm run dev como npm run preview)
  return "http://localhost:8081";
}