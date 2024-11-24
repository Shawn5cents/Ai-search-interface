import React from 'react';
import SearchBar from './SearchBar';

const SearchResults = ({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  isLoading, 
  setShowResults,
  results,
  error
}) => {
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
