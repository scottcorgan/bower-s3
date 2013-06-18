var path = require('path');
var bower = require('bower');
var hat = require('hat');
var fs = require('fs-extra');
var walk = require('walk')
var amazonS3 = require('awssum-amazon-s3');





/*
  - bucket name
  - bower package name,
  - accessKey
  - secretKey
 */















var s3 = new amazonS3.S3({
  'accessKeyId'     : 'AKIAJZLSGG5WYIXWVQFA',
  'secretAccessKey' : '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',
  'region'          : amazonS3.US_EAST_1
});

var installDir = path.join('.tmp', hat())

fs.mkdirs(installDir, function (err) {
  bower.commands.install(['git://github.com/scottcorgan/xortable.git'], {
    directory: installDir
  }).
    on('end', function (data) {
      walker = walk.walk(installDir, {followLinks: false});
      walker.on('file', uploadFileToBucket('bower-s3', 'components'));
      walker.on('end', rmTempDir(installDir));
    }).
    on('error', function (err) {
      console.log('ERROR Installing from Bower:', err);
    });
  
});

function uploadFileToBucket (bucketname, rootBucketFolder) {
  return function (root, fileStats, next) {
    var relativeRoot = root.replace(installDir, '');
    var srcPath = path.join(root, fileStats.name);
    var destPath = path.join(relativeRoot, fileStats.name);
    
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
    })
  };
}

