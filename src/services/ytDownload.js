const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const axios = require('axios');
const logger = require('../config/logger');
const keys = require('../config/keys');
const { sanitizeFilename } = require('../utils/index');

async function downloadVideo(videoId) {
    logger.debug('Getting Download Info');

    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    return new Promise((resolve, reject) => {
        const COOKIE = `SID=${keys.sid}; HSID=${keys.hsid}; SSID=${keys.ssid};`;

        logger.debug('Beginning Download');
        try {
            const video = ytdl(videoId, {
                requestOptions: {
                    headers: {
                        cookie: COOKIE,
                    },
                },
            });

            video.on('error', (err) => {
                logger.error(`[ytDownload] ${err}`);
                return reject;
            });

            let fileName;
            let thumbnailUrl;

            video.on('info', (info) => {
                fileName = sanitizeFilename(info.videoDetails.title);
                thumbnailUrl = info.videoDetails.thumbnail.thumbnails[0].url
                    .split('?')
                    .shift();

                video.pipe(
                    fs.createWriteStream(
                        path.join(
                            __dirname,
                            '..',
                            '..',
                            'uploads',
                            `${fileName}.mp4`
                        )
                    )
                );
            });

            video.on('end', async () => {
                logger.debug('Finished Downloading');
                logger.debug('Downloading Thumbnail');
                const downloadThumb = await axios.get(thumbnailUrl, {
                    responseType: 'stream',
                });
                const thumb = downloadThumb.data.pipe(
                    fs.createWriteStream(
                        path.join(
                            __dirname,
                            '..',
                            '..',
                            'uploads',
                            `${fileName}.jpg`
                        )
                    )
                );
                thumb.on('finish', () => {
                    logger.debug('Finished Downloading Thumb');
                    resolve({ fileName });
                });
            });
        } catch (e) {
            logger.error(`[ytDownload] ${e}`);
            reject();
        }
    });
}

async function downloadPlaylist(playlistId) {
    const result = await ytpl(playlistId);
    const items = result.items.map((item) => item.id);
    return items;
}

module.exports = { downloadPlaylist, downloadVideo };
