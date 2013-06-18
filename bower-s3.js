var path = require('path');
var assert = require('assert');
var bower = require('bower');
var hat = require('hat');
var fs = require('fs-extra');
var amazonS3 = require('awssum-amazon-s3');
var streamDir = require('stream-dir');
var through = require('through');

var DEFAULT_COMPONENT_DIRECTORY = 'components';
var DEFAULT_AWS_REGION = amazonS3.US_EAST_1;

var BowerS3 = function (options) {
  assert.notEqual(options.key, undefined, 'Requires S3 AWS Key.');
  assert.notEqual(options.secret, undefined, 'Requres S3 AWS Secret');
  assert.notEqual(options.bucket, undefined, 'Requires AWS S3 bucket name.');
  
  this.bucket = options.bucket;
  this.componentDirectory = options.componentDirectory || DEFAULT_COMPONENT_DIRECTORY;
  this.region = options.region || DEFAULT_AWS_REGION;
  this._s3 = new amazonS3.S3({
    'accessKeyId'     : options.key,
    'secretAccessKey' : options.secret,
    'region'          : this.region
  });
};

BowerS3.getFromBower = function(components, callback) {
  var installDir = path.join('.tmp', hat());
  
  fs.mkdirs(installDir, function (err) {
    bower.config.directory = installDir;
    bower.commands.install(components).
      on('end', function (data) {
       callback(null, installDir);
      }).
      on('error', callback);
  });
};

BowerS3.prototype.install = function (components, callback) {
  var self = this;
  var componentDirectory = this.componentDirectory;
  
  // Always need it as an array
  if (typeof components === 'string') {
    components = [components];
  }
  
  BowerS3.getFromBower(components, function (err, installDir) {
    if (err) {
      return callback(err);
    }
    
    streamDir(installDir).
      pipe(self.getFileStats).
      pipe(self.uploadFileToBucketFrom(installDir)).
      pipe(self.removeInstallDir(installDir)).
      on('end', callback);
  });
};

BowerS3.prototype.uploadFileToBucketFrom = function (installDir) {
  var self = this;
  
  var stream = through(function (fileStats) {
    var emit = this.emit;
    var destPath = fileStats.filePath.replace(installDir + '/', '');
    var options = {
      BucketName    : self.bucket,
      ObjectName    : path.join(self.componentDirectory, destPath),
      ContentLength : fileStats.size,
      Body          : fs.createReadStream(fileStats.filePath)
    };
    
    self._s3.PutObject(options, function(err, data) {
      emit('data', destPath);
    });
  }, function () {
    this.emit('end');
  });
  
  return stream;
};

BowerS3.prototype.removeInstallDir = function (installDir) {
  var stream = through(function () {
    this.emit('data');
  }, function () {
    fs.remove(installDir, function (err) {
      this.emit('end', null);
    }.bind(this))
  });
  
  return stream;
}

BowerS3.prototype.getFileStats = through(function (fileName) {
  fs.stat(fileName, function (err, stats) {
    stats.filePath = fileName;
    this.emit('data', stats);
  }.bind(this));
}, function (){
  this.emit('end');
});


module.exports = BowerS3;


