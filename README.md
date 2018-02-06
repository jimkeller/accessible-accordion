# Accessible Accordion

## Options

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

## TODO

Better Readme
Does not currently support nested accordions
