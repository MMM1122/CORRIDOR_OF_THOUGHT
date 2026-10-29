import type { NextConfig } from 'next';
const config: NextConfig = {devIndicators:false,distDir:process.env.NEXT_DIST_DIR||'.next',outputFileTracingRoot:process.cwd(),serverExternalPackages:['pdfjs-dist','@napi-rs/canvas'], experimental:{serverActions:{bodySizeLimit:'25mb'}}};
export default config;
