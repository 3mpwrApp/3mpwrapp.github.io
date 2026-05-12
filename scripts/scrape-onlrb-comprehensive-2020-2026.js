#!/usr/bin/env node

// Compatibility launcher after scripts reorganization.
const { main } = require('./scraping/scrape-onlrb-comprehensive-2020-2026.js');

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
