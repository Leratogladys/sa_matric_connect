 //TEMPORARY: Redirect to homepage when form is submitted
              document.getElementById('loginForm').addEventListener('submit', function(e) {
                e.preventDefault();

                //for now, just redirect to homepage
                window.location.href = 'homepage.html';
              });