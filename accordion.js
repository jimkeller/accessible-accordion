var Accordion = function ( options ) {

  Accordion.instantiation_count++;

  this.options = options;
  this.initialize();

};

/**
 * Gets an option by name, or sets an option if val parameter is present. Checks local options and falls back to global options
 * @param {string} key
 * @param {mixed} val (optional)
 * @return none
 */
Accordion.prototype.option = function ( key, val ) {
  try {

    var ret;

    if ( typeof(val) === 'undefined' ) {
      ret = Accordion.obj_get_if_set( this.options, key);

      if ( typeof(ret) == 'undefined' ) {
        ret = Accordion.obj_get_if_set( Accordion.options_default(), key );
      }

      return ret;
    }
    else {
      this.options[key] = val;
    }
  }
  catch(e) {
    throw e;
  }

};

/**
 * Determines whether a particular accordion item (heading + content) is expanded. Relies on the data-accordion-expanded attribute set on initialization
 * @param {DomElement} item The accordion item element, e.g. as returned by querySelector
 * @return {boolean} True if item is expanded, false otherwise
 */
Accordion.prototype.item_is_expanded = function( item ) {

  if ( item.getAttribute('data-accordion-expanded') == 'true' ) {
    return true;
  }


  return false;

};

/**
 * Handler that is fired on browser resize. Primarily, this function re-saves the height of the content area on resize
* @param {Object} options An options object. Currently unused.
* @return none
 */
Accordion.prototype.resize_handler = function( options ) {

    try {

      var bundles = document.querySelectorAll(this.option('selector_bundle'));
      options = options || {};

      for ( var bundle_index = 0; bundle_index < bundles.length; bundle_index++ ) {

        var bundle = bundles[bundle_index];
        var items = bundle.querySelectorAll(this.option('selector_item'));

        for( var i = 0; i < items.length; i++ ) {

          var item = items[i];
          var me = this;

          if ( this.item_is_expanded(item) ) {

            this.item_expanded_height_reapply(item, {immediate: true});

          }
          else {
            this.item_expanded_height_calculate(item);
          }
          
        }
      }
    }
    catch(e) {
      throw e;
    }

};

Accordion.prototype.item_get_content = function(item) {
  return item.querySelector(this.option('selector_content'));
};

Accordion.prototype.initialize = function() {

  if ( typeof(this.option('selector_bundle')) == 'undefined' || this.option('selector_bundle') == '' ) {
    throw 'No bundle selector specified';
    return false;
  }

  var bundles = document.querySelectorAll(this.option('selector_bundle'));

  for ( var bundle_index = 0; bundle_index < bundles.length; bundle_index++ ) {

    var bundle = bundles[bundle_index];
    var items = bundle.querySelectorAll(this.option('selector_item'));

    bundle.setAttribute('role', 'tablist');
    bundle.setAttribute('id', Accordion.instantiation_count.toString() + '_' + this.option('id_prefix_bundle') + '-' + bundle_index.toString() );

    for( var item_index = 0; item_index < items.length; item_index++ ) {
      this.item_initialize(items[item_index], item_index, bundle, bundle_index);
    }

    this.bundle_collapse( bundle, { first_initialize: true, except_first: this.option('auto_expand_first_item') });

    if ( this.option('auto_expand_first_item') == true ) {
      this.item_expand(items[0]);
    }
  }

  //
  // Apply Resize handler
  //
  var this_accordion = this;

  window.addEventListener('resize',
    function() {
      this_accordion.resize_handler();
    }
  );

  // 
  // Listen for custom resize event
  //
  window.addEventListener('accordion-resize', 
    function() {
      this_accordion.resize_handler();
    }
  );

};

/**
 * Set the initial stte of an accordion item
 *
 * @param {DomElement} item The accordion item element, e.g. as returned by querySelector
 * @param {int} item_index The index of this item in its bundle (base zero)
 * @param {DomElement} bundle The accordion bundle this item belongs to
 * @param {int} bundle_index The index of the bundle this item belongs to
 * @param {Object} options miscellaneous options. Currently unused
 * @return none
 */
