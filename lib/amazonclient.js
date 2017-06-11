const amazon = require('amazon-product-api');

const client = amazon.createClient({
  awsId: process.env.AWS_ID,
  awsSecret: process.env.AWS_SECRET,
  awsTag: process.env.AWS_TAG,
})

module.exports = class AmazonClient {
  static retrieveAmazonInfo(isbn='') {
    return client.itemLookup({
      idType: 'ISBN',
      itemId: isbn,
      responseGroup: 'ItemAttributes,Images',
      searchIndex: 'KindleStore',
      domain: 'ecs.amazonaws.jp'
    }).then((resp) => {
      const items = []
      resp.map((item) => {
        item.ItemAttributes.map(function(attr){
          if (attr.ProductGroup.includes('eBooks')) {
            let i = {
              isbn: isbn,
              title: attr.Title[0],
              url: item.DetailPageURL[0],
              key: item.ASIN[0],
              type: 'kindle'
            }
            // add Items
            if(item.SmallImage) {
              i['image'] = item.SmallImage[0].URL[0]
            }
            items.push(i)
          }
        })
      })
      return items
    })
    .catch((ex) => {
      // TODO: bYou are submitting requests too quickly.でたらどうするか？
      console.error(ex.Error)
      return []
    })
  }
}
