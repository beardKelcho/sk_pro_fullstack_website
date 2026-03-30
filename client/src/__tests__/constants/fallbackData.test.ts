import { fallbackContent } from '@/constants/fallbackData';

describe('fallbackContent', () => {
  it('should provide complete hero fallback data', () => {
    expect(fallbackContent.hero.title).toBeTruthy();
    expect(fallbackContent.hero.subtitle).toBeTruthy();
    expect(fallbackContent.hero.buttonLink).toBe('#services');
  });

  it('should provide about stats fallback data', () => {
    expect(fallbackContent.about.stats).toHaveLength(3);
    expect(fallbackContent.about.stats.map((item) => item.label)).toEqual([
      'Ekipler',
      'Projeler',
      'Yıllık Tecrübe',
    ]);
  });

  it('should provide service cards and contact fallback data', () => {
    expect(fallbackContent.services.services).toHaveLength(3);
    expect(fallbackContent.services.services.every((item) => item.title && item.description)).toBe(true);
    expect(fallbackContent.contact.email).toBe('info@skpro.com.tr');
    expect(fallbackContent.contact.workingHours).toContain('Pazartesi - Cuma: 09:00 - 18:00');
  });
});
