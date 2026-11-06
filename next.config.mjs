/** @type {import('next').NextConfig} */
export default { output: "standalone", poweredByHeader: false, compress: true, experimental: { serverActions: { bodySizeLimit: "10mb" } } };
