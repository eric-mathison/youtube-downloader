import React from 'react';
import SearchBar from './SearchBar';

const Header = () => {
    return (
        <nav className="navbar navbar-expand-md sticky-top navbar-dark bg-dark">
            <a className="navbar-brand" href="/">
                PLEXVID
            </a>
            <SearchBar />
        </nav>
    );
};

export default Header;
