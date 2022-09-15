//dependencies.............
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helpers/utilities');
const { createRandomString } = require('../../helpers/utilities');

//scaffolding..............
const handler = {};

handler.tokenHandler = (requestProperties,callback) => {
    const acceptMethods = ['get', 'post', 'put', 'delete'];

    if(acceptMethods.indexOf(requestProperties.method) > -1 ){
        handler._token[requestProperties.method](requestProperties,callback);
    }else{
        callback(405);
    }
};

//another scaffolding............
handler._token = {};

handler._token.post = (requestProperties,callback) => {
    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;
    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if(phone && password){
        data.read('users', phone, (err,uData) => {
            
            let userData = {...parseJSON(uData)};
            let hashedPassword = hash(password);

            if(hashedPassword === userData.password){

                let tokenId = createRandomString(20);
                let expire = Date.now() + 60 * 60 * 1000;

                let tokenObject = {
                    phone,
                    id: tokenId,
                    expire
                };

                //store token in DB..............
                data.create('tokens', tokenId, tokenObject, (err) => {
                    if(!err){
                        callback(200,tokenObject);
                    }else{
                        callback(500,{
                            error: 'There was a problem in server side!'
                        });
                    }
                });
            }else{
                callback(400,{
                    error: 'Password invalid!'
                });
            }
        });
    }else{
        callback(400,{
            error: 'You have a problem in your request',
        });
    }
};

handler._token.get = (requestProperties,callback) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length > 0 ? requestProperties.queryStringObject.id : false;

    if(id){
        data.read('tokens', id, (err,tData)=>{

            let tokenData = {...parseJSON(tData)};
    
            if(!err){
                callback(200,tokenData);
            }else{
                callback(400,{
                    error: 'You do not have any token',
                });
            }
        });
    }else{
        callback(400);
    }
};

handler._token.put = (requestProperties,callback) => {
    const id = typeof(requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;
    const extend = typeof(requestProperties.body.extend) === 'boolean' && requestProperties.body.extend === true ? true : false;

    if(id && extend){
        data.read('tokens', id, (err, tData) => {

            let tokenData = parseJSON(tData);

            if(tokenData.expire > Date.now()){

                let expire = Date.now() + 60 * 60 *1000;                
                let tokenObject = {
                    expire
                };

                //store updated data in DB..........
                data.update('tokens', id, tokenObject, (err) => {

                    if(!err){
                        callback(200,{
                            message: 'Token updated successfully!'
                        })
                    }else{
                        callback(400,{
                            error: 'There was a server side error!'
                        });
                    }

                });
            }else{
                callback(400,{
                    error: 'Token already expired!'
                })
            }
        })
    }else{
        callback(400,{
            error: 'There was a problem in your request'
        });
    }
};

handler._token.delete = (requestProperties,callback) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length > 0 ? requestProperties.queryStringObject.id : false;

    if(id){

        data.delete('tokens', id, (err,tokenData) => {
            if(!err && tokenData){
                callback(200,{
                    message: 'token deleted successfully!'
                });
            }else{
                callback(400,{
                    error: 'token not found!'
                });
            }
        });
    }else{
        callback(400,{
            error: 'token not found!'
        });
    }
};

handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expire > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handler;