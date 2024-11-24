import React from 'react';
import { searchAPI, webSearchAPI } from '../services/api';

const SearchResults = ({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  isLoading, 
  setShowResults,
  results,
  error,
  query,
  onResultsUpdate
}) => {
  const [loading, setLoading] = React.useState(false);
  const [errorState, setErrorState] = React.useState(null);
  const [resultsState, setResultsState] = React.useState({
    ai: null,
    web: null
  });

  React.useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      setErrorState(null);

      try {
        // Fetch both AI and web results concurrently
        const [aiResults, webResults] = await Promise.all([
          searchAPI(query),
          webSearchAPI(query)
        ]);

        setResultsState({
          ai: aiResults,
          web: webResults
        });

        if (onResultsUpdate) {
          onResultsUpdate({ ai: aiResults, web: webResults });
        }
      } catch (err) {
        setErrorState(err.message);
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, onResultsUpdate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>Error: {errorState}</p>
      </div>
    );
  }

  if (!resultsState.ai && !resultsState.web) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-cyan-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isLoading={isLoading}
          variant="compact"
        />

        <div className="space-y-6 mt-8">
          {error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200">
              {error}
            </div>
          ) : (
            <div className="p-6 bg-cyan-500/5 rounded-xl backdrop-blur-sm border border-cyan-500/10">
              <h2 className="text-xl font-semibold mb-4">Results for &quot;{searchQuery}&quot;</h2>
              <div className="space-y-4">
                <div className="p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/10">
                  <p className="text-cyan-100/90 whitespace-pre-wrap">{results}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 p-4">
          {resultsState.ai && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">AI Search Results</h2>
              <div className="prose max-w-none">
                {resultsState.ai.searchResults}
              </div>
            </div>
          )}

          {resultsState.web && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Web Search Results</h2>
              <div className="prose max-w-none">
                {resultsState.web.searchResults}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Source: Perplexity Search • {new Date(resultsState.web.metadata.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowResults(false)}
          className="mt-8 text-cyan-100/70 hover:text-cyan-100 flex items-center"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default SearchResults;