Accordion.prototype.item_initialize = function( item, item_index, bundle, bundle_index, options ) {

  try {
    var me = this;
    var callback;
    var heading = item.querySelector(this.option('selector_heading'));
    var content = item.querySelector(this.option('selector_content'));
    var unique_suffix = Accordion.instantiation_count.toString() + '_' + bundle_index.toString() + '_' + item_index.toString();
    var item_unique_id = this.option('selector_bundle').replace(/[^A-Za-z0-9-_]*/g, '') + '_' + unique_suffix;
    var callback_params = { item: item, bundle: bundle, accordion_object: me };

    item.setAttribute('data-accordion-item-id', item_unique_id );
    item.setAttribute('data-accordion-bundle-id', bundle.getAttribute('id') );
    heading.setAttribute('data-accordion-header-for', item_unique_id);
    heading.setAttribute('role', 'tab');
    heading.setAttribute('aria-controls', me.option('id_prefix_content') + '-' + unique_suffix );

    content.setAttribute('id', me.option('id_prefix_content') + '-' + unique_suffix);
    content.setAttribute('role', 'tabpanel');

    heading.addEventListener('click',
      function( event ) {

        var callback;
        var click_target  = event.currentTarget;
        var click_item_id = click_target.getAttribute('data-accordion-header-for');

        if ( click_item_id != null ) {

          event.preventDefault();
          event.stopPropagation();

          var click_item = document.querySelector( me.option('selector_item') + '[data-accordion-item-id=' + click_item_id + ']' );

          if ( !me.item_is_expanded(click_item) ) {

            //
            // Fire 'before' open callback
            //
            if ( callback = me.option('callbacks.open.before')  ) {
              callback.call(event, callback_params);
            }

            me.item_expand(click_item, { from_click: true, scroll_to_top: me.option('scroll_to_top')} );

            //
            // Fire 'after' open callback
            //
            if ( callback = me.option('callbacks.open.after')  ) {
              callback.call(event, callback_params);
            }

          }
          else {

            //
            // Fire 'before' close callback
            //
            if ( callback = me.option('callbacks.close.before') ) {
              callback.call(event, callback_params);
            }

            me.item_collapse(click_item);

            //
            // Fire 'after' close callback
            //
            if ( callback = me.option('callbacks.close.after')  ) {
              callback.call(event, callback_params);
            }
          }
        }

      }

    );

    this.item_expanded_height_calculate(item );

    if ( callback = this.option('callbacks.item.initialize.after')  ) {
      callback.call(event, callback_params);
    }

  }
  catch(e) {
    throw e;
  }

};

/**
 * Enables or disables tabbing to elements. For accessibility compliance, certain elements have their tabindex
 * removed when the accordion is closed (e.g. a, input)
 * @param {DomElement} element the containing element whose "tabbable" elements will be disabled
 * @param {string} action "enable" or "disable"
 * @param {Object} options miscellaneous options. Currently unused
 * @return none
 */
Accordion.prototype.tabbables_toggle = function( element, action, options ) {

  try {
    options = options || {};

    var tabbables = element.querySelectorAll(this.option('selector_tabbable_elements'));
    var tabindex = ( action == 'disable' ) ? '-1' : '0';

    for ( var j = 0; j < tabbables.length; j++ ) {
      tabbables[j].setAttribute('tabindex', tabindex);
    }
  }
  catch(e) {
    throw e;
  }

};




 /*
Accordion.prototype.item_expanded_height_recalculate = function(item, options) {

  try {

    options = options || {};
    var new_height = null;
    var me = this;

    var was_expanded = null;
    var content = item.querySelector(this.option('selector_content'));

    //
    // We need the item to be expanded in order to do this calculation
    //
    var was_expanded = this.item_is_expanded(item);
    if ( !was_expanded ) {
      this.item_expand(item, { 'shadow_expand': true } );
    }

    //requestAnimationFrame(function() {
    me.item_expanded_height_calculate(item, options);

    if ( !was_expanded ) {
      //
      // Re-collapse this item if we only expanded it to do this calculation
      //
      me.item_collapse(item);
    }

    //});
  }
  catch(e) {
    throw e;
  }
}
*/

/**
 * Saves the value of the expanded height of an accordion item .
 * In order to allow us to use CSS animations, we need to know what the expanded height of the accordion contents will be
 * (as of this writing, you can't animate to height: auto)
 * This function uses the element's scrollHeight to get the expanded height of the accordion, and saves it in a data-expanded-height attribute
 *
 * @param {DomElement} item The accordion item element, e.g. as returned by querySelector
 * @param {Object} options miscellaneous options. Currently unused
 * @return none
 */
