# PlexVid - A Youtube Downloader

Browse and Download Youtube Videos and Playlists directly to a Synology NAS device.  
This application uses an Express backend for the API Server, React for the frontend, and RabbitMQ to handle queuing of the download jobs.

## Requirements

In order to use this application you'll need a few things:
- A RabbitMQ Instance
- A Synology NAS Device with external network access
- A Google Project account for setting up the Youtube API 

## Install

To get started run `npm install`. This will install the dependencies for the `api server`.   
Then run `npm install --prefix src/client` to install the dependences for the `client server`.
  
Next you'll need to insert your keys.  
For `Development`, all keys are stored in the `./src/config/dev.js` file.  
For `Production`, keys must be stored as environment variables.  

### The list of keys are as follows:
- COOKIE_KEY // A random UID
- SYNO_HOST // The external address for your synology device
- SYNO_PORT // The public available port
- SYNO_USER // The synology user account
- SYNO_PASS // The password for the synology user account
- AMQP_URL // The hostname url for the RabbitMQ instance
// The next three keys are collected from a locally stored Youtube Cookie that you must retrieve off your computer
- SID
- HSID
- SSID

### Client Side Keys
 
You will also need to insert your Youtube API key into `./src/client/src/utils/youtube.js`.

## Usage

To start a development version of this application: run `npm run dev`.  
To build a production version: run `npm run build`.

Once you have everything fired up, browse to `http://localhost`.  
You will be able to search for a video using the search bar, view the video in the player and queue the video for download.  
  
Videos downloaded will be uploaded to `/Videos/Youtube` on your Synology Device.  
This path can be modified in `./src/services/synoUploader.js`.

## Tests

```
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details
