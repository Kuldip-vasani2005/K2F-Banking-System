// Backend/src/utils/wrapAsync.js
const wrapAsync = (fn) => {
    return (req, res, next) => {
        // Make sure fn is a function
        if (typeof fn !== 'function') {
            console.error('wrapAsync: fn is not a function:', fn);
            return next(new Error('Controller function is undefined'));
        }
        
        // Handle async function
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = { wrapAsync };