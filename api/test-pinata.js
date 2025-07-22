export default function handler(req, res) {
  const hasJWT = !!process.env.PINATA_JWT;
  const jwtLength = process.env.PINATA_JWT?.length || 0;
  
  res.status(200).json({
    pinataConfigured: hasJWT,
    jwtLength: jwtLength,
    message: hasJWT ? 'Pinata is configured!' : 'Running in demo mode'
  });
}