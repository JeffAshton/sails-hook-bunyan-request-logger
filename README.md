# sails-hook-bunyan-request-logger
An extension to [sails-hook-bunyan] which adds a richer request logger.
It's installed as a [sails hook] and injected through [sails middleware].

## Installation

First, install the modules.

```
$ npm install sails-hook-bunyan
$ npm install sails-hook-bunyan-request-logger
```

Disable the [sails-hook-bunyan] built-in request logger.

```
// config/log.js
module.exports.log = {

    /** Handled by sails-hook-bunyan-request-logger */
    injectRequestLogger: false
}
```

Then, in your project's http config file, inject 'attachBunyanRequestLogger' into your middleware.
Idealy inject it before any of your custom middleware in order to leverage your request's logger.

```js
// config/http.js
module.exports.http = {

  middleware: {

    order: [
      ...
      'attachBunyanRequestLogger',
      ...
    ]
  }
```

## Configuration

You are able to configure the name of request id property serialized in every log message, 
as well you're able to provide a custom request id provider.

```js
// config/bunyanRequestLogger.js
module.exports.bunyanRequestLogger = {

  /**
   * The property name of the request id
   */
  requestIdProperty: 'reqId',
  
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
  requestIdProvider: function( req ) { ... }
};
```

 [sails hook]: http://sailsjs.org/#!/documentation/concepts/extending-sails/Hooks
 [sails-hook-bunyan]: https://github.com/building5/sails-hook-bunyan
 [sails middleware]: https://github.com/balderdashy/sails-docs/blob/master/concepts/Middleware/Middleware.md
