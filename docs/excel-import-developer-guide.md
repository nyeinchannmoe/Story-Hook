# Excel Import Developer Guide

Technical documentation for `scripts/merge_excel_into_json.py` — the incremental Excel → JSON merge tool used by Story Hook.

---

## Architecture Overview

The importer is a **single-file, offline merge pipeline**. It has no React dependency. At runtime it:

1. Loads the three production JSON catalogs from `src/data/`
2. Parses the first sheet of an `.xlsx` workbook with `openpyxl`
3. Normalizes and deduplicates entities (stories, casts, networks)
4. Maps relationships by UUID
5. Asserts that every pre-existing UUID still exists
6. Writes the three JSON files back to disk
7. Returns / prints a statistics dictionary

Design principles:

| Principle | Implementation |
|-----------|----------------|
| Existing JSON is source of truth | Excel never replaces the catalog wholesale |
| Append / fill only | No deletes, no full regenerations |
| Stable identities | UUID v4 only for new entities |
| Referential integrity | Stories reference cast/network UUIDs, never names |
| Fail closed on UUID loss | `assert` before write |

### Module layout

```text
scripts/merge_excel_into_json.py
├── Constants
│   ├── ROOT / DATA paths
│   └── ROLE_MAP
├── Parsing helpers
│   ├── clean, norm_name
│   ├── parse_urls, parse_episode_links
│   ├── parse_networks, parse_cast_blocks
│   └── load_json, write_json
├── Merge helpers
│   ├── find_story, fill_missing
│   ├── merge_photos, merge_episodes
│   ├── merge_cast_refs, merge_networks
│   └── merge()  ← orchestration + nested get_or_create_*
└── CLI (__main__)
```

Paths:

```python
ROOT = Path(__file__).resolve().parents[1]   # repository root
DATA = ROOT / "src" / "data"
```

---

## Data Flow

```text
Excel (.xlsx)
   │
   ▼
Parser (openpyxl, first sheet, header row → dict rows)
   │
   ▼
Normalization (clean / norm_name / ROLE_MAP / URL filters)
   │
   ▼
Deduplication
   ├── Networks → get_or_create_network
   ├── Casts    → get_or_create_cast
   └── Stories  → find_story
   │
   ▼
Relationship Mapping
   ├── orginalNetworks: [networkUuid, ...]
   └── cast: [{ castUuid, characterName, role }, ...]
   │
   ▼
JSON Merge
   ├── New story  → append full object
   └── Existing   → fill_missing + merge_* helpers
   │
   ▼
Validation
   └── assert orig_*_uuids ⊆ result uuids
   │
   ▼
Output Files
   ├── src/data/stories.json            (indent=2)
   ├── src/data/casts.json              (indent=4)
   └── src/data/original_network.json   (indent=4)
```

### Entity relationship model

```text
original_network.json          casts.json
        │                           │
        │ uuid                      │ uuid
        ▼                           ▼
stories.json
  orginalNetworks: string[]     ← network UUIDs
  cast: [{ castUuid, characterName, role }]
```

The React app resolves display names via `useCasts` / `useNetworks` and lookup helpers.

---

## Key Functions

### `clean(value) -> str`

**Purpose:** Coerce Excel cell values into trimmed strings.

**Inputs:** Any cell value (`None`, `bool`, `int`, `float`, `str`, …).

**Behavior:**

- `None` → `""`
- Integers / whole floats → decimal-free string (`38.0` → `"38"`)
- Other values → `str(value).strip()`

**Used by:** Nearly all parsers and field assignments.

---

### `norm_name(s) -> str`

**Purpose:** Canonical key for cast, network, and title comparisons.

**Inputs:** Any value (passed through `clean`).

**Outputs:** Lowercased (`casefold`) string with collapsed whitespace.

**Example:** `"Crystal  Liu"` → `"crystal liu"`.

---

### `parse_urls(text) -> list[str]`

**Purpose:** Extract photo URLs from the `Photos` column.

**Inputs:** Free-text cell content.

**Behavior:** Splits on whitespace and commas; keeps tokens that start with `http://` or `https://`.

**Outputs:** Ordered list of URL strings (duplicates possible at this stage; merge step dedupes).

---

### `parse_episode_links(text) -> list[dict]`

**Purpose:** Parse `EpiosodeLinks` into `episodeLinks` objects.

**Inputs:** Multiline text of titles and URLs.

**Outputs:** List of `{ "title", "description", "link" }` with `description` always `""`.

**Behavior:**

- Walks non-empty lines
- Title line + following URL → full episode entry
- Orphan URL → entry with empty title
- Title without a following URL is skipped (no link)

---

### `parse_networks(text) -> list[str]`

**Purpose:** Split `Orginal Networks` into network name strings.

**Inputs:** Delimited text.

**Delimiters:** `,` `;` `/` `|`

**Outputs:** Trimmed non-empty names (not yet UUID-resolved).

---

### `parse_cast_blocks(text) -> list[dict]`

**Purpose:** Parse `CastName,CharacterName and CastImage` into structured cast rows.

**Inputs:** Multiline blocks separated by blank lines.

