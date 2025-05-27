/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...qualquer outra opção que já exista
  eslint: {
    /** ignora erros de lint no build de produção */
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;