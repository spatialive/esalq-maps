const proxy = [
    {
        context: ['/geoservico'],
        target: 'http://34.123.211.92:8080',
        pathRewrite: {'^/geoservico' : ''},
        secure: true,
        logLevel: 'debug',
        changeOrigin: true,
        rejectUnhauthorized : false
    }
];
module.exports = proxy;
