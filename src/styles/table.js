/*
 * Class lists shared by the app's data tables (the leaderboard and the
 * session history), so their rows, headers and folding stay identical.
 */

// Columns that fold into the first cell's second line on narrow screens.
export const FROM_SM = 'hidden sm:table-cell'
export const FROM_LG = 'hidden lg:table-cell'

// The first and last columns sit 16px in from the frame, the rest 12px apart.
export const EDGE_PADDING = 'px-3 first:pl-4 last:pr-4'
export const CELL = `py-2.5 ${EDGE_PADDING}`

// 12px sentence-case headers that stay in view while the table scrolls.
export const HEAD = `sticky top-0 bg-surface py-2 font-normal whitespace-nowrap ${EDGE_PADDING}`
export const NUMERIC_HEAD = `${HEAD} text-right`

// Row rules, quieter than the frame's edges.
export const ROW = 'border-t border-edge'
