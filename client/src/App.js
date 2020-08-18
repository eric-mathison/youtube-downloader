import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Header from './components/Header';
import Start from './screens/Start';
import VideoList from './screens/VideoList';
import WatchVideo from './screens/WatchVideo';
import './App.css';

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Header />
                <Route exact path="/" component={Start} />
                <Route exact path="/search" component={VideoList} />
                <Route exact path="/watch" component={WatchVideo} />
            </BrowserRouter>
        </div>
    );
}

export default App;
