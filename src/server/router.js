/**
 * router.js
 */

var vote = require('./controllers/vote.js');

exports.route = function (app) {
  app.get('/list-voteData', vote.getVotesData);
  app.get('/list-voteItems', vote.getVotesItems);

  app.post('/list', vote.getItem);
  app.post('/vote', vote.setVote);
  app.post('/item', vote.setItem);
  app.post('/item-update', vote.updateItem);
  app.post('/update-status', vote.startEndVote);
  app.post('/delete-item', vote.deleteItem);
};