import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getImageSrc, handleImageError } from '@/utils/image';
import { PhotoLightbox } from './PhotoLightbox';

interface PhotoGalleryProps {
  photos: string[];
  title: string;
}

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const { t } = useTranslation(['a11y']);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <section aria-label={t('a11y:photoGallery', { title })}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/5 bg-bg-card transition-all hover:border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t('a11y:viewPhoto', {
              current: index + 1,
              total: photos.length,
            })}
          >
            <img
              src={getImageSrc(photo)}
              alt={t('a11y:photoStill', { title, index: index + 1 })}
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <PhotoLightbox
          photos={photos}
          selectedIndex={selectedIndex}
          title={title}
          onClose={() => setSelectedIndex(null)}
          onSelectIndex={setSelectedIndex}
        />
      )}
    </section>
  );
}
