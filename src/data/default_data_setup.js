/**
 * Default Data Setup for Planning Poker v2
 * Run this script to populate initial scoring methods and sample data
 */

gs.info("=== CREATING DEFAULT DATA FOR PLANNING POKER V2 ===");

// 1. Create Default Scoring Methods
var scoringMethods = [
    {
        name: "Fibonacci",
        description: "Standard Fibonacci sequence used in agile estimation",
        values: "0,1,2,3,5,8,13,21,34,55,89,?",
        is_default: true,
        active: true,
        allow_custom_values: false
    },
    {
        name: "Modified Fibonacci", 
        description: "Modified Fibonacci with half points",
        values: "0,0.5,1,2,3,5,8,13,20,40,100,?",
        is_default: false,
        active: true,
        allow_custom_values: false
    },
    {
        name: "T-Shirt Sizes",
        description: "Simple T-shirt sizing for high-level estimates", 
        values: "XS,S,M,L,XL,XXL,?",
        is_default: false,
        active: true,
        allow_custom_values: false
    },
    {
        name: "Powers of 2",
        description: "Powers of 2 sequence", 
        values: "0,1,2,4,8,16,32,64,?",
        is_default: false,
        active: true,
        allow_custom_values: false
    },
    {
        name: "Linear",
        description: "Simple linear sequence",
        values: "1,2,3,4,5,6,7,8,9,10,?",
        is_default: false,
        active: true,
        allow_custom_values: true
    }
];

gs.info("\nCreating scoring methods...");
scoringMethods.forEach(function(method) {
    // Check if method already exists
    var existingGR = new GlideRecord('x_1447726_planni_0_scoring_method');
    existingGR.addQuery('name', method.name);
    existingGR.query();
    
    if (!existingGR.next()) {
        var methodGR = new GlideRecord('x_1447726_planni_0_scoring_method');
        methodGR.name = method.name;
        methodGR.description = method.description;
        methodGR.values = method.values;
        methodGR.is_default = method.is_default;
        methodGR.active = method.active;
        methodGR.allow_custom_values = method.allow_custom_values;
        
        var sysId = methodGR.insert();
        gs.info("✅ Created scoring method: " + method.name + " (" + sysId + ")");
    } else {
        gs.info("⏭️  Scoring method already exists: " + method.name);
    }
});

// 2. Create Sample Session (optional)
gs.info("\nCreating sample session...");

// Get default scoring method
var fibonacciGR = new GlideRecord('x_1447726_planni_0_scoring_method');
fibonacciGR.addQuery('name', 'Fibonacci');
fibonacciGR.query();

if (fibonacciGR.next()) {
    // Check if sample session already exists
    var existingSessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
    existingSessionGR.addQuery('name', 'Sample Planning Session');
    existingSessionGR.query();
    
    if (!existingSessionGR.next()) {
        var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
        sessionGR.name = "Sample Planning Session";
        sessionGR.description = "This is a sample planning session for testing";
        sessionGR.facilitator = gs.getUserID(); // Current user as facilitator
        sessionGR.status = "active";
        sessionGR.scoring_method = fibonacciGR.sys_id;
        
        var sessionId = sessionGR.insert();
        gs.info("✅ Created sample session: " + sessionId);
        
        // 3. Create Sample Stories
        var sampleStories = [
            {
                story_number: "USER-001",
                story_title: "User Login Functionality",
                story_description: "As a user, I want to log in to the system so that I can access my account",
                acceptance_criteria: "- User can enter username and password\n- System validates credentials\n- User is redirected to dashboard on success\n- Error message shown on failure",
                order: 100
            },
            {
                story_number: "USER-002", 
                story_title: "Password Reset",
                story_description: "As a user, I want to reset my password so that I can regain access if I forget it",
                acceptance_criteria: "- User can request password reset via email\n- Reset link expires after 24 hours\n- User can set new password\n- Old password is invalidated",
                order: 200
            },
            {
                story_number: "USER-003",
                story_title: "User Profile Management", 
                story_description: "As a user, I want to manage my profile information so that I can keep my details up to date",
                acceptance_criteria: "- User can view current profile\n- User can edit name, email, phone\n- Changes are validated\n- Profile is updated in real-time",
                order: 300
            }
        ];
        
        gs.info("\nCreating sample stories...");
        sampleStories.forEach(function(story) {
            var storyGR = new GlideRecord('x_1447726_planni_0_session_stories');
            storyGR.session = sessionId;
            storyGR.story_number = story.story_number;
            storyGR.story_title = story.story_title;
            storyGR.story_description = story.story_description;
            storyGR.acceptance_criteria = story.acceptance_criteria;
            storyGR.status = "pending";
            storyGR.order = story.order;
            
            var storyId = storyGR.insert();
            gs.info("✅ Created sample story: " + story.story_title + " (" + storyId + ")");
        });
        
    } else {
        gs.info("⏭️  Sample session already exists");
    }
}

gs.info("\n=== DEFAULT DATA CREATION COMPLETE ===");
gs.info("✅ Scoring methods created");
gs.info("✅ Sample session and stories created");
gs.info("🎯 Ready to start Planning Poker sessions!");

// 4. Verify setup
gs.info("\n--- VERIFICATION ---");

// Count scoring methods
var methodCount = new GlideRecord('x_1447726_planni_0_scoring_method');
methodCount.query();
gs.info("Scoring methods available: " + methodCount.getRowCount());

// Count sessions
var sessionCount = new GlideRecord('x_1447726_planni_0_planning_session');
sessionCount.query();
gs.info("Planning sessions: " + sessionCount.getRowCount());

// Count stories
var storyCount = new GlideRecord('x_1447726_planni_0_session_stories');
storyCount.query();
gs.info("Session stories: " + storyCount.getRowCount());