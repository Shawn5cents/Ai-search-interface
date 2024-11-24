import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery, handleSearch, isLoading, variant = 'large' }) => {
  const inputClasses = variant === 'large'
    ? 'w-full px-6 py-4 text-lg rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder-cyan-100/50 focus:outline-none focus:border-cyan-500/40 backdrop-blur-sm shadow-lg transition-all hover:border-cyan-500/30'
    : 'flex-1 px-4 py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-white placeholder-cyan-100/50 focus:outline-none focus:border-cyan-500/40';

  return (
    <form onSubmit={handleSearch} className="relative z-10">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ask me anything..."
          className={inputClasses}
        />
        <button
          type="submit"
          className={variant === 'large' 
            ? "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
            : "px-6 py-2 bg-cyan-500/10 text-cyan-50 rounded-xl hover:bg-cyan-500/20 transition-colors"
          }
        >
          {isLoading ? (
            <div className="w-6 h-6 border-t-2 border-cyan-200 rounded-full animate-spin" />
          ) : (
            variant === 'large' ? (
              <Search className="w-6 h-6 text-cyan-200" />
            ) : (
              'Search'
            )
          )}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
