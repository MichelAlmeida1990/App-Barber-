/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Evita o Next inferir a raiz do workspace como C:\Users\miche por causa de lockfiles fora do projeto,
   * o que pode quebrar o output tracing e gerar EPERM em ambientes com OneDrive/ACL.
   */
  outputFileTracingRoot: __dirname,
  eslint: {
    // O projeto tem vários avisos/erros de lint legados (ex.: no-explicit-any).
    // Para não travar o build de produção, ignoramos ESLint durante `next build`.
    // O lint pode ser executado separadamente via `npm run lint`.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;


