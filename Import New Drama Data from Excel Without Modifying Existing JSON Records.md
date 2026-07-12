# Task: Import New Drama Data from Excel Without Modifying Existing JSON Records

## Critical Requirement

The project already contains the following files:

* `stories.json`
* `casts.json`
* `original_network.json`

These files already contain production data.

**DO NOT delete, replace, regenerate, overwrite, reorder, or modify existing records unless absolutely necessary for relationship linking.**

The provided Excel file contains **new data only** and must be merged into the existing JSON files.

This is an **incremental import task**, not a full regeneration task.

---

# Required Workflow

## Step 1

Read existing files:

* `stories.json`
* `casts.json`
* `original_network.json`

Analyze all existing records before importing Excel data.

---

## Step 2

Read the provided Excel file.

Extract all new dramas, casts, characters, networks, images, links, and metadata.

---

## Step 3

Merge Excel data into existing JSON files.

Only add missing records.

Never remove existing records.

Never reset files.

Never regenerate files from scratch.

---

# stories.json Rules

## Existing Story Detection

Before creating a new story:

Check whether the drama already exists.

Match using:

1. Title
2. Myanmar Title
3. Watch Link
4. Alternative available identifiers

Use best-effort matching.

---

## If Story Already Exists

Do NOT create another story.

Instead:

* Update missing fields only.
* Add new photos if not already present.
* Add new episode links if not already present.
* Add new cast relationships if not already present.
* Add new network references if not already present.

Never remove existing data.

---

## If Story Does Not Exist

Create a new story object.

Generate a new UUID v4.

Append the new story to `stories.json`.

---

# casts.json Rules

## Existing Cast Detection

Before creating a cast:

Search existing `casts.json`.

Compare:

* Actor Name
* Case-insensitive
* Trimmed whitespace

Examples:

```text
Crystal Liu
crystal liu
Crystal  Liu
```

These represent the same actor.

---

## If Cast Already Exists

Reuse existing UUID.

Never create duplicate actors.

Never generate a new UUID.

Example:

```json
{
  "uuid": "b4c24c32-acb7-4387-a9bb-46af243301b6",
  "name": "Crystal Liu",
  "image": "https://..."
}
```

Reuse:

```json
"castUuid": "b4c24c32-acb7-4387-a9bb-46af243301b6"
```

---

## If Cast Does Not Exist

Create new cast record.

Generate UUID v4.

Append to `casts.json`.

Example:

```json
{
  "uuid": "new-uuid",
  "name": "New Actor",
  "image": "https://..."
}
```

---

# original_network.json Rules

## Existing Network Detection

Before creating a network:

Search existing `original_network.json`.

Compare network names:

* Case-insensitive
* Trimmed
* Normalized whitespace

Examples:

```text
Netflix
NETFLIX
 netflix
```

These are the same network.

---

## If Network Already Exists

Reuse existing UUID.

Do not create duplicate network records.

Example:

```json
{
  "uuid": "795365a6-779a-4aaa-8fea-f21181a9032b",
  "name": "Netflix"
}
```

Reuse this UUID inside stories.

---

## If Network Does Not Exist

Create new network.

Generate UUID v4.

Append to `original_network.json`.

---

# Relationship Rules

## Story → Network

Never store network names directly.

Always store UUID references.

Example:

```json
"orginalNetworks": [
  "795365a6-779a-4aaa-8fea-f21181a9032b"
]
```

---

## Story → Cast

Always reference existing or newly-created cast UUID.

Example:

```json
{
  "castUuid": "b4c24c32-acb7-4387-a9bb-46af243301b6",
  "characterName": "Xu Hong Dou",
  "role": "Main Role"
}
```

---

# Photo Rules

When importing photos:

## Existing Story

Append only new URLs.

Do not remove existing URLs.

Example:

Existing:

```json
[
  "photo1.jpg",
  "photo2.jpg"
]
```

Excel:

```json
[
  "photo2.jpg",
  "photo3.jpg"
]
```

Result:

```json
[
  "photo1.jpg",
  "photo2.jpg",
  "photo3.jpg"
]
```

---

## Cover Photo

If existing cover photo already exists:

Keep existing value.

Only set cover photo if:

* Empty
* Missing

Never overwrite a valid cover photo.

---

# Episode Rules

For existing stories:

Append only missing episodes.

Do not delete existing episodes.

Do not recreate identical episode links.

Avoid duplicates by comparing:

* Title
* Link

---

# Data Preservation Rules

The following are strictly prohibited:

❌ Delete existing stories

❌ Delete existing casts

❌ Delete existing networks

❌ Regenerate all UUIDs

❌ Replace entire JSON files

❌ Remove photos

❌ Remove episode links

❌ Remove cast relations

❌ Remove network relations

❌ Rebuild files from Excel only

---

# Data Import Rules

The following are required:

✅ Read existing JSON files first

✅ Merge Excel data into existing files

✅ Create new UUIDs only for truly new records

✅ Reuse existing UUIDs whenever possible

✅ Preserve all existing data

✅ Append only new information

✅ Deduplicate globally

✅ Maintain referential integrity

---

# Output Requirements

After processing:

Update only these files:

```text
stories.json
casts.json
original_network.json
```

The final output must be a merged dataset consisting of:

* Existing JSON records
* Plus new Excel records
* Without losing any existing information

Treat the existing JSON files as the source of truth and the Excel file as additional data to be imported.
