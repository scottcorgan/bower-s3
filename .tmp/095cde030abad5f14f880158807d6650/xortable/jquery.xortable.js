;(function ($, document, undefined) {
  'use strict';
  
  var pluginName = "xortable";
  var defaults = {
    dragStart: function () {},
    dragEnd: function () {}
  };
  var $body = $('body');
  var $doc = $(document);

  function Xortable( element, options ) {
    this.element = element;
    this.$element = $(this.element);
    this.$dragged = {};
    this.draggedIdx = 0;
    this.$draggedPH = {};
    this.dragOffset = 0;
    this.prevX = 0;
    this.dragDirection = null;
    this._triggerPoints = [];

    this.options = $.extend( {}, defaults, options );

    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  Xortable.prototype = {

    init: function() {
      this._bindActions();
      this.$element.on('DOMNodeInserted', $.proxy(this._bindActions, this));
    },
    
    _bindActions: function (e) {
      
      // Remove previous events
      if (this.$children && this.$children.length) {
        this.$children.off('mousedown', this._prepEvetns);
      }
      
      this.$children = this.$element.children();
      this.setSelectable(false);
      this.$element.addClass('xortable-parent');
      this.$children.addClass('xortable-child'); 
      
      this.$children.on('mousedown', $.proxy(this._prepEvetns, this));
    },
    
    // Needed to allow outside events to pass through.
    // Because of this, I needed a way to only attach events
    // if the user started dragging the tab.
    //
    // Probably needs to be refactored at some point.
    _prepEvetns: function (e) {
      var $el = $(e.currentTarget);
      var self = this;
      
      $el.one('mousemove', function (e) {
        self._childMouseDownHandler(e);
      });
      
      $el.one('mouseup', function () {
        $el.off('mousemove');
      });
    },
    
    // Once the user has clicked and started to drag the itme,
    // we do the magic here.
    _childMouseDownHandler: function (e) {
      var $draggingElement = $(e.currentTarget);
      
      // Drag starting. Call 'dragStart' event
      this.options.dragStart($draggingElement);
      
      // Set up our dragging
      this._resetTriggerPoints();
      this.$dragged = $draggingElement;
      this.$draggedPH = this.$dragged.clone();
      this.draggedIdx = this.$children.index(this.$dragged);
      this.dragOffset = e.pageX - e.currentTarget.offsetLeft;

      this.$dragged.css({visibility: 'hidden'}).addClass('xortable-dragged');
      this.$draggedPH.
        appendTo(this.$element).
        attr('data-draggable-item', true).
        addClass('xortable-dragged-placeholder').
        css({
          position: 'absolute',
          left: e.pageX - this.dragOffset
        });
        
        // Dragging actually happens on these events
        $body.on('mousemove', $.proxy(this._dragTab, this));
        $doc.one('mouseup', $.proxy(function () {
          $draggingElement.mouseup();
          this._cleanup();
          
          // Callback for 'dragEnd'
          this.options.dragEnd($draggingElement);
        }, this));
    },
    
    _resetTriggerPoints: function () {
      var self = this;
      // var parentOffset = this.$element.offset();
      this._triggerPoints = [];
      
      this.$children.each(function (idx) {
        var $el = $(this);
        
        // Ignore our placeholder
        if ($el.attr('data-draggable-item')) {
          return;
        }
        
        var offset = $el.position();
        var left = offset.left;
        var right = offset.left + $el.width();
        
        self._triggerPoints[idx] = {
          left: left,
          right: right
        };
      });
    },
    
    _cleanup: function () {
      this.$dragged.removeClass('xortable-dragged');
      
      this.$draggedPH.remove();
      this.$dragged.css({visibility: 'visible'});
      this.$dragged = null;
      this.$draggedPH = null;
      this._triggerPoints = [];
      $body.off('mousemove', this._dragTab);
    },
    
    _dragTab: function (e) {
      var left = e.pageX - this.dragOffset;
      var draggableCenter = left + this.$draggedPH.width()/2;
      
      this.setDragDirection(left, this.prevX);
      this._rearrange(draggableCenter, e.pageX);
      
      this.prevX = left;
      this.$draggedPH.css('left', left);
    },
    
    _rearrange: function (elCenter, pageX) {
      var $movingEl;
      var resetTabEl = false;
      var point = 0;
      var idx = 0;

      // RIGHT
      if (this.dragDirection === 'right' && this.draggedIdx < (this._triggerPoints.length -1)) {
        idx = this.draggedIdx + 1;
        point = this._triggerPoints[idx].left;
        
        if (elCenter > point) {
          $movingEl = this.$children.get(idx);
          this.$dragged = this.$dragged.insertAfter($movingEl);
          this.draggedIdx = idx;
          resetTabEl = true;
        }
      }
      
      // LEFT
      if (this.draggedIdx > 0){
        idx = this.draggedIdx - 1;
        point = this._triggerPoints[idx].right;
        
        if (elCenter < point) {
          $movingEl = this.$children.get(idx);
          this.$dragged = this.$dragged.insertBefore($movingEl);
          this.draggedIdx = idx;
          resetTabEl = true;
        }
      }
      
      // RESET
      if (resetTabEl) {
        this.$children = this.$element.find('li:not([data-draggable-item])');
        resetTabEl = false;
      }
    },
    
    setDragDirection: function (currentX, previousX) {
      if (currentX >= previousX) {
        this.dragDirection = 'right';
      }
      else{
        this.dragDirection = 'left';
      }
    },
    
    setSelectable: function (isSelectable) {
      if (isSelectable) {
        this.$element.css('user-select', 'all').off('selectstart', false);
        return;
      }
      
      this.$element.css('user-select', 'none').on('selectstart', false);
    }
  };

  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Xortable( this, options ));
      }
    });
  };

})(jQuery, document);