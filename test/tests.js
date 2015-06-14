var expect = require( 'expect' );
var bunyanRequestLoggingHook = require( '..' );

describe( 'sails-hook-bunyan-request-logger', function() {

    var sails = {
        config: {
            http: {
                middleware: {}
            }
        }
    };
    var hook = bunyanRequestLoggingHook(sails);

    describe( 'when invoked', function() {

        var defaults = hook.defaults();
        var brlDefaults = defaults['bunyanRequestLogger'];

        it('should setup default request id name config property', function () {
            expect(brlDefaults.requestIdProperty).toBe('req_id');
        });

        it('should setup default request id provider config function', function () {
            expect(brlDefaults.requestIdProvider).toBeA(Function);

            var requestId = brlDefaults.requestIdProvider();
            expect(requestId).toMatch(/^[A-Za-z0-9]{32}$/, 'Should be a uuid without dashes');
        });
    });

    describe( 'when configured', function() {

        hook.config();

        it( 'sails should have http middleware setup', function() {
            expect( sails.config.http.middleware.attachBunyanRequestLogger ).toBeA( Function );
        });
    });
});