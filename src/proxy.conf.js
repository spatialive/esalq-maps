const proxy = [
    {
        context: ['/geoservico'],
        target: 'http://34.71.4.88:3000',
        pathRewrite: {'^/geoservico' : ''},
        secure: true,
        logLevel: 'debug',
        changeOrigin: true,
        rejectUnhauthorized : false
    }
];
module.exports = proxy;
