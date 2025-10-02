/**
 * Quick Start: What to Build in ServiceNow Studio
 * Scope: x_1447726_planni_0
 */

// 1. CREATE THESE TABLES IN STUDIO:

// Table 1: Planning Session
// Name: x_1447726_planni_0_planning_session
// Label: Planning Session
// Fields:
// - name (String) - Session name
// - description (String) - Session description  
// - facilitator (Reference to User) - Session facilitator
// - status (Choice) - active, completed, cancelled
// - created_date (Date/Time) - When session was created
// - scoring_method (Reference) - Link to scoring method

// Table 2: Planning Vote  
// Name: x_1447726_planni_0_planning_vote
// Label: Planning Vote
// Fields:
// - session (Reference) - Link to planning session
// - story (Reference) - Link to session story
// - voter (Reference to User) - Who voted
// - vote_value (String) - The vote (1, 2, 3, 5, 8, etc.)
// - vote_time (Date/Time) - When vote was cast

// Table 3: Session Stories
// Name: x_1447726_planni_0_session_stories  
// Label: Session Stories
// Fields:
// - session (Reference) - Link to planning session
// - story_title (String) - Story title
// - story_description (String) - Story details
// - story_points (String) - Final estimated points
// - status (Choice) - pending, voting, completed

// Table 4: Scoring Method
// Name: x_1447726_planni_0_scoring_method
// Label: Scoring Method  
// Fields:
// - name (String) - Method name (Fibonacci, T-shirt, etc.)
// - values (String) - Comma-separated values (1,2,3,5,8,13,21)
// - description (String) - Method description

// 2. CREATE THESE ROLES:
// - x_1447726_planni_0_voter
// - x_1447726_planni_0_facilitator  
// - x_1447726_planni_0_admin

gs.info("=== PLANNING POKER V2 BUILD CHECKLIST ===");
gs.info("✅ Create tables listed above in ServiceNow Studio");
gs.info("✅ Create roles for voter, facilitator, admin");
gs.info("✅ Run ACL permissions script");
gs.info("✅ Create basic UI page for voting");
gs.info("✅ Test functionality");
gs.info("✅ Export to GitHub when ready");