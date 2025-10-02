/**
 * Planning Poker Ajax Script Processor
 * Handles all AJAX requests from the voting interface
 */

var PlanningPokerAjax = Class.create();
PlanningPokerAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    /**
     * Get session data including facilitator info and scoring method
     */
    getSession: function() {
        var sessionId = this.getParameter('sysparm_session_id');
        if (!sessionId) {
            return this._error('Session ID required');
        }
        
        var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
        if (!sessionGR.get(sessionId)) {
            return this._error('Session not found');
        }
        
        // Check if current user is facilitator
        var isFacilitator = (gs.getUserID() === sessionGR.facilitator.toString());
        
        // Get scoring method details
        var scoringMethodGR = new GlideRecord('x_1447726_planni_0_scoring_method');
        var scoringMethodName = '';
        var scoringMethodValues = '';
        if (sessionGR.scoring_method && scoringMethodGR.get(sessionGR.scoring_method)) {
            scoringMethodName = scoringMethodGR.name.toString();
            scoringMethodValues = scoringMethodGR.values.toString();
        }
        
        var sessionData = {
            sys_id: sessionGR.sys_id.toString(),
            name: sessionGR.name.toString(),
            description: sessionGR.description.toString(),
            status: sessionGR.status.toString(),
            facilitator_name: sessionGR.facilitator.getDisplayValue(),
            scoring_method_name: scoringMethodName,
            scoring_method_values: scoringMethodValues,
            is_facilitator: isFacilitator
        };
        
        return JSON.stringify(sessionData);
    },
    
    /**
     * Get participants for the session
     */
    getParticipants: function() {
        var sessionId = this.getParameter('sysparm_session_id');
        if (!sessionId) {
            return this._error('Session ID required');
        }
        
        // Get all users with voter role (simplified - in reality you might have session participants table)
        var userGR = new GlideRecord('sys_user');
        userGR.addQuery('active', true);
        userGR.addQuery('roles', 'CONTAINS', 'x_1447726_planni_0_voter');
        userGR.query();
        
        var participants = [];
        while (userGR.next()) {
            participants.push({
                sys_id: userGR.sys_id.toString(),
                name: userGR.getDisplayValue()
            });
        }
        
        return JSON.stringify(participants);
    },
    
    /**
     * Get current story being voted on
     */
    getCurrentStory: function() {
        var sessionId = this.getParameter('sysparm_session_id');
        if (!sessionId) {
            return this._error('Session ID required');
        }
        
        var storyGR = new GlideRecord('x_1447726_planni_0_session_stories');
        storyGR.addQuery('session', sessionId);
        storyGR.addQuery('status', 'IN', 'pending,voting');
        storyGR.orderBy('order');
        storyGR.setLimit(1);
        storyGR.query();
        
        if (!storyGR.next()) {
            return JSON.stringify(null);
        }
        
        var storyData = {
            sys_id: storyGR.sys_id.toString(),
            story_number: storyGR.story_number.toString(),
            story_title: storyGR.story_title.toString(),
            story_description: storyGR.story_description.toString(),
            acceptance_criteria: storyGR.acceptance_criteria.toString(),
            status: storyGR.status.toString(),
            story_points: storyGR.story_points.toString()
        };
        
        return JSON.stringify(storyData);
    },
    
    /**
     * Cast a vote for the current user
     */
    castVote: function() {
        var storyId = this.getParameter('sysparm_story_id');
        var voteValue = this.getParameter('sysparm_vote_value');
        var currentUserId = gs.getUserID();
        
        if (!storyId || !voteValue) {
            return this._error('Story ID and vote value required');
        }
        
        // Verify story is in voting status
        var storyGR = new GlideRecord('x_1447726_planni_0_session_stories');
        if (!storyGR.get(storyId) || storyGR.status != 'voting') {
            return this._error('Story not available for voting');
        }
        
        // Check if user already voted (update if exists)
        var voteGR = new GlideRecord('x_1447726_planni_0_planning_vote');
        voteGR.addQuery('story', storyId);
        voteGR.addQuery('voter', currentUserId);
        voteGR.query();
        
        if (voteGR.next()) {
            // Update existing vote
            voteGR.vote_value = voteValue;
            voteGR.vote_time = new GlideDateTime();
            voteGR.update();
        } else {
            // Create new vote
            voteGR = new GlideRecord('x_1447726_planni_0_planning_vote');
            voteGR.session = storyGR.session;
            voteGR.story = storyId;
            voteGR.voter = currentUserId;
            voteGR.vote_value = voteValue;
            voteGR.vote_time = new GlideDateTime();
            voteGR.insert();
        }
        
        return 'success';
    },
    
    /**
     * Get votes for a story
     */
    getVotes: function() {
        var storyId = this.getParameter('sysparm_story_id');
        var currentUserId = gs.getUserID();
        
        if (!storyId) {
            return this._error('Story ID required');
        }
        
        // Check if voting is revealed (simple check - you might want more sophisticated logic)
        var storyGR = new GlideRecord('x_1447726_planni_0_session_stories');
        storyGR.get(storyId);
        var isRevealed = (storyGR.status == 'completed');
        
        var voteGR = new GlideRecord('x_1447726_planni_0_planning_vote');
        voteGR.addQuery('story', storyId);
        voteGR.query();
        
        var votes = {};
        var myVote = null;
        
        while (voteGR.next()) {
            var voterId = voteGR.voter.toString();
            votes[voterId] = voteGR.vote_value.toString();
            
            if (voterId === currentUserId) {
                myVote = voteGR.vote_value.toString();
            }
        }
        
        return JSON.stringify({
            votes: votes,
            my_vote: myVote,
            is_revealed: isRevealed
        });
    },
    
    /**
     * Start voting on a story (facilitator only)
     */
    startVoting: function() {
        var storyId = this.getParameter('sysparm_story_id');
        
        if (!this._isFacilitator(storyId)) {
            return this._error('Only facilitators can start voting');
        }
        
        var storyGR = new GlideRecord('x_1447726_planni_0_session_stories');
        if (!storyGR.get(storyId)) {
            return this._error('Story not found');
        }
        
        storyGR.status = 'voting';
        storyGR.voting_started = new GlideDateTime();
        storyGR.update();
        
        return 'success';
    },
    
    /**
     * Reveal votes (facilitator only)
     */
    revealVotes: function() {
        var storyId = this.getParameter('sysparm_story_id');
        
        if (!this._isFacilitator(storyId)) {
            return this._error('Only facilitators can reveal votes');
        }
        
        var storyGR = new GlideRecord('x_1447726_planni_0_session_stories');
        if (!storyGR.get(storyId)) {
            return this._error('Story not found');
        }
        
        storyGR.status = 'completed';
        storyGR.voting_completed = new GlideDateTime();
        storyGR.update();
        
        return 'success';
    },
    
    /**
     * Reset voting for a story (facilitator only)
     */
    resetVoting: function() {
        var storyId = this.getParameter('sysparm_story_id');
        
        if (!this._isFacilitator(storyId)) {
            return this._error('Only facilitators can reset voting');
        }
        
        // Delete all votes for this story
        var voteGR = new GlideRecord('x_1447726_planni_0_planning_vote');
        voteGR.addQuery('story', storyId);
        voteGR.deleteMultiple();
        
        // Reset story status
        var storyGR = new GlideRecord('x_1447726_planni_0_session_stories');
        if (storyGR.get(storyId)) {
            storyGR.status = 'pending';
            storyGR.voting_started = '';
            storyGR.voting_completed = '';
            storyGR.update();
        }
        
        return 'success';
    },
    
    /**
     * Move to next story (facilitator only)
     */
    nextStory: function() {
        var sessionId = this.getParameter('sysparm_session_id');
        
        if (!sessionId) {
            return this._error('Session ID required');
        }
        
        // Find current story
        var currentStoryGR = new GlideRecord('x_1447726_planni_0_session_stories');
        currentStoryGR.addQuery('session', sessionId);
        currentStoryGR.addQuery('status', 'IN', 'voting,completed');
        currentStoryGR.orderBy('order');
        currentStoryGR.query();
        
        if (currentStoryGR.next()) {
            // Mark current story as completed if it's still voting
            if (currentStoryGR.status == 'voting') {
                currentStoryGR.status = 'completed';
                currentStoryGR.update();
            }
            
            // Find next story
            var nextStoryGR = new GlideRecord('x_1447726_planni_0_session_stories');
            nextStoryGR.addQuery('session', sessionId);
            nextStoryGR.addQuery('status', 'pending');
            nextStoryGR.addQuery('order', '>', currentStoryGR.order);
            nextStoryGR.orderBy('order');
            nextStoryGR.setLimit(1);
            nextStoryGR.query();
            
            if (nextStoryGR.next()) {
                return nextStoryGR.sys_id.toString();
            }
        }
        
        return 'no_more_stories';
    },
    
    /**
     * Helper: Check if current user is facilitator for the session
     */
    _isFacilitator: function(storyId) {
        var storyGR = new GlideRecord('x_1447726_planni_0_session_stories');
        if (!storyGR.get(storyId)) {
            return false;
        }
        
        var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
        if (!sessionGR.get(storyGR.session)) {
            return false;
        }
        
        return (gs.getUserID() === sessionGR.facilitator.toString());
    },
    
    /**
     * Helper: Return error message
     */
    _error: function(message) {
        return JSON.stringify({error: message});
    },
    
    type: 'PlanningPokerAjax'
});