Accordion.prototype.item_expanded_height_calculate = function(item, options) {

    try {
      options = options || {};
      var new_height = null;
      var content = item.querySelector(this.option('selector_content'));

      var content_stage = content.firstElementChild;

      if ( !content_stage ) {
        throw 'Could not find a content stage. Make sure you have an inner div inside your accordion content.';
      }

      // content.style.transitionDuration='0s'; //extremely necessary if transition "all" is set. Otherwise scrollHeight doesn't update in time for our calculation below.
      // content.style.removeProperty('height');
      // new_height = content.scrollHeight;

      new_height = content_stage.scrollHeight;
      content.setAttribute('data-expanded-height', parseInt(new_height) + parseInt(this.option('height_buffer')) );
      
      //content.style.removeProperty('transition-duration');

    }
    catch(e) {
      throw e;
    }
};

Accordion.prototype.item_expanded_height_reapply = function(item, options) {

  try {
    this.item_expanded_height_calculate(item);
    this.height_apply_expanded(item, options);
  }
  catch(e) {
    throw e;
  }

};


/**
 * Collapse all items in a given accordion bundle
 * @param {DomElement} bundle the accordion bundle (i.e. the container that has multiple accordion items in it)
 * @param {Object} options object with options. Currently supports:
 * "except_first": if true, the first item in the accordion bundle will be left open
 * @return none
 */
Accordion.prototype.bundle_collapse = function( bundle, options ) {

  try {

    options = options || {};

    var collapse = true;
    var items = bundle.querySelectorAll(this.option('selector_item'));
    var first_item = items[0];
    var item;

    for( var i = 0; i < items.length; i++ ) {

      item = items[i];
      collapse = true;

      if ( typeof(options.except_first) != 'undefined' && options.except_first == true ) {
        //if ( item == first_item ) {
        //  this.item_expand( item );
          collapse = false;
        //}
      }

      if ( typeof(options.except_item) != 'undefined' && options.except_item == item ) {
        collapse = false;
      }

      if ( collapse ) {
        this.item_collapse(item);
      }
    }
  }
  catch(e) {
    throw e;
  }

};

Accordion.prototype.height_apply_collapsed = function(item, options) {
  var content = item.querySelector( this.option('selector_content') );
  content.style.height = '0' + this.option('height_units');

};

Accordion.prototype.height_apply_expanded = function(item, options) {

  options = options || {};

  var content = item.querySelector( this.option('selector_content') );

  if ( typeof(options.immediate) != 'undefined' && options.immediate ) {
    content.style.transitionDuration = '0s';
  }

  content.style.height = content.getAttribute('data-expanded-height') + this.option('height_units');

  if ( typeof(options.immediate) != 'undefined' && options.immediate ) {
    content.style.removeProperty('transition-duration');
  }

};

Accordion.prototype.active_attributes_apply = function( item ) {
  try {

    var heading = item.querySelector( this.option('selector_heading') );
    var content = item.querySelector( this.option('selector_content') );

    item.setAttribute('data-accordion-expanded', true);
    item.classList.add( this.option('class_name_expanded') );

    // if ( this.options.css_style_apply ) {
    //   this.css_style_apply(item, { 'expanded': true });
    // }

    heading.setAttribute('aria-expanded',true);
    content.setAttribute('aria-hidden', false);
    this.tabbables_toggle(content, 'enable');

  }
  catch(e) {
    throw e;
  }
};

/**
 * Get an accordion item's bundle
 * @param {DomElement} item The accordion item element, e.g. as returned by querySelector
 * @return {DomElement} the bundle this item is in
 */
Accordion.prototype.bundle_by_item = function( item ) {

  try {
    if ( item.getAttribute('data-accordion-bundle-id') ) {
      return document.getElementById( item.getAttribute('data-accordion-bundle-id') );
    }
    else {
      throw "Error Getting Bundle ID for Item " + item;

      /* @TODO
       *
       * Is there ever a time where we need this function to operate before a bundle has been initialized?
       * if so, code here would need to traverse up the DOM
       */
    }
  }
  catch(e) {
    throw e;
  }
};

