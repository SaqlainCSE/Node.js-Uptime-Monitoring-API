//dependencies.............
const crypto = require('crypto');
const environments = require('./environments');

//scaffolding...............
const utilities = {}; 

utilities.parseJSON = (jsonString) => {
    let output;

    try{
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }

    return output;
};

utilities.hash = (str) => {
    if(typeof str === 'string' && str.length > 0)
    {
        const hash = crypto.createHmac('sha1', environments[process.env.NODE_ENV].secretKey)
        .update(str)
        .digest('hex');

        return hash;
    }else{
        return false;
    }
};

utilities.createRandomString = (strlength) => {
    let length = strlength;
    length = typeof strlength === 'number' && strlength > 0 ? strlength : false;

    if(length){
        const possiblecharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output= '';
        for(let i=0 ; i<=length; i++){
            const randomCharacter = possiblecharacters.charAt(Math.floor(Math.random() * possiblecharacters.length));

            output += randomCharacter;
        }
        return output;
    } else {
        return false;
    }
};

module.exports = utilities;