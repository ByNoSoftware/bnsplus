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
