import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { SearchProvider } from './context/searchContext';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.css';

ReactDOM.render(
    <React.StrictMode>
        <SearchProvider>
            <App />
        </SearchProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
