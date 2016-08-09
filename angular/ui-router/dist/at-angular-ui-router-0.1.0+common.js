 /**
 * Copyright 2016 Adobe Systems, Inc. http://www.adobe.com
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/* global adobe, angular */
(function (angular, at) {
  'use strict';

  function getOfferPromise(promise, options) {
    options = options || {};
    var atOpts = {
      mbox: options.mbox,
      params: options.params,
      timeout: options.timeout
    };
    var deferred = promise.defer();
    atOpts.success = function (response) {
      if (response && response.length > 0) {
        deferred.resolve({
          mbox: options.mbox,
          offer: response,
          selector: options.selector,
          element: options.element
        });
      } else {
        deferred.reject('Empty offer');
      }
    };
    atOpts.error = function (status, error) {
      deferred.reject(error);
    };
    at.getOffer(atOpts);
    return deferred.promise;
  }

  function applyOfferPromise(promise, options) {
    return promise(function (resolve, reject) {
      at.applyOffer(options);
      resolve();
    });
  }

  function OfferService(promise) {
    this.getOfferPromise = function (options) {
      return getOfferPromise(promise, options);
    };
    this.applyOfferPromise = function (options) {
      return applyOfferPromise(promise, options);
    };
  }

  function isRouteAllowed(routeName, opts) {
    return (opts.allowedRoutesFilter.length === 0 || opts.allowedRoutesFilter.indexOf(routeName) !== -1) &&
      !(opts.disallowedRoutesFilter.length > 0 && opts.disallowedRoutesFilter.indexOf(routeName) !== -1);
  }

  function RouteService() {
    this.isRouteAllowed = isRouteAllowed;
  }

  function getOptions(settings, opts) {
    return {
      mbox: opts.mbox || settings.globalMboxName,
      timeout: opts.timeout || settings.timeout,
      globalMboxAutoCreate: settings.globalMboxAutoCreate,
      params: opts.params || null,
      selector: opts.selector || null,
      allowedRoutesFilter: opts.allowedRoutesFilter || [],
      disallowedRoutesFilter: opts.disallowedRoutesFilter || [],
      appendToSelector: opts.appendToSelector || false
    };
  }

  function setupCommonModule(settings, logger, opts) {
    angular.module('target.angular.common', [])
      .constant('version', '0.3.0')
      .constant('settings', settings)
      .constant('logger', logger)
      .constant('customOptions', opts)

      .factory('options', ['settings', 'customOptions', getOptions])

      .service('routeService', RouteService)
      .service('offerService', ['$q', OfferService]);
  }

  at.registerExtension({
    name: 'angular.setupCommon',
    modules: ['settings', 'logger'],
    register: function (settings, logger) {
      return function (opts) {
        setupCommonModule(settings, logger, opts);
      };
    }
  });
})(angular, adobe.target);


/* global adobe, angular */
(function (document, angular, at) {
  'use strict';

  function addModuleDependencies(module, dependencies) {
    dependencies.forEach(function (dependency) {
      if (module.requires.indexOf(dependency) === -1) {
        module.requires.push(dependency);
      }
    });
  }

  function setStateOfferResolve(state, offerPromiseFn) {
    state.resolve = state.resolve || {};
    state.resolve.offerData = offerPromiseFn;
  }

  function routeServiceDecorator($delegate, options, offerService, logger) {
    $delegate.applyTargetToStates = function (states) {
      states.forEach(function (state) {
        if ($delegate.isRouteAllowed(state.url, options)) {
          logger.log('location: ' + state.url);
          setStateOfferResolve(state, function () {
            return offerService.getOfferPromise(options);
          });
        }
      });
    };
    return $delegate;
  }

  function decorateRouteService() {
    angular.module('target.angular.common')
      .decorator('routeService', ['$delegate', 'options', 'offerService', 'logger', routeServiceDecorator]);
  }

  function initializeModule(module) {
    module.run(['$rootScope', '$state', 'routeService', 'offerService', 'options', 'logger',
      function ($rootScope, $state, routeService, offerService, options, logger) {
        routeService.applyTargetToStates($state.get());

        $rootScope.$on('$viewContentLoaded', function () {
          var offerData = $state.$current.locals.globals.offerData;
          if (offerData) {
            offerService.applyOfferPromise(offerData)
              .catch(function (reason) {
                logger.error('AT applyOffer error: ' + reason);
              });
          }});
      }]);
  }

  at.registerExtension({
    name: 'angular.initStates',
    modules: [],
    register: function () {
      return function (app, opts) {
        at.ext.angular.setupCommon(opts);
        decorateRouteService();
        var appModule = (typeof app === 'string') ? angular.module(app) : app;
        addModuleDependencies(appModule, ['target.angular.common']);
        initializeModule(appModule);
      };
    }
  });
})(document, angular, adobe.target);