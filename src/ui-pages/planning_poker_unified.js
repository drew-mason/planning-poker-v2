// Planning Poker Unified Interface - Client Script (Viewport Scaled)
(function() {
    'use strict';

    // Global variables
    let currentSession = null;
    let currentView = 'hub';
    let selectedGroups = [];
    let currentStory = null;
    let scoringMethods = [];
    let allGroups = [];
    let isFacilitator = false;
    let showCompletedSessions = false;

    // ==================== INITIALIZATION ====================
    function initializePlanningPoker() {
        console.log('🚀 Initializing Planning Poker');

        try {
            initializeTheme();
            setupNavigationTabs();
            setupFormHandlers();
            setupButtonHandlers();
            loadCurrentUser();
            loadScoringMethods();
            loadAllGroups();
            checkIfFacilitator();

            // Set initial view to hub and load sessions
            showView('hub');

            console.log('✅ Planning Poker initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Planning Poker:', error);
        }
    }

    // ==================== THEME MANAGEMENT ====================
    function initializeTheme() {
        console.log('🎨 Initializing theme');

        // Check if dark mode should be enabled
        const isDark = localStorage.getItem('color-theme') === 'dark' ||
                       (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

        // Apply theme
        if (isDark) {
            document.documentElement.classList.add('dark');
            // Show light icon (to switch to light mode)
            const lightIcon = document.getElementById('theme-toggle-light-icon');
            const darkIcon = document.getElementById('theme-toggle-dark-icon');
            if (lightIcon) lightIcon.classList.remove('hidden');
            if (darkIcon) darkIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            // Show dark icon (to switch to dark mode)
            const lightIcon = document.getElementById('theme-toggle-light-icon');
            const darkIcon = document.getElementById('theme-toggle-dark-icon');
            if (lightIcon) lightIcon.classList.add('hidden');
            if (darkIcon) darkIcon.classList.remove('hidden');
        }

        // Setup theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    }

    function toggleTheme() {
        console.log('🌓 Toggling theme');

        const htmlElement = document.documentElement;
        const lightIcon = document.getElementById('theme-toggle-light-icon');
        const darkIcon = document.getElementById('theme-toggle-dark-icon');

        if (!lightIcon || !darkIcon) {
            console.error('Theme toggle icons not found');
            return;
        }

        // Toggle dark class and icons
        if (htmlElement.classList.contains('dark')) {
            // Switch to light mode
            htmlElement.classList.remove('dark');
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
            localStorage.setItem('color-theme', 'light');
            console.log('Switched to light mode');
        } else {
            // Switch to dark mode
            htmlElement.classList.add('dark');
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
            localStorage.setItem('color-theme', 'dark');
            console.log('Switched to dark mode');
        }
    }

    // ==================== EVENT HANDLERS SETUP ====================
    function setupFormHandlers() {
        console.log('📋 Setting up form handlers');

        // Session form submission
        const sessionForm = document.getElementById('create-session-form');
        if (sessionForm) {
            sessionForm.addEventListener('submit', window.createSession);
        }

        // Modal close buttons
        const closeModalBtn = document.getElementById('close-modal-btn');
        const cancelSessionBtn = document.getElementById('cancel-session-btn');
        if (closeModalBtn) closeModalBtn.addEventListener('click', window.hideCreateSessionModal);
        if (cancelSessionBtn) cancelSessionBtn.addEventListener('click', window.hideCreateSessionModal);

        // Add participant button
        const addGroupBtn = document.getElementById('add-group-btn');
        if (addGroupBtn) {
            addGroupBtn.addEventListener('click', window.addGroup);
        }

        // Close modal on overlay click
        const createSessionModal = document.getElementById('create-session-modal');
        if (createSessionModal) {
            createSessionModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    window.hideCreateSessionModal();
                }
            });
        }
    }

    function setupButtonHandlers() {
        console.log('🔘 Setting up button handlers');

        // Create new session button
        const createSessionBtn = document.getElementById('create-new-session-btn');
        if (createSessionBtn) {
            createSessionBtn.addEventListener('click', window.showCreateSessionModal);
        }

        // Refresh sessions button
        const refreshSessionsBtn = document.getElementById('refresh-sessions-btn');
        if (refreshSessionsBtn) {
            refreshSessionsBtn.addEventListener('click', function() {
                loadAvailableSessions();
            });
        }
    }

    // ==================== NAVIGATION ====================
    function setupNavigationTabs() {
        console.log('🔧 Setting up navigation tabs');

        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(function(tab) {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const viewName = this.getAttribute('data-view');
                if (viewName) {
                    showView(viewName);
                }
            });
        });
    }

    function showView(viewName) {
        console.log('📄 Showing view:', viewName);
        currentView = viewName;

        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(function(tab) {
            tab.classList.remove('active');
        });

        // Show selected tab as active
        const activeTab = document.querySelector('[data-view="' + viewName + '"]');
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Hide all views
        document.querySelectorAll('.view-section').forEach(function(section) {
            section.classList.remove('active');
        });

        // Show selected view
        const selectedView = document.getElementById(viewName + '-view');
        if (selectedView) {
            selectedView.classList.add('active');
        }

        // Update session context
        const sessionContext = document.getElementById('session-context');
        if (sessionContext) {
            switch (viewName) {
                case 'hub':
                    sessionContext.textContent = 'Session Hub';
                    break;
                case 'facilitator':
                    sessionContext.textContent = 'Facilitator Mode';
                    break;
                case 'voter':
                    sessionContext.textContent = 'Voter Mode';
                    break;
                case 'observer':
                    sessionContext.textContent = 'Observer Mode';
                    break;
                default:
                    sessionContext.textContent = 'Session Hub';
            }
        }

        // Load view-specific data
        loadViewData(viewName);
    }

    function loadViewData(viewName) {
        console.log('📊 Loading data for view:', viewName);

        switch (viewName) {
            case 'hub':
                loadAvailableSessions();
                break;
            case 'facilitator':
                if (currentSession) {
                    loadFacilitatorView();
                }
                break;
            case 'voter':
                if (currentSession) {
                    loadVoterView();
                }
                break;
            case 'observer':
                if (currentSession) {
                    loadObserverView();
                }
                break;
        }
    }

    // ==================== USER MANAGEMENT ====================
    function loadCurrentUser() {
        console.log('👤 Loading current user');

        // Check if we're in ServiceNow platform
        if (typeof GlideAjax === 'undefined') {
            console.warn('⚠️ GlideAjax not available - not in ServiceNow context');

            // Try to use window.NOW or other ServiceNow globals
            if (window.NOW && window.NOW.user) {
                console.log('Using window.NOW.user');
                displayCurrentUser({
                    sys_id: window.NOW.user.userID || 'unknown',
                    display_name: window.NOW.user.name || window.NOW.user.userName || 'User',
                    user_name: window.NOW.user.userName || 'user',
                    email: window.NOW.user.email || ''
                });
                return;
            }

            // Fallback to mock data for testing
            console.log('Using mock user data for testing');
            displayCurrentUser({
                sys_id: 'mock_user',
                display_name: 'Test User',
                user_name: 'testuser',
                email: 'testuser@example.com'
            });
            return;
        }

        console.log('🔄 Making AJAX call to get current user');
        const ajax = new GlideAjax('x_1447726_planni_0.PlanningPokerAjax');
        ajax.addParam('sysparm_name', 'getCurrentUser');
        ajax.getXMLAnswer(function(answer) {
            try {
                console.log('📥 Raw user response:', answer);
                console.log('📥 Response type:', typeof answer);
                console.log('📥 Response length:', answer ? answer.length : 0);

                if (!answer || answer === 'null' || answer === '' || answer === 'undefined') {
                    console.error('❌ Empty or invalid user response');
                    setDefaultUserInfo();
                    return;
                }

                const userData = JSON.parse(answer);
                console.log('✅ Parsed user data successfully:', userData);

                if (userData && (userData.sys_id || userData.user_name || userData.display_name)) {
                    displayCurrentUser(userData);
                } else {
                    console.error('❌ Invalid user data structure:', userData);
                    setDefaultUserInfo();
                }
            } catch (error) {
                console.error('❌ Error parsing user data:', error);
                console.error('Raw answer was:', answer);
                setDefaultUserInfo();
            }
        });
    }

    function displayCurrentUser(userData) {
        console.log('✨ Displaying user information:', userData);
        console.log('📝 User data keys:', Object.keys(userData));

        const currentUserEl = document.getElementById('current-user');
        const userAvatarEl = document.getElementById('user-avatar');
        const roleDisplay = document.getElementById('role-display');

        console.log('🎯 Elements found:', {
            currentUserEl: !!currentUserEl,
            userAvatarEl: !!userAvatarEl,
            roleDisplay: !!roleDisplay
        });

        const displayName = userData.display_name || userData.user_name || 'User';
        console.log('👤 Display name:', displayName);

        // Update name display
        if (currentUserEl) {
            currentUserEl.textContent = displayName;
            console.log('✅ Updated current-user element');
        } else {
            console.error('❌ current-user element not found!');
        }

        // Update role display with user name or email
        if (roleDisplay) {
            roleDisplay.textContent = userData.user_name || userData.email || 'User';
            console.log('✅ Updated role-display element');
        } else {
            console.error('❌ role-display element not found!');
        }

        // Update avatar with proper initials
        if (userAvatarEl) {
            const initials = getInitials(displayName);
            console.log('🔤 Generated initials:', initials);
            userAvatarEl.textContent = initials;

            // Add a color based on the user name for variety
            const colors = [
                'bg-indigo-600', 'bg-blue-600', 'bg-purple-600',
                'bg-pink-600', 'bg-red-600', 'bg-orange-600',
                'bg-yellow-600', 'bg-green-600', 'bg-teal-600', 'bg-cyan-600'
            ];
            const colorIndex = getHashCode(displayName) % colors.length;
            console.log('🎨 Selected color index:', colorIndex, '→', colors[colorIndex]);

            // Remove all color classes first
            colors.forEach(function(color) {
                userAvatarEl.classList.remove(color);
            });

            // Add the selected color
            userAvatarEl.classList.add(colors[colorIndex]);
            console.log('✅ Updated user-avatar element with color');
        } else {
            console.error('❌ user-avatar element not found!');
        }

        console.log('✅ User display update complete');
    }

    function getInitials(name) {
        if (!name) return 'U';

        const words = name.trim().split(/\s+/);

        if (words.length === 1) {
            // Single word, return first 2 characters
            return name.substring(0, 2).toUpperCase();
        } else {
            // Multiple words, return first letter of first two words
            return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
        }
    }

    function getHashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    function setDefaultUserInfo() {
        const currentUserEl = document.getElementById('current-user');
        const userAvatarEl = document.getElementById('user-avatar');
        if (currentUserEl) currentUserEl.textContent = 'User';
        if (userAvatarEl) userAvatarEl.textContent = 'U';
    }

    // ==================== DATA LOADING ====================
    function loadScoringMethods() {
        console.log('🔢 Loading scoring methods');

        if (typeof GlideAjax === 'undefined') {
            console.log('⚠️ Using mock scoring methods');
            scoringMethods = [
                { value: 'fibonacci', label: 'Fibonacci (1, 2, 3, 5, 8, 13, 21)' },
                { value: 'sequential', label: 'Sequential (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)' },
                { value: 'tshirt', label: 'T-Shirt Sizes (XS, S, M, L, XL, XXL)' }
            ];
            displayScoringMethods(scoringMethods);
            return;
        }

        const ajax = new GlideAjax('x_1447726_planni_0.PlanningPokerAjax');
        ajax.addParam('sysparm_name', 'getScoringMethods');
        ajax.getXMLAnswer(function(answer) {
            try {
                const response = JSON.parse(answer);
                if (response.success && response.methods) {
                    scoringMethods = response.methods;
                    displayScoringMethods(response.methods);
                } else {
                    console.error('Failed to load scoring methods:', response.message);
                    // Use fallback methods
                    scoringMethods = [
                        { value: 'fibonacci', label: 'Fibonacci (1, 2, 3, 5, 8, 13, 21)' },
                        { value: 'sequential', label: 'Sequential (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)' },
                        { value: 'tshirt', label: 'T-Shirt Sizes (XS, S, M, L, XL, XXL)' }
                    ];
                    displayScoringMethods(scoringMethods);
                }
            } catch (error) {
                console.error('Error parsing scoring methods response:', error);
                // Use fallback methods
                scoringMethods = [
                    { value: 'fibonacci', label: 'Fibonacci (1, 2, 3, 5, 8, 13, 21)' },
                    { value: 'sequential', label: 'Sequential (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)' },
                    { value: 'tshirt', label: 'T-Shirt Sizes (XS, S, M, L, XL, XXL)' }
                ];
                displayScoringMethods(scoringMethods);
            }
        });
    }

    function displayScoringMethods(methods) {
        console.log('📋 Displaying scoring methods:', methods.length);

        const select = document.getElementById('scoring-method');
        if (!select) return;

        select.innerHTML = '<option value="">Select scoring method...</option>';
        methods.forEach(function(method) {
            const option = document.createElement('option');
            option.value = method.value;
            option.textContent = method.label;
            select.appendChild(option);
        });
    }

    function loadAllGroups() {
        console.log('👥 Loading all groups');

        if (typeof GlideAjax === 'undefined') {
            console.log('⚠️ Using mock groups');
            allGroups = [
                { sys_id: 'group1', name: 'Development Team', description: 'Main development team' },
                { sys_id: 'group2', name: 'Product Owners', description: 'Product owner group' },
                { sys_id: 'group3', name: 'Scrum Masters', description: 'Scrum master group' }
            ];
            displayAllGroups(allGroups);
            return;
        }

        const ajax = new GlideAjax('x_1447726_planni_0.PlanningPokerAjax');
        ajax.addParam('sysparm_name', 'getAllGroups');
        ajax.getXMLAnswer(function(answer) {
            try {
                const response = JSON.parse(answer);
                if (response.success && response.groups) {
                    allGroups = response.groups;
                    displayAllGroups(response.groups);
                } else {
                    console.error('Failed to load groups:', response.message);
                    allGroups = [];
                    displayAllGroups([]);
                }
            } catch (error) {
                console.error('Error parsing groups response:', error);
                allGroups = [];
                displayAllGroups([]);
            }
        });
    }

    function displayAllGroups(groups) {
        console.log(' Displaying groups:', groups.length);

        const select = document.getElementById('group-select');
        if (!select) return;

        select.innerHTML = '<option value="">Select group to add...</option>';
        groups.forEach(function(group) {
            const option = document.createElement('option');
            option.value = group.sys_id;
            option.textContent = group.name + (group.description ? ' - ' + group.description : '');
            select.appendChild(option);
        });
    }

    // ==================== SESSIONS MANAGEMENT ====================
    function checkIfFacilitator() {
        console.log('🔍 Checking if user is a facilitator');

        if (typeof GlideAjax === 'undefined') {
            console.log('⚠️ Mock facilitator check');
            isFacilitator = true;
            updateToggleVisibility();
            return;
        }

        const ajax = new GlideAjax('x_1447726_planni_0.PlanningPokerAjax');
        ajax.addParam('sysparm_name', 'isFacilitator');
        ajax.getXMLAnswer(function(answer) {
            try {
                const response = JSON.parse(answer);
                if (response.success) {
                    isFacilitator = response.is_facilitator;
                    updateToggleVisibility();
                }
            } catch (error) {
                console.error('Error checking facilitator status:', error);
            }
        });
    }

    function updateToggleVisibility() {
        const toggleContainer = document.getElementById('session-filter-toggle');
        if (toggleContainer) {
            if (isFacilitator) {
                toggleContainer.classList.remove('hidden');
            } else {
                toggleContainer.classList.add('hidden');
            }
        }
    }

    function loadAvailableSessions() {
        console.log('📋 Loading available sessions');

        if (typeof GlideAjax === 'undefined') {
            console.log('⚠️ Using mock sessions');
            displayAvailableSessions([
                {
                    sys_id: 'session1',
                    title: 'Sprint Planning - User Stories',
                    description: 'Planning session for upcoming sprint stories',
                    created_by_name: 'John Doe',
                    scoring_method_name: 'Fibonacci',
                    participant_count: 5,
                    story_count: 8,
                    state: 'in_session',
                    sys_created_on: '2024-01-15 10:30:00'
                }
            ]);
            return;
        }

        const ajax = new GlideAjax('x_1447726_planni_0.PlanningPokerAjax');
        ajax.addParam('sysparm_name', 'getAllSessions');
        ajax.addParam('sysparm_filter', showCompletedSessions ? 'completed' : 'active');
        ajax.getXMLAnswer(function(answer) {
            try {
                const response = JSON.parse(answer);
                if (response.success && response.sessions) {
                    displayAvailableSessions(response.sessions);
                } else {
                    console.error('Failed to load sessions:', response.message);
                    displayAvailableSessions([]);
                }
            } catch (error) {
                console.error('Error parsing sessions response:', error);
                displayAvailableSessions([]);
            }
        });
    }

    function displayAvailableSessions(sessions) {
        console.log('🗂️ Displaying sessions:', sessions.length);

        const grid = document.getElementById('sessions-grid');
        const noSessions = document.getElementById('no-sessions');

        if (!grid) return;

        if (sessions.length === 0) {
            if (noSessions) noSessions.classList.remove('hidden');
            grid.innerHTML = '';
            return;
        }

        if (noSessions) noSessions.classList.add('hidden');

        grid.innerHTML = sessions.map(function(session) {
            return createSessionCard(session);
        }).join('');
    }

    function createSessionCard(session) {
        const statusClass = getStatusClass(session.state || session.status);
        const statusText = getStatusText(session.state || session.status);

        // Build edit button HTML if user can edit
        const editButton = session.can_edit ?
            '<button onclick="editSession(\'' + session.sys_id + '\'); event.stopPropagation();" class="bg-blue-600 hover:bg-blue-700 text-white px-[1.5vw] py-[1vh] rounded-[0.6vw] text-[1vw] lg:text-[0.9vw] xl:text-[0.8vw] font-medium transition-colors duration-200 mt-[1.5vh] w-full">Manage Stories</button>' : '';

        return '<div class="session-card bg-white dark:bg-gray-800 rounded-[1vw] border border-gray-200 dark:border-gray-700 p-[2vw] cursor-pointer hover:shadow-lg transition-shadow duration-200" onclick="joinSession(\'' + session.sys_id + '\')">' +
            '<div class="flex justify-between items-start mb-[1.5vh]">' +
            '<h4 class="font-semibold text-gray-900 dark:text-white text-[1.3vw] lg:text-[1.1vw] xl:text-[1vw]">' + escapeHtml(session.title || session.name || 'Untitled Session') + '</h4>' +
            '<span class="status-badge ' + statusClass + ' text-white text-[0.9vw] lg:text-[0.8vw] xl:text-[0.7vw] px-[1vw] py-[0.5vh] rounded-full ml-[1vw]">' + statusText + '</span>' +
            '</div>' +
            '<p class="text-gray-600 dark:text-gray-300 text-[1vw] lg:text-[0.9vw] xl:text-[0.8vw] mb-[1.5vh]">' + escapeHtml(session.description || 'No description provided') + '</p>' +
            '<div class="space-y-[0.5vh] text-[1vw] lg:text-[0.9vw] xl:text-[0.8vw] text-gray-500 dark:text-gray-400">' +
            '<div class="flex justify-between"><span>Facilitator:</span><span class="font-medium">' + escapeHtml(session.created_by_name || session.facilitator_name || 'Unknown') + '</span></div>' +
            '<div class="flex justify-between"><span>Method:</span><span class="font-medium">' + escapeHtml(session.scoring_method_name || 'Not specified') + '</span></div>' +
            '<div class="flex justify-between"><span>Participants:</span><span class="font-medium">' + (session.participant_count || 0) + '</span></div>' +
            '<div class="flex justify-between"><span>Created:</span><span class="font-medium">' + formatDate(session.sys_created_on) + '</span></div>' +
            '</div>' +
            editButton +
            '</div>';
    }

    // ==================== UTILITY FUNCTIONS ====================
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    function getStatusClass(status) {
        switch (status) {
            case 'in_session': return 'active';
            case 'complete': return 'completed';
            case 'draft': return 'pending';
            // Legacy status support
            case 'active': return 'active';
            case 'completed': return 'completed';
            default: return 'pending';
        }
    }

    function getStatusText(status) {
        switch (status) {
            case 'in_session': return 'In Session';
            case 'complete': return 'Complete';
            case 'draft': return 'Draft';
            // Legacy status support
            case 'active': return 'Active';
            case 'completed': return 'Completed';
            default: return 'Pending';
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'Unknown';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Unknown';
        }
    }

    // ==================== GLOBAL FUNCTIONS ====================
    window.addGroup = function() {
        const select = document.getElementById('group-select');

        if (!select) return;

        const groupId = select.value;
        const groupName = select.options[select.selectedIndex].text;

        if (!groupId) {
            alert('Please select a group');
            return;
        }

        // Check if already added
        const exists = selectedGroups.some(function(g) {
            return g.group_id === groupId;
        });

        if (exists) {
            alert('Group already added to this session');
            return;
        }

        selectedGroups.push({
            group_id: groupId,
            group_name: groupName
        });

        updateSelectedGroupsList();

        // Reset selection
        select.value = '';
    };

    function updateSelectedGroupsList() {
        const container = document.getElementById('selected-groups');
        if (!container) return;

        container.innerHTML = selectedGroups.map(function(group, index) {
            return '<div class="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-[1.5vw] rounded text-[1.2vw] lg:text-[1vw] xl:text-[0.9vw]">' +
                '<span class="font-medium text-gray-900 dark:text-white">' + escapeHtml(group.group_name) + '</span>' +
                '<button type="button" onclick="removeGroup(' + index + ')" class="bg-red-600 hover:bg-red-700 text-white px-[1.5vw] py-[0.8vh] rounded text-[1.1vw] lg:text-[0.9vw] xl:text-[0.8vw] font-medium transition-colors duration-200">Remove</button>' +
                '</div>';
        }).join('');
    }

    window.removeGroup = function(index) {
        selectedGroups.splice(index, 1);
        updateSelectedGroupsList();
    };

    // ==================== SESSION ACTIONS ====================
    window.showCreateSessionModal = function() {
        console.log('📝 Showing create session modal');
        const modal = document.getElementById('create-session-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');

            // Focus on session name input
            setTimeout(function() {
                const sessionNameInput = document.getElementById('session-name');
                if (sessionNameInput) sessionNameInput.focus();
            }, 100);
        }
    };

    window.hideCreateSessionModal = function() {
        console.log('✖️ Hiding create session modal');
        const modal = document.getElementById('create-session-modal');
        if (modal) {
            modal.classList.add('opacity-0');
            setTimeout(function() {
                modal.classList.add('hidden');
            }, 300);
        }

        // Reset form and participants
        const form = document.getElementById('create-session-form');
        if (form) form.reset();
        selectedGroups = [];
        updateSelectedGroupsList();
    };

    window.createSession = function(event) {
        event.preventDefault();
        console.log('🎯 Creating new session');

        const form = document.getElementById('create-session-form');
        if (!form) {
            console.error('Session form not found');
            return;
        }

        const formData = new FormData(form);
        const title = formData.get('session-name');
        const description = formData.get('session-description');
        const scoringMethod = formData.get('scoring-method');

        if (!title || !scoringMethod) {
            alert('Please fill in all required fields');
            return;
        }

        const sessionData = {
            title: title,
            description: description,
            scoring_method: scoringMethod,
            groups: selectedGroups
        };

        console.log('Session data:', sessionData);

        if (typeof GlideAjax === 'undefined') {
            console.log('⚠️ Mock session creation');
            alert('Session "' + title + '" created successfully (mock mode)');
            window.hideCreateSessionModal();
            loadAvailableSessions();
            return;
        }

        const ajax = new GlideAjax('x_1447726_planni_0.PlanningPokerAjax');
        ajax.addParam('sysparm_name', 'createSession');
        ajax.addParam('sysparm_session_data', JSON.stringify(sessionData));
        ajax.getXMLAnswer(function(answer) {
            try {
                const response = JSON.parse(answer);
                if (response.success) {
                    alert('Session created successfully!');
                    window.hideCreateSessionModal();

                    // Store the created session
                    currentSession = response.session;

                    // Refresh sessions list and stay on hub view
                    loadAvailableSessions();
                } else {
                    alert('Failed to create session: ' + (response.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error creating session:', error);
                alert('Error creating session');
            }
        });
    };

    window.joinSession = function(sessionId) {
        console.log('🎯 Joining session:', sessionId);

        if (typeof GlideAjax === 'undefined') {
            console.log('⚠️ Mock session join');
            alert('Joining session: ' + sessionId + ' (mock mode)');
            return;
        }

        const ajax = new GlideAjax('x_1447726_planni_0.PlanningPokerAjax');
        ajax.addParam('sysparm_name', 'joinSession');
        ajax.addParam('sysparm_session_id', sessionId);
        ajax.getXMLAnswer(function(answer) {
            try {
                const response = JSON.parse(answer);
                if (response.success) {
                    currentSession = response.session;
                    console.log('Successfully joined session:', response.session.session_name);

                    // Navigate to appropriate view based on role
                    if (response.role === 'facilitator') {
                        showView('facilitator');
                    } else if (response.role === 'observer') {
                        showView('observer');
                    } else {
                        showView('voter');
                    }
                } else {
                    alert('Failed to join session: ' + (response.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error joining session:', error);
                alert('Error joining session');
            }
        });
    };

    window.editSession = function(sessionId) {
        console.log('✏️ Editing session:', sessionId);
        // For now, we'll alert that this feature is coming soon
        // In the future, this would open a story management interface
        alert('Story Management\n\nThis will allow you to:\n• Add user stories\n• Edit existing stories\n• Manage story order\n• Set current voting story\n\n(Feature coming soon)');
    };

    window.toggleSessionFilter = function() {
        showCompletedSessions = !showCompletedSessions;

        // Update toggle button text
        const toggleBtn = document.getElementById('toggle-filter-btn');
        if (toggleBtn) {
            if (showCompletedSessions) {
                toggleBtn.innerHTML = '<svg class="w-[1.2vw] h-[1.2vw] mr-[0.5vw]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>Show Active Sessions';
            } else {
                toggleBtn.innerHTML = '<svg class="w-[1.2vw] h-[1.2vw] mr-[0.5vw]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Show Completed Sessions';
            }
        }

        // Reload sessions with new filter
        loadAvailableSessions();
    };

    // ==================== MOCK FUNCTIONS FOR OTHER VIEWS ====================
    function loadFacilitatorView() {
        console.log('👔 Loading facilitator view');
        const storyTitle = document.getElementById('storyTitle');
        const storyDescription = document.getElementById('storyDescription');

        if (currentSession && storyTitle && storyDescription) {
            storyTitle.textContent = 'Current Session: ' + currentSession.session_name;
            storyDescription.textContent = 'Facilitating planning poker session';
        }
    }

    function loadVoterView() {
        console.log('🗳️ Loading voter view');
        const voterStoryTitle = document.getElementById('voter-story-title');
        const voterStoryDescription = document.getElementById('voter-story-description');

        if (currentSession && voterStoryTitle && voterStoryDescription) {
            voterStoryTitle.textContent = 'Session: ' + currentSession.session_name;
            voterStoryDescription.textContent = 'Ready to vote on user stories';
        }
    }

    function loadObserverView() {
        console.log('👁️ Loading observer view');
        const observerHeader = document.getElementById('observer-story-content-header');

        if (currentSession && observerHeader) {
            observerHeader.textContent = 'Observing: ' + currentSession.session_name;
        }
    }

    // ==================== INITIALIZATION ====================
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePlanningPoker);
    } else {
        initializePlanningPoker();
    }

})();