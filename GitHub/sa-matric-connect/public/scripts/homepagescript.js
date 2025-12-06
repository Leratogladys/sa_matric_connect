const { application, json } = require("express");

document.addEventListener('DOMContentLoaded', function () {
  checkAuthentication();
  setupLogout();
  initializeApplicationTracker();
  setupBackToTop();
  setupDropdownMenus();
})

//Authentication check 
async function checkAuthentication() {
  try {
    const response = await fetch('/api/me', {
      method: 'GET',
      credentials: 'include'
    });

    //Redirect to login, if not authenticated
    if (!response.ok) {
      window.location.href = '/index.html';
      return;
    }

    //Authenticated, get user data
    const userData = await response.json();
    updateWelcomeMessage(userData);

  } catch (error) {
    console.error('Authentication check failed:', error);
    window.location.href = '/index.html';
  }
}

function updateWelcomeMessage(userData) {
  //Updating welcome message with user's name
  const welcomeElements = document.querySelectorAll('#welcome-user, .username');
  welcomeElements.forEach(element => {
    if (element) {
      element.textContent = userData.name || 'User';
    }
  });
}

//Logout functionality
function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);

    //Keyboard logout shortcut
    document.addEventListener('keydwon', function (event) {
      if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        event.preventDefault();
        handleLogout();
      }
    });
  } else {
    console.warn('Logout button not found. Make sure your HTML has element with id="logout-btn"');
  }
}

async function handleLogout() {

  try {
    //Confirmation dialog
    const confirmLogout = confirm('Are you sure you want to logout');

    if (!confirmLogout) return;

    //Show loading state on logout button
    const logoutBtn = document.getElementById('logout-btn');
    const originalText = logoutBtn ? logoutBtn.textContent : 'Logout';

    if (logoutBtn) {
      logoutBtn.textContent = 'Loggin out...';
      logoutBtn.disabled = true;
    }

    //Calling logout API

    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      //Clear all frontend storage
      localStorage.clear();
      sessionStorage.clear();

      //Success message
      showNotification('Successfull logged out. Redirecting to login page...', 'success');

      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1500);

    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);

    showNotification(`Logout failed: ${error.message}. Redirecting to login....`, 'error');

    //Re-enable logout button 
    const logoutBtn = getElementById('logout-btn');

    if (logoutBtn) {
      logoutBtn.disabled = false;
      logoutBtn.textContent = 'Logout';
    }

    //Try to redirect to login page after error
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 3000);
  }

}

// Application tracker system
function initializeApplicationTracker() {
  const checkboxes = document.querySelectorAll('.tracker-checkbox');
  const totalAppsElement = document.getElementById('totalApplications');
  const activeAppsElement = document.getElementById('activeApplications');
  const completedAppsElement = document.getElementById('completedApplications');
  const bursaryAppsElement = document.getElementById('bursaryApplications');
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  const progressBar = document.querySelector('.progress-bar');

  // Initialize counts
  let totalApplications = 0;
  let activeApplications = 0;
  let completedApplications = 0;
  let bursaryApplications = 0;


  // Update dashboard stats 
  function updateStats() {
    totalApplications = activeApplications + completedApplications;

    // Updating DOM elements
    if (totalAppsElement) totalAppsElement.textContent = totalApplications;
    if (activeAppsElement) activeAppsElement.textContent = activeApplications;
    if (completedAppsElement) completedAppsElement.textContent = completedApplications;
    if (bursaryAppsElement) bursaryAppsElement.textContent = bursaryApplications;


    // Update progress bar
    const progressPercentage = checkboxes.length > 0 ?
      (completedApplications / checkboxes.length) * 100 : 0;

    updateProgressBar(progressPercentage);

    if (progressText) {
      progressText.textContent = `${Math.round(progressPercentage)}% Complete`;
    }

    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', progressPercentage);
    }

    // Update comparisons
    document.querySelectorAll('.comparison').forEach(el => {
      if (el.classList.contains('negative')) {
        el.textContent = completedApplications > 0 ?
          `+${Math.floor(Math.random() * 10)}% vs last week` :
          "-0% vs last week";
      } else {
        el.textContent = `+${Math.floor(Math.random() * 20)}% vs last month`;
      }
    });

    // Remove loading states
    document.querySelectorAll('.value.loading').forEach(el => {
      el.classList.remove('loading');
    });
  }

  function updateProgressBar(percentage) {
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
  }

  // Checkbox event listeners
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      const statusElement = this.parentElement.querySelector('.tracker-status');

      if (this.checked) {
        if (statusElement) {
          statusElement.textContent = 'Completed';
          statusElement.classList.add('completed');
        }
        completedApplications++;
        activeApplications--;

        // If this is the bursary application, increment bursary count
        if (this.id === 'bursary') {
          bursaryApplications++;
        }
      } else {
        if (statusElement) {
          statusElement.textContent = 'Pending';
          statusElement.classList.remove('completed');
        }
        completedApplications--;
        activeApplications++;

        // If this is the bursary application, decrement bursary count
        if (this.id === 'bursary') {
          bursaryApplications--;
        }
      }

      updateStats();
    });
  });

  // Initialize with some active applications
  activeApplications = checkboxes.length;
  updateStats();
}

// Back to top functionality
function setupBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    if (!backToTopButton) return;

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

// Show/hide back to top button based on scroll position
window.addEventListener('scroll', function() {
        if (backToTopButton) {
            backToTopButton.style.display = window.pageYOffset > 300 ? 'block' : 'none';
       }
    });
}

// Initialize with some active applications
activeApplications = checkboxes.length;
updateStats();

// Dropdown menu functionality
function setupDropdownMenus() {
    const dropdownTriggers = document.querySelectorAll('.resources-dropdown > a');
    
    if (dropdownTriggers.length === 0) return;
    
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);

    // Close other dropdowns
    dropdownTriggers.forEach(otherTrigger => {
                if (otherTrigger !== this) {
                    otherTrigger.setAttribute('aria-expanded', 'false');
                }
            });
        });
    });

// Close dropdowns when clicking outside
 document.addEventListener('click', function(e) {
        if (!e.target.closest('.resources-dropdown')) {
            dropdownTriggers.forEach(trigger => {
                trigger.setAttribute('aria-expanded', 'false');
            });
        }
    });
}  

// Helper finctions
function showNotification(message, type = 'info') {
  //Notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  //Notification styles
  notification.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 6px:
  color: white;
  font-weight: 500;
  z-index: 10000;
  animation: slideIn 0.3s ease;
  `;

  //Set colors based on type

  if (type === 'success') {
    notification.style.backgroundColor = '#2E8B57';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#dc3545';
  } else {
    notification.style.backgroundColor = '#007bff'
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);

  if(!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-style';
    style.textContent = `@keyframes slideIn {
    from { transformz; translateX(100%); opacity: 0; } 
    to { transform: translateX(0); opacity: 1;}
    } 
    @keyframes slideOut {
    from { transform: translateX(0); opacity: 1;} 
    to { transform: translateX(100%); opacity: 0;} 
    }`;

    document.head.appendChild(style);
  }
  
}

//Page Load Indicator

//Show loading state on initial page load
window.addEventListener('load', function() {
  //Remove any loading classes
  document.querySelectorAll('.loading').forEach(el => {
    el.classList.remove('loading');
  });

  //Hide loading spinner 
  const laodingSpinner = this.document.getElementById('loading-spinner');
  if (laodingSpinner) {
    laodingSpinner.style.display = 'none';
  }
});