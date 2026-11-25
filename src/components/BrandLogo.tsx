import appLogo from '@/assets/storyhook_icon_128.png';
import { APP_NAME } from '@/constants';

const SIZE_PX = {
  sm: 28,
  md: 32,
  lg: 40,
  xl: 48,
} as const;

const SIZE_CLASS = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
} as const;

export type BrandLogoSize = keyof typeof SIZE_PX;

interface BrandLogoProps {
  size?: BrandLogoSize;
  className?: string;
  /** When true (default), treat as decorative beside visible app name text. */
  decorative?: boolean;
}

export function BrandLogo({
  size = 'md',
  className = '',
  decorative = true,
}: BrandLogoProps) {
  const px = SIZE_PX[size];

  return (
    <img
      src={appLogo}
      alt={decorative ? '' : APP_NAME}
      width={px}
      height={px}
      className={`${SIZE_CLASS[size]} shrink-0 object-contain ${className}`.trim()}
      decoding="async"
      aria-hidden={decorative || undefined}
    />
  );
}
