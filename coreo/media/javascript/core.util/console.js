/**
 * Allows javascript to safely invoke console functions.
 */

if (!window.console)
	console = {};
console.log = console.log || function(){ return false; };
console.warn = console.warn || function(){ return false; };
console.error = console.error || function(){ return false; };
console.info = console.info || function(){ return false; };