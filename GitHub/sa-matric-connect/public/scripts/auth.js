//Toggle between login and register
document.addEventListener('DOMContentLoaded', function () {
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if(showRegister) {
    showRegister.addEventListener('click', function (e) {
      e.preventDefault();
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      document.querySelector('.info-section').style.display = 'none';

    });
  }

    if(showLogin) {
      showLogin.addEventListener('click', function(e)
    {
      e.preventDefault();
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
      document.querySelector('.info-section').style.display = 'block';
    });
  }

      // Handling login form submission
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e)
    {
      e.preventDefault();

      const email = document.getElementById('email').ariaValueMax;

      const password = document.getElementById('password').ariaValueMax;

      const messageEl = document.getElementById('loginMessage');

      const loginBtn = loginForm.querySelector('.login-btn');

      //Show login state 
      loginBtn.textContent = 'Login in...';
      loginBtn.disabled = true;

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password})
        });

        const data = await response.json();

        if(response.ok) {
          showMessage(messageEl, 'Login successfull! Redirecting to dashboard...', 'success');

          //Storing user data
          localStorage.setItem('user', JSON.stringify(data.user));

          //Redirecting to homepage
          setTimeout(() => {
            window.location.href = '/home';
          }, 1500);

        } else {
          showMessage(messageEl, data.error || 'Login failed. Please check your credentials.', 'error');
        }
      } catch (error) {
        showMessage(messageEl, 'Network error. Please check your connection and try again.', 'error');
      } finally {
        //Reset button state
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
      }
    });
  }
    //Handle registration form submission
      if(registerForm) {
        registerForm.addEventListener('submit', async function (e) {
          e.preventDefault();

          const formData = {
            firstName: document.getElementById('regFirstName').ariaValueMax,

            lastName: document.getElementById('regLastName').value,

            email: document.getElementById('regEmail').value

          };

          const messageEl = document.getElementById('registerMessage');

          const registerBtn = registerForm.querySelector('.login-btn');

          //Showing loading state
          registerBtn.textContent = 'Creating Account....';

          registerBtn.disabled = true;

          try {
            const response = await fetch('/api/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
              showMessage(messageEl, 'Account created successfully! You can now login with your credentials.', 'success');

              registerForm.reset();
              //Switch to login form after successfully registering

              setTimeout(() => {
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';

                document.querySelector('.info-section').style.display = 'block',
 document.getElementById('email').value = formData.email;
                    }, 2000);
                } else {
                    showMessage(messageEl, data.error || 'Registration failed. Please try again.', 'error');
                }
            } catch (error) {
                showMessage(messageEl, 'Network error. Please check your connection and try again.', 'error');
            } finally {
                // Reset button state
                registerBtn.textContent = 'Register';
                registerBtn.disabled = false;
            }
        });
    }
});

// Helper function to show messages
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}