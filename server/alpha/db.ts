import postgres from 'postgres';
let client: ReturnType<typeof postgres> | null = null;
export const getAlphaDb = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not configured');
  if (!client) client = postgres(url, { max: 3, idle_timeout: 20, connect_timeout: 10 });
  return client;
};