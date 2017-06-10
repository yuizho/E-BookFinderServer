const ApiClient = require('./http');

const RAKUTEN_BOOKS_API = 'https://app.rakuten.co.jp/services/api/BooksTotal/Search/20130522';
const RAKUTEN_KOBO_API = 'https://app.rakuten.co.jp/services/api/Kobo/EbookSearch/20140811';

const APP_ID = process.env.RAKUTEN_APP_ID;

module.exports = class KoboClient {
  static retrieveKoboInfo(isbn='') {
    return this.fetchRakutenBooks(isbn)
      .then((resp) => {
        if (resp.hasOwnProperty('error')) {
          return Promise.reject(new Error(resp.error))
        }
        const item = resp.data.Items[0].Item;
        return this.fetchKobo(item.title, item.author);
      })
      .then((resp) => {
        if (resp.hasOwnProperty('error')) {
          return Promise.reject(new Error(resp.error))
        }
        const items = [];
        resp.data.Items.map((item) => {
          items.push({
            isbn: isbn,
            title: item.Item.title,
            image: item.Item.smallImageUrl,
            price: item.Item.itemPrice,
            url: item.Item.itemUrl,
            key: item.Item.itemNumber,
            type: 'kobo',
                      
          });       
        });
        return items;
      })
      .catch((ex) => {
        console.error(ex)
        return [];
      });
  }

  static fetchRakutenBooks(isbn='') {
    const params = {
      format: 'json',
      bookGenreId: '000',
      isbnjan: isbn,
      applicationId: APP_ID,
    };
    const uri = ApiClient.createGetUri(RAKUTEN_BOOKS_API, params);
    return ApiClient.get(uri);
  }

  static fetchKobo(keyword='', author='') {
    const args = keyword.split(/[　\(\)\[\]【】 ,@\\「」（）『』［］〈〉《》〔〕｛｝{}‘’“”{}"'`]/g);
    // TODO: 1とかは01に直すようにしたいなぁ
    const filtered = args.filter((keyword) => { return keyword.length > 1 }).join(' ');
    const params = {
      format: 'json',
      keyword: filtered,
      author: author,
      applicationId: APP_ID,
    };
    const uri = ApiClient.createGetUri(RAKUTEN_KOBO_API, params);
    return ApiClient.get(uri);
  }
}

