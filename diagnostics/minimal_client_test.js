// Minimal client script test to verify basic functionality
console.log('🔧 Minimal client script loaded');

// Test basic theme toggle
function setupBasicThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) {
        console.log('❌ Theme toggle button not found');
        return;
    }

    console.log('✅ Theme toggle button found, adding event listener');
    
    themeToggleBtn.addEventListener('click', function() {
        console.log('🎨 Theme toggle clicked');
        
        const isDark = document.documentElement.classList.contains('dark');
        
        if (isDark) {
            document.documentElement.classList.remove('dark');
            console.log('🌞 Switched to light mode');
        } else {
            document.documentElement.classList.add('dark');
            console.log('🌙 Switched to dark mode');
        }
    });
}

// Test basic navigation
function setupBasicNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    console.log(`🧭 Found ${navTabs.length} navigation tabs`);
    
    navTabs.forEach((tab, index) => {
        console.log(`Adding event listener to tab ${index}: ${tab.getAttribute('data-view')}`);
        
        tab.addEventListener('click', function() {
            const targetView = this.getAttribute('data-view');
            console.log(`📋 Tab clicked: ${targetView}`);
            
            // Update navigation
            document.querySelectorAll('.nav-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update views
            document.querySelectorAll('.view-section').forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(`${targetView}-view`);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log(`✅ Switched to view: ${targetView}`);
            } else {
                console.log(`❌ View section not found: ${targetView}-view`);
            }
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - initializing minimal test');
    
    setTimeout(function() {
        console.log('⏰ Running delayed initialization');
        setupBasicThemeToggle();
        setupBasicNavigation();
        console.log('✅ Minimal test initialization complete');
    }, 100);
});

console.log('📝 Minimal client script setup complete');