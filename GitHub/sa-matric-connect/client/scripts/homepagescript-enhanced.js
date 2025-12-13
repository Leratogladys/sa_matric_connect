// Enhanced homepage script with real data fetching
document.addEventListener('DOMContentLoaded', async function() {
    console.log('íº€ Homepage script loaded');
    
    try {
        // Check authentication
        const authCheck = await checkAuthentication();
        
        if (!authCheck.authenticated) {
            console.log('âŒ Not authenticated, redirecting...');
            showNotification('Please login to access the dashboard', 'error');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        console.log('âœ… User authenticated:', authCheck.user.name);
        updateWelcomeMessage(authCheck.user);
        
        // Initialize all features
        await initializeAllFeatures(authCheck.user);
        
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Error loading dashboard: ' + error.message, 'error');
    }
});

// ==================== AUTHENTICATION ====================
async function checkAuthentication() {
    if (typeof authService !== 'undefined') {
        return await authService.checkAuth();
    }
    
    // Fallback: direct API call
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { authenticated: false, error: data.error };
        }
        
        return {
            authenticated: true,
            user: data.user
        };
        
    } catch (error) {
        console.error('Auth check error:', error);
        return { authenticated: false, error: error.message };
    }
}

// ==================== DASHBOARD DATA ====================
async function loadDashboardData() {
    try {
        console.log('í³Š Loading dashboard data...');
        
        const response = await fetch('/api/dashboard/data', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateDashboardStats(data.stats);
            updateRecentActivity(data.recentActivity);
            updateDeadlines(data.upcomingDeadlines);
            console.log('âœ… Dashboard data loaded successfully');
        }
        
        return data;
        
    } catch (error) {
        console.error('Dashboard data error:', error);
        
        // Fallback to mock data for development
        if (process.env.NODE_ENV === 'development') {
            const mockData = {
                stats: {
                    totalApplications: 8,
                    completedApplications: 3,
                    pendingApplications: 5,
                    bursaryApplications: 2
                },
                recentActivity: [
                    { id: 1, action: 'Submitted UCT application', status: 'pending', date: '2024-01-15' },
                    { id: 2, action: 'Uploaded matric certificate', status: 'completed', date: '2024-01-14' },
                    { id: 3, action: 'Applied for NSFAS bursary', status: 'in-review', date: '2024-01-13' }
                ],
                upcomingDeadlines: [
                    { id: 1, title: 'University Applications', deadline: '2024-02-01', type: 'university', daysLeft: 17 },
                    { id: 2, title: 'NSFAS Bursary', deadline: '2024-01-31', type: 'bursary', daysLeft: 16 }
                ]
            };
            
            updateDashboardStats(mockData.stats);
            updateRecentActivity(mockData.recentActivity);
            updateDeadlines(mockData.upcomingDeadlines);
            
            console.log('âš  Using mock dashboard data for development');
        }
        
        throw error;
    }
}

function updateDashboardStats(stats) {
    const elements = {
        total: document.getElementById('totalApplications'),
        active: document.getElementById('activeApplications'),
        completed: document.getElementById('completedApplications'),
        bursary: document.getElementById('bursaryApplications')
    };
    
    for (const [key, element] of Object.entries(elements)) {
        if (element) {
            const value = stats[key + 'Applications'] || stats[key] || 0;
            element.textContent = value;
            element.classList.remove('loading');
        }
    }
    
    // Update progress bar
    const total = stats.totalApplications || 0;
    const completed = stats.completedApplications || 0;
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
    
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill) {
        progressFill.style.width = \`\${progressPercentage}%\`;
    }
    
    if (progressText) {
        progressText.textContent = \`\${Math.round(progressPercentage)}% Complete\`;
    }
}

function updateRecentActivity(activities) {
    const activityList = document.getElementById('recentActivityList');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const li = document.createElement('li');
        li.className = \`activity-item status-\${activity.status}\`;
        li.innerHTML = \`
            <span class="activity-action">\${activity.action}</span>
            <span class="activity-date">\${formatDate(activity.date)}</span>
            <span class="activity-status \${activity.status}">\${activity.status}</span>
        \`;
        activityList.appendChild(li);
    });
}

function updateDeadlines(deadlines) {
    const deadlinesList = document.getElementById('deadlinesList');
    if (!deadlinesList) return;
    
    deadlinesList.innerHTML = '';
    
    deadlines.forEach(deadline => {
        const li = document.createElement('li');
        li.className = \`deadline-item type-\${deadline.type}\`;
        li.innerHTML = \`
            <div class="deadline-title">\${deadline.title}</div>
            <div class="deadline-info">
                <span class="deadline-date">\${formatDate(deadline.deadline)}</span>
                <span class="deadline-days \${deadline.daysLeft < 7 ? 'urgent' : ''}">
                    \${deadline.daysLeft} days left
                </span>
            </div>
        \`;
        deadlinesList.appendChild(li);
    });
}

// ==================== INITIALIZE ALL FEATURES ====================
async function initializeAllFeatures(user) {
    console.log('í´„ Initializing all features...');
    
    // Load dashboard data
    await loadDashboardData();
    
    // Setup other features
    setupLogout();
    initializeApplicationTracker();
    setupBackToTop();
    setupDropdownMenus();
    
    console.log('âœ… All features initialized');
}

// ==================== APPLICATION TRACKER ====================
function initializeApplicationTracker() {
    const checkboxes = document.querySelectorAll('.tracker-checkbox');
    
    if (checkboxes.length === 0) {
        console.log('âš  No tracker checkboxes found');
        return;
    }
    
    console.log(\`Found \${checkboxes.length} application checkboxes\`);
    
    // Add event listeners
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async function() {
            await updateApplicationStatus(this);
        });
    });
}

async function updateApplicationStatus(checkbox) {
    const applicationId = checkbox.dataset.applicationId;
    const completed = checkbox.checked;
    
    try {
        const response = await fetch('/api/dashboard/application/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                applicationId: applicationId,
                completed: completed
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update application');
        }
        
        // Update UI
        const statusElement = checkbox.parentElement.querySelector('.tracker-status');
        if (statusElement) {
            statusElement.textContent = completed ? 'Completed' : 'Pending';
            statusElement.classList.toggle('completed', completed);
        }
        
        // Reload dashboard stats
        await loadDashboardData();
        
    } catch (error) {
        console.error('Update application error:', error);
        checkbox.checked = !completed; // Revert checkbox
        showNotification('Failed to update application: ' + error.message, 'error');
    }
}

// ==================== LOGOUT FUNCTIONALITY ====================
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleLogout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;
    
    try {
        let success = false;
        
        if (typeof authService !== 'undefined') {
            const result = await authService.logout();
            success = result.success;
        } else {
            // Fallback
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            success = response.ok;
        }
        
        if (success) {
            showNotification('Successfully logged out. Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            throw new Error('Logout failed');
        }
        
    } catch (error) {
        console.error('Logout error:', error);
        showNotification(\`Logout failed: \${error.message}\`, 'error');
    }
}

// ==================== UI FUNCTIONS ====================
function updateWelcomeMessage(userData) {
    const welcomeElements = document.querySelectorAll('#welcome-user, .user-name');
    
    welcomeElements.forEach(element => {
        if (element) {
            element.textContent = userData.name || 'Student';
        }
    });
}

function showNotification(message, type = 'info') {
    // Your existing notification function
    // [Keep your existing notification code]
}

function setupBackToTop() {
    // Your existing back-to-top function
}

function setupDropdownMenus() {
    // Your existing dropdown function
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkAuthentication,
        loadDashboardData,
        updateDashboardStats
    };
}
