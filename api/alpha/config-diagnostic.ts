export default function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    databaseConfigured: Boolean(process.env.DATABASE_URL),
  });
}
