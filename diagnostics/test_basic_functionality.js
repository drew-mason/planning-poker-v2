// Basic JavaScript functionality test for Planning Poker interface
// This script tests if the basic elements and functions are working

console.log('🔍 Starting basic functionality test...');

// Test 1: Check if DOM elements exist
function testDOMElements() {
    console.log('📋 Testing DOM elements...');
    
    const criticalElements = [
        'theme-toggle',
        'session-hub-tab',
        'facilitator-tab',
        'voter-tab',
        'observer-tab',
        'hub-view',
        'facilitator-view',
        'voter-view',
        'observer-view'
    ];
    
    let allElementsFound = true;
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Found element: ${id}`);
        } else {
            console.log(`❌ Missing element: ${id}`);
            allElementsFound = false;
        }
    });
    
    return allElementsFound;
}

// Test 2: Check if theme toggle works
function testThemeToggle() {
    console.log('🎨 Testing theme toggle...');
    
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        console.log('❌ Theme toggle button not found');
        return false;
    }
    
    // Test click event
    try {
        themeToggle.click();
        console.log('✅ Theme toggle click successful');
        return true;
    } catch (error) {
        console.log('❌ Theme toggle click failed:', error);
        return false;
    }
}

// Test 3: Check if navigation tabs work
function testNavigation() {
    console.log('🧭 Testing navigation...');
    
    const tabs = ['session-hub-tab', 'facilitator-tab', 'voter-tab', 'observer-tab'];
    let allTabsWork = true;
    
    tabs.forEach(tabId => {
        const tab = document.getElementById(tabId);
        if (tab) {
            try {
                tab.click();
                console.log(`✅ Tab click successful: ${tabId}`);
            } catch (error) {
                console.log(`❌ Tab click failed: ${tabId}`, error);
                allTabsWork = false;
            }
        } else {
            console.log(`❌ Tab not found: ${tabId}`);
            allTabsWork = false;
        }
    });
    
    return allTabsWork;
}

// Test 4: Check if GlideAjax is available
function testAjaxAvailability() {
    console.log('🌐 Testing AJAX availability...');
    
    if (typeof GlideAjax !== 'undefined') {
        console.log('✅ GlideAjax is available');
        
        try {
            const ajax = new GlideAjax('PlanningPokerAjax');
            console.log('✅ PlanningPokerAjax instance created');
            return true;
        } catch (error) {
            console.log('❌ Failed to create PlanningPokerAjax instance:', error);
            return false;
        }
    } else {
        console.log('❌ GlideAjax is not available');
        return false;
    }
}

// Test 5: Check localStorage functionality
function testLocalStorage() {
    console.log('💾 Testing localStorage...');
    
    try {
        localStorage.setItem('test-key', 'test-value');
        const value = localStorage.getItem('test-key');
        localStorage.removeItem('test-key');
        
        if (value === 'test-value') {
            console.log('✅ localStorage working');
            return true;
        } else {
            console.log('❌ localStorage value mismatch');
            return false;
        }
    } catch (error) {
        console.log('❌ localStorage error:', error);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 Running comprehensive functionality test...');
    
    const results = {
        domElements: testDOMElements(),
        themeToggle: testThemeToggle(),
        navigation: testNavigation(),
        ajax: testAjaxAvailability(),
        localStorage: testLocalStorage()
    };
    
    console.log('📊 Test Results:', results);
    
    const passedTests = Object.values(results).filter(result => result === true).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! The interface should be working.');
    } else {
        console.log('⚠️ Some tests failed. Check the specific errors above.');
    }
    
    return results;
}

// Wait for DOM to be ready, then run tests
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}