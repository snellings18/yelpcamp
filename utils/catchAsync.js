// Function to catch errors in async functions in app.js

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}