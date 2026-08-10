import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /dashboard/offers ("Browse Lender Offers") and /dashboard/offers-received
      // used to be two separate pages showing the same "all offers" list —
      // merged into one; this catches any stale bookmarks/links.
      {
        source: "/dashboard/offers",
        destination: "/dashboard/offers-received",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
