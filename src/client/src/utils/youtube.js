import axios from 'axios';

// Insert your youtube API key here
// This script randomly selects a key to use so you can insert keys 
// from mutliple projects here to increase daily limits
const KEY = {
    1: '',
    2: '',
};

const ytClient = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
});

const randomKey =
    KEY[Object.keys(KEY)[Math.floor(Math.random() * Object.keys(KEY).length)]];

ytClient.interceptors.request.use((config) => {
    config.params = config.params || {};
    config.params['part'] = 'snippet';
    config.params['maxResults'] = 50;
    config.params['key'] = randomKey;
    return config;
});

export default ytClient;
