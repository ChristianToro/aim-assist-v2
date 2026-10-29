const byNewest = (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)

/*
 * One list from the answers generated on this page (`added`) and the ones
 * loaded from the server (`saved`), newest first. An id in both keeps the
 * `added` copy, which carries `cached` when the server reused a saved
 * answer.
 */
export const mergeEntries = (added, saved) => {
  const seen = new Set()
  return [...added, ...saved]
    .filter(({ id }) => !seen.has(id) && seen.add(id))
    .sort(byNewest)
}

// The entry a panel shows: the one picked, else the latest, else none.
export const shownEntry = (entries, selectedId) =>
  entries.find(({ id }) => id === selectedId) ?? entries[0] ?? null

export const formatGeneratedAt = (generatedAt) =>
  new Date(generatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
