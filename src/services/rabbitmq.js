const amqp = require('amqplib/callback_api');
const keys = require('../config/keys');
const logger = require('../config/logger');
const { downloadVideo } = require('./ytDownload');
const uploader = require('./synoUploader');
const { isJson } = require('../utils');

let amqpConn = null;
let pubChannel = null;
const offlinePubQueue = [];

// method to publish a message, will queue messages internally if the connection is
// down and resend later
function publish(exchange, routingKey, content) {
    try {
        pubChannel.publish(
            exchange,
            routingKey,
            content,
            { persistent: true },
            // eslint-disable-next-line no-unused-vars
            (err, ok) => {
                if (err) {
                    logger.error(`[AMQP] publish ${err}`);
                    offlinePubQueue.push([exchange, routingKey, content]);
                    pubChannel.connection.close();
                }
            }
        );
    } catch (e) {
        logger.error(`[AMQP] publish ${e.message}`);
        offlinePubQueue.push([exchange, routingKey, content]);
    }
}

function closeOnErr(err) {
    if (!err) return false;
    logger.error(`[AMQP] error ${err}`);
    amqpConn.close();
    return true;
}

function startPublisher() {
    amqpConn.createConfirmChannel((err, ch) => {
        if (closeOnErr(err)) return;
        ch.on('error', (error) => {
            logger.error(`[AMQP] channel error ${error.message}`);
        });
        ch.on('close', () => {
            logger.info('[AMQP] channel closed');
        });
        pubChannel = ch;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const m = offlinePubQueue.shift();
            if (!m) break;
            publish(m[0], m[1], m[2]);
        }
    });
}

async function work(msg, cb) {
    logger.debug(`Got msg ${msg.content.toString()}`);
    if (isJson(msg.content) && JSON.parse(msg.content).type === 'video') {
        try {
            logger.info('Starting Download');
            const { videoId } = JSON.parse(msg.content);
            const download = await downloadVideo(videoId);
            const content = JSON.stringify({
                filename: download.fileName,
                type: 'upload',
            });
            publish('', 'jobs', Buffer.from(content));
            logger.info('Finished Download');
            return cb(true);
        } catch (e) {
            logger.error(`[Worker Download] ${e}`);
            return cb(false);
        }
    }
    if (isJson(msg.content) && JSON.parse(msg.content).type === 'upload') {
        try {
            logger.info('Starting Upload');
            const video = `${JSON.parse(msg.content).filename}.mp4`;
            const thumbnail = `${JSON.parse(msg.content).filename}.jpg`;
            await uploader([video, thumbnail]);
            logger.info('Finished Upload');
            return cb(true);
        } catch (e) {
            logger.error(`[Worker Upload] ${e}`);
            return cb(false);
        }
    }
    logger.debug('No Workers.... Flushing');
    return cb(true);
}

// A worker that acks messages only if processed successfully
function startWorker() {
    amqpConn.createChannel((err, ch) => {
        const processMsg = (msg) => {
            work(msg, (ok) => {
                try {
                    if (ok) {
                        ch.ack(msg);
                    } else {
                        ch.reject(msg, true);
                    }
                } catch (e) {
                    closeOnErr(e);
                    logger.error(`[AMQP Worker] ${e}`);
                }
            });
        };

        if (closeOnErr(err)) return;
        ch.on('error', (error) => {
            logger.error(`[AMQP] channel error ${error.message}`);
        });
        ch.on('close', () => {
            logger.info('[AMQP] channel closed');
        });
        ch.prefetch(1);
        // eslint-disable-next-line no-unused-vars
        ch.assertQueue('jobs', { durable: true }, (errr, _ok) => {
            if (closeOnErr(errr)) return;
            ch.consume('jobs', processMsg, { noAck: false });
            logger.info('Worker is started');
        });
    });
}

function whenConnected() {
    startPublisher();
    startWorker();
}

// if the connection is closed or fails to be established, it will reconnect
function start() {
    amqp.connect(`${keys.amqpURL}?heartbeat=60`, (err, conn) => {
        if (err) {
            logger.error(err);
            return setTimeout(start, 1000);
        }
        conn.on('error', (error) => {
            if (error.message !== 'Connection closing') {
                logger.error(`[AMQP] connection error ${error.message}`);
            }
        });
        conn.on('close', () => {
            logger.error('[AMQP] reconnecting');
            return setTimeout(start, 1000);
        });
        logger.info('[AMQP] connected');
        amqpConn = conn;
        return whenConnected();
    });
}

start();

module.exports = publish;
