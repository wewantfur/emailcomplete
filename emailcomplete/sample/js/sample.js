$(function() {
	// Simple complete
	$('textarea.email').emailcomplete();
	
// Simple complete with hinting
$('.textarea.emailcomplete').each(function() {
	var input = $(this);
	input.autocomplete({
		source : ['Ids Klijnsma <i.klijnsma@wewantfur.com>', 
		          'Danny Ruchtie <d.ruchtie@wewantfur.com>', 
		          'Danny Ruchtie <danny@wewantfur.com>', 
		          'Danny Ruchtie <d.ruchtie@wewantfur.nl>'],
		
		select : function(event, ui) {
			// Override default select action
			console.log(event,ui);
			input.val(ui.item.label);
			input.emailcomplete('update',ui.item.label);
			event.preventDefault();
		}

	});
});
});