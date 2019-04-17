const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let EntryModel = {};

// mongoose.Types.ObjectID is a function that
// converts string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;

const EntrySchema = new mongoose.Schema({

  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  content: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  contest: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Competition',
  },

  createdData: {
    type: Date,
    default: Date.now,
  },
  mascot: {
    type: String,
    default: '1.png',
  },
});

EntrySchema.statics.toAPI = (doc) => ({
  content: doc.content,
  contest: doc.contest,
});

// find entry by ownerID
EntrySchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return EntryModel.find(search).select(
    'owner content contest createdDate name mascot').exec(callback);
};

// find entry by entry ID
EntrySchema.statics.findById = (id, callback) => {
  const search = {
    _id: convertId(id),
  };

  return EntryModel.find(search).select(
    'owner content contest createdDate name mascot').exec(callback);
};

// find entry by contest entry was entered into
EntrySchema.statics.findByContest = (contestId, callback) => {
  const search = {
    contest: convertId(contestId),
  };

  return EntryModel.find(search).select(
    'owner content contest createdDate name mascot').exec(callback);
};

EntryModel = mongoose.model('Entry', EntrySchema);

module.exports.EntryModel = EntryModel;
module.exports.EntrySchema = EntrySchema;
