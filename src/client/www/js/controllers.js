angular.module('starter.controllers', [])

.controller('MainCtrl', function($scope, $timeout, $ionicLoading, $ionicPopup, VoteInfo) {
  // init value
  $scope.uuid = ionic.Platform.platform();
  $scope.postData = {
    "deviceID": $scope.uuid,
    "voteID": "",
    "voteItemID": ""
  };

  // ng-show
  $scope.alreadyVote = false;
  $scope.postFailed = false;

  // Callback Function for VoteInfo.post
  var hideLoading = function(value) {
    console.log('hideLoading');
    $timeout($ionicLoading.hide, 500);
    console.log('hideLoading.hide');
    $scope.postFailed = value; // ng-show
  };

  // HTTP/POST
  $scope.doPost = function(url, data, func) {
    // Show Loading
    $ionicLoading.show({
      templateUrl: "templates/loading.html"
    });

    // Post Data: { deviceID, voteID, voteItemID }
    VoteInfo.post(url, data, hideLoading).then(func);
  };

  // Perform init/refresh action
  $scope.doRefresh = function() {
    console.log("Doing Refresh");

    $scope.doPost(VoteInfo.listURL, { "deviceID": $scope.postData.deviceID }, function(data) {
      // Check
      if(data.voteItems === undefined) {
        console.log("Server Error: " + data);
        hideLoading(true);
        return;
      }

      //console.log(data);
      hideLoading(false);

      // _id, voteSubject, voteItems
      $scope.voteData = data;
      $scope.alreadyVote = !(data.voteItems.length); // ng-show

      // for doVote()
      $scope.postData.voteID = data._id;
    });
  };

  // Perform the vote action
  $scope.doVote = function() {
    console.log("Doing Vote: " + $scope.postData.voteItemID);

    $scope.doPost(VoteInfo.voteURL, $scope.postData, function(data) {
      if(data == "OK") {
        $scope.doRefresh();
      } else {
        console.log("Vote Error: " + data);
        hideLoading(true);
      }
    });
  };

  // Open the vote popup
  $scope.goVote = function(id) {
    $scope.postData.voteItemID = id;

    $ionicPopup.confirm({
      //title: VoteInfo.votePopupTitle,
      title: id + VoteInfo.votePopupBody, // template
      buttons: [{
        text: VoteInfo.votePopupNo,
        type: 'button-default',
        onTap: function(e) {
          $scope.postData.voteItemID = "";
          //e.preventDefault();
        }
      }, {
        text: VoteInfo.votePopupYes,
        type: 'button-positive',
        onTap: function(e) {
          $scope.doVote();
        }
      }]
    });
  };

  // Exit
  $scope.doExit = function() {
    ionic.Platform.exitApp();
  };
})

.controller('HomeCtrl', function($scope, $ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Get UUID
    if($scope.uuid != "win32") {
      $scope.uuid = ionic.Platform.device().uuid;
    }

    //$scope.uuid = "test";
    console.log("UUID: " + $scope.uuid);

    // HTTP/POST
    $scope.postData.deviceID = $scope.uuid;
    $scope.doRefresh();
  });
});
