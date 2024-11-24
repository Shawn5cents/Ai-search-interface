const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const logger = require('../utils/logger');

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/search';

const searchWeb = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const response = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                max_tokens: 1000,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            logger.error(`Perplexity API error: ${error}`);
            return res.status(response.status).json({ 
                error: 'Failed to fetch search results',
                details: error
            });
        }

        const data = await response.json();
        
        // Transform the response to match our application's format
        const transformedResults = {
            searchResults: data.text,
            metadata: {
                source: 'perplexity',
                timestamp: new Date().toISOString(),
            }
        };

        logger.info(`Web search successful for query: ${query}`);
        res.json(transformedResults);

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
