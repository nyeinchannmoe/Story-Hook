import { useTranslation } from 'react-i18next';
import type { Story } from '@/types/story';
import { StoryCard } from './StoryCard';

interface StoryGridProps {
  stories: Story[];
}

export function StoryGrid({ stories }: StoryGridProps) {
  const { t } = useTranslation('a11y');

  return (
    <section
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-label={t('dramaCollection')}
    >
      {stories.map((story) => (
        <StoryCard key={story.uuid} story={story} />
      ))}
    </section>
  );
}
