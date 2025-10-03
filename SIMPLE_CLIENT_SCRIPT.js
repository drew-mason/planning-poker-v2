// SIMPLE Planning Poker Client Script for Debugging
(function() {
    'use strict';
    
    console.log('🔍 DEBUGGING: Planning Poker client script loading...');
    
    // Test variables
    let testResults = [];
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔍 DEBUGGING: DOM ready');
        runDiagnostics();
        setupBasicFunctionality();
    });
    
    function runDiagnostics() {
        console.log('🔍 DEBUGGING: Running diagnostics...');
        
        // Test 1: Check if GlideAjax is available
        if (typeof GlideAjax !== 'undefined') {
            console.log('✅ GlideAjax is available');
            testResults.push('GlideAjax: Available');
            
            // Test 2: Test Script Include connection
            testScriptInclude();
        } else {
            console.log('❌ GlideAjax is NOT available');
            testResults.push('GlideAjax: NOT Available');
            showDiagnostics();
        }
        
        // Test 3: Check DOM elements
        testDOMElements();
    }
    
    function testScriptInclude() {
        console.log('🔍 Testing Script Include connection...');
        
        try {
            const ajax = new GlideAjax('PlanningPokerAjax');
            ajax.addParam('sysparm_name', 'test');
            ajax.getXML(function(response) {
                const answer = response.responseXML.documentElement.getAttribute('answer');
                console.log('🔍 Script Include response:', answer);
                
                try {
                    const result = JSON.parse(answer);
                    if (result.success) {
                        console.log('✅ Script Include is working');
                        testResults.push('Script Include: Working');
                        
                        // Test data loading
                        testDataLoading();
                    } else {
                        console.log('❌ Script Include error:', result.error);
                        testResults.push('Script Include: Error - ' + result.error);
                    }
                } catch (parseError) {
                    console.log('❌ Script Include parse error:', parseError);
                    testResults.push('Script Include: Parse Error');
                }
                
                showDiagnostics();
            });
        } catch (ajaxError) {
            console.log('❌ Ajax creation error:', ajaxError);
            testResults.push('Script Include: Ajax Error');
            showDiagnostics();
        }
    }
    
    function testDataLoading() {
        console.log('🔍 Testing data loading...');
        
        // Test sessions loading
        const ajax = new GlideAjax('PlanningPokerAjax');
        ajax.addParam('sysparm_name', 'getAllSessions');
        ajax.getXML(function(response) {
            const answer = response.responseXML.documentElement.getAttribute('answer');
            
            try {
                const result = JSON.parse(answer);
                if (result.success) {
                    console.log('✅ Sessions loaded:', result.count, 'sessions');
                    testResults.push('Sessions: ' + result.count + ' loaded');
                    
                    if (result.sessions && result.sessions.length > 0) {
                        console.log('📋 First session:', result.sessions[0]);
                        displaySessions(result.sessions);
                    }
                } else {
                    console.log('❌ Sessions loading error:', result.error);
                    testResults.push('Sessions: Error - ' + result.error);
                }
            } catch (error) {
                console.log('❌ Sessions parse error:', error);
                testResults.push('Sessions: Parse Error');
            }
            
            showDiagnostics();
        });
    }
    
    function testDOMElements() {
        console.log('🔍 Testing DOM elements...');
        
        const elements = [
            'sessions-grid',
            'create-new-session-btn', 
            'join-session-btn',
            'session-code-input',
            'create-session-modal'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                console.log('✅ Element found:', id);
                testResults.push('DOM: ' + id + ' found');
            } else {
                console.log('❌ Element missing:', id);
                testResults.push('DOM: ' + id + ' MISSING');
            }
        });
    }
    
    function displaySessions(sessions) {
        const grid = document.getElementById('sessions-grid');
        if (!grid) {
            console.log('❌ Sessions grid not found');
            return;
        }
        
        console.log('🔍 Displaying sessions in grid...');
        
        grid.innerHTML = sessions.map(session => `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h4 class="font-semibold text-gray-900 dark:text-white">${session.session_name}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">Code: ${session.session_code}</p>
                <p class="text-sm text-gray-600 dark:text-gray-300">${session.description}</p>
                <p class="text-xs text-gray-500">By: ${session.facilitator_name}</p>
            </div>
        `).join('');
        
        console.log('✅ Sessions displayed');
        testResults.push('Display: Sessions rendered');
    }
    
    function showDiagnostics() {
        console.log('🔍 DIAGNOSTIC RESULTS:');
        testResults.forEach(result => console.log('  - ' + result));
        
        // Show on page if possible
        const diagnosticsDiv = document.getElementById('diagnostics-display') || createDiagnosticsDisplay();
        diagnosticsDiv.innerHTML = `
            <div class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">🔍 Diagnostic Results</h3>
                <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    ${testResults.map(result => `<li>• ${result}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    function createDiagnosticsDisplay() {
        const div = document.createElement('div');
        div.id = 'diagnostics-display';
        div.style.cssText = 'position: fixed; top: 10px; right: 10px; max-width: 300px; z-index: 9999;';
        document.body.appendChild(div);
        return div;
    }
    
    function setupBasicFunctionality() {
        console.log('🔍 Setting up basic functionality...');
        
        // Basic navigation
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetView = this.getAttribute('data-view');
                console.log('🔍 Navigation clicked:', targetView);
                
                // Simple view switching
                document.querySelectorAll('.view-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                const targetSection = document.getElementById(targetView + '-view');
                if (targetSection) {
                    targetSection.classList.add('active');
                    console.log('✅ Switched to view:', targetView);
                } else {
                    console.log('❌ View not found:', targetView + '-view');
                }
            });
        });
        
        console.log('✅ Basic functionality setup complete');
    }
    
    // Simple notification function
    function showNotification(message, type) {
        console.log('📢 ' + (type || 'INFO') + ':', message);
    }
    
    // Make some functions global for testing
    window.debugPlanningPoker = {
        runDiagnostics: runDiagnostics,
        testResults: testResults,
        showNotification: showNotification
    };
    
})();