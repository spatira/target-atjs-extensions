# at-angular-ng-route
> Angular ngRoute Adobe Target **at.js** extension  
> This adds a Target getOffer() resolve to all ngRoute routes and applies the resolved offer once a view is loaded.

## Overview

This extension applies a Target getOffer() promise resolve to all of your app's ngRoute routes. Thus, when a route is selected, the requested Target offers are fetched via **at.js** API.  
Once the view corresponding to the current route is fully loaded, the offer is applied to the elements matching the configured Target selector (provided in options parameter).  
The extension should be used in Angular apps utilizing the ngRoute routing module (`angular-route(.min).js`).  
  
**Note:** The extension requires [`at-angular-common extension`](../common/)(`target.angular.common` Angular module). If you're not already loading it separately in your app, just use the `at-angular-ng-route+common.js` version, which has it bundled.

## Usage

```javascript
adobe.target.ext.angular.initRoutes(app, options);
```

where `options` object contains custom **at.js** options.  

## Options

> The following options can be provided in the `options` object:

Key | Type | Mandatory | Description
--- | ---- | --------- | -----------
`mbox` | String | Yes | mbox name. It is mandatory if you want to track clicks. If not provided, an error will be logged and tracking event won't be attached.
`params` | Object | No | mbox parameters - an object of key-value pairs, that has the following structure:<br>`{`<br>`"param1": "value1",`<br>`"param2": "value2"`<br>`}`
`timeout` | Number | No | timeout in milliseconds. If not specified, default adobe.target will be used. Default timeout is the one set via mbox.js settings. This value can be configured using mbox.js settings in Target Classic Admin UI Advanced Mode or in Bullseye UI.
`element` | DOM element | No | Dom element to be used as container for the target offer content. This option excludes the usage of `selector` option. If both are specified, an error will be logged and applyOffer() execution will be cancelled.
`selector` | String | No | CSS selector used to identify the HTML element that shall contain the offer content. If selector is not provided, it shall be assumed that the HTML element to be used is HTML HEAD, or document.documentElement, in case HTML HEAD is not present. This option excludes the usage of `element` option. If both are specified, an error will be logged and applyOffer() execution will be cancelled.

## License

Apache-2.0 © [Adobe Systems, Inc.](http://www.adobe.com)