Accordion.prototype.item_collapse = function( item ) {

  try {

    var heading = item.querySelector( this.option('selector_heading') );
    var content = item.querySelector( this.option('selector_content') );

    item.classList.remove( this.option('class_name_expanded') );
    item.setAttribute('data-accordion-expanded', false);

    // if ( this.options.css_style_apply ) {
    //   this.css_style_apply(item, { 'expanded': false });
    // }
    // else {
    //   this.height_apply_collapsed(item);
    // }

    this.height_apply_collapsed(item);
    heading.setAttribute('aria-expanded',false);
    content.setAttribute('aria-hidden', true);

    this.tabbables_toggle(content, 'disable');

    //$content.slideUp();
  }
  catch(e) {
    throw e;
  }

};

/*** UNUSED CURRENTLY 
Accordion.prototype.content_clone = function( content, options ) {

  try {
    var clone = content.cloneNode(true);
    var parent = content.parentElement;

    clone.id = 'clone_' + content.id.toString();
    clone.style.position = 'absolute';
    clone.style.left = '-1000rem';
    clone.style.transitionDuration = '0s';

    parent.appendChild(clone);

    return clone;

  }
  catch(e) {
    throw e;
  }

}
**/


/**
 * Expand an accordion item
 * @param {DomElement} item The accordion item element, e.g. as returned by querySelector
 * @param {Object} options
 * {
 * shadow_expand: used internally to expand an item for height calculation only,
 * scroll_to_top: scroll to the top of this item after expansion
 * }
 * @return none
 */
Accordion.prototype.item_expand = function( item, local_options ) {

  try {

    local_options = local_options || {};

    var content = item.querySelector( this.option('selector_content') );

    this.active_attributes_apply(item);
    this.height_apply_expanded(item);
    //$content.slideDown( 400 );

    if ( typeof(local_options.shadow_expand) == 'undefined' || local_options.shadow_expand == false ) {
      if ( typeof(this.option('item_expand_unique')) !== 'undefined' && this.option('item_expand_unique') == true ) {
        this.bundle_collapse( this.bundle_by_item(item), { except_item: item } );
      }

      if ( typeof(local_options.scroll_to_top) != 'undefined' && local_options.scroll_to_top.enabled != false) {

        if ( this.option('scroll_to_top.transition.enabled') == true) {
          Accordion.scroll_to_element(
            this.option('scroll_to_top.selector_scroll_element'),
            Accordion.scroll_position(this.option('scroll_to_top.selector_scroll_element')),
            item.offsetTop,
            Accordion.scroll_position,
            this.option('scroll_to_top.transition.duration'),
            this.option('scroll_to_top.transition.function_scroll_ease'),
            this.option('scroll_to_top.transition.animation_interval')
          );
        }
        else {
          Accordion.scroll_position(this.option('scroll_to_top.selector_scroll_element'), item.offsetTop);
        }
      }
    }
  }
  catch(e) {
    throw e;
  }

};

/**
 * Get or set the scroll position of an element or window.
 */
Accordion.scroll_position = function (scroll_element, value) {
  // Get
  if(value === undefined) {
    if(scroll_element == window) {
      return (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0);
    }
    else {
      return document.querySelector(scroll_element).scrollTop;
    }
  }
  // Set
  else {
    if ( scroll_element == window ) {
      return scroll_element.scrollTo( 0, value );
    }
    else {
      return document.querySelector(scroll_element).scrollTop = value;
    }
  }
};



/**
 * Transition an element between two values.
 * This function uses setInterval for it's animation loop because it's intended for short animations and allows for more consistent fps.
 * If a transition is triggered on the same element before a previous transition is complete, the previous one will be canceled.
 *
 * @param {DomElement} element The element the transition is being performed on.
 * @param {number} from The beginning value for the transition.
 * @param {number} to The ending value for the transition.
 * @param {function} set_function A setter function that will update the element with the new values.
 * @param {number} duration The length of time (milliseconds) the transition will take.
 * @param {function} ease_function A custom ease function for the step calculations.
 * @param {number} interval The amount of time (milliseconds) each animation step will take.
 * @return none
 */
