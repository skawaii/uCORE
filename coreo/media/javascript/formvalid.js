
        function passwordConfirm()
        {
          document.getElementById('formOutput').innerHTML = "";
          val1 = document.getElementsByName('password')[0].value;
          val2 = document.getElementsByName('password2')[0].value;
          if (val1 !== val2)
          {
            document.getElementById('matchOutput').style.color = "red";
            document.getElementById('matchOutput').innerHTML = "Passwords do not match.";
          }
          else
          {
            document.getElementById('matchOutput').style.color = "green";
            document.getElementById('matchOutput').innerHTML = "Passwords match.";
          } 
        }
  
        function check_form()
        {
          val1 = document.getElementsByName('password')[0].value;
          val2 = document.getElementsByName('password2')[0].value;
          if (val1 !== val2)
          {
            document.getElementById('formOutput').style.color = 'red';
            document.getElementById('formOutput').innerHTML = "Please make sure your passwords match before submission.";
            return false;
          }
          if (document.getElementsByName('username')[0].value == "")
          {
            document.getElementById('formOutput').style.color = 'red';
            document.getElementById('formOutput').innerHTML = "Please fill in username before submission.";
            return false;
          }
          if (document.getElementsByName('first_name')[0].value == "")
          {
            document.getElementById('formOutput').style.color = 'red';
            document.getElementById('formOutput').innerHTML = "Please fill in firstname before submission.";
            return false;
          }
          if (document.getElementsByName('last_name')[0].value == "")
          {
            document.getElementById('formOutput').style.color = 'red';
            document.getElementById('formOutput').innerHTML = "Please fill in lastname before submission.";
            return false;
          }
          if (document.getElementsByName('phone_number')[0].value == "")
          {
            document.getElementById('formOutput').style.color = 'red';
            document.getElementById('formOutput').innerHTML = "Please fill in phone number before submission.";
            return false;
          }
          if (document.getElementsByName('email')[0].value == "")
          {
            document.getElementById('formOutput').style.color = 'red';
            document.getElementById('formOutput').innerHTML = "Please fill in email before submission.";
            return false;
          }
          if (document.getElementsByName('password')[0].value == "")
          {
            document.getElementById('formOutput').style.color = 'red';
            document.getElementById('formOutput').innerHTML = "Please fill in password before submission.";
            return false;
          }
          // set the sid to the username before form submission.
          var username = document.getElementsByName('username')[0].value;
          document.getElementsByName('sid')[0].value = username;
        }

        function check_username()
        {
         var user = document.getElementsByName("username")[0].value;
         $.getJSON('../../check-username/', { username: user },
         function(jsonstuff)
         { 
           if (jsonstuff)
           {
           document.getElementById('userOutput').innerHTML = 'Username already used. Please change it.';
           document.getElementsByName("username")[0].focus();
           }  
           else
           {
            document.getElementById('userOutput').innerHTML = 'Username is available.';
           }   
         });   

        }

