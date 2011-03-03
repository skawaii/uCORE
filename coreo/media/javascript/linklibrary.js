      var totalTable = [];
      var librarytable = [];
      var grid;
      var librarygrid;
      
      function split( val ) {
         return val.split( /,\s*/ );
      }
      
      function extractLast( term ) {
         return split( term ).pop();
      }

      $(document).ready(function()
      {
        document.getElementById('dialog').style.display='none';
        document.getElementById('questionDialog').style.display='none';
        $("input#tagname").bind( "keydown", function( event ) {
              if ( event.keyCode === $.ui.keyCode.TAB &&
                $( this ).data( "autocomplete" ).menu.active ) {
                      event.preventDefault();
                }
        })
        .autocomplete({
               source: function(req, add){ 
                $.getJSON("../get-tags/", 
                  req, function(data) {  
                    var suggestions = [];  
                    $.each(data, function(i, val){
                      suggestions.push(val.fields.name);  
                   });
                   
                add(suggestions);  
             })
             }, 
             search: function() {
					    // custom minLength
					    var term = extractLast( this.value );
					    // if ( term.length < 2 ) {
              if (term.length < 1) {
					    	return false;
				    	}
			     	},
				    focus: function() {
				   	// prevent value inserted on focus
				    	return false;
				    },
				    select: function( event, ui ) {
					  var terms = split( this.value );
					  // remove the current input
					  terms.pop();
					  // add the selected item
					  terms.push( ui.item.value );
					  // add placeholder to get the comma-and-space at the end
					  terms.push( "" );
					  this.value = terms.join( ", " );
					  return false;
				}
		 	});
          
      });

      function searchLinks(term)
       {
        document.getElementById('tagname').value = '';
        document.getElementById('q2').value = '';
        document.getElementById('q1').value = '';
        if (grid !== null)
        {
          grid.invalidateAllRows();
          grid.render();
        }
        if (librarygrid !== null)
        {
          librarygrid.invalidateAllRows();
          librarygrid.render();
        }
        $("#myGrid").empty();
        $("#libraryGrid").empty();
         $.getJSON('../search-links/', { q : term },
         function(jsonstuff)
         { 
           if (!jQuery.isEmptyObject(jsonstuff))
           {
              var columns = [];
              $(function()
              {
                var checkboxSelector = new Slick.CheckboxSelectColumn({
                 cssClass: "slick-cell-checkboxsel"
                });
                columns.push(checkboxSelector.getColumnDefinition());
                columns.push({ id: "name", name: "name", field: "name", width:300,
                editor: TextCellEditor
               });
               columns.push({ id: "desc", name: "desc", field: "description", width:300,
               editor: TextCellEditor
               });
               columns.push({ id: "url", name: "url", field: "urlfield", width:500,
               editor: TextCellEditor
               });
               for (var i=0; i < jsonstuff.length; i++)
               {
                  var d = (totalTable[i] = {}); 
                  d["name"] = jsonstuff[i].fields.name;
                  d["description"] = jsonstuff[i].fields.desc;
                  d["urlfield"] = jsonstuff[i].fields.url;
                  d["pk"] = jsonstuff[i].pk;
               }
               var options = { editable: true, enableCellNavigation: true, asyncEditorLoading: false, autoEdit: false };
               grid = new Slick.Grid("#myGrid", totalTable, columns, options);
               grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow:false}));
               grid.registerPlugin(checkboxSelector);
              })   
         } 
         
         //   alert("empty JSON is returned.");
          
        
        
         });
           
         $.getJSON('../search-libraries/', { q : term },
         function(libraryjson)
         { 
           if (!jQuery.isEmptyObject(libraryjson))
           {
   
          var columns = [];
          $(function()
          {
          var checkboxSelector = new Slick.CheckboxSelectColumn({
                 cssClass: "slick-cell-checkboxsel"
          });
          columns.push(checkboxSelector.getColumnDefinition());
          columns.push({ id: "name", name: "name", field: "name", width:300,
               editor: TextCellEditor
           });
          columns.push({ id: "desc", name: "desc", field: "description", width:300,
               editor: TextCellEditor
           });
           for (var i=0; i < libraryjson.length; i++)
           {
               var d2 = (librarytable[i] = {}); 
               d2["name"] = libraryjson[i].fields.name;
               d2["description"] = libraryjson[i].fields.desc;
               // d2["urlfield"] = jsonstuff2[i].fields.url;
               d2["pk"] = libraryjson[i].pk;
          }
          var options = { editable: true, enableCellNavigation: true, asyncEditorLoading: false, autoEdit: false };
          librarygrid = new Slick.Grid("#libraryGrid", librarytable, columns, options);
          librarygrid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow:false}));
          librarygrid.registerPlugin(checkboxSelector);
              })   
         } });
         var continueClick = false;
         $("#dialog").dialog({ width: 1000, hide: 'slide', close: function(event, ui)
             { if (grid !== null){
               grid.invalidateAllRows();
               grid.render();
               }
               if (librarygrid !== null)
               {
               librarygrid.invalidateAllRows();
               librarygrid.render();
               }
               $("#myGrid").empty();
               $("#libraryGrid").empty();
               if (!continueClick)
               {
                 window.location.reload(true);
               }  
             }, buttons: { "Continue": function() {
               continueClick = true;
               $("#dialog").dialog( "close" );
               $("#questionDialog").dialog({ width: 1000, buttons: { "Continue" : function() {
               var library_name = document.getElementById('q1').value;
               var library_desc = document.getElementById('q2').value;
               var tagparameter = document.getElementById('tagname').value;
               $.post("../create-library/", { name: library_name, desc: library_desc, tags: tagparameter, links: row_parameter});
               $("#questionDialog").dialog("close");
                $("#myGrid").empty();
                $("#libraryGrid").empty();
                document.getElementById('tagname').value = '';
                document.getElementById('q2').value = '';
                document.getElementById('q1').value = '';
                 }
               }
               });
               document.getElementById('questionDialog').style.display='block';
               var selectedRows = grid.getSelectedRows();
               if (selectedRows == 0)
               {
                 alert("Please check some links before continuing..");
                 return false;
               }
               var row_parameter;
               for (var j = 0; j < selectedRows.length; j++)
               {
                 var rowNum = selectedRows[j];
                 if (j == 0)
                 {
                   row_parameter = totalTable[rowNum]["pk"];
                 }
                 else
                 {
                   row_parameter = row_parameter + "," + totalTable[rowNum]["pk"];
                 }
               }
         } 
     } 
   });
}
