 // Application tracking functionality
      document.addEventListener('DOMContentLoaded', function() {
        const checkboxes = document.querySelectorAll('.tracker-checkbox');
        const totalAppsElement = document.getElementById('totalApplications');
        const activeAppsElement = document.getElementById('activeApplications');
        const completedAppsElement = document.getElementById('completedApplications');
        const bursaryAppsElement = document.getElementById('bursaryApplications');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const progressBar = document.querySelector('.progress-bar');
        const backToTopButton = document.getElementById('back-to-top');

        // Initialize counts
        let totalApplications = 0;
        let activeApplications = 0;
        let completedApplications = 0;
        let bursaryApplications = 0;

        // Update dashboard stats 
        function updateStats() {
          totalApplications = activeApplications + completedApplications;
          totalAppsElement.textContent = totalApplications;
          activeAppsElement.textContent = activeApplications;
          completedAppsElement.textContent = completedApplications;
          bursaryAppsElement.textContent = bursaryApplications;

          // Update progress bar
          const progressPercentage = (completedApplications / checkboxes.length) * 100;
          updateProgressBar(progressPercentage);
          progressText.textContent = `${Math.round(progressPercentage)}% Complete`;
          progressBar.setAttribute('aria-valuenow', progressPercentage);

          function updateProgressBar(percentage) {
            const progressFill = document.querySelector('.progress-fill');
            progressFill.style.width = `${percentage}%`;
          }

          // Update comparisons
          document.querySelectorAll('.comparison').forEach(el => {
            if (el.classList.contains('negative')) {
              el.textContent = completedApplications > 0 ? `+${Math.floor(Math.random() * 10)}% vs last week` : "-0% vs last week";
            } else {
              el.textContent = `+${Math.floor(Math.random() * 20)}% vs last month`;
            }
          });

          // Remove loading states
          document.querySelectorAll('.value.loading').forEach(el => {
            el.classList.remove('loading');
          });
        }

        // Checkbox event listeners
        checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', function() {
            const statusElement = this.parentElement.querySelector('.tracker-status');

            if (this.checked) {
              statusElement.textContent = 'Completed';
              statusElement.classList.add('completed');
              completedApplications++;
              activeApplications--;

              // If this is the bursary application, increment bursary count
              if (this.id === 'bursary') {
                bursaryApplications++;
              }
            } else {
              statusElement.textContent = 'Pending';
              statusElement.classList.remove('completed');
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

        // Back to top functionality
        backToTopButton.addEventListener('click', function() {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });

        // Show/hide back to top button based on scroll position
        window.addEventListener('scroll', function() {
          if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'block';
          } else {
            backToTopButton.style.display = 'none';
          }
        });

        // Initialize with some active applications
        activeApplications = checkboxes.length;
        updateStats();

        // Dropdown menu functionality
        const dropdownTriggers = document.querySelectorAll('.resources-dropdown > a');
        
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
      });