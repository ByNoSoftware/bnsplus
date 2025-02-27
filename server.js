var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var express = require('express');
var winston = require('winston');

var DocumentHandler = require('./lib/document_handler.js');
var FileStorage = require('./lib/file_storage.js');

// Load configuration
var config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
config.port = process.env.PORT || config.port || 8080;
config.host = process.env.HOST || config.host || 'localhost';

// Logger setup - güncellenmiş Winston API'si ile
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

logger.info('BNSCode Plus\'a hoşgeldiniz!');

// Init file storage
var fileStorage = new FileStorage(config.dataPath);

// Configure the document handler
var documentHandler = new DocumentHandler({
  store: fileStorage,
  maxLength: config.maxLength,
  keyLength: config.keyLength,
  createKey: config.createKey
});

// Compress static assets
var cssCompressor = require('clean-css');
var jsCompressor = require('uglify-js');

// Only compress if files don't exist already
try {
  var files = fs.readdirSync(__dirname + '/static');
  for (var i = 0; i < files.length; i++) {
    var item = files[i];
    var itemPath = path.join(__dirname, 'static', item);
    
    // Önce öğenin bir dosya olup olmadığını kontrol et
    var stats = fs.statSync(itemPath);
    if (!stats.isFile()) {
      // Eğer dosya değilse (yani dizinse), atla
      continue;
    }
    
    var dest = "";
    if ((item.indexOf('.css') === item.length - 4) && (item.indexOf('.min.css') === -1)) {
      dest = item.substring(0, item.length - 4) + '.min.css';
      // Check if minified file already exists
      var destPath = path.join(__dirname, 'static', dest);
      if (!fs.existsSync(destPath)) {
        try {
          var cssContent = fs.readFileSync(itemPath, 'utf8');
          var minified = new cssCompressor().minify(cssContent).styles;
          fs.writeFileSync(destPath, minified, 'utf8');
          logger.verbose('Sıkıştırılmış:: ' + item + ' ==> ' + dest);
        } catch (error) {
          logger.error('CSS sıkıştırma hatası:', item, error.message);
        }
      }
    } else if ((item.indexOf('.js') === item.length - 3) && (item.indexOf('.min.js') === -1) && 
              (item !== 'jquery.min.js') && (item !== 'highlight.min.js')) {
      dest = item.substring(0, item.length - 3) + '.min.js';
      // Check if minified file already exists
      var destPath = path.join(__dirname, 'static', dest);
      if (!fs.existsSync(destPath)) {
        try {
          var jsContent = fs.readFileSync(itemPath, 'utf8');
          var result = jsCompressor.minify(jsContent);
          if (result.error) {
            throw new Error(result.error);
          }
          fs.writeFileSync(destPath, result.code, 'utf8');
          logger.verbose('Sıkıştırılmış:: ' + item + ' ==> ' + dest);
        } catch (error) {
          logger.error('JS sıkıştırma hatası:', item, error.message);
        }
      }
    }
  }
} catch (err) {
  logger.error('Dosya sıkıştırma hatası:', err);
}

// Setup routes and request handling
var app = express();

// Enable CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Raw document endpoint
app.get('/raw/:id', function(req, res) {
  return documentHandler.handleRawGet(req.params.id, res);
});

// Create document endpoint
app.post('/documents', express.text({type: '*/*', limit: config.maxLength + 'b'}), function(req, res) {
  return documentHandler.handlePost(req, res);
});

// Get document endpoint
app.get('/documents/:id', function(req, res) {
  return documentHandler.handleGet(req.params.id, res);
});

// Serve static files
app.use(express.static(__dirname + '/static'));

// Single page app - all routes serve index.html
app.get('/:id', function(req, res, next) {
  res.sendFile(__dirname + '/static/index.html');
});

// Start server
app.listen(config.port, config.host);
logger.info('Listening on ' + config.host + ':' + config.port);