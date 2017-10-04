var Accordion = function ( options ) {

  //
  // Assign defaults
  //
  this.options = {
    'selector_bundle': '.accordion', //selector for outer container for multiple accordion items (accordion item consists of heading and content)
    'selector_item': '.accordion__item', //selector for single accordion item (heading + content)
    'selector_heading': '.accordion__item__heading a', //selector for clickable accordion heading
    'selector_content': '.accordion__item__content', //selector for clickable accordion content
    'id_prefix_content': 'accordion-content',
    'scroll_to_top': true,
    'selector_scroll_element': 'window', //What container to scroll when accordion opens
    'class_name_expanded': 'expanded', //Class name for 'expanded' accordion
    'auto_expand_first_item': false, //If you want the first item to default to expanded
    'height_buffer': 0, //If you want extra padding below the content when the accordion is expanded
    'height_units': 'px',
    'css_style_apply': false, //EXPERIMENTAL if you want to apply all your own CSS, set this to false. These defaults are probably necessary though
    'css_styles': { //if css_style_apply is true, these styles will be applied
      'collapsed': {
        'content': { 'height': '0px'  }
      },
      'expanded': {}
    }

  };

  for ( var key in options ) {
    this.options[key] = options[key];
  }

  this.initialize();

}

Accordion.prototype.css_style_apply = function( item, options ) {

  try {
    var content = item.querySelector( this.options.selector_content );

    if ( typeof(options.expanded) != 'undefined' && options.expanded == true ) { //expanded item

      for ( var property_name in this.options.css_styles.collapsed.content ) {
        content.style.removeProperty(property_name);
      }

      for ( var property_name in this.options.css_styles.expanded.content ) {
        content.style.setProperty(property_name, this.options.css_styles.expanded.content[property_name]);
      }


    }
    else {

      for ( var property_name in this.options.css_styles.expanded.content ) {
        content.style.removeProperty(property_name);
      }

      for ( var property_name in this.options.css_styles.collapsed.content ) {
        content.style.setProperty(property_name, this.options.css_styles.collapsed.content[property_name]);
      }

    }
  }
  catch(e) {
    throw e;
  }

}

Accordion.prototype.item_is_expanded = function( item ) {

  if ( item.getAttribute('data-accordion-expanded') == 'true' ) {
    return true;
  }

  return false;

}


Accordion.prototype.resize_handler = function( options ) {

    try {

      var bundles = document.querySelectorAll(this.options.selector_bundle);

      options = options || {};

      for ( var bundle_index = 0; bundle_index < bundles.length; bundle_index++ ) {

        var bundle = bundles[bundle_index];
        var items = bundle.querySelectorAll(this.options.selector_item);

        for( var i = 0; i < items.length; i++ ) {

          var item = items[i];
          this.item_expanded_height_reset(item, {force_expanded: true});

        }
      }
    }
    catch(e) {
      throw e;
    }

}

Accordion.prototype.initialize = function() {

  if ( typeof(this.options.selector_bundle) == 'undefined' || this.options.selector_bundle == '' ) {
    console.log('No bundle selector specified');
    return false;
  }

  var bundles = document.querySelectorAll(this.options.selector_bundle);

  for ( var bundle_index = 0; bundle_index < bundles.length; bundle_index++ ) {

    var bundle = bundles[bundle_index];
    var items = bundle.querySelectorAll(this.options.selector_item);
    var me = this;

    bundle.setAttribute('role', 'tablist');
    this.bundle_collapse( bundle, { except_first: this.options.auto_expand_first_item });

    for( var item_index = 0; item_index < items.length; item_index++ ) {

      var item = items[item_index];
      var heading = item.querySelector(this.options.selector_heading);
      var content = item.querySelector(this.options.selector_content);
      var unique_suffix = bundle_index.toString() + '_' + item_index.toString();
      var item_unique_id = this.options.selector_bundle.replace(/[^A-Za-z0-9-_]*/g, '') + '_' + unique_suffix;

      item.setAttribute('data-accordion-item-id', item_unique_id );
      heading.setAttribute('data-accordion-header-for', item_unique_id);
      heading.setAttribute('role', 'tab');
      heading.setAttribute('aria-controls', '#' + me.options.id_prefix_content + '-' + unique_suffix );

      content.setAttribute('id', me.options.id_prefix_content + '-' + unique_suffix)
      content.setAttribute('role', 'tabpanel');

      heading.addEventListener('click',
        function( event ) {

          var click_target  = event.currentTarget;
          var click_item_id = click_target.getAttribute('data-accordion-header-for');

          if ( click_item_id != null ) {

            event.preventDefault();
            event.stopPropagation();

            var click_item = document.querySelector( me.options.selector_item + '[data-accordion-item-id=' + click_item_id + ']' );

            if ( !click_item.classList.contains( me.options.class_name_expanded) ) {
              me.item_expand(click_item, { scroll_to_top: true} );
            }
            else {
              me.item_collapse(click_item);
            }
          }

        }

      );

    }

  }

  //
  // Resize handler
  //
  var this_accordion = this;

  window.addEventListener('resize',
    function() {
      this_accordion.resize_handler();
    }
  );

}


