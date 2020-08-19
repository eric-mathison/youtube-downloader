const decode = (string) => {
    const el = document.createElement('div');
    el.innerHTML = string;
    const cleaned = el.innerText;
    return cleaned;
};

const truncate = (string, length) => {
    return string.length > length
        ? `${string.substring(0, length)}...`
        : string;
};

export { decode, truncate };
