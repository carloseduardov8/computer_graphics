$( document ).ready(function() {
	$( "#dialog" ).dialog({
		autoOpen: true,
		width: 370,
		buttons: [
			{
				text: "Ok",
				click: function() {
					$( this ).dialog( "close" );
				}
			}
		]
	});
});