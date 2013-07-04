/**
 * Copyright (C) 2013 Fur
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a 
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
 * THE SOFTWARE.
 */
(function($) {
	var KEY_COMMA = 44;
	var KEY_ENTER = 13;
	var KEY_BACKSPACE = 8;
	var KEY_DELETE = 46;
	
	var id = 1;
	var methods = {
		init : function(options, elem) {
			if(this.length) {
				return this.each(function() {
					id = 'jq-ec-' + (new Date()).getTime() + '-' + Math.round(Math.random()*100);
					var wrapper = $('<div class="jq-ec clearfix" id='+id+'></div>');					
					var $this = $(this);
					$this.wrap(wrapper);
					if($this.attr('name')) {
						$this.attr('data-name', $this.attr('name'));
					} else {
						$this.attr('data-name',id);
					}
					// Unset the name field, it will become an array
					$this.attr('name', null);
					var attributes = $this.prop("attributes");
					var ce = $('<div contenteditable></div>');
					$.each(attributes, function() {
						ce.attr(this.name, this.value);
					});
					ce.addClass('textarea');
					ce.text($this.val());
					$this.replaceWith(ce);
					$this = ce;
					$('#' + id).on('click', function() {
						$('.textarea', this).focus();
					});
					
					/**
					 * On focus out update the text inside it
					 */
					$('#' + id).on('focusout blur', '.textarea',function() {
						methods.update.call($this, options);
					});
					
					/*
					 * Double click handler for an email span,
					 * Get the email address and replace the span with the
					 * text area. Also give focus to textarea
					 */
					$('#' + id).on('dblclick', '.jq-ec-email', function() {
						
						methods.update.call($this, options);
						var val = $('input', this).first().val();
						if($('input', this).last().val() != '') {
							val = "<" + $('input', this).last().val() + "> " + val;
						}
						$(this).replaceWith($this);
						$this.text(val);
						$this.setCursorAtEnd();
					});
					
					$('#' + id).on('click', '.jq-ec-close', function() {
						$(this).closest('.jq-ec-email').remove();
					});
					
					$('#' + id).on('keypress', '.textarea', function(e) {
						if(!e.ctrlKey && !e.altKey && !e.shiftKey) {
							switch(e.charCode) {
							case KEY_COMMA:
							case KEY_ENTER:
								// Create email box
								e.preventDefault();
								e.stopPropagation();
								//$this.emailcomplete('update');
								methods.update.call($this, options);
								break;
							}
						}
					});
					$('#' + id).on('keydown', '.textarea', function(e) {
						if(!e.ctrlKey && !e.altKey && !e.shiftKey) {
							switch(e.keyCode) {
							case KEY_BACKSPACE:
								if(methods.getCaretCharacterOffsetWithin(e.currentTarget) == 0) {
									$(e.currentTarget).prev().remove();
								}
								break;
							case KEY_DELETE:
								if(methods.getCaretCharacterOffsetWithin(e.currentTarget) == $(this).text().length) {
									$(e.currentTarget).next().remove();
								}
								break;
							}
						}
						
					});

					methods.update.call($this, options);
				});
			}
		},
		update : function() {
			var $this = $(this);
			var n = $this.attr('data-name');
			if(n.indexOf(']') == -1) {
				n += '-name';
			} else {
				var a = n.split(']');
				a[a.length-2] += '-name';
				n = a.join(']');
			}
			var tpl = $('<span class="jq-ec-email">' +
						'<span class="jq-ec-label"></span>' +
						'<input type="hidden" name="'+$this.attr('data-name')+'[]" value="" />' +
						'<input type="hidden" name="'+n+'[]" value="" />' +
						'<span class="jq-ec-close"></span>' +
						'<span>');
			
			// Check if field is not empty
			var val = $this.text().trim();
			if(val == '' || val == ',') {
				return;
			}
			var arr = val.split(',');
			for(var i = 0; i < arr.length; i++) {
				var rv = arr[i].trim();
				if(rv != '') {
					var inp, name, realname, email;
					realname = '';
					if(rv.indexOf('<') !== -1 && rv.indexOf('>') !== -1) {
						realname = name = rv.substring(0, rv.indexOf('<')).trim();
					}
					var re = /([A-z0-9\.\-\_]*@{1}[A-z0-9\.\-\_]*)/;
					var seemsValid = false;
					inp = re.exec(rv);
					if(inp) {
						// found something which looks like an email adress
						email = inp[1];
						seemsValid = true;
					} else {
						email = val;
					}
					if(name == undefined) {
						name = email;
					} else {
						name += ' (' + email +')';
					}
					var spn = tpl.clone();
					$('.jq-ec-label', spn).text(name);
					if(!seemsValid) {
						spn.addClass('jq-ec-invalid');
					}
					$('input', spn).first().val(email);
					$('input', spn).last().val(realname);
					$this.text("");
					$this.before(spn);
				}
			}
		},
		
		/**
		 * @private
		 * @param el
		 * @returns {Number}
		 */
		getCaretCharacterOffsetWithin: function(el) {
		
			var caretOffset = 0;
		    if (typeof window.getSelection != "undefined") {
		        var range = window.getSelection().getRangeAt(0);
		        var preCaretRange = range.cloneRange();
		        preCaretRange.selectNodeContents(el);
		        preCaretRange.setEnd(range.endContainer, range.endOffset);
		        caretOffset = preCaretRange.toString().length;
		        
		    } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
		        var textRange = document.selection.createRange();
		        var preCaretTextRange = document.body.createTextRange();
		        preCaretTextRange.moveToElementText(el);
		        preCaretTextRange.setEndPoint("EndToEnd", textRange);
		        caretOffset = preCaretTextRange.text.length;
		    }
		    return caretOffset;
		
		}
	};
	$.fn.emailcomplete = function(method) {

		// Method calling logic
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(
					arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.emailcomplete');
		}

	};


	/**
	 * tnx to http://stackoverflow.com/a/4238971/1498351
	 */
	$.fn.setCursorAtEnd = function() {
		this.each(function(index, elem) {
			this.focus();
			if (typeof window.getSelection != "undefined"
					&& typeof document.createRange != "undefined") {
				var range = document.createRange();
				range.selectNodeContents(this);
				range.collapse(false);
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			} else if (typeof document.body.createTextRange != "undefined") {
				var textRange = document.body.createTextRange();
				textRange.moveToElementText(this);
				textRange.collapse(false);
				textRange.select();
			}
//			
		});
		return this;
	};
	
})(jQuery);