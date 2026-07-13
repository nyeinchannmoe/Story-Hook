import { useCallback, useEffect, useState } from 'react';
import type { Story } from '@/types/story';
import storiesData from '@/data/stories.json';
import { sortStoriesByAiredDate } from '@/utils/search';

interface UseStoriesResult {
  stories: Story[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface StoriesCache {
  stories: Story[];
  error: string | null;
}

let storiesCache: StoriesCache | null = null;

function normalizeStories(data: Story[]): Story[] {
  return data.map((story) => ({
    ...story,
    type: story.type ?? '',
    format: story.format ?? '',
    duration: story.duration ?? '',
    episodeLinks: story.episodeLinks ?? [],
    orginalNetworks: story.orginalNetworks ?? [],
    cast: story.cast ?? [],
    photos: story.photos ?? [],
  }));
}

function readStories(): StoriesCache {
  try {
    const data = storiesData as Story[];

    if (!Array.isArray(data)) {
      throw new Error('invalidStoriesFormat');
    }

    return {
      stories: sortStoriesByAiredDate(normalizeStories(data)),
      error: null,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'failedLoadStories';
    return { stories: [], error: message };
  }
}

function ensureStoriesCache(): StoriesCache {
  if (!storiesCache) {
    storiesCache = readStories();
  }
  return storiesCache;
}

export function useStories(): UseStoriesResult {
  const hasCache = storiesCache !== null;
  const [stories, setStories] = useState<Story[]>(
    () => storiesCache?.stories ?? [],
  );
  const [loading, setLoading] = useState(!hasCache);
  const [error, setError] = useState<string | null>(
    () => storiesCache?.error ?? null,
  );

  const applyCache = useCallback((cache: StoriesCache) => {
    storiesCache = cache;
    setStories(cache.stories);
    setError(cache.error);
    setLoading(false);
  }, []);

  const loadStories = useCallback(() => {
    setLoading(true);
    setError(null);
    applyCache(readStories());
  }, [applyCache]);

  useEffect(() => {
    if (storiesCache) {
      applyCache(storiesCache);
      return;
    }

    // First visit only: brief skeleton for catalog UX.
    const timer = window.setTimeout(() => {
      applyCache(ensureStoriesCache());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [applyCache]);

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