**Outputs:** List of:

```python
{
  "name": str,            # actor
  "characterName": str,
  "role": str,            # Main Role | Support Role | Guest Role
  "image": str,           # optional URL or ""
}
```

**Behavior:**

- Optional trailing image URL popped from the block
- Requires at least two remaining lines (name + character)
- Last line mapped through `ROLE_MAP` when recognized; otherwise role defaults to `Support Role`
- Character name is the joined middle lines

**`ROLE_MAP` keys:** `main role`, `support role`, `guest role`, `main`, `support`, `guest`.

---

### `load_json(path) -> Any`

**Purpose:** Read UTF-8 JSON from disk.

---

### `write_json(path, data, indent=2) -> None`

**Purpose:** Write UTF-8 JSON with a trailing newline and `ensure_ascii=False` (preserves Myanmar script).

**Indent conventions in `merge()`:**

| File | Indent |
|------|--------|
| `stories.json` | 2 |
| `casts.json` | 4 |
| `original_network.json` | 4 |

---

### `find_story(stories, title, mm_title, watch_link)`

**Purpose:** Locate an existing story for incremental update.

**Match order per candidate story:**

1. Normalized title equality
2. Normalized `mmTitle` equality
3. Normalized watch link equality (trailing `/` stripped)

**Returns:** Story dict or `None`.

---

### `fill_missing(story, field, value) -> bool`

**Purpose:** Set a scalar/list field only when the current value is empty.

**Empty means:** `None`, `""`, or `[]`.

**Returns:** `True` if the field was written.

**Does not overwrite** non-empty values (including cover photos when used with an explicit empty check).

---

### `merge_photos(story, photos) -> int`

**Purpose:** Append photo URLs not already present.

**Returns:** Count of newly appended URLs.

---

### `merge_episodes(story, episodes) -> int`

**Purpose:** Append episode link objects without duplicates.

**Dedup keys:**

1. `(normalized title, normalized link)` pair
2. Additionally skips if the **link alone** already exists on the story

**Returns:** Count of newly appended episodes.

---

### `merge_cast_refs(story, cast_refs) -> int`

**Purpose:** Append cast relationship objects.

**Dedup key:** `(castUuid, normalized characterName)`.

**Returns:** Count of newly appended refs.

---

### `merge_networks(story, network_uuids) -> int`

**Purpose:** Append network UUID strings to `orginalNetworks`.

**Dedup:** Exact UUID string membership.

**Returns:** Count of newly appended UUIDs.

> Note: the top-level stats object does not currently expose this return value.

---

### Nested: `get_or_create_cast(name, image="") -> (uuid, created)`

Defined inside `merge()`.

- Lookup by `norm_name(name)`
- Reuse UUID if found; optionally fill missing `image`
- Else append `{ uuid, name [, image] }` with a new UUID v4

---

### Nested: `get_or_create_network(name) -> (uuid, created)`

Defined inside `merge()`.

- Lookup by `norm_name(name)`
- Reuse or append `{ uuid, name }`

---

### `merge(excel_path: Path) -> dict`

**Purpose:** Orchestrate the full import.

**Steps:**

1. Load the three JSON files
2. Snapshot original UUID sets and counts
3. Build `cast_by_name` / `network_by_name` indexes
4. Open workbook (`data_only=True`), read first sheet headers
5. For each data row with a non-empty `Title`:
   - Parse fields (note Excel keys: `Epiosodes`, `EpiosodeLinks`, `Orginal Networks`, …)
   - Resolve networks and casts
   - `find_story` → create or update
6. Assert UUID preservation
7. Write JSON files
8. Return statistics dict

**CLI:** `argparse` optional positional `excel` (default `~/Downloads/Story Hook Raw Data.xlsx`), prints `json.dumps(stats)`.

---

## UUID Strategy

| Entity | When created | When reused |
|--------|--------------|-------------|
| Story | No match from `find_story` | Matched story keeps its UUID; never regenerated |
| Cast | No name match in `casts.json` (+ in-run index) | Name matches via `norm_name` |
| Network | No name match in `original_network.json` | Name matches via `norm_name` |

### Referential integrity guarantees

- New stories only store cast/network UUIDs obtained from `get_or_create_*`
- Existing stories receive additional UUID refs via `merge_cast_refs` / `merge_networks`
- After processing, `orig_story_uuids ⊆ {s["uuid"] for s in stories}` (and the same for casts/networks)
- Detail routes (`/detail/:uuid`) remain stable for existing dramas

### What is never done

- Regenerating UUIDs for matched entities
- Deleting UUID entries from the three arrays
- Storing network or actor **names** inside `stories.json` relationship fields

---

## Merge Strategy

### New story

When `find_story` returns `None`, append a complete object:

```text
uuid, title, mmTitle, story, country, rating, type, format,
watchLink, episodes, episodeLinks, aired, duration,
orginalNetworks, cast, photos, coverPhoto
```

Defaults: `type` → `"Drama"`, `format` → `"Standard Series"`, `episodes` → `0` if unparseable.

### Existing story

