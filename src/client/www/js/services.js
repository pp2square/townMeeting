angular.module('starter.services', [])

.factory('VoteInfo', function($http, $q) {
  return {
    baseURL: "http://192.168.0.99:3333",
    testURL: "http://localhost:3333",
    listURL: "/list",
    voteURL: "/vote",
    //userURL: "/user",

    post: function(url, data, cb) {
      var dfd = $q.defer();

      $http.post(this.baseURL + url, data, {timeout: 10000})
      //$http.post(this.baseURL + url, data)
        .success(function(result) {
          console.log("HTTP: success");
          dfd.resolve(result);
          //cb(false);
        })
        .error(function(result) {
          console.log("HTTP: fail");
          cb(true);
        });
        //.then()
        //.finally()
        

      return dfd.promise;
    },

    votePopupTitle: "투표하기",
    votePopupBody: "번을 선택하셨습니다.",
    votePopupYes: "투표",
    votePopupNo: "취소",
  }
});
