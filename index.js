'use strict';

/*
 * Workaround for incorrect double quote handling on Windows:
 * https://github.com/joyent/node/issues/25339
 */
 
function fixArgsOnWindows (args) {
	// Detect faulty arguments, return if not found
	if (process.platform.indexOf('win') != 0 || !hasFaultyArg(args)) return args;
	
	var notQuoteOrSpaceAtEndRe = /[^\s"]+$/;
	var whitespaceRe = /\s+/g;
	var argsJoined = args.join(' ');
	var level = -1;
	var quotesForLevel = getQuotesForLevel(level);
	var quotesForNextLevel = getQuotesForLevel(level + 1);
	var index = 0;
	var levelQuoteIndex = -1;
	var nextLevelQuoteIndex = -1;
	var result = [];
	var argsSlice;
	
	while (true) {
		// Iterate on quote occurrences
		
		levelQuoteIndex = quotesForLevel ? argsJoined.indexOf(quotesForLevel, index) : -1;
		nextLevelQuoteIndex = argsJoined.indexOf(quotesForNextLevel, index);
		
		if (nextLevelQuoteIndex > -1 && nextLevelQuoteIndex == levelQuoteIndex) {
			// Level is being increased
			argsSlice = argsJoined.slice(index, nextLevelQuoteIndex);
			if (level == -1) {
				// Level was root level
				// Root level arguments are split on space
				result = result.concat(argsSlice.split(whitespaceRe));
				// Only start a new argument when coming from root level
				result.push(quotesForNextLevel);
			} else {
				// Level was deeper than root: append to last item
				if (result[result.length - 1].match(notQuoteOrSpaceAtEndRe)) result[result.length - 1] += ' ';
				result[result.length - 1] += argsSlice + quotesForNextLevel;
			}
			index = nextLevelQuoteIndex + quotesForNextLevel.length;
			// Increase level
			level++;
			quotesForLevel = quotesForNextLevel;
			quotesForNextLevel = getQuotesForLevel(level + 1);
		} else if (levelQuoteIndex > -1) {
			// Level is being decreased: can only happen when not root
			argsSlice = argsJoined.slice(index, levelQuoteIndex + quotesForLevel.length);
			if (result[result.length - 1].match(notQuoteOrSpaceAtEndRe)) result[result.length - 1] += ' ';
			result[result.length - 1] += argsSlice;
			index = levelQuoteIndex + quotesForLevel.length;
			// Decrease level
			level--;
			quotesForNextLevel = quotesForLevel;
			quotesForLevel = getQuotesForLevel(level);
		} else {
			// This is the last slice
			argsSlice = argsJoined.slice(index);
			if (level == -1) {
				result = result.concat(argsSlice.split(whitespaceRe));
				break;
			} else {
				throw 'parallelshell: Invalid quote nesting.';
			}
		}
	};
	
	for (var i = result.length - 1; i >= 0; i--) {
		var arg = result[i].replace(/"+/g, function(match) {
			// Remove one level of quotes
			if (match.length == 1) {
				return '';
			} else {
				return match.slice(0, match.length / 2);
			}
		});
		if (arg) {
			result[i] = arg;
		} else {
			// Remove empty arguments
			result.splice(i, 1);
		}
	}
	
	return result;
}

function hasFaultyArg (args) {
	var re = /^\s*".*[^"]\s*$/;
	for (var i = 0, n = args.length; i < n; i++) {
		var arg = args[i];
		if (re.test(arg)) {
			return true;
		}
	}
	return false;
}

function getQuotesForLevel (level) {
	var count = Math.pow(2, level);
	var result = '';
	for (var i = 0; i < count; i++) {
		result += '"';
	}
	return result;
}

module.exports = fixArgsOnWindows;