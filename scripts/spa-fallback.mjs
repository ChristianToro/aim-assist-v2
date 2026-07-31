import { copyFileSync } from 'node:fs'

/*
 * GitHub Pages is a plain static file server with no SPA rewrite rule, so a
 * request for /Aim_Assist/leaderboards finds no file and returns the 404
 * page. Client-side navigation is unaffected — this only bites on a hard
 * refresh or a shared deep link, which is exactly what casual testing
 * misses.
 *
 * Pages serves 404.html for any unmatched path, so shipping a copy of
 * index.html there boots the app as normal; the router then reads the
 * (preserved) URL and renders the right route. The response still carries
 * a 404 status, which browsers ignore and crawlers do not.
 */
copyFileSync('dist/index.html', 'dist/404.html')
