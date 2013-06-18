# bower-s3

Install [Bower](http://bower.io/) packages directly to s3 buckets.

## Install

```
npm install bower-s3 --save
```

## Usage

```javascript
var BowerS3 = require('bower-s3');

var options = {
  key: 'some-aws-key',
  secret: 'some-aws-secret-key',
  bucket: 'bower-s3',
  componentDirectory: 'components' // optional
  region: 'US_EAST_1' // optional
};

var bowerS3 = new BowerS3(options);

bowerS3.install(['jquery'], function (err) {
  //
});
```

## Todo

* Provide a streaming interface as well as callback
* Find a way to stream straight form Bower to S3. Currently we download the files and stream them to S3

## Changelog

* **0.3.0**
  * NEW - Install component by component name rather than component repo
  * NEW - Options for region and default component folder
  * FIXED - Refactor to use streams internally
  * FIXED - Remove uneccessary files.

* **0.0.1**
  * Inital download from bower and stream/put to S3
  * Lots of dirty code
