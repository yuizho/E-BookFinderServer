const express = require('express')
const router = express.Router()
const EBooks = require('../models/ebooks')
const Histories = require('../models/histories')
const KoboClient  = require('../lib/koboClient')
const AmazonClient = require('../lib/amazonClient')
const co = require('co')
const ISBN = require('isbn').ISBN

router.get('/:_isbn', function(req, res, next) {
  const isbn = req.params._isbn
  const parsedISBN = ISBN.parse(isbn)
  // validation check
  if (!parsedISBN || !parsedISBN.isIsbn13()) {
    let err = new Error('Bad Request')
    err.status = 400
    return next(err)
  }
  co(function*() {
    const history = yield Histories.find({ isbn: isbn }).exec()
    const request_tasks = []
    if (history && history.length > 0) {
      if (history[0].created.toDateString() !== new Date().toDateString()) {
        if (!history[0].hasKobo) {
          request_tasks.push(KoboClient.retrieveKoboInfo(isbn))
        }
        if (!history[0].hasKindle) {
          request_tasks.push(AmazonClient.retrieveAmazonInfo(isbn))
        }
      }
      if (request_tasks.length === 0) {
        const ebooks = yield EBooks.find({ isbn: isbn }, {}).exec()
        return {ebooks: ebooks.filter(domainFilter)}
      }
    } else {
      request_tasks.push(KoboClient.retrieveKoboInfo(isbn))
      request_tasks.push(AmazonClient.retrieveAmazonInfo(isbn))
    }
    const req_result = yield request_tasks
    const tasks = []
    for (const items of req_result) {
      if (items && items.length) {
        for (const item of items) {
          tasks.push(EBooks.update({isbn: isbn, key: item.key}, item, {upsert: true}).exec())
        }
      }
    }
    yield tasks
    const ebooks = yield EBooks.find({ isbn: isbn }, {}).exec()
    let hasKobo = false
    let hasKindle = false
    ebooks.map((e) => {
      if (e.type === 'kobo') { hasKobo = true }
      if (e.type === 'kindle') { hasKindle = true }
    })
    yield Histories.update(
      {isbn: isbn},
      {hasKobo: hasKobo, hasKindle: hasKindle, created: new Date()},
      {upsert: true}).exec()
    return {ebooks: ebooks.filter(domainFilter)}
  }).then((result) => {
    res.json(result)
  }).catch((ex) => {
    ex.message('Error')
    next(ex)
  })
})

function domainFilter(e) {
  const domains = [
    '^https?:\/\/books\\.rakuten\\.co\\.jp',
    '^https?:\/\/www\\.amazon\\.co\\.jp',]
  const imageDomains = [
    '^https?:\/\/thumbnail\\.image\\.rakuten\\.co\\.jp',
    '^https?:\/\/images-fe\\.ssl\-images\-amazon\\.com',]
  const dr = new RegExp(domains.join('|'))
  const ir = new RegExp(imageDomains.join('|'))
  return (dr.test(e.url) && ir.test(e.image))
}

module.exports = router
