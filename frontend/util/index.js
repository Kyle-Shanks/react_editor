export const debounce = (callback, wait) => {
    let timeout;
    return (...args) => {
        const later = () => {
            clearTimeout(timeout);
            callback(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
