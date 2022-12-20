/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: { domains: ["ikzttp.mypinata.cloud"], formats: ["image/avif", "image/webp"] },
}

module.exports = nextConfig