| Field / collection | Strategy |
|--------------------|----------|
| `mmTitle`, `story`, `country`, `rating`, `type`, `format`, `watchLink`, `aired`, `duration` | `fill_missing` only |
| `episodes` | Set only if Excel has a value and current episodes is falsy |
| `coverPhoto` | Set only if current value is missing/empty |
| `photos` | `merge_photos` (append unique URLs) |
| `episodeLinks` | `merge_episodes` |
| `cast` | `merge_cast_refs` |
| `orginalNetworks` | `merge_networks` |

Existing non-empty scalars are left untouched.

### Existing cast

- Reuse UUID
- Fill `image` only when absent and Excel provides a URL
- Never rename the stored `name` field on match

### Existing network

- Reuse UUID
- Never rename the stored `name` field on match

### New cast / network

Append to the respective JSON array with a fresh UUID v4.

---

## Validation Rules

### UUID preservation

```python
assert orig_story_uuids.issubset({s["uuid"] for s in stories})
assert orig_cast_uuids.issubset({c["uuid"] for c in casts})
assert orig_network_uuids.issubset({n["uuid"] for n in networks})
```

Runs **before** `write_json`. Failure raises `AssertionError` and leaves files unchanged.

### Duplicate prevention

| Layer | Mechanism |
|-------|-----------|
| Stories | Match before create |
| Casts | Name index (`norm_name`) |
| Networks | Name index (`norm_name`) |
| Photos | Exact URL set |
| Episodes | Title+link pair and link-only check |
| Cast refs | `(castUuid, characterName)` |
| Network refs | UUID membership |

### Relationship consistency

- Cast refs always point at UUIDs present in the in-memory `casts` list (created or reused in the same pass)
- Network refs always point at UUIDs present in the in-memory `networks` list
- Typo field `orginalNetworks` is intentional and must stay aligned with `src/types/story.ts`

### Excel column contract

The script keys rows by **exact header strings**. Changing headers without updating `merge()` silently drops fields. Critical exact keys:

```text
Title
MMTitle
Story
Country
Rating
Type
Format
WatchLink
Epiosodes
EpiosodeLinks
Aired
Duration
Orginal Networks
CastName,CharacterName and CastImage
Photos
Cover Photo
```

---

## Setup and Maintenance

### Local setup

```bash
pip install openpyxl
python scripts/merge_excel_into_json.py path/to/file.xlsx
```

No `requirements.txt` entry is required for the web app; treat `openpyxl` as a **dev/content-ops** dependency.

### Maintenance checklist

1. Keep Excel header names in sync with `merge()` `row.get(...)` keys.
2. Keep written story shape aligned with `src/types/story.ts` (`Story`, `EpisodeLink`, `CastMember`).
3. Prefer extending merge helpers over rewriting JSON wholesale.
4. After structural changes, run a dry merge against a copy of `src/data/` and diff.
5. Commit JSON and script changes together when an import ships with code updates.

### Testing suggestions (not automated yet)

- Import a row that matches an existing title → expect `stories_updated`, stable UUID
- Import a new title with a known cast name → expect cast UUID reuse
- Re-run the same Excel twice → second run should show updates with zero (or minimal) creates
- Corrupt JSON deliberately → expect load failure before any write

---

## Future Extension Guide

### Adding a new Excel column

1. Add the header to the spreadsheet template and to `docs/excel-import-guide.md`.
2. In `merge()`, read `row.get("Exact Header")` and parse/normalize.
3. Decide create vs update behavior (`fill_missing` vs always-append).
4. Extend the TypeScript `Story` (or related) interface if the field is consumed by the UI.
5. Update README feature notes if user-visible.

### Adding a new JSON field on stories

1. Update `src/types/story.ts` and any UI readers.
2. Include the field in the **new story** object literal inside `merge()`.
3. For existing stories, use `fill_missing` unless product rules require overwrite (avoid overwrite by default).
4. Document safety implications in the user guide.

### Supporting additional relationship types

Example: genres, tags, or directors as separate UUID directories.

1. Add `src/data/<entity>.json` and a TypeScript interface.
2. Mirror `get_or_create_network` / `get_or_create_cast` for the new entity.
3. Store UUID arrays or ref objects on the story.
4. Extend UUID snapshot assertions for the new file.
5. Add hooks/lookup utilities in the React app similar to `useCasts` / `useNetworks`.

### Extending validation rules

Ideas that fit the current style:

- Schema check: required keys on every story after merge
- Orphan detection: every `castUuid` / network UUID referenced by stories exists in directories
- Dry-run mode: compute stats without writing
- Stricter episode title requirements (reject orphan URLs)

Implement new checks **before** `write_json`, and fail with clear exceptions.

### CLI improvements

Possible additions without changing merge semantics:

- `--dry-run`
- `--sheet-name`
- Explicit `--data-dir`
- Exit non-zero when assertions fail (already true) or when zero rows processed

---

## Related Documentation

- [Excel Import Guide](excel-import-guide.md) — operator-facing usage
- [README — Excel Data Import Tool](../README.md#excel-data-import-tool)
- Source: `scripts/merge_excel_into_json.py`
- Types: `src/types/story.ts`
