/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Evita o Next inferir a raiz do workspace como C:\Users\miche por causa de lockfiles fora do projeto,
   * o que pode quebrar o output tracing e gerar EPERM em ambientes com OneDrive/ACL.
   */
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.app https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.onrender.com https://*.vercel.app https://*.supabase.co https://*.google.com https://ipapi.co; frame-src 'self' https://*.google.com;"
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;