Accordion.scroll_to_element = function (element, from, to, set_function, duration, ease_function, interval) {

  var difference = to - from;
  var time_start = new Date().getTime();
  var time_end = time_start + duration;

  set_function(element, from);

  // End previous running transitioning.
  if( element.animation_loop ) {
    clearInterval(element.animation_loop);
  }

  var animation_loop = setInterval(function () {
    var time_current = new Date().getTime();
    var time_passed = time_current - time_start;
    var duration_percent = time_passed / duration;
    var ease_percent = ease_function(duration_percent);

    // Limit the ease percent to 100%.
    if( ease_percent > 1 ) {
      ease_percent = 1;
    }

    var transition_interval_value = (ease_percent * difference) + from;
    set_function(element, transition_interval_value);

    if( time_current >= time_end ) {
      clearInterval(animation_loop);
      set_function(element, to);
      element.animation_loop = false;
    }
  }, interval);

  element.animation_loop = animation_loop;
};

if ( typeof module !== 'undefined' && module.exports ) {
  module.exports = Accordion;
}

/**
 * Utility function to check whether nested object keys are set, without getting a TypeError
 * @param {Object} obj the object whose keys you wish to check
 * @param {String} keys the keys you wish to look for, e,g. ['level1', 'level2']
 * @return {Boolean} true if the key exists, false otherwise
 */
Accordion.obj_get_if_set = function( obj, keys ) {
  try {
    var ret = undefined;
    eval ('ret = obj' + '.' + keys);
    return ret;
  }
  catch(e) {
    return undefined;
  }
};

Accordion.options_default = function() {
  return {
    'selector_bundle': '.accordion', //selector for outer container for multiple accordion items (an accordion item consists of heading and content, a "bundle" consists of multiple items)
    'selector_item': '.accordion__item', //selector for single accordion item (heading + content)
    'selector_heading': '.accordion__item__heading a', //selector for clickable accordion heading
    'selector_content': '.accordion__item__content', //selector for clickable accordion content
    'id_prefix_content': 'accordion-content',
    'id_prefix_bundle': 'accordion-bundle',
    'selector_tabbable_elements': 'input, a', //selector for elements that can be tabbed to. These are disabled in the accordion content when the accordion is closed
    'scroll_to_top': {
      'enabled': true,
      'selector_scroll_element': window, // What container to scroll when accordion opens.
      //'offset_top': 0, // (FUTURE FEATURE, NOT IMPLEMENTED YET) For sticky headers, accepts a number or an element selector.
      'transition': {
        'enabled': true,
        //'scroll_interrupt': false, // (FUTURE FEATURE, NOT IMPLEMENTED YET) If true, the transition animation will be canceled when a user scrolls during the transition.
        'duration': 450, // How many milliseconds the transition animation will take.
        'function_scroll_ease': function easeInOutQuad(t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; },
        'animation_interval': 20 // How many milliseconds each animation step will take (lower = smoother animations).
      }
    },
    'class_name_expanded': 'expanded', //Class name for 'expanded' accordion
    'auto_expand_first_item': false, //If you want the first item to default to expanded
    'item_expand_unique': false, //If true, other items will be closed when an item is expanded
    'height_buffer': 0, //If you want extra padding below the content when the accordion is expanded
    'height_units': 'px',
    'callbacks': {
      //
      // Open and close callbacks are passed the following object as a parameter:
      // {
      //  item: [the item that was opened or closed, as a dom object]
      //  bundle: [the bundle containing this item, as a dom object]
      //  accordion_object: [this object]
      // }
      'open': {
        'before': null, //Callback to fire before an accordion is opened (but after it is clicked/tapped)
        'after': null //Callback to fire after an accordion is opened
      },
      'close': {
        'before': null, //Callback to fire before an accordion is closed (but after it is clicked/tapped)
        'after': null //Callback to fire after an accordion is closed
      },
      'item': {
        'initialize': {
          'after': null //Callback fired after an accordion item is initialized
        }
      }

    },
    'css_style_apply': false, //EXPERIMENTAL if you want to apply all your own CSS, set this to false. These defaults are probably necessary though
    'css_styles': { //if css_style_apply is true, these styles will be applied
      'collapsed': {
        'content': { 'height': '0px'  }
      },
      'expanded': {}
    }
  };
};

Accordion.instantiation_count = 0;
