/**
 * vote.js in controllers
 */

var VoteData = require('../Models/vote.js');
var VoteItem = require('../Models/item.js');

Date.prototype.yyyymmdd = function() {

    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString();
    var dd  = this.getDate().toString();

    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};

exports.setItem = function(req, resp) {
  var voteItem = new VoteItem();

  console.log('setItem()');

  voteItem = JSON.parse(req.body.json);

  voteItem.itemStatus = "Not Yet";
  voteItem.voteDate = new Date().yyyymmdd();

  console.log(voteItem);

  new VoteItem(voteItem).save(function (err, saveItem) {
    if(err) {
      console.log('VoteItem.save() Error');
      //resp.send('Error : Not Save');
      resp.send(500);
      return;
    }

    console.log('new VoteItem Saved');

    getVoteItemList(req, resp);

  });
};

var sendVoteItem = function(res, deviceID) {
  console.log('sendVoteItem() : deviceID : ' + deviceID);

  var voteItem = new VoteItem();

  VoteItem.find({'itemStatus': 'Doing'}).sort({'_id': -1}).exec( function (err, docs) {
    if(err) {
      console.log('VoteItem.find() Error');
      return;
    }

    if(docs.length > 0) {
      console.log('Vaild Item is found');

      console.log('docs[0]._id : ' + docs[0]._id);

      VoteData.find({'deviceID': deviceID, 'voteID': docs[0]._id}).sort({'_id': -1}).exec( function (err, rets) {
        if(err) {
          console.log('VoteData.find() : deviceID Error');
          return;
        }

        if(rets.length > 0) {
          console.log(deviceID + ' is voted');

          voteItem.voteID = docs[0].voteID;
          voteItem.voteSubject = docs[0].voteSubject;

          res.charset = 'utf-8';
          res.header("Access-Control-Allow-Origin", "*");
          res.json(voteItem);
        } else {
          console.log('Send VoteItems to Client');
          res.charset = 'utf-8';
          res.header("Access-Control-Allow-Origin", "*");
          console.log(docs[0]);
          res.json(docs[0]);
        }
      });
    } else {
      console.log('No Activated voteItem');
      res.send('Not Found');
    }
  });
};

exports.getItem = function(req, resp) {
  var deviceID = '';

  console.log('getItem()');

  console.log(req.body);

  deviceID = req.body.deviceID;

  console.log('device_id : ' + deviceID);

  if(deviceID === undefined) {
    console.log('No deviceID');
    resp.send('No deviceID');
    return;
  }

  if(deviceID.length === 0) {
    console.log('No deviceID');
    resp.send('No deviceID');
    return;
  }

  sendVoteItem(resp, deviceID);
};

var saveVoteData = function(res, votedData) {
  console.log('saveVoteData()');

  var voteItem = new VoteItem();

  VoteData.find({'deviceID': votedData.deviceID, 'voteID': votedData.voteID}).sort({'_id': -1}).exec( function (err, rets) {
    if(err) {
      console.log('VoteData.find() : Error');
      return;
    }

    if(rets.length > 0) {
      console.log(votedData.deviceID + ' is already voted');

      res.send('Error : Already Voted');
    } else {

      VoteItem.update({'_id': votedData.voteID, "voteItems.id": votedData.voteItemID},
              {'$inc': {'voteItems.$.count': 1}}, function(err,numAffected, raw) {
        if(err) {
          console.log('voteData Update Error');
        }

        console.log('voteData Update : ' + numAffected);

        if(numAffected > 0) {
          new VoteData(votedData).save(function (err, saveData) {
            if(err) {
              console.log('VoteData.save() Error');
              res.send('Error: voteData Save Error');
              return;
            }

            console.log('new VoteData Saved');
            res.send(200);
          });
        } else {
          console.log('Update Failed');
          res.send('Error : Update Failed');
        }
      });
    }
  });
};

exports.setVote = function (req, resp) {

  var voteData = new VoteData();

  console.log('setVote()');

  console.log(req.body);

  voteData = req.body;

  console.log('device_id : ' + voteData.deviceID);
  console.log('voteID : ' + voteData.voteID);
  console.log('vote_num : ' + voteData.voteItemID);

  if(voteData.deviceID === undefined || voteData.voteID === undefined ||
      voteData.voteItemID === undefined) {
    console.log('Invaild voteData');
    resp.send('Invaild voteData');
    return;
  }

  if(voteData.deviceID.length === 0 || voteData.voteID.length === 0 ||
      voteData.voteItemID.length === 0) {
    console.log('Invaild voteData');
    resp.send('Invaild voteData');
    return;
  }

  saveVoteData(resp, voteData);
};

exports.getVotesData = function (req, resp) {

  var voteData = new VoteData();

  console.log('getVotesData()');

  VoteData.find().sort({'_id': -1}).exec( function (err, rets) {
    if(err) {
      console.log('VoteData.find() Error');
      resp.send('Error : voteData get Error');
      return;
    }

    if(rets.length > 0) {
      console.log('Found');
      resp.send(rets);
    } else {
      console.log('No Found');
      resp.send(200);
    }
  });
};

var getVoteItemList = function (req, resp) {

  var voteItem = new VoteItem();

  console.log('getVotesItem()');

  VoteItem.find().sort({'_id': -1}).exec(function (err, rets) {
    if(err) {
      console.log('VoteItem.find() Error');
      resp.send(200);
      return;
    }

    if(rets.length > 0) {
      console.log('Found');
      console.log(rets);
      resp.send(rets);
    } else {
      console.log('No Found');
      resp.send(200);
    }
  });
};

exports.getVotesItems = getVoteItemList;

exports.startEndVote = function (req, resp) {
  console.log('StartEndVote()');

  var itemStatus = '', itemId = '';

  console.log(req.body);

  itemStatus = req.body.itemStatus;
  itemId = req.body.itemId;

  console.log(itemStatus);
  console.log(itemId);

  VoteItem.where({'_id': itemId}).update({'itemStatus': itemStatus}, function(err, numAffected, raw) {
    if(err) {
      console.log('Update Error');
      return;
    }

    console.log('Affected Number : ' + numAffected);

    resp.send(200);
  });
};

exports.deleteItem = function (req, resp) {
  var del_id = req.body.itemId;

  console.log('deleteItem() - _id : ' + del_id);

  VoteItem.remove({'_id': del_id}, function (err) {
    if (err) {
      throw err;
    }

    console.log('VoteItem remove success!!');
    getVoteItemList(req, resp);
  });
};

exports.updateItem = function (req, resp) {
  var voteItem = new VoteItem();
  voteItem = JSON.parse(req.body.json);

  console.log('updateItem() : ' + voteItem._id);

  VoteItem.where({'_id': voteItem._id}).update({$set: voteItem}, function(err, numAffected, raw) {
    if(err) {
      console.log('Update Error');
      return;
    }

    console.log('Item Update Success');

    resp.send(raw);
  });
};
