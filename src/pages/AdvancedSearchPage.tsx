import { useId, type FormEvent } from 'react';
import {
  PageContainer,
  SEO,
  StoryGrid,
  LoadingSkeleton,
  EmptyState,
  DualRangeSlider,
} from '@/components';
import {
  APP_NAME,
  SEARCH_COUNTRIES,
  SEARCH_RATING_MAX,
  SEARCH_RATING_MIN,
  SEARCH_YEAR_MAX,
  SEARCH_YEAR_MIN,
  type SearchCountry,
} from '@/constants';
import { useStories } from '@/hooks/useStories';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

export default function AdvancedSearchPage() {
  const { stories, loading, error, refetch } = useStories();
  const { draft, results, updateDraft, search, reset } =
    useAdvancedSearch(stories);

  const formId = useId();
  const keywordId = `${formId}-keyword`;
  const episodesMinId = `${formId}-episodes-min`;
  const episodesMaxId = `${formId}-episodes-max`;

  const toggleCountry = (country: SearchCountry) => {
    const selected = draft.countries.includes(country);
    if (selected) {
      updateDraft({
        countries: draft.countries.filter((c) => c !== country),
      });
    } else {
      updateDraft({ countries: [...draft.countries, country] });
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    search();
  };

  const resultLabel =
    results.length === 1 ? '1 Result Found' : `${results.length} Results Found`;

  return (
    <>
      <SEO
        title={`Advanced Search | ${APP_NAME}`}
        description="Search Asian dramas by keyword, country, rating, episodes, and aired year."
      />

      <PageContainer>
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Advanced <span className="text-accent">Search</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-text-secondary sm:text-lg">
            Filter curated dramas by keyword, country, rating, episode count,
            and aired year.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-2xl border border-white/5 bg-bg-card p-5 sm:p-6 lg:p-8"
          aria-label="Advanced search filters"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6 lg:col-span-2">
              <div>
                <label
                  htmlFor={keywordId}
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Keyword
                </label>
                <input
                  id={keywordId}
                  type="search"
                  name="keyword"
                  value={draft.keyword}
                  onChange={(e) => updateDraft({ keyword: e.target.value })}
                  placeholder="Search title, Myanmar title, cast, or character…"
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <p className="mt-2 text-xs text-text-muted">
                  Searches title, Myanmar title, cast name, and character name.
                </p>
              </div>
            </div>

            <fieldset>
              <legend className="mb-3 text-sm font-medium text-text-primary">
                Country
              </legend>
              <div className="flex flex-wrap gap-3">
                {SEARCH_COUNTRIES.map((country) => {
                  const checked = draft.countries.includes(country);
                  const checkboxId = `${formId}-country-${country.replace(/\s+/g, '-').toLowerCase()}`;
                  return (
                    <label
                      key={country}
                      htmlFor={checkboxId}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
                        checked
                          ? 'border-accent/40 bg-accent-muted text-text-primary'
                          : 'border-white/10 bg-bg-secondary text-text-secondary hover:border-white/20'
                      }`}
                    >
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCountry(country)}
                        className="h-4 w-4 rounded border-white/20 bg-bg-primary text-accent focus:ring-accent focus:ring-offset-0"
                      />
                      {country}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-6">
              <DualRangeSlider
                id={`${formId}-rating`}
                label="Rating"
                min={SEARCH_RATING_MIN}
                max={SEARCH_RATING_MAX}
                step={0.1}
                valueFrom={draft.ratingFrom}
                valueTo={draft.ratingTo}
                formatValue={(v) => v.toFixed(1)}
                onChange={(ratingFrom, ratingTo) =>
                  updateDraft({ ratingFrom, ratingTo })
                }
              />

              <DualRangeSlider
                id={`${formId}-year`}
                label="Aired Year"
                min={SEARCH_YEAR_MIN}
                max={SEARCH_YEAR_MAX}
                step={1}
                valueFrom={draft.yearFrom}
                valueTo={draft.yearTo}
                onChange={(yearFrom, yearTo) =>
                  updateDraft({ yearFrom, yearTo })
                }
              />
            </div>

            <div className="lg:col-span-2">
              <p className="mb-3 text-sm font-medium text-text-primary">
                Episodes
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={episodesMinId}
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-text-muted"
                  >
                    Min Episodes
                  </label>
                  <input
                    id={episodesMinId}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    name="episodesMin"
                    value={draft.episodesMin}
                    onChange={(e) =>
                      updateDraft({ episodesMin: e.target.value })
                    }
                    placeholder="e.g. 16"
                    className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label
                    htmlFor={episodesMaxId}
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-text-muted"
                  >
                    Max Episodes
                  </label>
                  <input
                    id={episodesMaxId}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    name="episodesMax"
                    value={draft.episodesMax}
                    onChange={(e) =>
                      updateDraft({ episodesMax: e.target.value })
                    }
                    placeholder="e.g. 40"
                    className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-white/10 bg-transparent px-6 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Reset Filters
            </button>
            <button
              type="submit"
              className="rounded-lg gradient-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card"
            >
              Search
            </button>
          </div>
        </form>

        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <EmptyState
            title="Failed to Load Dramas"
            description={error}
            action={
              <button
                type="button"
                onClick={refetch}
                className="rounded-lg gradient-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-900/30"
              >
                Try Again
              </button>
            }
          />
        )}

        {!loading && !error && (
          <section aria-live="polite" aria-atomic="true">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-text-primary sm:text-xl">
                {resultLabel}
              </h2>
            </div>

            {results.length === 0 ? (
              <EmptyState
                icon="search"
                title="No dramas found"
                description="Try adjusting your filters"
                action={
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-lg gradient-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-900/30"
                  >
                    Reset Filters
                  </button>
                }
              />
            ) : (
              <StoryGrid stories={results} />
            )}
          </section>
        )}
      </PageContainer>
    </>
  );
}
