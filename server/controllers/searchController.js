const { logger } = require('../middleware/logger');

// Import fetch using dynamic import
let fetchPromise = import('node-fetch').then(module => {
  global.fetch = module.default;
  logger.info('node-fetch initialized successfully');
}).catch(err => {
  logger.error('Failed to initialize node-fetch:', err);
  process.exit(1);
});

const searchOpenAI = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Wait for fetch to be initialized
    await fetchPromise;
    
    logger.info('Received search request:', {
      body: req.body,
      headers: req.headers,
      url: req.url
    });
    
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      logger.warn('Invalid query format:', { query, type: typeof query });
      return res.status(400).json({ 
        error: 'Invalid query format',
        details: 'Query must be a non-empty string'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      logger.error('OpenAI API key not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'API key not configured'
      });
    }

    if (!process.env.OPENAI_API_URL) {
      logger.error('OpenAI API URL not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'API URL not configured'
      });
    }

    const apiUrl = `${process.env.OPENAI_API_URL}/chat/completions`;
    
    logger.debug('Making OpenAI API request:', {
      url: apiUrl,
      queryLength: query.length,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const requestBody = {
        model: 'hf:mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides clear, concise answers.'
          },
          {
            role: 'user',
            content: query.trim()
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      };

      logger.debug('Request payload:', requestBody);

      const response = await global.fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const responseText = await response.text();
      
      logger.debug('Raw API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}\nResponse: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        logger.error('Failed to parse API response:', {
          error: parseError.message,
          response: responseText
        });
        throw new Error('Invalid JSON response from OpenAI API');
      }
      
      if (!data.choices?.[0]?.message?.content) {
        logger.error('Invalid API response format:', { data });
        throw new Error('Invalid response format from OpenAI API');
      }

      const result = data.choices[0].message.content.trim();
      const duration = Date.now() - startTime;
      
      logger.info(`Request completed successfully in ${duration}ms`);
      
      return res.json({ 
        result,
        duration,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Search request failed:', {
      error: error.message,
      stack: error.stack,
      duration
    });

    if (error.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Request timeout',
        details: 'The request took too long to complete'
      });
    }

    // Check for specific OpenAI API errors
    if (error.message.includes('OpenAI API error')) {
      return res.status(502).json({
        error: 'OpenAI API error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'External API error'
      });
    }

    return res.status(500).json({
      error: 'Failed to process search request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  searchOpenAI
};
