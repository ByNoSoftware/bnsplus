var winston = require('winston');

var KeyGenerator = require('./key_generator.js');

// Winston logger yapılandırması
const logger = winston.createLogger({
  level: 'verbose',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Handles creating new and requesting existing documents
var DocumentHandler = function(options) {
  if (!options) {
    options = {};
  }
  this.store = options.store;
  this.maxLength = options.maxLength || 50000;
  this.keyLength = options.keyLength || 10;
  this.createKey = options.createKey || '';
  this.keyGenerator = new KeyGenerator();

  if (this.createKey !== '') {
    logger.info("Oluşturma Anahtarı:", this.createKey);
  }
};

// Handles existing documents
DocumentHandler.prototype.handleGet = function(key, res) {
  this.store.get(key, function(ret) {
    if (ret) {
      logger.verbose('Kod açıldı:', key);
      res.writeHead(200, {'content-type': 'application/json'});
      res.end(JSON.stringify({key: key, data: ret.replace(/\t/g, '    ')}));
    } else {
      logger.verbose('Kod bulunamadı.', key);
      res.writeHead(404, {'content-type': 'application/json'});
      res.end(JSON.stringify({message: 'Kod bulunamadı.'}));
    }
  });
};

// Handles existing documents (raw)
DocumentHandler.prototype.handleRawGet = function(key, res) {
  this.store.get(key, function(ret) {
    if (ret) {
      logger.verbose('Kod açıldı:', key);
      res.writeHead(200, {'content-type': 'text/plain'});
      res.end(ret);
    } else {
      logger.verbose('Kod bulunamadı.', key);
      res.writeHead(404, {'content-type': 'application/json'});
      res.end(JSON.stringify({message: 'Kod bulunamadı.'}));
    }
  });
};

// Handles creating new documents
DocumentHandler.prototype.handlePost = function(req, res) {
  var _this = this;
  var buffer = req.body || '';
  
  if (buffer.length > this.maxLength) {
    logger.warn('Kod maksimum uzunluğu aşıyor.');
    res.writeHead(400, {'content-type': 'application/json'});
    return res.end(JSON.stringify({message: 'Kod maksimum uzunluğu aşıyor.'}));
  }

  if (_this.createKey !== '') {
    if (!buffer.startsWith(_this.createKey)) {
      logger.warn('Yeni kod eklenirken hata oluştu: yanlış anahtar');
      res.writeHead(400, {'content-type': 'application/json'});
      return res.end(JSON.stringify({message: 'Yeni kod eklenirken hata oluştu: yanlış anahtar'}));
    }
    buffer = buffer.substring(_this.createKey.length);
  }

  _this.chooseKey(function(key) {
    _this.store.set(key, buffer, function(success) {
      if (success) {
        logger.verbose('Yeni kod:', key);
        res.writeHead(200, {'content-type': 'application/json'});
        res.end(JSON.stringify({key: key}));
      } else {
        logger.warn('Yeni kod eklenirken hata oluştu.');
        res.writeHead(500, {'content-type': 'application/json'});
        res.end(JSON.stringify({message: 'Yeni kod eklenirken hata oluştu.'}));
      }
    });
  });
};

// Creates new keys until one is not taken
DocumentHandler.prototype.chooseKey = function(callback) {
  var key = this.acceptableKey();
  var _this = this;
  this.store.get(key, function(success) {
    if (success) {
      _this.chooseKey(callback);
    } else {
      callback(key);
    }
  });
};

// Creates a new key using the key-generator
DocumentHandler.prototype.acceptableKey = function() {
  return this.keyGenerator.createKey(this.keyLength);
};

module.exports = DocumentHandler;