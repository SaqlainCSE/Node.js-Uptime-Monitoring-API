//module scaffolding..............
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);
    
    callback(200, {
        message: 'This is sample URL',
    });
};

module.exports = handler;