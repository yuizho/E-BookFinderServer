const express = require('express');
const router = express.Router();
const EBooks = require('../models/ebooks');
const Histories = require('../models/histories');
const KoboClient  = require('../lib/koboClient');
const AmazonClient = require('../lib/amazonClient');
const co = require('co');
const ISBN = require('isbn').ISBN;

router.get('/:_isbn', function(req, res, next) {
  const isbn = req.params._isbn
  const parsedISBN = ISBN.parse(isbn)
  // validation check
  if (!parsedISBN || !parsedISBN.isIsbn13()) {
    var err = new Error('Bad Request')
    err.status = 400
    return next(err)
  }
  co(function*() {
    const history = yield Histories.find({ isbn: isbn }).exec();
    const request_tasks = []
    if (history && history.length > 0) {
      if (history[0].created.toDateString() !== new Date().toDateString()) {
        console.log(history[0].hasKobo)
        if (!history[0].hasKobo) {
          request_tasks.push(KoboClient.retrieveKoboInfo(isbn))
        }
        if (!history[0].hasKindle) {
          request_tasks.push(AmazonClient.retrieveAmazonInfo(isbn))
        }
      }
      if (request_tasks.length === 0) {
        console.log('-------------find ebook')
        const ebooks = yield EBooks.find({ isbn: isbn }, {}).exec()
        return {ebooks: ebooks.filter(domainFilter)};
      }
    } else {
      request_tasks.push(KoboClient.retrieveKoboInfo(isbn))
      request_tasks.push(AmazonClient.retrieveAmazonInfo(isbn))
    }
    console.log('request to API------------');
    const req_result = yield request_tasks;
    console.log('save retrieved items------------');
    const tasks = [];
    let hasKobo = false;
    let hasKindle = false;
    for (const items of req_result) {
      console.log(items);
      if (items && items.length) {
        for (const item of items) {
          console.log(item);
          if (item.type === 'kobo') { hasKobo = true }
          if (item.type === 'kindle') { hasKindle = true }
          // TODO: upsertにする
          tasks.push(new EBooks(item).save());
        }
      }
    }
    let task_result = yield tasks;
    // TODO: upsertにする
    yield new Histories({isbn: isbn, hasKobo: hasKobo, hasKindle: hasKindle}).save();
    return {ebooks: task_result.filter(domainFilter)};
  }).then((result) => {
    res.json(result);
  }).catch((ex) => {
    console.err(ex)
    ex.message('Error')
    next(ex)
  });
});

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

module.exports = router;
