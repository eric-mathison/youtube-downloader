const fs = require('fs');
const axios = require('axios');
const path = require('path');
const FormData = require('form-data');
const keys = require('../config/keys');
const logger = require('../config/logger');

async function uploader(files) {
    try {
        const baseUrl = `https://${keys.synoHost}:${keys.synoPort}`;
        const getSid = await axios.get(
            `${baseUrl}/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=login&account=${keys.synoUser}&passwd=${keys.synoPass}&session=FileStation&format=sid
    `
        );

        const sid = await getSid.data.data.sid;
        const fileApiUrl = `${baseUrl}/webapi/entry.cgi?api=SYNO.FileStation.Upload&method=upload&version=2&_sid=${sid}`;

        const uploads = await Promise.all(
            files.map(async (file) => {
                const form = new FormData();
                form.append('overwrite', 'true');
                form.append('path', '/Videos/Youtube');
                form.append('create_parents', 'true');
                form.append(
                    'file',
                    fs.createReadStream(
                        path.join(__dirname, '..', '..', 'uploads', file)
                    )
                );
                logger.debug('Making Post Request to Syno');
                const uploadResponse = await axios.post(fileApiUrl, form, {
                    headers: {
                        // eslint-disable-next-line no-underscore-dangle
                        'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
                    },
                    timeout: 300000,
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                });
                return uploadResponse.data;
            })
        );

        return new Promise((resolve, reject) => {
            if (uploads) {
                uploads.forEach((obj) => {
                    if (obj.success === true) {
                        try {
                            fs.unlinkSync(
                                path.join(
                                    __dirname,
                                    '..',
                                    '..',
                                    'uploads',
                                    obj.data.file
                                )
                            );
                        } catch (err) {
                            logger.error(err);
                            reject();
                        }
                    }
                });
            }
            return resolve();
        });
    } catch (e) {
        logger.error(`[synoUploader] ${e}`);
        return e;
    }
}

module.exports = uploader;
