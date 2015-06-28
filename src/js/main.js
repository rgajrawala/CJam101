/*##############################################################################
*################################   VARIABLES   ################################
*#############################################################################*/

var isRunning = false, explain = null;

/*##############################################################################
*################################   FUNCTIONS   ################################
*#############################################################################*/

function run() {
	if (isRunning) {
		return;
	}

	isRunning = true;

	$('#output').val('');
	$('#run').prop('disabled', true);

	setTimeout(function() {
		try {
			$('#output').val(runCJam($('#code').val(), $('#input').val()));
		}
		catch (e) {
			$('#output').val('Syntax error:\n' + e.__gwt$backingJsError.stack);
		}

		setTimeout(function() {
			$('#run').prop('disabled', false);
			isRunning = false;
		}, 0);
	}, 0);
}

function setCount() {
	$('#count').html($('#code').val().length);
}

function permalink() {
	window.location.hash = '#code=' + encodeURIComponent($("#code").val()) + '&input=' + encodeURIComponent($('#input').val());
}

$(function() {
	/*##########################################################################
	*##############################   FIRST RUN   ##############################
	*#########################################################################*/

	{
		var h = window.location.hash.substring(1);
		if (h.indexOf('code=') === 0) {
			var x = h.indexOf('&input=');

			$('#code').val(decodeURIComponent(x > 0 ? h.slice(5, x) : h.slice(5)));
			$('#input').val(decodeURIComponent(x > 0 ? h.slice(x + 7) : ''));

			setCount();
		}
	}

	/*##########################################################################
	*##############################   TEXTAREAS   ##############################
	*#########################################################################*/

	$('#code, #input').keypress(function(e) {
		if (e.ctrlKey && e.which === 13) {
			run();
			e.preventDefault();
		}
	});

	$('#code').keyup(function() {
		setCount();
	});

	$('#code, #input').keyup(function() {
		permalink();
	});

	/*##########################################################################
	*###############################   BUTTONS   ###############################
	*#########################################################################*/

	$('#permalink').click(permalink);

	$('#run').click(function() {
		run();
	});

	/*##########################################################################
	*#############################   EXPLANATION   #############################
	*#########################################################################*/

	(explain = function explain() {
		var code = this.value;
		if (!code) {
			$('#explanation').html('<p1>An explanation of your code will be automatically generated as you type.</p1>');
			return;
		}

		try {
			var parts = Explainer.tokenize(code);
			var explanations = Explainer.explain(parts);
			var html = Explainer.toHtml(parts, explanations);
			$('#explanation').html(html).find('b.level').each(function() {
				var el = $(this), html = '';

				el.next().find('li').each(function() {
					var value = $(this).data('value'), type = $(this).data('type');
					if (value) {
						if (type === 'char') {
							html += '\'' + value;
						} else if (type === 'string') {
							html += '"' + value + '"';
						} else if (type === 'comment') {
							html += value + '<br>';
						} else {
							html += value;
						}
					}
				});

				el.html(html);
			});
		} catch (e) {
			$('#explanation').html('<p1 style="color: red;">' + e.stack.replace(/ /g, '&nbsp;') + '</p1>');
		}
	}).call($('#code').keyup(explain)[0]);

	/*##########################################################################
	*##############################   REFERENCE   ##############################
	*#########################################################################*/

	$('.ref-select').click(function() {
		var el = $(this), ref = el.data('ref');

		$('.ref-data').hide();
		$('.ref-data[data-ref="' + ref + '"]').show();
	});
	$('.ref-data[data-ref="syntax"]').show();

	$('.ref-ex').click(function() {
		var el = $(this), code = el.attr('data-code'), input = el.attr('data-input');

		var cel = $('#code').val(code || '');
		$('#input').val(input || '');

		permalink();
		setCount();
		explain.call(cel[0]);
	});
});
