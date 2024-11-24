import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import SearchResults from './components/SearchResults';
import { searchOpenAI } from './services/api';

const SearchApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState('');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery?.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await searchOpenAI(searchQuery);
      setSearchResults(result);
      setShowResults(true);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      setError(err.message);
      console.error('Search failed:', err);
      
      // Auto-retry on network errors or timeouts
      if (retryCount < 2 && 
          (err.message.includes('internet connection') || 
           err.message.includes('timed out'))) {
        setRetryCount(prev => prev + 1);
        console.log(`Auto-retrying (${retryCount + 1}/2)...`);
        setTimeout(() => handleSearch(), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    handleSearch();
  };

  return showResults ? (
    <SearchResults
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      handleSearch={handleSearch}
      handleRetry={handleRetry}
      isLoading={isLoading}
      setShowResults={setShowResults}
      results={searchResults}
      error={error}
      retryCount={retryCount}
    />
  ) : (
    <LandingPage
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      handleSearch={handleSearch}
      handleRetry={handleRetry}
      isLoading={isLoading}
      error={error}
      retryCount={retryCount}
    />
  );
};

export default SearchApp;
