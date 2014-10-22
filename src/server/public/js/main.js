angular.module('townMetting', ['ngRoute', 'ui.router', 'ui.bootstrap', 'townMetting.controllers', 'townMetting.services', 'ngTable', 'inputAutoFocus', 'modalDialog'])
  .config(function($stateProvider, $urlRouterProvider){
    $stateProvider
      .state('main', {
        abtract: true,
        url:"/main",
        views: {
          'MainTabs' : {
            templateUrl:"main.html",
            controller: 'MainCtrl'
          }
        }
      })

      .state('main.voteItem', {
        url: "/voteItem",
        views: {
          'MainContents' : {
            templateUrl: "voteItem-manage.html",
            controller: 'VoteItemCtrl'
          }
        }
      })

      .state('main.voteData', {
        url: "/voteData",
        views: {
          'MainContents' : {
            templateUrl: "voteData-manage.html",
            controller: ''
          }
        }
      })

      .state('main.voteAdditional', {
        url: "/voteAdditional",
        views: {
          'MainContents' : {
            templateUrl: "additional-manage.html",
            controller: ''
          }
        }
      });

    $urlRouterProvider.otherwise('/main/voteItem');
});


