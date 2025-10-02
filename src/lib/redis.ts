import { Redis } from '@upstash/redis';

// Función helper para configurar Redis con múltiples opciones de variables de entorno
export function createRedisClient() {
  // Intentar diferentes combinaciones de variables de entorno
  let url = process.env.KV_KV_URL || 
            process.env.KV_URL || 
            process.env.KV_REDIS_URL || 
            process.env.KV_KV_REST_API_URL;

  const token = process.env.KV_KV_REST_API_TOKEN || 
                process.env.KV_TOKEN || 
                process.env.KV_KV_REST_API_READ_ONLY_TOKEN;

  // Convertir URL de rediss:// a https:// si es necesario
  if (url && url.startsWith('rediss://')) {
    url = url.replace('rediss://', 'https://');
  }

  // Durante el build, las variables de entorno pueden no estar disponibles
  // En ese caso, creamos una instancia dummy que fallará en runtime pero permitirá el build
  if (!url || !token) {
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      // En producción en Vercel, las variables deberían estar disponibles
      console.error('Redis configuration error:', {
        url: !!url,
        token: !!token,
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('KV') || key.includes('REDIS'))
      });
      throw new Error('Redis configuration missing. Please check your environment variables.');
    } else {
      // Durante el build o desarrollo local, crear instancia dummy
      return new Redis({
        url: 'https://dummy.upstash.io',
        token: 'dummy-token',
      });
    }
  }

  return new Redis({
    url,
    token,
  });
}

// Instancia singleton de Redis
export const redis = createRedisClient();
