/*!
 * created using jQuery lightweight plugin boilerplate
 */

// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = 'textSearch',
        defaults = {
            // height
            // width 
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = $(element);

        // jQuery has an extend method that merges the
        // contents of two or more objects, storing the
        // result in the first object. The first object
        // is generally empty because we don't want to alter
        // the default options for future instances of the plugin
        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {
        
        init: function() {
            var doc = document; 
            
            // Get text from the element
            var text = this.element.text();
            this.element.text('');
            
            // Add the toolbar to the element passed 
            this.element.append(this.getToolBar()); 
            
            // Create container, add the content class to the element, put the element in the container
            var container = doc.createElement('div');
            container.className = 'textSearch-container';
            var content = doc.createElement('div');
            content.className = 'textSearch-content';
            container.appendChild(content);
            // Turns the element into the wrapper, and adds the container to the wrapper 
            this.element.addClass('textSearch-wrapper');
            this.element.append(container);
            
            // Set sizes
            // Need to set height of the element so scroll works 
            if(this.options.height > 0) {
                this.element.height(this.options.height); 
            } else {
                this.element.height(this.element.parent().height());
            }
            if(this.options.width > 0) {
                this.element.width(this.options.width);
            }
            
            // Add text to content div 
            this.element.find('.textSearch-content').text(text);
           
           
            // Add click events to buttons
            var submitButton = this.element.find('.textSearch-submitButton');
            var nextButton = this.element.find('.textSearch-nextButton');
            var prevButton = this.element.find('.textSearch-prevButton');
            
            submitButton.on('click', this.searchAndHighlightText);
            nextButton.on('click', this.selectNext);
            prevButton.on('click', this.selectPrev); 
        },
        /**
         * Initializes toolbar, creates input and buttons
         * Returns the toolbar div, with the added input and buttons 
         */ 
        getToolBar: function() {
            var toolbar = document.createElement('div');
            toolbar.className = 'textSearch-toolbar';
            
            // Input to put in text to search
            var searchInput = document.createElement('input');
            searchInput.className = 'textSearch-searchInput';
            searchInput.type = 'text';
            toolbar.appendChild(searchInput);
            
            // label for radio button
            var caseSensitivityLabel = document.createElement('span');
            caseSensitivityLabel.innerHTML = "Case sensitive";
            toolbar.appendChild(caseSensitivityLabel);
            
            // radio button for case sensitivity
            var caseSensitivityBox = document.createElement('input');
            caseSensitivityBox.type = 'checkbox';
            caseSensitivityBox.className = 'textSearch-caseSensitivityBox';
            toolbar.appendChild(caseSensitivityBox); 
            
            // Button to submit search
            var submitButton = document.createElement('button');
            submitButton.className = 'textSearch-submitButton';
            var submitText = document.createTextNode('Submit');
            submitButton.appendChild(submitText); 
            toolbar.appendChild(submitButton);
            
            // Button to go to "next" match found 
            var nextButton = document.createElement('button');
            nextButton.className = 'textSearch-nextButton';
            var nextText = document.createTextNode('Next');
            nextButton.appendChild(nextText); 
            toolbar.appendChild(nextButton);
            
            // Button to go to "prev" match found 
            var prevButton = document.createElement('button');
            prevButton.className = 'textSearch-prevButton';
            var prevText = document.createTextNode('Previous');
            prevButton.appendChild(prevText); 
            toolbar.appendChild(prevButton);
            
            // Field to display errors
            var errorSpan = document.createElement('span');
            errorSpan.className = 'textSearch-errorSpan';
            toolbar.appendChild(errorSpan);
            
            return toolbar; 
        },
        /**
         * The actual search and highlighting functionality. The function will grab the text to search by,
         * in the search input, and then search the whole div of text, adding a class to specify a match. The old HTML is
         * then replaced with the newly created html. 
         */ 
        searchAndHighlightText : function(e) {
            // Find container, and get the search input element 
            var container = $(e.target).parents('.textSearch-toolbar').siblings('.textSearch-container').first();
            var searchInput = $(e.target).siblings('.textSearch-searchInput').first(); 
            
            // Store the current text, and the search text 
            var text = container.text(); 
            var textLength = text.length;
            var searchText = searchInput.val();
            var searchTextLength = searchText.length;
            
            var newHtml = "";
            var matched, matchedPos = -1; 
            var i=0;
            var noMatchFound = true;
            var remainingText = text;
            var caseSensitive = "";
            
            // set the case sensitive option, depending on the case sensitive check box 
            var csCheck = $(e.target).siblings('.textSearch-caseSensitivityBox');
            if(csCheck) {
                if(!csCheck.is(":checked")) {
                    caseSensitive += "i"; 
                }
            }
            
            var regex = new RegExp(searchText, caseSensitive); // Turn the search text into a regular expression
            
            while(remainingText.length > 0){ // while there's still text left 
                
                matchedPos = remainingText.search(regex); // returns -1 if no match is found 
                if(matchedPos > -1) { // If there's a match 
                    matched = remainingText.match(regex)[0]; // Store the first match (the .search() will store all matches) 
                    // First add previous text to newHtml 
                    newHtml += remainingText.substring(0, matchedPos);
                    // Then add the matched
                    newHtml += '<span class="highlight">' + matched + '</span>';
                    // Store the rest of the text in remainingText
                    remainingText = remainingText.substring(matchedPos + matched.length);
                    
                    noMatchFound = false; // for error message purposes 
                    // reset matchedPos 
                    matchedPos = -1; 
                } else { // if there are no more matches 
                    // add the rest of the text string
                    newHtml += remainingText;
                    break;
                }
            }
            
            if(noMatchFound) {
                container.siblings('.textSearch-toolbar').first().find('.textSearch-errorSpan').text('No match found!');
                return; 
            }
            
            container.siblings('.textSearch-toolbar').first().find('.textSearch-errorSpan').text('');
            var content = container.find('.textSearch-content'); 
            content.html(newHtml);
            content.find('.highlight').first().addClass('selected');
            scrollTo(content, content.find('.selected'));
        },
        selectNext : function(e) {
            var content = $(e.target).parents('.textSearch-toolbar').siblings('.textSearch-container').find('.textSearch-content').first();
            var selected = content.find('.selected').first();
            var next = selected.next('.highlight'); // finds the next element with the 'highlight' class
            if(next.length != 0) {
                next.addClass('selected');
                selected.removeClass('selected');
                scrollTo(content, next); 
            }
        },
        selectPrev : function(e) {
            var content = $(e.target).parents('.textSearch-toolbar').siblings('.textSearch-container').find('.textSearch-content').first();
            var selected = content.find('.selected').first();
            var prev = selected.prev('.highlight'); // finds the next element with the 'highlight' class
            if(prev.length != 0) {
                prev.addClass('selected');
                selected.removeClass('selected');
                scrollTo(content, prev); 
            }
        }
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );

// Utility Functions

/**
 * Sets the scroll of the parent element to the toElement
 * @param {jQuery Element} parent element that will have it's scroll position changed
 * @param {jQuery Element} toElement element that the scroll position of the parent element will change to 
 */ 
function scrollTo(parent, toElement) {
    var scrollPositionTop = parent.scrollTop();
    var offsetTop = toElement.offset().top;
    var newPosTop = scrollPositionTop + offsetTop - parent.offset().top;
    
    var scrollPositionLeft = parent.scrollLeft();
    var offsetLeft = toElement.offset().left;
    var newPosLeft = scrollPositionLeft + offsetLeft - parent.offset().left; 
    
    parent.animate({
        scrollTop: newPosTop,
        scrollLeft: newPosLeft
    }); 
}