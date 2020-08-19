import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSearch, updateSearch } from '../context/searchContext';

const SearchBar = () => {
    const [term, setTerm] = useState('');
    const context = useSearch();
    const history = useHistory();

    const handleChange = (e) => {
        setTerm(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateSearch(context, term);
        history.push('/search');
    };

    return (
        <>
            <form
                className="form-inline w-50 ml-auto my-2 my-md-0"
                onSubmit={handleSubmit}
            >
                <input
                    className="form-control w-100"
                    type="text"
                    placeholder="Search"
                    value={term}
                    onChange={handleChange}
                />
            </form>
        </>
    );
};

export default SearchBar;
