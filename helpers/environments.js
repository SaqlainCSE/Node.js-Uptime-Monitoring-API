//scaffolding.............
const environments = {};

environments.staging = {
    port : 3000,
    envName : 'staging',
    secretKey: 'asdfghjkl',
    maxChecks: 5,
    twilio: {
        fromPhone: '01688496756',
        accountSid: '',
        authToken: '',
    },
};

environments.production = {
    port : 5000,
    envName : 'production',
    secretKey: 'lkjhgfdsa',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: '',
    },
};

const currentEnvironment = typeof(process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging');

const environmentToExport = typeof(environments[currentEnvironment] === 'object' ? environments[currentEnvironment] : environments.staging);

module.exports = environmentToExport;
module.exports = environments;