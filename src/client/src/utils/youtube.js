import axios from 'axios';

const KEY = {
    1: 'AIzaSyCHftYoVzF61TofUYeSbewiI8ico_blIK4',
    2: 'AIzaSyBqtRdneM6mtYs9yYxebSFFWVx71ucLWp0',
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
