import React from 'react';
import NetworkAnimation from './NetworkAnimation';
import SearchBar from './SearchBar';

const LandingPage = ({ searchQuery, setSearchQuery, handleSearch, isLoading, error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden relative">
      {/* Network Animation Background */}
      <div className="absolute inset-0 opacity-70">
        <NetworkAnimation />
      </div>
      
      <div className="relative max-w-md w-full mx-auto px-4 flex flex-col justify-center min-h-screen">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium text-cyan-50 mb-4">
            How may I assist you?
          </h1>
          <p className="text-cyan-100/60">
            Ask anything and let AI guide you
          </p>
        </div>

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isLoading={isLoading}
          variant="large"
        />

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
