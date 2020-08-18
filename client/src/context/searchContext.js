import React, { useState, useContext, useMemo } from 'react';

const SearchContext = React.createContext();

const SearchProvider = ({ children }) => {
    const [search, setSearch] = useState('');
    const value = useMemo(() => [search, setSearch], [search]);

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};

const useSearch = () => {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider.');
    }
    return context;
};

const updateSearch = (context, term) => {
    const [, setSearch] = context;
    setSearch(term);
};

export { SearchProvider, useSearch, updateSearch };
