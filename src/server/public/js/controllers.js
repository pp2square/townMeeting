angular.module('townMetting.controllers', [])
  .controller('MainCtrl', function($scope, $state) {
    $scope.go = function(route){
      $state.go(route);
    };

    $scope.active = function(route){
      return $state.is(route);
    };

    $scope.tabs = [
      { heading: "VoteItem Manage", route:"main.voteItem", active:false },
      { heading: "VoteData Manage", route:"main.voteData", active:false },
      { heading: "Additional Manage", route:"main.voteAdditional", active:false }
    ];

    $scope.$on("$stateChangeSuccess", function() {
      $scope.tabs.forEach(function(tab) {
        tab.active = $scope.active(tab.route);
      });
    });
  })

  .controller('VoteItemCtrl', function($scope, $http, $filter, connServer, ngTableParams) {
    $scope.connServer = connServer;
    $scope.addVoteItem = { 'subject' : '', 'newItems' : []};
    //$scope.rows = [];
    $scope.viewDetail = {};
    $scope.modalShown = { 'addNew' : false, 'itemDetail' : false};
    $scope.viewDetailStatus = { 'buttonTitle' : 'Edit', 'itemEditable' : false, 'allowEdit' : true, 'allowChange': true};
    $scope.curItem = {'itemStatus' : ''};

    var itemIndex = 0;

    var setVoteItemList = function(data) {
      console.log(data);
      $scope.voteItems = data;

      if ($scope.tableParams){
        updateItemList($scope.voteItems);
      } else {
        makeItemList($scope.voteItems, 'voteDate');
      }
    };

    var connServerError = function(data, status) {
      console.log('connServerError() : ' + status);
    };

    var loadVoteItemListSuccess = function(data, status) {
      console.log('loadVoteItemListSuccess()');

      setVoteItemList(data);
    };

    $scope.loadVoteItemList = function () {
      console.log('loadVoteItemList()');

      $scope.connServer.getHttp("/list-voteItems", loadVoteItemListSuccess, connServerError);
    };

    var updateItemList = function(data) {
      console.log('updateItemList() ');

      $scope.rows = data;
      $scope.tableParams.reload();
    };

    var makeItemList = function(data, initVal) {
      console.log('makeItemList() : ' + data.length);
      $scope.rows = data;
      $scope.groupby = initVal;

      $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10          // count per page
        }, {
          groupBy: $scope.groupby,
          total: $scope.rows.length,

          getData: function($defer, params) {
            var orderedData = params.sorting() ?
                  $filter('orderBy')($scope.rows, $scope.tableParams.orderBy()) : $scope.rows;

            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          }
      });

      $scope.tableParams.settings().$scope = $scope;

      $scope.$watch('groupby', function(value) {
        $scope.tableParams.settings().groupBy = value;
        $scope.tableParams.reload();
      });
    };

    $scope.showItemDetail = function (user) {
      console.log('showItemDetail : ' + user.voteSubject);

      $scope.viewDetail = user;
      $scope.viewDetailStatus.buttonTitle = 'Edit';
      $scope.viewDetailStatus.itemEditable = false;
      $scope.viewDetailStatus.allowChange = true;
      $scope.modalShown.itemDetail = true;
      $scope.viewDetailStatus.allowEdit = checkVoteStatus();
    };

    var checkVoteStatus = function() {
      var allowEdit = false;

      switch($scope.viewDetail.itemStatus) {
        case 'Not Yet':
          $scope.curItem.itemStatus = 'Start Vote';
          allowEdit = true;
          break;

        case 'Doing':
          $scope.curItem.itemStatus = 'End Vote';
          break;

        default:
          $scope.curItem.itemStatus = 'Done';
          break;
      }

      return allowEdit;
    };

    $scope.changeItemStatus = function() {
      console.log('changeItemStatus() : ' + $scope.viewDetail.itemStatus);

      switch($scope.viewDetail.itemStatus) {
        case 'Not Yet':
          updateVoteStatus('Doing');
          break;

        case 'Doing':
          updateVoteStatus('Done');
          break;

        default:
          break;
      }
    };

    var updateVoteStatusSuccess = function(data, status) {
      console.log('updateVoteStatusSuccess()');
      $scope.modalShown.itemDetail = false;
      $scope.viewDetail.itemStatus = $scope.curItemStatus
    };

    var updateVoteStatus = function(voteStatus) {
      console.log('updateVoteStatus() : ' + voteStatus);

      var data = { 'itemId' : $scope.viewDetail._id, 'itemStatus' : voteStatus };

      $scope.curItemStatus = voteStatus;

      console.log('<< Updating Vote Status >>');
      $scope.connServer.postHttp("/update-status", data, updateVoteStatusSuccess, connServerError);
    };

    var itemSaveSuccess = function(data, status) {
      console.log('itemSaveSuccess()');
      $scope.modalShown.addNew = false;
      setVoteItemList(data);
    };

    $scope.itemSave = function() {
      var newVoteItem = {};
      newVoteItem.voteSubject = $scope.addVoteItem.subject;

      console.log('Subject : ' + $scope.addVoteItem.subject);

      newVoteItem.voteItems = new Array([]);

      var itemLength = $scope.addVoteItem.newItems.length;

      console.log('total item length : ' + itemLength);

      for(var srcIndex = 0, destIndex = 0; srcIndex < itemLength; srcIndex++ ) {
        if($scope.addVoteItem.newItems[srcIndex].itemTitle.length > 0) {
          console.log('srcIndex : ' + srcIndex);
          newVoteItem.voteItems[destIndex] = { 'id' : destIndex +  1, 'title' : $scope.addVoteItem.newItems[srcIndex].itemTitle};
          destIndex++;
        } else {
          console.log('srcIndex : ' + srcIndex + ' / destIndex : ' + destIndex);
        }
      }
      console.log(JSON.stringify(newVoteItem));

      var data = { json: JSON.stringify(newVoteItem) };

      $scope.connServer.postHttp("/item", data, itemSaveSuccess, connServerError);
    };

    $scope.addNewVoteItem = function () {
      $scope.addVoteItem.subject = '';
      $scope.addVoteItem.newItems = [];
      $scope.modalShown.addNew = !$scope.modalShown.addNew;
    };

    $scope.addItem = function() {
      $scope.addVoteItem.newItems.push({
        itemTitle: "",
      });

      $scope.focusIndex = $scope.addVoteItem.newItems.length-1;
    };

    $scope.itemRefresh = function() {
      $scope.loadVoteItemList();
    };

    var deleteItemSuccess = function(data, status) {
      console.log('deleteItemSuccess()');
      setVoteItemList(data);
    };

    $scope.deleteItem = function(user) {
      console.log('deleteItem() : ' + user._id);
      var data = { 'itemId' : user._id };

      $scope.connServer.postHttp("/delete-item", data, deleteItemSuccess, connServerError);
    };

    var itemUpdateSaveSuccess = function(data, status) {
      console.log('itemUpdateSaveSuccess()');
      $scope.modalShown.itemDetail = false;
    };

    var itemUpdateSave = function() {
      var data = { json: JSON.stringify($scope.viewDetail) };

      $scope.connServer.postHttp("/item-update", data, itemUpdateSaveSuccess, connServerError);
    };

    $scope.itemUpdate = function() {
      console.log('itemUpdate() : Eidtable? ' + $scope.viewDetailStatus.itemEditable);

      if($scope.viewDetailStatus.itemEditable) {
        itemUpdateSave();
      } else {
        $scope.viewDetailStatus.itemEditable = true;
        $scope.viewDetailStatus.buttonTitle = 'Save';
        $scope.viewDetailStatus.allowChange = false;
      }
    };

    $scope.allowDelete = function(user) {

      if(user.itemStatus === 'Doing') {
        return false;
      } else {
        return true;
      }
    };
  });