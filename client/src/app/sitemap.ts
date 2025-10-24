import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nilestore.com';
  const now = new Date().toISOString();

  const routes = [
    '',
    '/categories',
    '/cart',
    '/profile',
    '/contact',
    '/about',
    '/checkout',
    '/tracking',
    '/settings',
    '/privacy',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));
}
