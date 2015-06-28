var ops = [
	// Here is a list of predefined operators in ASCII order:
	['!', 'boolean "not"'],
	['#', 'power, find index'],
	['$', 'copy from stack, sort'],
	['%', 'mod, split, map'],
	['&', 'bitwise/setwise "and", if-then'],
	['(', 'decrement, uncons from left'],
	[')', 'increment, uncons from right'],
	['*', 'multiply, join, repeat, fold (reduce)'],
	['+', 'add, concat'],
	[',', 'range, length, filter'],
	['-', 'subtract, remove'],
	['.', 'infix "vector" operator, must be followed by a binary operator or a block; applies that operator or block on two arrays, item by item, creating an array with the results'],
	['/', 'divide, split, each'],
	[':', 'infix operator, can be followed by: 1) variable name 2) set variable 3) unary operator - map 4) binary operator - fold (reduce)'],
	[';', 'pop and discard'],
	['<', 'compare, slice'],
	['=', 'compare, array get, find value'],
	['>', 'compare, slice'],
	['?', 'if (ternary)'],
	['@', 'rotate top 3 elements on the stack'],
	['[', 'start array'],
	['\\', 'swap top 2 elements on the stack'],
	[']', 'end array'],
	['^', 'bitwise xor, symmetric difference'],
	['_', 'duplicate top element on the stack'],
	['`', 'string representation'],
	['a', 'wrap in array'],
	['b', 'base conversion'],
	['c', 'convert to char'],
	['d', 'convert to double'],
	['e', 'followed by numeric literal - infix operator, calculates *10x (as in the scientific notation)'],
	['f', 'infix operator, can be followed by: 1) variable name - for loop 2) binary operator 3) block - map with extra parameter'],
	['g', 'do-while loop that pops the condition, signum, get from url'],
	['h', 'do-while loop that leaves the condition on the stack'],
	['i', 'convert to integer'],
	['j', 'memoize'],
	['l', 'read line'],
	['m', 'followed by numeric literal - subtract (same as - but avoids the need for a space after it)'],
	['o', 'print value'],
	['p', 'print string representation and newline'],
	['q', 'read the whole input'],
	['r', 'read token (whitespace-separated)'],
	['s', 'convert to string (char array)'],
	['t', 'array set'],
	['w', 'while loop'],
	['z', 'zip (transpose), abs'],
	['|', 'bitwise/setwise "or", if-else'],
	['~', 'bitwise "not", eval, dump array'],

	// "Extended" 2-character operators:
	['e!', 'unique permutations'],
	['e#', 'line comment (not really an operator)'],
	['e%', 'string formatting a la printf'],
	['e&', 'logical and'],
	['e*', 'repeat each item in an array'],
	['e<', 'min of 2 values'],
	['e=', 'count occurrences'],
	['e>', 'max of 2 values'],
	['e[', 'pad array to the left'],
	['e\\', 'swap 2 array items'],
	['e]', 'pad array to the right'],
	['e_', 'flatten array'],
	['e`', 'RLE encode'],
	['ea', 'command-line args'],
	['ed', 'debug (show stack contents)'],
	['ee', 'enumerate array'],
	['el', 'lowercase'],
	['er', 'transliteration (element replacement)'],
	['es', 'timestamp (milliseconds from the epoch)'],
	['et', 'local time'],
	['eu', 'uppercase'],
	['ew', 'overlapping slices'],
	['e|', 'logical or'],
	['e~', 'RLE decode'],

	// "Math" 2-character operators:
	['m!', 'factorial, permutations with duplicates'],
	['m*', 'cartesian product, cartesian power'],
	['m<', 'bit shift, rotate left'],
	['m>', 'bit shift, rotate right'],
	['mC', 'arccos'],
	['mF', 'factorization with exponents'],
	['mL', 'log with base'],
	['mO', 'round with precision'],
	['mQ', 'integer square root'],
	['mR', 'random choice'],
	['mS', 'arcsin'],
	['mT', 'arctan'],
	['m[', 'floor'],
	['m]', 'ceil'],
	['ma', 'atan2'],
	['mc', 'cos'],
	['md', 'divmod'],
	['me', 'exp'],
	['mf', 'factorization'],
	['mh', 'hypot'],
	['ml', 'ln (natural logarithm)'],
	['mo', 'round'],
	['mp', 'prime'],
	['mq', 'sqrt'],
	['mr', 'random number, shuffle'],
	['ms', 'sin'],
	['mt', 'tan']
];

var vars = [
	['A', '10'],
	['B', '11'],
	['C', '12'],
	['D', '13'],
	['E', '14'],
	['F', '15'],
	['G', '16'],
	['H', '17'],
	['I', '18'],
	['J', '19'],
	['K', '20'],
	['L', '"" (same as [])'],
	['M', '""'],
	['N', 'newline string'],
	['O', '""'],
	['P', 'pi (3.141592653589793)'],
	['Q', '""'],
	['R', '""'],
	['S', '" " (space)'],
	['T', '0'],
	['U', '0'],
	['V', '0'],
	['W', '-1'],
	['X', '1'],
	['Y', '2'],
	['Z', '3']
];

