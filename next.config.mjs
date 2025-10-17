/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: 'out', // Output directory for static export
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
}

export default nextConfig