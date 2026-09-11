import type { NextConfig } from "next";

/** Always use the custom domain — never a *.vercel.app deployment URL */
const envDigital = process.env.NEXT_PUBLIC_DIGITAL_URL?.replace(/\/$/, "") || "";
const DIGITAL =
  envDigital && !/vercel\.app/i.test(envDigital) && !/localhost/i.test(envDigital)
    ? envDigital
    : "https://wisdomtower.tech";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/digital",
        destination: DIGITAL,
        permanent: false,
      },
      {
        source: "/digital/:path*",
        destination: `${DIGITAL}/:path*`,
        permanent: false,
      },
      {
        source: "/services",
        destination: `${DIGITAL}/services`,
        permanent: false,
      },
      {
        source: "/services/:path*",
        destination: `${DIGITAL}/services/:path*`,
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: `${DIGITAL}/dashboard`,
        permanent: false,
      },
      {
        source: "/business",
        destination: `${DIGITAL}/business`,
        permanent: false,
      },
      {
        source: "/business/:path*",
        destination: `${DIGITAL}/business/:path*`,
        permanent: false,
      },
      {
        source: "/apply",
        destination: `${DIGITAL}/apply`,
        permanent: false,
      },
      {
        source: "/request",
        destination: `${DIGITAL}/request`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
