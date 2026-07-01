import type { Story } from '@/types/story';
import { StoryCard } from './StoryCard';

interface StoryGridProps {
  stories: Story[];
}

export function StoryGrid({ stories }: StoryGridProps) {
  return (
    <section
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Drama collection"
    >
      {stories.map((story) => (
        <StoryCard key={story.uuid} story={story} />
      ))}
    </section>
  );
}
