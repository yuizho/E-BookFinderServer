var mongoose = require('mongoose')

const eBooksFields = {
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
	required: true
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
}

const eBooksSchema = mongoose.Schema(eBooksFields, {strict: true});

eBooksSchema.set('toJSON', {
  virtuals: true,
  versionKey:false,
  transform: (doc, ret) => {
    for (let f of Object.keys(ret)) {
      if (!eBooksFields.hasOwnProperty(f)) {
        delete ret[f]
      }
    }
  }
})

const EBooks = module.exports = mongoose.model('ebooks', eBooksSchema)
