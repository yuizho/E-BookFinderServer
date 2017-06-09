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
});

eBooksSchema.set('toJSON', {
  virtuals: true,
  versionKey:false,
  transform: (doc, ret) => {delete ret._id}
});

const EBooks = module.exports = mongoose.model('ebooks', eBooksSchema);