Accordion.prototype.item_expanded_height_reset = function(item, options) {

  try {

    options = options || {};
    var original_item = item;
    var new_height = null;
    var Me = this;

    var content = original_item.querySelector(this.options.selector_content);

    var was_expanded = this.item_is_expanded(item);
    if ( !was_expanded ) {
      this.item_expand(item);
    }

    requestAnimationFrame(function() {
      content.style.removeProperty('height');
      new_height = content.scrollHeight;

      if ( !was_expanded ) {
        Me.item_collapse(item);
      }


      content.setAttribute('data-expanded-height', parseInt(new_height) + parseInt(Me.options.height_buffer) );

      if ( Me.item_is_expanded(original_item) ) {
        Me.height_apply_expanded(original_item);
      }
    });
  }
  catch(e) {
    throw e;
  }
}

Accordion.prototype.bundle_collapse = function( bundle, options ) {

  try {

    options = options || {};

    var items = bundle.querySelectorAll(this.options.selector_item);
    var first_item = items[0];

    for( var i = 0; i < items.length; i++ ) {

      var item = items[i];
      this.item_expanded_height_reset(item);

      if ( typeof(options.except_first) != 'undefined' && options.except_first == true ) {
        if ( item == first_item ) {
          this.active_attributes_apply( item );
          continue;
        }
      }

      this.item_collapse(item);
    }
  }
  catch(e) {
    throw e;
  }

}

Accordion.prototype.height_apply_collapsed = function(item, options) {

  var content = item.querySelector( this.options.selector_content );
  content.style.height = '0' + this.options.height_units;

}

Accordion.prototype.height_apply_expanded = function(item, options) {

  var content = item.querySelector( this.options.selector_content );
  content.style.height = content.getAttribute('data-expanded-height') + this.options.height_units;

}

Accordion.prototype.active_attributes_apply = function( item ) {
  try {

    var heading = item.querySelector( this.options.selector_heading );
    var content = item.querySelector( this.options.selector_content );

    item.setAttribute('data-accordion-expanded', true);
    item.classList.add( this.options.class_name_expanded );

    if ( this.options.css_style_apply ) {
      this.css_style_apply(item, { 'expanded': true });
    }

    heading.setAttribute('aria-expanded',true);
    content.setAttribute('aria-hidden', false);

  }
  catch(e) {
    throw e;
  }
}

Accordion.prototype.item_collapse = function( item ) {

  try {

    var heading = item.querySelector( this.options.selector_heading );
    var content = item.querySelector( this.options.selector_content );

    item.classList.remove( this.options.class_name_expanded );
    item.setAttribute('data-accordion-expanded', false);

    if ( this.options.css_style_apply ) {
      this.css_style_apply(item, { 'expanded': false });
    }
    else {
      this.height_apply_collapsed(item);
    }

    heading.setAttribute('aria-expanded',false);
    content.setAttribute('aria-hidden', true);

    //$content.slideUp();
  }
  catch(e) {
    throw e;
  }

}

Accordion.prototype.item_expand = function( item, options ) {

  try {

    options = options || {};

    var content = item.querySelector( this.options.selector_content );

    this.active_attributes_apply(item);
    this.height_apply_expanded(item);
    //$content.slideDown( 400 );

    if ( typeof(options.scroll_to_top) !='undefined' && options.scroll_to_top == true) {

      if ( this.options.selector_scroll_element == 'window' ) {
        window.scrollTo( 0, item.offsetTop );
      }
      else {
        document.querySelector(this.options.selector_scroll_element).scrollTop = item.offsetTop;
      }
    }
  }
  catch(e) {
    throw e;
  }

}


//module.exports = Accordion; //Uncomment to use with ES6 exports
