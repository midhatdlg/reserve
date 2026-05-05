import type { TemplateTheme } from '@/lib/template-theme';

function isLight(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export function buildCustomTheme(accentColor?: string): TemplateTheme {
  const primary = accentColor || '#2C3A2E';
  const light = isLight(primary);

  return {
    pageBg: light ? '#FAFAFA' : '#F5F0E8',
    displayFont: '"Cormorant Garamond", Georgia, serif',
    bodyFont: '"Montserrat", "Helvetica Neue", sans-serif',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap',
    ink: light ? '#1A1A1A' : '#2C2C2C',
    ink2: '#6B6560',
    ink3: '#9E9890',
    rule: 'rgba(0,0,0,0.12)',
    ruleSoft: 'rgba(0,0,0,0.06)',
    surface: 'rgba(255,255,255,0.8)',
    surfaceBorder: 'rgba(0,0,0,0.1)',
    heroBg: '#1A1A1A',
    heroImgFallback: '#0F0F0F',
    sectionDarkBg: '#1A1A1A',
    textOnDark: '#FFFFFF',
    textOnDarkMuted: 'rgba(255,255,255,0.8)',
    ruleOnDark: 'rgba(255,255,255,0.2)',
    footerBg: '#1A1A1A',
    footerMuted: 'rgba(255,255,255,0.55)',
    footerRule: 'rgba(255,255,255,0.14)',
    photoFilter: 'none',
    placeholderMuted: 'rgba(0,0,0,0.42)',
    placeholderMutedOnDark: 'rgba(255,255,255,0.48)',
    placeholderBorder: '1px dashed rgba(0,0,0,0.22)',
    placeholderBorderOnDark: '1px dashed rgba(255,255,255,0.38)',
    placeholderFill: 'rgba(0,0,0,0.045)',
    placeholderFillOnDark: 'rgba(255,255,255,0.07)',
    primary,
    primaryMuted: `${primary}33`,
    primaryContrast: light ? '#1A1A1A' : '#F2F0EC',
    accent: primary,
    cardBg: '#FFFFFF',
    border: '#D4CFC6',
    surfaceTint: `${primary}0A`,
    danger: '#C4564A',
  };
}
