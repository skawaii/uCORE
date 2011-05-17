
    <script type="text/javascript">
      
      jQuery.ajaxSettings.traditional = true;

      function add_library()
      {
         var box  = document.getElementById('library_id');
         var selected = new Array();
         for (var i = 0; i < box.options.length; i++)
         {
           if (box.options[i].selected)
           {
             selected.push(box.options[i].value);
           }
         }
         $.post("../add-library/", { library_id: selected }, function() { window.location.reload(); } );
      }

      function delete_libraries()
      {
        var box = document.getElementById('ids');
        var selected = new Array();
        for (var j = 0; j < box.options.length; j++)
        {
          if (box.options[j].selected)
          {
            selected.push(box.options[j].value);
          }
        }
        $.post("../delete-libraries/", { library_id: selected },
            function() { window.location.reload(); } );
      }
   </script>
