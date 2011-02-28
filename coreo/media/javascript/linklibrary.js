      var totalTable = [];
      var grid;
      
      function split( val ) {
         return val.split( /,\s*/ );
      }
      
      function extractLast( term ) {
         return split( term ).pop();
      }

      $(document).ready(function()
      {
        document.getElementById('question').style.display='none';
        document.getElementById('myGrid').style.display='none';
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
					    if ( term.length < 2 ) {
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
         // alert('Got to searchLinks and passed in : ' + term);
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
          // for (var i = 0; i < jsonstuff.length; i++) {
          //  columns.push({ id: i, name: String.fromCharCode("A".charCodeAt(0) + i), field: i, width: 100,
          //          editor: TextCellEditor
          // });
          columns.push({ id: "name", name: "name", field: "name", width:300,
               editor: TextCellEditor
           });
          columns.push({ id: "desc", name: "desc", field: "description", width:300,
               editor: TextCellEditor
           });
        //  columns.push({ id: "url", name: "url", field: "urlfield", width:500,
        //       editor: TextCellEditor
        //   });
           for (var i=0; i < jsonstuff.length; i++)
           {
               var d = (totalTable[i] = {}); 
               d["name"] = jsonstuff[i].fields.name;
               d["description"] = jsonstuff[i].fields.desc;
              //  d["urlfield"] = jsonstuff[i].fields.url;
               d["pk"] = jsonstuff[i].pk;
          }
          var options = { editable: true, enableCellNavigation: true, asyncEditorLoading: false, autoEdit: false };
          grid = new Slick.Grid("#myGrid", totalTable, columns, options);
          grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow:false}));
          grid.registerPlugin(checkboxSelector);
              })  // document.getElementById('dialog').innerHTML = totalTable; 
         } });
           
         $("#dialog").dialog({ width: 1000, buttons: { "Save Link Library": function() {
               var selectedRows = grid.getSelectedRows();
               if (selectedRows == 0)
               {
                 alert("Please check some links before continuing..");
                 return false;
               }
               name = document.getElementById('q1').value;
               if (name == null || name == '')
               {
                 alert("Please enter a value for library name.");
                 return false;
               }
               description = document.getElementById('q2').value;
               if (description == null || description == '')
               {
                 alert("Please enter a value for library description.");
                 return false;
               }
               var row_parameter;
               for (var j = 0; j < selectedRows.length; j++)
               {
                 var rowNum = selectedRows[j];
                 // alert("You selected:  " + totalTable[rowNum]["name"] + " | " + totalTable[rowNum]["pk"]);
                 // alert("you entered: " + document.getElementById('q1').value); 
                 if (j == 0)
                 {
                   row_parameter = totalTable[rowNum]["pk"];
                 }
                 else
                 {
                   row_parameter = row_parameter + "," + totalTable[rowNum]["pk"];
                 }
               }
               var library_name = document.getElementById('q1').value;
               var library_desc = document.getElementById('q2').value;
               var tagparameter = document.getElementById('tagname').value;
               $.post("../create-library/", { name: library_name, desc: library_desc, tags: tagparameter, links: row_parameter});
               //  alert("you entered: " + document.getElementById('q1').value);
               $("#dialog").dialog("close");
               document.getElementById('q1').value = '';
               document.getElementById('q2').value = '';
               document.getElementById('tagname').value = '';
         } 
     } 
   });
}
