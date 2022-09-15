//dependecies......................
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

//Scaffolding.......................
const handler = {};

handler.userHandler = (requestProperties, callback) => {

    const acceptMethods = ['get', 'post', 'put', 'delete'];

    if(acceptMethods.indexOf(requestProperties.method) > -1 ){
        handler._users[requestProperties.method](requestProperties,callback);
    }else{
        callback(405);
    }
};

//another scaffolding..................
handler._users = {};

handler._users.post = (requestProperties,callback) => {
    const firstName = typeof(requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;
    const lastName = typeof(requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;
    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;
    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
    const tosAssignment = typeof(requestProperties.body.tosAssignment) === 'boolean' && requestProperties.body.tosAssignment ? requestProperties.body.tosAssignment : false;

    if(firstName && lastName && phone && password && tosAssignment)
    {
        data.read('users',phone,(err,user)=>{
            if(err){
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password : hash(password),
                    tosAssignment,
                };

                //store the data to DB......
                data.create('users', phone, userObject, (err) => {
                    if(!err)
                    {
                        callback(200,{
                            message: 'User create successfully!'
                        });
                    }else{
                        callback(500,{
                            error: 'Counld not create user'
                        });
                    }
                })
            }else{
                callback(500,{
                    error: 'There was a problem in server side!',
                });
            }
        });
    }else{
        callback(400,{
            error: 'You have a problem in your request',
        });
    }
};

//@auth system in this for get user............
handler._users.get = (requestProperties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;
    if (phone) {
        // verify token
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                // lookup the user
                data.read('users', phone, (err, u) => {
                    const user = { ...parseJSON(u) };
                    if (!err && user) {
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(404, {
                            error: 'Requested user was not found!',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication failure!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested user was not found!',
        });
    }
};

//@auth system in this for delete user............
handler._users.delete = (requestProperties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;

    if (phone) {
        // verify token
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                // lookup the user
                data.read('users', phone, (err1, userData) => {
                    if (!err1 && userData) {
                        data.delete('users', phone, (err2) => {
                            if (!err2) {
                                callback(200, {
                                    message: 'User was successfully deleted!',
                                });
                            } else {
                                callback(500, {
                                    error: 'There was a server side error!',
                                });
                            }
                        });
                    } else {
                        callback(500, {
                            error: 'There was a server side error!',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication failure!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request!',
        });
    }
};

//@auth system in this for update user............
handler._users.put = (requestProperties, callback) => {
    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;
    const firstName = typeof(requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;
    const lastName = typeof(requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;
    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
    
    if (phone) {
        if (firstName || lastName || password) {
            // verify token
            const token =
                typeof requestProperties.headersObject.token === 'string'
                    ? requestProperties.headersObject.token
                    : false;

            tokenHandler._token.verify(token, phone, (tokenId) => {
                if (tokenId) {
                    // loopkup the user
                    data.read('users', phone, (err1, uData) => {
                        const userData = { ...parseJSON(uData) };

                        if (!err1 && userData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.firstName = firstName;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }

                            // store to database
                            data.update('users', phone, userData, (err2) => {
                                if (!err2) {
                                    callback(200, {
                                        message: 'User was updated successfully!',
                                    });
                                } else {
                                    callback(500, {
                                        error: 'There was a problem in the server side!',
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: 'You have a problem in your request!',
                            });
                        }
                    });
                } else {
                    callback(403, {
                        error: 'Authentication failure!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You have a problem in your request!',
            });
        }
    } else {
        callback(400, {
            error: 'Invalid phone number. Please try again!',
        });
    }
};

module.exports = handler;