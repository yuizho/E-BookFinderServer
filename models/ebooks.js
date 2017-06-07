var mongoose = require('mongoose');

const eBooksSchema = mongoose.Schema({
  isbn:{
	type: String,
	required: true
  },
  title:{
	type: String,
	required: true
  },
  image:{
	type: String,
	required: false
  },
  price:{
	type: String,
	required: false
  },
  url:{
	type: String,
	required: true
  },
  key:{
	type: String,
	required: true
  },
  type:{
	type: String,
	required: true
  },
  // TODO: これをつけるとSave()が失敗する
//  _id: {type: mongoose.Schema.ObjectId, select: false},
//  __v: {type: Number, select: false},
});

const EBooks = module.exports = mongoose.model('ebooks', eBooksSchema);
