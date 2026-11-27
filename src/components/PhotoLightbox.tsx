import { useTranslation } from 'react-i18next';
import { getImageSrc, handleImageError } from '@/utils/image';

interface PhotoLightboxProps {
  photos: string[];
  selectedIndex: number;
  title: string;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export function PhotoLightbox({
  photos,
  selectedIndex,
  title,
  onClose,
  onSelectIndex,
}: PhotoLightboxProps) {
  const { t } = useTranslation(['a11y', 'dialogs']);
  const hasMultiple = photos.length > 1;

  const goNext = () => {
    onSelectIndex((selectedIndex + 1) % photos.length);
  };

  const goPrev = () => {
    onSelectIndex((selectedIndex - 1 + photos.length) % photos.length);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t('dialogs:photoLightbox')}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
        if (hasMultiple && e.key === 'ArrowRight') goNext();
        if (hasMultiple && e.key === 'ArrowLeft') goPrev();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label={t('dialogs:closeLightbox')}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          aria-label={t('dialogs:previousPhoto')}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <img
        src={getImageSrc(photos[selectedIndex])}
        alt={t('a11y:photoStill', { title, index: selectedIndex + 1 })}
        onClick={(e) => e.stopPropagation()}
        onError={handleImageError}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
      />

      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:right-16"
          aria-label={t('dialogs:nextPhoto')}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
