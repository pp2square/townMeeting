angular.module('inputAutoFocus', [])
  .directive('inputAutofocus', function() {
    return{
      restrict: 'A',

      link: function(scope, element, attrs){
        scope.$watch(function(){
          return scope.$eval(attrs.inputAutofocus);
        }, function (newValue){
          if (newValue === true){
            element[0].focus();
          }
        });
      }
    };
});