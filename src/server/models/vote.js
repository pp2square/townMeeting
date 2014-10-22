/**
 * vote.js in models
 */

var MONGOOSE = require('mongoose');
var	Schema = MONGOOSE.Schema;

var voteDataSchema = new Schema({
	
	deviceID: String,
	voteID: String,
	voteItemID: Number
},
{ versionKey: false}
);

var VoteData =  MONGOOSE.model('VoteData', voteDataSchema);

module.exports = VoteData;