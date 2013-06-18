var path = require('path');
var bower = require('bower');
var hat = require('hat');
var fs = require('fs-extra');
var walk = require('walk')
var amazonS3 = require('awssum-amazon-s3');




/*
  - bucket name
  - destination directory name (default: components)
  - bower package name,
  - accessKey
  - secretKey
  
  DEFAULTS:
  'accessKeyId'     : 'AKIAJZLSGG5WYIXWVQFA',
  'secretAccessKey' : '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',
  'region'          : amazonS3.US_EAST_1
 */

var DEFAULT_COMPONENT_DIRECTORY = 'components';
var DEFAULT_AWS_REGION = amazonS3.US_EAST_1;

var BowerS3 = function (options) {
  assert.notEqual(options.key, undefined, 'Requires S3 AWS Key.');
  assert.notEqual(options.secret, undefined, 'Requres S3 AWS Secret');
  assert.notEqual(options.bucket, undefined, 'Requires AWS S3 bucket name.');
  
  this.componentDirectory = options.componentDirectory || DEFAULT_COMPONENT_DIRECTORY;
  this.region = options.region || DEFAULT_AWS_REGION;
  this._s3 = new amazonS3.S3({
    'accessKeyId'     : options.key,
    'secretAccessKey' : options.secret,
    'region'          : this.region
  });
};

BowerS3.prototope.install = function (components, callback) {
  // Always need it as an array
  if (typeof components === 'string') {
    components = [compontents];
  }
};


module.exports = BowerS3;

return;


// var bowerS3 = new BowerS3({
//   key: 'AKIAJZLSGG5WYIXWVQFA',
//   secret: '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',
//   bucket: 'bower-s3',
//   componentDirectory: 'components'
// });

// bowerS3.install(['asasdfasdfasdfasf.git'], function (err, res) {
  
// });








var s3 = new amazonS3.S3({
  'accessKeyId'     : 'AKIAJZLSGG5WYIXWVQFA',
  'secretAccessKey' : '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',
  'region'          : amazonS3.US_EAST_1
});


getFromBower(['git://github.com/scottcorgan/xortable.git'], function (err, installDir) {
  walker = walk.walk(installDir, {followLinks: false});
  walker.on('file', uploadFileToBucket('bower-s3', 'components', installDir));
  walker.on('end', rmTempDir(installDir));
});


function getFromBower(components, callback) {
  var installDir = path.join('.tmp', hat());
  
  fs.mkdirs(installDir, function (err) {
    bower.config.directory = installDir;
    bower.commands.install(components).
      on('end', function (data) {
       callback(null, installDir);
      }).
      on('error', function (err) {
        callback(null);
      });
  });
}

function uploadFileToBucket (bucketname, rootBucketFolder, installDir) {
  return function (root, fileStats, next) {
    var relativeRoot = root.replace(installDir, '');
    var srcPath = path.join(root, fileStats.name);
    var destPath = path.join(relativeRoot, fileStats.name);
    console.log(destPath);
    
    var options = {
      BucketName    : bucketname,
      ObjectName    : path.join(rootBucketFolder, destPath),
      ContentLength : fileStats.size,
      Body          : fs.createReadStream(srcPath)
    };
    
    s3.PutObject(options, function(err, data) {
      next();
    });
  };
}

function rmTempDir (dir) {
  return function (err) {
    fs.remove(dir, function () {
      console.log('done uploaded');
    });
  };
}

