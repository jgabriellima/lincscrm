(function() {
    'use strict';
    window.appversion = '0.1';
    window.online = true;
    window.vbase = '0.2';
    window.molotov = angular.module('lincscrm', ['mongolabResourceHttp', 'facebook']);
    window.molotov.config(function(FacebookProvider) {
        FacebookProvider.init('1501693240076943');
    });
    window.molotov.constant('MONGOLAB_CONFIG', {
        API_KEY: 'F1Fk9-FjLLrA4c62rbTuCDmgkGg0sE4A',
        DB_NAME: 'scrmdb'
    });
    window.molotov.factory('User', function($mongolabResourceHttp) {
        return $mongolabResourceHttp('faceusers');
    });
    window.molotov.filter('trusted', ['$sce',
        function($sce) {
            return function(url) {
                return $sce.trustAsResourceUrl(url);
            };
        }
    ]);
    window.molotov.controller('SCRMController', ['$scope', '$http', 'User', 'Facebook',
        function($scope, $http, User, Facebook) {

            /*FACEBOOK*/
            $scope.loginStatus = 'disconnected';
            $scope.loginStatusb = false;
            $scope.facebookIsReady = false;
            $scope.user = null;

            $scope.login = function() {
                Facebook.login(function(response) {
                    $scope.loginStatus = response.status;
                    if ($scope.loginStatus === 'connected') {
                        $scope.loginStatusb = true;
                        $scope.api();
                    } else {
                        $scope.loginStatusb = false;
                    }
                }, {
                    scope: 'email,user_likes,user_groups,read_stream,publish_actions,read_friendlists,user_tagged_places,user_status,user_interests'
                });
            };
            $scope.logout = function() {
                Facebook.logout(function(response) {
                    $scope.loginStatus = response.status;
                    if ($scope.loginStatus === 'connected') {
                        $scope.loginStatusb = true;
                    } else {
                        $scope.loginStatusb = false;
                    }
                });
            };

            $scope.removeAuth = function() {
                console.log("removeAuth");
                FB.api('/me/permissions', 'delete', function(response) {
                    Facebook.getLoginStatus(function(response) {
                        $scope.loginStatus = response.status;
                        console.log($scope.loginStatus);
                        if ($scope.loginStatus === 'connected') {
                            $scope.loginStatusb = true;
                        } else {
                            $scope.loginStatusb = false;
                        }
                    });
                });
            };

            $scope.api = function() {
                if ($scope.loginStatusb) {
                    if ($scope.user === null) {
                        Facebook.api('/me', function(response) {
                            $scope.user = new User(response);
                            User.query({
                                "id": response.id
                            }).then(function(result) {
                                console.log('result', result);
                                if (result.length === 0) {
                                    $scope.user.dtcreated = Date.now();
                                    $scope.user = $scope.user.$saveOrUpdate();
                                }
                                console.log("$scope.user", $scope.user);
                            });
                        });
                    }
                }
            };

            $scope.getFeed = function() {
                Facebook.api($scope.user.id + '/feed', function(response) {
                    console.log(response);
                });
            };
            $scope.getFriends = function() {
                Facebook.api($scope.user.id + '/friends', function(response) {
                    $scope.user.friends = response;
                });
            };

            $scope.$watch(function() {
                return Facebook.isReady();
            }, function(newVal) {
                if (newVal) {
                    $scope.facebookIsReady = true;
                    Facebook.getLoginStatus(function(response) {
                        $scope.loginStatus = response.status;
                        console.log($scope.loginStatus);
                        if ($scope.loginStatus === 'connected') {
                            $scope.loginStatusb = true;
                            $scope.api();
                        }
                    });
                }
            });
        }
    ]);

})();
