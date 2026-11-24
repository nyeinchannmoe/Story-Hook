# Excel Import Guide

End-user guide for importing Story Hook drama data from Excel into the project JSON files.

---

## Overview

Story Hook keeps its catalog in static JSON files under `src/data/` (`stories.json`, `casts.json`, `original_network.json`, `genres.json`, `countries.json`). When you receive new drama rows in a spreadsheet, run the merge script instead of editing JSON by hand.

```text
Prepare Excel workbook
        │
        ▼
Run merge_excel_into_json.py
        │
        ▼
Script loads existing JSON (source of truth)
  (creates genres.json / countries.json if missing)
        │
        ▼
For each Excel row with a Title:
  • Resolve / create countries
  • Resolve / create networks
  • Resolve / create genres
  • Resolve / create casts
  • Match existing story OR create new story
  • Merge photos, episodes, cast refs, networks, genres, country_uuid
        │
        ▼
Validate that all previous UUIDs still exist
        │
        ▼
Write updated:
  stories.json
  casts.json
  original_network.json
  genres.json
  countries.json
        │
        ▼
Print JSON statistics report
```

**Important:** Existing JSON is the source of truth. Excel is additional data to merge. The script never deletes stories, casts, networks, genres, or countries.

---

## Prerequisites

- Python 3.10+ (3.11–3.13 recommended)
- `openpyxl` package
- A Story Hook repository checkout with writable `src/data/` files
- The workbook at `docs/Story Hook Raw Data.xlsx` (or another `.xlsx` with the same headers on the **first sheet**)

### Install openpyxl

Prefer a project virtual environment. This avoids conflicts with system Python packages (for example a locked `numpy` under `C:\Program Files\...`).

```bash
python -m venv .venv
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install openpyxl
```

Without a venv (not recommended if you hit import/permission errors):

```bash
pip install openpyxl
```

---

## Expected Excel Structure

Use the **first worksheet** only (for example `Sheet1`). Row 1 must be headers. Data starts at row 2.

| Column | Description |
|--------|-------------|
| Title | English title (required to import the row) |
| MMTitle | Myanmar title |
| Story | Synopsis / long description |
| Country | Country of origin name (for example `China`); resolved to a UUID in `countries.json` and stored on the story as `country_uuid` |
| Rating | Rating string (for example `8.2/10`) |
| Type | Content type (defaults to `Drama` if empty) |
| Format | Format (defaults to `Standard Series` if empty) |
| WatchLink | Primary external watch URL |
| Epiosodes | Episode count (Excel header spelling is intentional) |
| EpiosodeLinks | Episode title + URL pairs (see format below) |
| Aired | Airing period text |
| Duration | Runtime (for example `45 min`) |
| Orginal Networks | Comma-separated network names (header spelling is intentional) |
| CastName,CharacterName and CastImage | Cast blocks (see format below) |
| Photos | Additional image URLs (comma or whitespace separated) |
| Cover Photo | Main poster URL |
| Genres | Comma-separated genre names (for example `Historical, Romance`) |

> **Header spellings:** The script reads the Excel headers exactly as shown above, including `Epiosodes`, `EpiosodeLinks`, and `Orginal Networks`. Renaming those headers will cause those fields to be ignored.

### Episode links format (`EpiosodeLinks`)

Alternate title and URL lines. Blank lines between pairs are fine.

```text
Drama Name EP-1 HD
https://t.me/example/100

Drama Name EP-1 FHD
https://t.me/example/101
```

Rules:

- A non-URL line is treated as the episode `title`
- The next URL line becomes `link`
- `description` is always written as `""`
- A bare URL with no title is stored with an empty title

### Networks format (`Orginal Networks`)

Comma-, semicolon-, slash-, or pipe-separated names:

```text
CCTV, Tencent Video
```

```text
Netflix; Youku
```

### Country format (`Country`)

A single country name string:

```text
China
```

```text
South Korea
```

Rules:

- Matched case-insensitively against `countries.json` → `country`
- Unknown names are created in `countries.json` with a new UUID
- Stories store the country **UUID** in `country_uuid` (not the display name)
- If `countries.json` does not exist yet, the script creates it
- Existing non-empty `country_uuid` values are never overwritten (`fill_missing`)

