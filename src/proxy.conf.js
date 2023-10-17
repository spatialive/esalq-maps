const {Agent} = require("https");
const agent = new Agent({
    rejectUnauthorized: false
});

const proxy = [
    {
        context: ['/geoservico'],
        target: 'https://teeb.gppesalq.agr.br',
        pathRewrite: {'^/geoservico' : ''},
        secure: true,
        logLevel: 'debug',
        changeOrigin: true,
        agent: agent,
        rejectUnauthorized : false,
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[INFO] Proxying request GEOSERVER - ${req.method} ${req.url}`);
        },
    }
];
module.exports = proxy;
