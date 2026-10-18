import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SEE AI — Intellektual Yordamchi',
    short_name: 'SEE AI',
    description: "O'zbek tilidagi ilg'or sun'iy intellekt platformasi. Muallif: Muhammadislom Rustambekov.",
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#06b6d4',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    categories: ['productivity', 'utilities', 'education'],
    lang: 'uz',
  };
}
