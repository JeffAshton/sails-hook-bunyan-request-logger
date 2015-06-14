var uuid = require( 'uuid' );

var configKey = 'bunyanRequestLogger';

module.exports = function( sails ) {

    var logger;
    var requestIdProperty;
    var requestIdProvider;
    var requestSerializer;

    var attachBunyanRequestLogger = function( req, res, next ) {

        try {
            var options = {
                req: requestSerializer( req )
            };

            var requestId = requestIdProvider( req, res );
            if( requestId !== null ) {
                options[ requestIdProperty ] = requestId;
            }

            req.log = logger.child( options, true );

            if( typeof req.id === undefined ) {
                req.id = requestId;
            }

        } catch( err ) {
            logger.error( err );
        } finally {
            next();
        }
    };

    return {

        defaults: function() {

            var config = {};
            config[ configKey ] = {
                requestIdProperty: 'req_id',
                requestIdProvider: generateRequestId
            };

            return config;
        },

        config: function() {

            sails.config.http.middleware.attachBunyanRequestLogger = attachBunyanRequestLogger;
        },

        initialize: function( done ) {

            sails.after( 'hook:bunyan:loaded', function() {

                var config = sails.config[ configKey ];
                requestIdProperty = config.requestIdProperty;
                requestIdProvider = config.requestIdProvider;

                logger = sails.hooks.bunyan.logger;
                requestSerializer = logger.serializers.req || nullRequestSerializer;

                done();
            });
        }
    };
};

function generateRequestId() {

    var buffer = new Buffer( 16 );
    uuid.v4( null, buffer, 0 );

    var id = buffer.toString( 'hex' );
    return id;
}

function nullRequestSerializer( req ) {
    return req;
}