### Genres format (`Genres`)

Comma-, semicolon-, slash-, or pipe-separated genre names:

```text
Historical, Romance
```

```text
Drama; Life
```

Rules:

- Each name is trimmed and matched case-insensitively against `genres.json`
- Unknown genre names are created in `genres.json` with a new UUID
- Story rows store genre **UUIDs** in `stories.json` → `genres: [uuid, ...]`
- Duplicate names in the same cell are ignored
- If `genres.json` does not exist yet, the script creates it

### Cast format (`CastName,CharacterName and CastImage`)

Separate actors with a blank line. Each block:

```text
Actor Name
Character Name
Main Role
https://optional-cast-image.jpg
```

Rules:

- Line 1: actor name
- Middle lines: character name (may span multiple lines)
- Last non-URL line: role (`Main Role`, `Support Role`, `Guest Role`, or short forms `Main` / `Support` / `Guest`)
- Optional final line: cast image URL (`http://` or `https://`)
- If no recognized role line is present, role defaults to `Support Role`
- Blocks with fewer than two non-URL lines are skipped

Example:

```text
Crystal Liu
Huang Yi Mei / "Rose" / "Rosie"
Main Role

Tong Da Wei
Huang Zhen Hua
Main Role
https://i.mydramalist.com/jV7ybc.jpg
```

### Photos format (`Photos`)

One or more `http://` / `https://` URLs, separated by commas and/or whitespace:

```text
https://example.com/a.jpg, https://example.com/b.jpg
```

---

## How to Prepare Excel Data

### Required fields

| Field | Requirement |
|-------|-------------|
| Title | Required. Rows without a title are skipped |

All other columns are optional for the importer, but empty optional fields produce empty strings or empty arrays in newly created stories.

### Optional fields

Everything except `Title` is optional. Defaults applied on create:

| Field | Default when empty |
|-------|--------------------|
| Type | `Drama` |
| Format | `Standard Series` |
| Episodes count | `0` |
| Episode links / photos / cast / networks / genres | `[]` |

### Supported formats

- File type: `.xlsx` (Excel 2007+)
- Engine: `openpyxl` with `data_only=True` (formula cells use cached calculated values)
- Encoding: Unicode (Myanmar script is preserved)

### Common mistakes

| Mistake | Result |
|---------|--------|
| Renaming `Epiosodes` / `EpiosodeLinks` / `Orginal Networks` / `Genres` | Those fields are not imported |
| Putting data on sheet 2 | Ignored; only the first sheet is read |
| Missing blank line between cast blocks | Actors may be merged into one block |
| Putting role on the wrong line | Character name or role may parse incorrectly |
| Duplicate titles that differ only by spaces/case | Treated as the **same** story and merged |
| Editing JSON manually with a new UUID for an existing actor | Creates duplicate cast entries later if names differ slightly |
| Expecting cover photo overwrite | Existing non-empty `coverPhoto` is never replaced |

### Recommended workflow

1. Keep a backup or commit of `src/data/` before importing.
2. Put only **new or incremental** rows in the spreadsheet when possible.
3. Keep actor, network, and genre names consistent with existing JSON (spelling and spacing).
4. Run the script once, review the statistics report, then spot-check the JSON and the app UI.

---

## Running the Import Script

Always run from a context where paths resolve correctly. The script locates JSON relative to the repository root (`scripts/` → parent → `src/data/`). The Excel workbook lives at `docs/Story Hook Raw Data.xlsx` in the repository. Quote the path because the filename contains spaces.

### Windows

```powershell
cd C:\NCM\React\Story-Hook
.\.venv\Scripts\Activate.ps1
python scripts\merge_excel_into_json.py "docs\Story Hook Raw Data.xlsx"
```

Or with an absolute path:

```powershell
python scripts\merge_excel_into_json.py "C:\NCM\React\Story-Hook\docs\Story Hook Raw Data.xlsx"
```

Without activating the venv:

