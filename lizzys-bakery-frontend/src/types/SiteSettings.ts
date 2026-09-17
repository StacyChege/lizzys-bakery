// null hero_image means "use the site's bundled default photo" (see
// HomePage's fallback to the imported hero-cake-coffee.jpg asset).
export default interface SiteSettings {
  hero_image: string | null;
}
