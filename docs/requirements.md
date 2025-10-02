# Planning Poker v2 - Requirements

## 🎯 Functional Requirements

### Core Features
1. **Session Management**
   - Create planning sessions with multiple stories
   - Assign facilitators and participants
   - Set session duration and voting rounds

2. **Story Point Estimation**
   - Import stories from external sources
   - Display story details during voting
   - Support multiple scoring methods (Fibonacci, T-shirt sizes, etc.)

3. **Interactive Voting**
   - Real-time voting interface
   - Hide votes until reveal
   - Show voting results and statistics
   - Support re-voting on stories

4. **Role-Based Access**
   - **Voters:** Participate in voting sessions
   - **Facilitators:** Create/manage sessions, control voting flow
   - **Admins:** Full system administration

### Technical Requirements
1. **ServiceNow Integration**
   - Scoped application (`x_1447726_planni_0`)
   - Responsive UI using ServiceNow UI framework
   - Real-time updates using GlideAjax or WebSockets

2. **Data Model**
   - Planning sessions table
   - Votes tracking table  
   - Stories/backlog items table
   - Scoring methods configuration table

3. **Security**
   - Role-based ACL permissions
   - Session access controls
   - Data validation and sanitization

## 🔧 Technical Architecture

### Tables Structure
- `x_1447726_planni_0_planning_session`
- `x_1447726_planni_0_planning_vote` 
- `x_1447726_planni_0_session_stories`
- `x_1447726_planni_0_scoring_method`

### Roles
- `x_1447726_planni_0_voter`
- `x_1447726_planni_0_facilitator` 
- `x_1447726_planni_0_admin`

### UI Components
- Session management dashboard
- Interactive voting interface
- Results and analytics view
- Administration panel