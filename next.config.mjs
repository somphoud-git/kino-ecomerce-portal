/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: 'out', // Explicit output directory for S3
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