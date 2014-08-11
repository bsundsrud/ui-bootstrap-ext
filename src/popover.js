angular.module('ui.ext.popover', []).provider('$extPopup', function() {
    return {
        $get: ['$rootScope', '$q', '$compile', '$document', '$http', '$templateCache', function($rootScope, $q, $compile, $document, $http, $templateCache) {
            var $popup = {};
            function getTemplatePromise(options) {
                return options.template ? $q.when(options.template) :
                    $http.get(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl,
                        {cache: $templateCache}).then(function (result) {
                        return result.data;
                    });
            }
            $popup.open = function(options) {
                var popupResultDeferred = $q.defer();
                var popupOpenedDeferred = $q.defer();
                var popupInstance = {
                    result: popupResultDeferred.promise,
                    opened: popupOpenedDeferred.promise,
                    close: function (result) {
                        popupResultDeferred.resolve(result);
                    },
                    dismiss: function (reason) {
                        popupResultDeferred.reject(reason);
                    }
                };
                var templatePromise = getTemplatePromise(options);
                templatePromise.then(function resolveSuccess(tpl) {
                    var body = $document.find('body').eq(0);
                    var modalScope = (options.scope || $rootScope).$new();
                    modalScope.$close = popupInstance.close;
                    modalScope.$dismiss = popupInstance.dismiss;
                    var innerEl = angular.element('<div class="popover-inner"></div>');
                    innerEl.html(tpl);
                    var domEl = angular.element('<div></div>');
                    domEl.append(angular.element('<div class="arrow"></div>'));
                    domEl.append(innerEl);
                    domEl.attr({
                        class: "popover left",
                        style: "display: block;"
                    });
                    var popupDomEl = $compile(domEl)(modalScope);
                    body.append(popupDomEl);

                }, function resolveError(reason) {
                    popupResultDeferred.reject(reason);
                });
                templatePromise.then(function () {
                    popupOpenedDeferred.resolve(true);
                }, function () {
                    popupOpenedDeferred.reject(false);
                });

                return popupInstance;
            };
            return $popup;
        }]
    }
});

