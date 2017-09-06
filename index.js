exports.login = login;
exports.query = query;
exports.createConnection = createConnection;
exports.createDocument = createDocument;

var querystring = require('querystring');
var https = require('https');

var host = '';
var username = '';
var password = '';
var userid = '';
var vaultIds = '';
var apiKey = '*****';
var VERSION = 'v16.0'
var sessionId = null;

var Connection = function(opts) {

    host = opts.host;
    username = opts.username;
    password = opts.password;

}


function performRequest(endpoint, method, data, success) {
  var dataString = JSON.stringify(data);
  var headers = {};
  if (sessionId != null) { headers.Authorization = sessionId; }
  if (endpoint.includes("objects/documents")) { headers['Content-Type'] = "multipart/form-data";}

  if (method == 'GET') {
    endpoint += '?' + querystring.stringify(data);
  }
  else {
    /*headers = {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    };*/
    endpoint += '?' + querystring.stringify(data);
  }
  var options = {
    host: host,
    path: endpoint,
    method: method,
    headers: headers
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');
    console.log('*********' + JSON.stringify(options));

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      console.log(responseString);
      var responseObject = JSON.parse(responseString);
      success(responseObject);
    });
  });

  req.write(dataString);
  req.end();
}

function login(callback) {
  performRequest('/api/'+VERSION+'/auth', 'POST', {
    username: username,
    password: password,
  }, function(data) {
    sessionId = data.sessionId;
    console.log('data', data);
    console.log('vaultids: ' + data.vaultIds);
    callback();
  });
}

function query() {
  performRequest('/api/'+VERSION+'/query', 'POST', { "q" : "select id from products"
  }, function(data) {
    console.log('Fetched ' + data);
  });
}

// create a connection
function createConnection(opts) {
  return new Connection(opts);
};

function createDocument() {
  performRequest('/api/'+VERSION+'/objects/documents', 'POST', {
  "file": "gludacta-document-01.docx",
  "name__v": "Gludacta Document",
  "type__v": "Promotional Piece",
  "subtype__v": "Advertisement",
  "classification__v": "Web",
  "lifecycle__v": "Promotional Piece",
  "major_version_number__v": "0",
  "minor_version_number__v": "1",
  "product__v": "0PR0303",
  "external_id__v": "GLU-DOC-0773"
  }, function(data) {
    console.log('Fetched ' + data);
  });

}