```powershell
.\.venv\Scripts\python.exe scripts\merge_excel_into_json.py "docs\Story Hook Raw Data.xlsx"
```

### macOS

```bash
cd ~/projects/Story-Hook
python3 scripts/merge_excel_into_json.py "docs/Story Hook Raw Data.xlsx"
```

### Linux

```bash
cd ~/projects/Story-Hook
python3 scripts/merge_excel_into_json.py "docs/Story Hook Raw Data.xlsx"
```

### Default path

If you omit the argument, the script uses the workbook under `docs/` relative to the repository root:

```text
docs/Story Hook Raw Data.xlsx
```

```bash
python scripts/merge_excel_into_json.py
```

---

## Understanding Merge Results

On success, the script prints a JSON object to stdout. Example:

```json
{
  "rows": 1,
  "stories_created": 1,
  "stories_updated": 0,
  "casts_created": 5,
  "networks_created": 0,
  "genres_created": 1,
  "photos_added": 0,
  "episodes_added": 0,
  "cast_refs_added": 0,
  "genre_refs_added": 2,
  "created_titles": [
    "The Tale of Rose (2024)"
  ],
  "updated_titles": [],
  "new_casts": [
    "Tong Da Wei",
    "Wan Qian"
  ],
  "new_networks": [],
  "new_genres": [
    "Historical"
  ],
  "stories_before": 5,
  "casts_before": 22,
  "networks_before": 8,
  "genres_before": 3,
  "stories_total": 6,
  "casts_total": 27,
  "networks_total": 8,
  "genres_total": 4
}
```

### Field reference

| Field | Meaning |
|-------|---------|
| `rows` | Excel data rows processed (rows with a non-empty Title) |
| `stories_created` | Brand-new story objects appended |
| `stories_updated` | Existing stories matched and merged |
| `casts_created` | New actors appended to `casts.json` |
| `networks_created` | New networks appended to `original_network.json` |
| `genres_created` | New genres appended to `genres.json` |
| `photos_added` | Photo URLs appended to **existing** stories during update |
| `episodes_added` | Episode links appended to **existing** stories during update |
| `cast_refs_added` | Cast relationship entries appended to **existing** stories during update |
| `genre_refs_added` | Genre UUID entries appended to **existing** stories during update |
| `created_titles` | Titles of newly created stories |
| `updated_titles` | Titles of matched existing stories |
| `new_casts` | Names of newly created cast records |
| `new_networks` | Names of newly created network records |
| `new_genres` | Names of newly created genre records |
| `stories_before` / `casts_before` / `networks_before` / `genres_before` | Counts before merge |
| `stories_total` / `casts_total` / `networks_total` / `genres_total` | Counts after merge |

Notes:

- For **newly created** stories, photos, episodes, and genres are included in the new object; they are **not** counted in `photos_added` / `episodes_added` / `genre_refs_added` (those counters only track appends during updates).
- Network UUID appends on existing stories are merged silently (no separate counter in the report).

---

## Safety Guarantees

The importer is designed for production catalog files:

| Guarantee | Detail |
|-----------|--------|
| Never deletes existing stories | Only appends or in-place field fills |
| Never deletes casts | Only appends new actors or fills a missing `image` |
| Never deletes networks | Only appends new networks |
| Never deletes genres | Only appends new genres |
| Never regenerates existing UUIDs | Matched cast/network/genre/story UUIDs stay stable |
| Never overwrites valid scalar fields | `fill_missing` only writes when the current value is empty |
| Never overwrites a valid cover photo | Sets `coverPhoto` only if missing or empty |
| Never removes photos | Appends URLs not already present |
| Never removes episode links | Appends non-duplicate links only |
| Never removes cast, network, or genre relations | Appends missing UUID references only |
| Post-merge UUID assertion | Aborts write path if any pre-existing UUID disappeared |

If an assertion fails, the process raises and you should not treat the run as successful. (Writes occur after assertions; if an assert fails, files are not updated.)

---

## Deduplication Logic

### Story matching

A row matches an existing story if **any** of these succeed (checked in order per story):

