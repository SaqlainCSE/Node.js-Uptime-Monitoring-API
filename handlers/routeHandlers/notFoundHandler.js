const handler = {};

handler.notFoundHandler = (requestProperties,callback) => {
    callback(404,{
        message: 'Page not found',
    })
};

module.exports = handler;