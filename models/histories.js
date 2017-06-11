var mongoose = require('mongoose')

const historiesSchema = mongoose.Schema({
  isbn:{
	type: String,
	required: true
  },
  hasKobo:{
	type: Boolean
  },
  hasKindle:{
	type: Boolean
  },
  created: {
    type: Date,
	default: Date.now
  }
})

const Histories = module.exports = mongoose.model('histories', historiesSchema)