1. **Title** — normalized equality (`trim`, collapse whitespace, casefold)
2. **Myanmar title (`mmTitle`)** — same normalization
3. **Watch link** — trimmed, trailing `/` stripped, casefold

If none match, a new story UUID is generated and the story is appended.

### Cast matching

Actor names are compared with `norm_name`:

- Trim whitespace
- Collapse internal whitespace to a single space
- Case-insensitive (`casefold`)

Examples treated as the same actor:

```text
Crystal Liu
crystal liu
Crystal  Liu
```

When an existing cast is reused:

- The existing UUID is returned
- If Excel provides an image and the cast record has no `image`, the image is filled in
- An existing image is never overwritten

### Network matching

Network names use the same `norm_name` rules. Examples treated as the same network:

```text
Netflix
NETFLIX
 netflix
```

Matched networks reuse their existing UUID inside `orginalNetworks` on the story.

### Genre matching

Genre names use the same `norm_name` rules. Examples treated as the same genre:

```text
Romance
romance
 Romance
```

Matched genres reuse their existing UUID inside `genres` on the story. Unknown names create a new `{ uuid, name }` entry in `genres.json`.

---

## After Import

1. Review the statistics report for unexpected `stories_updated` or duplicate-looking titles.
2. Open `src/data/stories.json`, `casts.json`, `original_network.json`, and `genres.json` and spot-check the new entries.
3. Run the app (`npm run dev`) and open `/detail/<new-uuid>`.
4. Commit the JSON changes when ready.

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'openpyxl'`

```bash
pip install openpyxl
```

If you use a virtual environment, activate it first, or call that environment’s Python:

```bash
.\.venv\Scripts\python.exe scripts\merge_excel_into_json.py "path\to\file.xlsx"
```

### Excel file not found

```text
FileNotFoundError: [Errno 2] No such file or directory: '...\\docs\\Story Hook Raw Data.xlsx'
```

- Confirm the file exists at `docs/Story Hook Raw Data.xlsx` under the repository root.
- Confirm quoting is correct (paths with spaces need quotes).
- Run the script from the repository root, or pass an absolute path to the workbook.
- If you relied on the default path, verify the file name is exactly `Story Hook Raw Data.xlsx` under `docs/`.

### Invalid or renamed column names

Symptoms: story is created but episodes, networks, or cast are empty.

- Restore the exact headers listed in [Expected Excel Structure](#expected-excel-structure).
- Do not “fix” `Epiosodes` → `Episodes` unless you also change the script.

### JSON parsing errors

```text
json.decoder.JSONDecodeError
```

- One of `stories.json`, `casts.json`, or `original_network.json` is invalid JSON.
- Fix the file (trailing commas, missing brackets) before re-running.

### Permission errors

```text
PermissionError
```

When writing JSON:

- Close the JSON files if they are open in another program that locks them.
- Ensure you have write permission to `src/data/`.
- Do not run against a read-only checkout or protected system folder.

When importing packages (often during `import openpyxl`):

```text
PermissionError: ... 'C:\\Program Files\\Python313\\Lib\\site-packages\\numpy\\__init__.py'
```

- Create/activate a project `.venv` and install `openpyxl` there (see [Prerequisites](#prerequisites)).
- Avoid mixing a user-installed `openpyxl` with a system-wide `numpy` under `Program Files`.

### AssertionError after merge

```text
AssertionError
```

- A pre-existing UUID was missing from the in-memory result (should not happen in normal operation).
- Do not force-save; restore from git and report the input that caused it.

### Wrong sheet imported

Only the **first** sheet is processed. Move your table to sheet index 0 or copy data onto the first sheet.

### Duplicate dramas after import

Usually caused by titles/watch links that do not match normalization (different punctuation, year suffixes, or different Telegram links). Align identifiers with the existing story before re-importing, or manually merge once and standardize the Excel title.

---

## Related Documentation

- [Excel Import Developer Guide](excel-import-developer-guide.md) — architecture and extension notes
- [README — Excel Data Import Tool](../README.md#excel-data-import-tool) — project-level summary
- `scripts/merge_excel_into_json.py` — implementation
