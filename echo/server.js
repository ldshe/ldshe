require('dotenv').config();

const env = process.env;
const EchoServer = require('laravel-echo-server');

const options = {
	authHost: env.LDSHE_HOST,
	authEndpoint: '/api/broadcasting/auth',
	// clients: [{
	// 	appId: env.APP_ID,
	// 	key: env.APP_KEY,
	// }],
	database: 'redis',
	databaseConfig: {
		redis: {
			host: env.REDIS_HOST,
			port: env.REDIS_PORT,
			password: env.REDIS_PASSWORD,
		},
		sqlite: {}
	},
	devMode: env.APP_DEBUG == 'true' ? true : false,
	host: env.ECHO_HOST ? env.ECHO_HOST : null,
	port: env.ECHO_PORT ? env.ECHO_PORT : '6001',
	protocol: 'http',
	socketio: {},
	sslCertPath: '',
	sslKeyPath: '',
	sslCertChainPath: '',
	sslPassphrase: '',
	apiOriginAllow: {
		allowCors: false,
		allowOrigin: '',
		allowMethods: '',
		allowHeaders: ''
	},
	socketio: {
		cookie: false,
	},
};

EchoServer.run(options);