var Explainer = {
	// breaks code into literals, operators, and variables
	tokenize: function tokenize(code) {
		var parts = [], level = 0, curNum = '', curString = '', isInString = false, wasInString = false, isInComment = false, curComment = '';

		for (var i = 0; i < code.length; i++) {
			var cp = code[i - 1], c = code[i], cn = code[i + 1];

			if (level < 0) {
				throw new Error('CJam syntax error');
			}

			if (isInComment) {
				curComment += c;
				if (c === '\n' || cn === undefined) { // only multi-line comments
					isInComment = false;
					parts.push({ level: level, type: 'comment', value: curComment });
					curComment = '';
					level--;
				}
			} else if (isInString) {
				if (c === '"') {
					curString += c;
					parts.push({ level: level, type: 'string', value: curString });
					isInString = false;
					wasInString = true;
				} else if (c === '\\' && (cn === '"' || cn === '\\')) { // \" escape ==> " , \\ escape ==> \
					curString += cn;
					i++;
				} else {
					curString += c;
				}
			} else {
				if (/[\s]/g.test(c)) { // whitespace, do nothing
					parts.push({ level: level, type: 'whitespace', value: c });
				} else if (c === '{') { // block open
					level++;
					parts.push({ level: level, type: 'block', value: c });
				} else if (c === '}') { // block close
					parts.push({ level: level, type: 'block', value: c });
					level--;
				} else if (c === '"') { // string start
					isInString = !wasInString; // start or end string?
					wasInString = false; // reset
				} else if (c === '\'') { // op '{cn} ==> '{cn}'
					parts.push({ level: level, type: 'char', value: cn });
					i++;
				} else if (c === 'm' || c === 'e') { // double-char ops or single op
					if (/[0-9]/g.test(cn)) { // single op
						parts.push({ level: level, type: 'op1', value: c });
					} else { // double-char ops
						parts.push({ level: level, type: 'op2', value: c + cn });
						i++;

						if (c + cn === 'e#') { // comment
							isInComment = true;
							level++;
						}
					}
				} else if (/[A-Z]/g.test(c)) { // vars
					parts.push({ level: level, type: 'var', value: c });
				} else if (c === '-') { // negative
					if (/[0-9]/g.test(cn) || (cn === '.' && /[0-9]/g.test(code[i + 2]))) { // -{.}{0-9}
						curNum += c;
					} else {
						parts.push({ level: level, type: 'op1', value: c });
					}
				} else if (c === '.') { // op or decimal
					if (/[0-9]/g.test(cn)) { // decimal
						curNum += c;
					} else { // op .
						if (curNum) { // num lit test might be tricked into
									  // thinking this is an actual decimal
							parts.push({ level: level, type: 'num', value: curNum });
							curNum = '';
						}
						parts.push({ level: level, type: 'op1', value: c });
					}
				} else if (/[0-9\-]/g.test(c)) { // num lits
					curNum += c;
					if (!/[0-9\.]/g.test(cn)) { // check if last number
						parts.push({ level: level, type: 'num', value: curNum });
						curNum = '';
					}
				} else { // has to be single-char op
					parts.push({ level: level, type: 'op1', value: c });
				}
			}
		}

		if (isInString) {
			throw new Error('Unfinished string');
		}

		return parts;
	},
	explain: function explain(parts) {
		var explanations = [];

		for (var i = 0; i < parts.length; i++) {
			var pp = parts[i - 1], p = parts[i], np = parts[i + 1];

			if (p.type === 'block') {
				explanations.push({ text: '<b>' + p.value + '</b>: Block ' + (p.value === '{' ? 'begin' : 'end') + '.' });
			} else if (p.type === 'string') {
				explanations.push({ text: '<b>"' + p.value + '"</b>: Push string literal "' + p.value + '" onto the stack.' });
			} else if (p.type === 'num') {
				explanations.push({ text: '<b>' + p.value + '</b>: Push numeric literal "' + p.value + '" onto the stack.' });
			} else if (p.type === 'op1' || p.type === 'op2') {
				var op = ops.filter(function(op) { return op[0] === p.value; })[0];
				if (p.value.indexOf('undefined') !== -1) {
					throw new Error('Unfinished operator: <b>"' + p.value.replace('undefined', '') + '"</b>.');
				} else if (!op) {
					throw new Error('Undefined operator: <b>"' + p.value + '"</b>.');
				} else {
					explanations.push({ text: '<b>' + p.value + '</b>: ' + op[1] });
				}
			} else if (p.type === 'var') {
				explanations.push({ text: '<b>' + p.value + '</b>: Push pre-defined variable ' + p.value + ', default value is ' + vars.filter(function(_var) { return _var[0] === p.value; })[0][1] + ', onto the stack.' });
			} else if (p.type === 'char') {
				explanations.push({ text: '<b>"' + p.value + '"</b>: Push character literal "' + p.value + '" onto the stack.' });
			} else if (p.type === 'comment') {
				explanations.push({ text: 'Comment: <b>"' + p.value.trim() + '"</b>.' });
			} else if (p.type === 'whitespace') {
				explanations.push({ text: '' });
			} else {
				throw new Error('Unknown token ({ type: "' + p.type + '", value: "' + p.value + '" })');
			}
		}

		return explanations;
	},
	toHtml: function toHtml(parts, explanations) {
		var html = '', prevLev = -1, bi = 0;

		parts.forEach(function(p, i) {
			if (prevLev < p.level) {
				html += '<b class="level"></b><ul>';
			} else if (prevLev > p.level) {
				html += '</ul>';
			}

			prevLev = p.level;

			explanations[i].text && (html += '<li data-value="' + p.value + '" data-type="' + p.type + '" data-level="' + p.level + '">' + explanations[i].text + '</li>');
		});

		return html;
	}
};
