import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JOSH DATA PLUG",
    short_name: "Josh Data",
    description: "Cheap Data. Instant Delivery. Trusted Plug.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16A34A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
