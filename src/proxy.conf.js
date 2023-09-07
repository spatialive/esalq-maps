const proxy = [
    {
        context: ['/geoservico'],
        // target: 'http://siscom.ibama.gov.br',
        target: 'http://geo.sema.mt.gov.br',
        pathRewrite: {'^/geoservico' : ''},
        secure: true,
        logLevel: 'debug',
        changeOrigin: true,
        rejectUnhauthorized : false
    }
];
module.exports = proxy;
