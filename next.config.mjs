/** @type {import('next').NextConfig} */
export default { output: "standalone", experimental: { serverActions: { bodySizeLimit: "10mb" } } };
