const axios = require('axios');

module.exports = class ApiClient {
  static createGetUri(uri='', params={}) {
    let query_args = [];
    for (var key of Object.keys(params)){
      query_args.push(`${key}=${encodeURI(params[key])}`);          
    }
    return `${uri}?` + query_args.join('&');
  }

  static get(uri) {
    return this.send(uri, null, 'GET');
  }

  static post(uri, params) {
    return this.send(uri, params, 'POST');
  }

  static send(uri, params, method) {
    return axios({
      method: method,
      url: uri,
      data: (params ? { body: JSON.stringfy(params) } : null),
      head: {
        'Content-Type': 'application/json',          
      }
    })
    .then((resp) => resp)
    .catch((ex) => console.error(ex));
  }
}
