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

## Options

* **key** (required) - AWS security credential key
* **secret** (required) - AWS security credential secret
* **bucket** (required) - AWS S3 bucket you want the bower files uploaded to
* **componentDirectory** (optional) - The root directory in the bucket for all the Bower packages. By Bower's default, it is ` componenents `
* **region** (optional) - Region your S3 bucket is located in. Default is ` US_EAST_1 `


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
