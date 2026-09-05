import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vivifactor Elements',
    short_name: 'Vivifactor',
    description: 'A precise, non-commercial acoustic and visual instrument.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020204',
    theme_color: '#020204',
    orientation: 'any',
    icons: [],
  };
}
