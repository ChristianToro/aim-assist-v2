// How many past recommendations of a kind GET returns. Older rows stay in
// the table: the cache and the daily limit still read them.
export const HISTORY_LIMIT = 10

// A stored row as the API sends it, the same shape from POST and GET.
// `context` is null for rows saved before it was recorded.
export const toEntry = ({ id, result, context, model, createdAt }) => ({
  id,
  recommendation: result,
  context: context ?? null,
  model,
  generatedAt: createdAt,
})

/*
 * The rows a player can be shown, newest first as given. Each answer goes
 * back through its kind's `parseAdvice`, so a row stored in a shape the
 * current UI can't render (an older PROMPT_VERSION) is left out instead
 * of breaking the panel.
 */
export const historyEntries = (rows, parseAdvice) =>
  rows.filter(({ result }) => parseAdvice(result) !== null).map(toEntry)
