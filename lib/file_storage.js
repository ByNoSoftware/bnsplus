var fs = require('fs');
var crypto = require('crypto');
var path = require('path');

var winston = require('winston');

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

// Handles saving and retrieving all documents
var FileDocumentStore = function(options) {
  this.basePath = options.path || './data';
  logger.info('Veri yolu: ' + this.basePath);
  
  // Make sure the storage directory exists
  try {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true, mode: 0o700 });
      logger.info('Veri dizini oluşturuldu: ' + this.basePath);
    }
  } catch (err) {
    logger.error('Veri dizini oluşturma hatası:', err);
  }
};

// Saves a new file to the filesystem
FileDocumentStore.prototype.set = function(key, data, callback) {
  var _this = this;
  var filePath = path.join(this.basePath, key);
  
  fs.writeFile(filePath, data, 'utf8', function(err) {
    if (err) {
      logger.error('Dosya yazma hatası:', err);
      callback(false);
    } else {
      logger.verbose('Belge kaydedildi:', key);
      callback(true);
    }
  });
};

// Gets an existing file from the filesystem
FileDocumentStore.prototype.get = function(key, callback) {
  var _this = this;
  var filePath = path.join(this.basePath, key);
  
  fs.readFile(filePath, 'utf8', function(err, data) {
    if (err) {
      if (err.code === 'ENOENT') {
        logger.verbose('Belge bulunamadı:', key);
      } else {
        logger.error('Dosya okuma hatası:', err);
      }
      callback(false);
    } else {
      logger.verbose('Belge okundu:', key);
      callback(data);
    }
  });
};

// Deletes a file from the filesystem
FileDocumentStore.prototype.delete = function(key, callback) {
  var _this = this;
  var filePath = path.join(this.basePath, key);
  
  fs.unlink(filePath, function(err) {
    if (err) {
      logger.error('Dosya silme hatası:', err);
      callback(false);
    } else {
      logger.verbose('Belge silindi:', key);
      callback(true);
    }
  });
};

module.exports = FileDocumentStore;