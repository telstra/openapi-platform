const { schema } = require('@openapi-platform/config');
schema.load({});
console.log(schema.get('server.port'));

/*const { run } = require('../lib/index');
run();*/
