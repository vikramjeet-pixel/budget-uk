import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Cache spot detail pages (last 50)
      {
        urlPattern: /^https?:\/\/.*\/london\/.+\/.+$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "spot-pages",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
          networkTimeoutSeconds: 3,
        },
      },
      // Cache static pages
      {
        urlPattern: /^https?:\/\/.*\/(spots|free|events|student|transport|community|diet)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-pages",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
        },
      },
      // Cache images
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-images",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      // Cache fonts & CSS
      {
        urlPattern: /\.(?:woff|woff2|ttf|otf|css)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      // Cache JS bundles
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {},
};

export default withPWA(nextConfig);
