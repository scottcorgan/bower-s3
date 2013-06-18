# Xortable

jQuery plugin for sortable horiztonal lists. Fast, light-weight (less than 1kb gzipped), and horizontal.

## Demo

[Play with a demo on Codepen](http://codepen.io/scottcorgan/pen/AGvJt)

[![Screen Shot 2013-04-17 at 10 55 15 AM](https://f.cloud.github.com/assets/974723/392841/002f8046-a788-11e2-9d9e-3e7428912828.png)](http://codepen.io/scottcorgan/pen/AGvJt)

## Browser Support

* Chrome
* Firefox 4+
* Safari 5+
* IE 9+???

## Install

```
bower install xortable
```

Include script after the jQuery library (unless you are packaging scripts somehow else):

```
<script src="path/to/scripts/components/xortable/jquery.xortable.js"></script>
```

## Usage

Basic usage to get up and running

**HTML**

```
<ul class="tabs">
  <li>Tab 1</li>
  <li>Tab 2</li>
  <li>Tab 3</li>
</ul>
```

**Javascript**

```javascript
$('.tabs').xortable();
```

At this point, all the the ` li ` elements will be sortable on the "x" axis (a.k.a. - horiztonally).

**With Options**

```javascript
$('.tabs').xortable({
  dragStart: function ($tab) {
    //
  },
  dragEnd: function ($tab) {
    //
  }
});
```

## Xortable Options

### dragStart

Callback function each time an item starts to be dragged. The callback function is provided the tab in action as the first argument.

```javascript
dragStart: function ($tab) {
  // $tab is a the tab in action as a jQuery object
}
```

### dragEnd

Callback function each time an item has been dragged and dropped. The callback function is provided the tab in action as the first argument.

```javascript
dragEnd: function ($tab) {
  // $tab is a the tab in action as a jQuery object
}
```
