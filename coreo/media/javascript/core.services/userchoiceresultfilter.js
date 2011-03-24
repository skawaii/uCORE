/**
 * Class: UserChoiceResultFilter
 * 
 * Filters Link and LinkLibrary search results by allowing the user to select
 * the Links or LinkLibraries.
 * 
 * SuperClass:
 *   <SearchResultFilter>
 * 
 * Namespace:
 *   core.services
 * 
 * Dependencies:
 *   - jQuery
 *   - core.services.SearchResultFilter
 */

if (!window.core)
	window.core = {};
if (!window.core.services)
	window.core.services = {};

(function($, ns) {
	var SearchResultFilter = core.services.SearchResultFilter;

	var sgColumns = [];
	var checkboxSelector = new Slick.CheckboxSelectColumn({
		cssClass: "slick-cell-checkboxsel"
	});
	sgColumns.push(checkboxSelector.getColumnDefinition());
	sgColumns.push({ id: "name", name: "Name", field: "name", width: 300 });
	sgColumns.push({ id: "desc", name: "Description", field: "desc", width: 300 });

	/**
	 * Constructor: UserChoiceResultFilter
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   gridEl - DOM Element. Element where dialog will be rendered.
	 */
	var UserChoiceResultFilter = function(gridEl) {
		this.gridEl = gridEl;
	};
	$.extend(UserChoiceResultFilter.prototype, SearchResultFilter.prototype, {
		/**
		 * Property: gridEl
		 * 
		 * DOM Element. Element where dialog containing grid of choices will 
		 * be displayed.
		 */
		gridEl: null,
		
		rows: [],
		
		callback: null,
		
		sgOptions: {
			editable: true,
			enableCellNavigation: true,
			asyncEditorLoading: false,
			autoEdit: false
		},
		
		grid: null,

		renderGrid: function() {
			this.grid = new Slick.Grid(this.gridEl, this.rows, sgColumns, this.sgOptions);
			this.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow:false}));
			this.grid.registerPlugin(checkboxSelector);
		},

		/**
		 * Function: begin
		 * 
		 * Displays a new grid of search results.
		 * 
		 * See Also:
		 *   <SearchResultFilter.begin>
		 */
		begin: function(callback) {
			this.rows = [];
			this.callback = callback;
		},

		/**
		 * Function: result
		 * 
		 * Adds a Link or LinkLibrary to the search results grid.
		 * 
		 * Parameters:
		 *   data - Object. Link or LinkLibrary.
		 * 
		 * See Also:
		 *   <SearchResultFilter.result>
		 */
		result: function(linkOrLibrary) {
			var row = {
				name: linkOrLibrary.fields.name,
				desc: linkOrLibrary.fields.desc,
				url: linkOrLibrary.fields.url,
				pk: linkOrLibrary.pk
			};
			this.rows.push(row);
		},

		/**
		 * Function: end
		 * 
		 * Completes rendering of search results grid and waits for user 
		 * to make selection.
		 * 
		 * See Also:
		 *   <SearchResultFilter.end>
		 */
		end: function() {
			this.renderGrid();
		},

		/**
		 * Function: error
		 * 
		 * Displays an error dialog to the user. Closes the search result
		 * grid.
		 * 
		 * Parameters:
		 *   errorThrown - String. Error details.
		 *   
		 * See Also:
		 *   <SearchResultFilter.error>
		 */
		error: function(errorThrown) {
			alert("Error processing search results: " + errorThrown);
		}
	});
	ns.UserChoiceResultFilter = UserChoiceResultFilter;
})(jQuery, window.core.services);