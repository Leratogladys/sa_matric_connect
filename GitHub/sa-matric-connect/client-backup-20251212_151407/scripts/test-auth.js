document.addEventListener('DOMContentLoaded', function() {
  const testResults = document.getElementById('test-results');

  async function runAllTests() {
    testResults.innerHTML = <h3> Running Authentication Test....</h3>;

    await testValidLogin();
    await testInvalidLogin();
    await testProtectedRoute();
    await testLogout();
    await testSessionPersistence();
    await testMultipleTabs();
    await testCookieSecurity();
  }

  async function testValidLogin() {
    const results = document.createElement('div');
    try{
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},

        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),

        credentials: 'include'
      });

      results.innerHTML = `✅ Valid Login: ${res.status === 200 ? 'PASS' : 'FAIL' }`;

    } catch (error) {
      result.innerHTML = `❌ Valid Login: ERROR - ${error.message}`;
    }

    testResults.appendChild(result);

  }

   async function testProtectedRoute() {
        const result = document.createElement('div');
        try {
            const res = await fetch('/api/protected', {
                credentials: 'include'
            });
            result.innerHTML = `✅ Protected Route: ${res.status === 200 ? 'PASS' : 'FAIL'}`;
        } catch (error) {
            result.innerHTML = `❌ Protected Route: ERROR - ${error.message}`;
        }
        testResults.appendChild(result);
    }

    async function testLogout() {
      const result = document.createElement('div');
      try{
        const res = await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include'

        });

        result.innerHTML =  `✅ Logout: ${res.status === 200 ? 'PASS' : 'FAIL'}`;
         } catch (error) {
            result.innerHTML = `❌ Logout: ERROR - ${error.message}`;
      }
      testResults.appendChild(result);
    }

    //Run tests when the button is clicked
    document.getElementById('run-tests').addEventListener('click', runnAllTests);
});