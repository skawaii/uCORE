/**
 * Class: Iterate
 * 
 * Uses an asynchronous timer to iterate over an array to prevent a loop from 
 * taking up too much execution time all at once. This will prevent the 
 * browser warning that says the Javascript is taking too long.
 * 
 * Namespace:
 *   core.util
 *   
 * Dependencies:
 *   None
 */

if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function(ns) {
	var Iterate = {
		
		/**
		 * Constant: MAX_RATE
		 * 
		 * Integer. Maximum number of array elements processed per execution.
		 */
		MAX_RATE: 100,
	
		/**
		 * Constate: MIN_INTERVAL
		 * 
		 * Integer. Minimum milliseconds between executions.
		 */
		MIN_INTERVAL: 40,

		/**
		 * Function: iterate
		 * 
		 * Parameters:
		 *   items - Array. Required. The list of items to iterate.
		 *   options - Object. Required. Options for iterating. Contains 
		 *         the following properties:
		 *           - onItem(item, index) - Function. Required. Invoked for 
		 *                 each element in the array. Invoked with two 
		 *                 parameters - the first parameter being the array 
		 *                 item and the second being the index of the element 
		 *                 in the array. 
		 *           - onComplete() - Function. Optional. Invoked after 
		 *                 iteration is complete.
		 *           - rate - Integer. Optional. Number of array elements 
		 *                 processed per execution.
		 *           - interval - Integer. Optional. Milliseconds between 
		 *                 executions.
		 */
		iterate: function(items, options) {
			var itemsCopy = items.slice(0);
			var onItem = options.onItem;
			var onComplete = options.onComplete;
			var rate = options.rate ? Math.max(options.rate, Iterate.MAX_RATE) : Iterate.MAX_RATE;
			var interval = options.interval ? Math.min(options.interval, Iterate.MIN_INTERVAL) : Iterate.MIN_INTERVAL;
			var index = -1;
			var timer = null;
			var busy = false;
			var execute = function() {
				if (!busy) {
					busy = true;
					var stopIndex = index + rate;
					var halted = false;
					while (itemsCopy.length > 0 && index < stopIndex && !halted) {
						var item = itemsCopy.shift();
						index++;
						halted = onItem.call(onItem, item, index) === false;
					}
					if (halted || itemsCopy.length == 0) {
						window.clearInterval(timer);
						if (onComplete)
							onComplete.call(onComplete);
					}
					busy = false;
				}
			};
			timer = setInterval(execute, interval);
		}
	};
	ns.Iterate = Iterate;
})(window.core.util);