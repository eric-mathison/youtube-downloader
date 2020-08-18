const { check, validationResult } = require('express-validator');
const publish = require('../services/rabbitmq');
const { downloadPlaylist } = require('../services/ytDownload');

module.exports = (app) => {
    app.get(
        '/api/add-video/:videoId',
        [
            check('videoId')
                .notEmpty()
                .withMessage('You need to specify a video'),
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).send({ errors: errors.array() });
            }

            const content = JSON.stringify({
                videoId: req.params.videoId,
                type: 'video',
            });

            publish('', 'jobs', Buffer.from(content));
            return res.send();
        }
    );

    app.get(
        '/api/add-playlist/:playListId',
        [
            check('playListId')
                .notEmpty()
                .withMessage('You need to specify a playlist'),
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).send({ errors: errors.array() });
            }

            const videos = await downloadPlaylist(req.params.playListId);
            videos.map((videoId) => {
                const content = JSON.stringify({ videoId, type: 'video' });
                return publish('', 'jobs', Buffer.from(content));
            });

            return res.send();
        }
    );
};
