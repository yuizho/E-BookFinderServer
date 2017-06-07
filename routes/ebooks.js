const express = require('express');
const router = express.Router();
const EBooks = require('../models/ebooks');
const Histories = require('../models/histories');
const KoboClient  = require('../lib/koboClient');
const AmazonClient = require('../lib/amazonClient');
const co = require('co');

router.get('/:_isbn', function(req, res, next) {
  // TODO: validation check
  co(function*() {
    const isbn = req.params._isbn;
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
        return yield {ebooks: EBooks.find({ isbn: isbn }).exec()};
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
    return {ebooks: task_result};
  }).then((result) => {
    res.json(result);
  }).catch((ex) => {
    // TODO: error handling
    console.err(ex)
  });
});

module.exports = router;
