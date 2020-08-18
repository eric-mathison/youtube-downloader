function isJson(str) {
    try {
        const json = JSON.parse(str);
        return typeof json === 'object';
    } catch (e) {
        return false;
    }
}

function sanitizeFilename(filename) {
    const regex = /\/+/gi;
    const str = filename.replace(regex, '-');
    return str;
}

module.exports = { isJson, sanitizeFilename };
