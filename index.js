var uuid = require( 'uuid' );

var configKey = 'bunyanRequestLogger';

module.exports = function( sails ) {

    var logger;
    var requestIdProperty;
    var requestIdProvider;
    var requestSerializer;

    /**
     * Attaches a child bunyan request logger to the request.
     * @param req The request
     * @param res The response
     * @param next The next action
     */
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

                /**
                 * The property name of the request id
                 */
                requestIdProperty: 'req_id',

                /**
                 * Gets or generates a unique id for the request, and attaches it
                 * to the request logger's options. If no id is returned, then the
                 * request logger is unmodified.
                 *
                 * For example, a heroku style (https://devcenter.heroku.com/articles/http-request-id) provider:
                 *
                 * function( req ) {
                 *   var id = req.headers['x-request-id'] || uuid.v4();
                 *   return req.id;
                 * }
                 *
                 * The default request id provider returns a UUID v4 (without dashes).
                 */
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

/**
 * Generates a uuid v4 request id
 * @returns {string} Returns the new request id
 */
function generateRequestId() {

    var buffer = new Buffer( 16 );
    uuid.v4( null, buffer, 0 );

    var id = buffer.toString( 'hex' );
    return id;
}

function nullRequestSerializer( req ) {
    return req;
}
