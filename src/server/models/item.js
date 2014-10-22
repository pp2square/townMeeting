/**
 * item.js in models
 */

var MONGOOSE = require('mongoose');
var Schema = MONGOOSE.Schema;

var voteItemContentSchema = new Schema({
  id: Number,
  title: String,
  count : { type: Number, default: 0 }
},
{ versionKey: false}
);

var voteItemSchema = new Schema({
  voteSubject: String,
  voteItems: [voteItemContentSchema],
  itemStatus: String,
  voteDate: String
},
{ versionKey: false}
);

var VoteItem =  MONGOOSE.model('VoteItem', voteItemSchema);
module.exports = VoteItem;