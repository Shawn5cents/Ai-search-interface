const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

const PERPLEXITY_URL = 'https://www.perplexity.ai/';

const searchWeb = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            
            // Navigate to Perplexity
            await page.goto(PERPLEXITY_URL);
            
            // Wait for search input and type query
            await page.waitForSelector('textarea[placeholder*="Ask"]');
            await page.type('textarea[placeholder*="Ask"]', query);
            
            // Press Enter to search
            await page.keyboard.press('Enter');
            
            // Wait for results
            await page.waitForSelector('.prose', { timeout: 30000 });
            
            // Get the search results
            const results = await page.evaluate(() => {
                const resultElement = document.querySelector('.prose');
                return resultElement ? resultElement.innerText : '';
            });

            // Get sources if available
            const sources = await page.evaluate(() => {
                const sourceElements = document.querySelectorAll('a[href*="://"]');
                return Array.from(sourceElements, el => ({
                    title: el.innerText,
                    url: el.href
                })).slice(0, 5); // Get first 5 sources
            });

            logger.info(`Web search successful for query: ${query}`);
            
            res.json({
                searchResults: results,
                metadata: {
                    source: 'perplexity',
                    timestamp: new Date().toISOString(),
                    sources: sources
                }
            });

        } finally {
            await browser.close();
        }

    } catch (error) {
        logger.error(`Web search error: ${error.message}`);
        res.status(500).json({ 
            error: 'Internal server error during web search',
            details: error.message 
        });
    }
};

module.exports = {
    searchWeb
};
