import { useCallback, useEffect, useState } from 'react';
import type { Story } from '@/types/story';
import storiesData from '@/data/stories.json';

interface UseStoriesResult {
  stories: Story[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStories(): UseStoriesResult {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStories = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const data = storiesData as Story[];

      if (!Array.isArray(data)) {
        throw new Error('invalidStoriesFormat');
      }

      setStories(
        data.map((story) => ({
          ...story,
          type: story.type ?? '',
          format: story.format ?? '',
          duration: story.duration ?? '',
          episodeLinks: story.episodeLinks ?? [],
          orginalNetworks: story.orginalNetworks ?? [],
          cast: story.cast ?? [],
          photos: story.photos ?? [],
        })),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'failedLoadStories';
      setError(message);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadStories, 400);
    return () => clearTimeout(timer);
  }, [loadStories]);

  return { stories, loading, error, refetch: loadStories };
}

export function useStory(uuid: string | undefined): {
  story: Story | undefined;
  loading: boolean;
  error: string | null;
} {
  const { stories, loading, error } = useStories();

  const story = uuid ? stories.find((s) => s.uuid === uuid) : undefined;

  return { story, loading, error };
}
