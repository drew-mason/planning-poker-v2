/**
 * Planning Poker Ajax Script Processor - Updated for user-specific sessions
 * Handles all AJAX requests from the unified planning poker interface
 *
 * @type {ScriptInclude}
 * @name PlanningPokerAjax
 * @scope x_1447726_planni_0
 * @description Unified Planning Poker AJAX processor for all interface operations
 */

var PlanningPokerAjax = Class.create();
PlanningPokerAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    /**
     * Get current user information
     */
    getCurrentUser: function() {
        try {
            var user = gs.getUser();

            // More defensive - check if user methods exist
            if (!user) {
                gs.error('PlanningPokerAjax.getCurrentUser: gs.getUser() returned null');
                return JSON.stringify({
                    sys_id: gs.getUserID() || 'unknown',
                    user_name: gs.getUserName() || 'unknown',
                    display_name: gs.getUserDisplayName() || 'User',
                    email: ''
                });
            }

            var userData = {
                sys_id: user.getID() || gs.getUserID() || 'unknown',
                user_name: user.getUserName() || gs.getUserName() || 'unknown',
                display_name: user.getDisplayName() || gs.getUserDisplayName() || 'User',
                email: user.getEmail() || ''
            };

            gs.info('PlanningPokerAjax.getCurrentUser: Returning user data for ' + userData.user_name);

            return JSON.stringify(userData);
        } catch (e) {
            gs.error('PlanningPokerAjax.getCurrentUser: Error - ' + e.message);
            // Return fallback data
            return JSON.stringify({
                sys_id: gs.getUserID() || 'unknown',
                user_name: gs.getUserName() || 'unknown',
                display_name: gs.getUserDisplayName() || 'User',
                email: ''
            });
        }
    },

    /**
     * Get all active groups for group selection
     */
    getAllGroups: function() {
        var groupGR = new GlideRecord('sys_user_group');
        groupGR.addQuery('active', true);
        groupGR.orderBy('name');
        groupGR.setLimit(100); // Limit for performance
        groupGR.query();
        
        var groups = [];
        while (groupGR.next()) {
            groups.push({
                sys_id: groupGR.sys_id.toString(),
                name: groupGR.name.toString(),
                description: groupGR.description.toString() || '',
                type: groupGR.type.toString() || ''
            });
        }
        
        return JSON.stringify({
            success: true,
            groups: groups
        });
    },
    
    /**
     * Get all users for participant selection
     */
    getAllUsers: function() {
        var userGR = new GlideRecord('sys_user');
        userGR.addQuery('active', true);
        userGR.addQuery('user_name', '!=', 'guest');
        userGR.addQuery('user_name', '!=', 'admin');
        userGR.orderBy('name');
        userGR.setLimit(50); // Limit for performance
        userGR.query();
        
        var users = [];
        while (userGR.next()) {
            users.push({
                sys_id: userGR.sys_id.toString(),
                name: userGR.name.toString(),
                email: userGR.email.toString(),
                user_name: userGR.user_name.toString()
            });
        }
        
        return JSON.stringify({
            success: true,
            users: users
        });
    },
    
    /**
     * Get all available scoring methods
     */
    getScoringMethods: function() {
        var scoringGR = new GlideRecord('x_1447726_planni_0_scoring_method');
        scoringGR.addQuery('active', true);
        scoringGR.orderBy('name');
        scoringGR.query();
        
        var methods = [];
        while (scoringGR.next()) {
            methods.push({
                value: scoringGR.sys_id.toString(),
                label: scoringGR.name.toString() + ' (' + scoringGR.values.toString() + ')',
                values: scoringGR.values.toString(),
                description: scoringGR.description.toString()
            });
        }
        
        return JSON.stringify({
            success: true,
            methods: methods
        });
    },
    
    /**
     * Get sessions available to the current user
     * Returns sessions where user is facilitator or participant
     * Accepts optional filter parameter: 'active' (in_session only) or 'completed' (complete only)
     */
    getAllSessions: function() {
        var currentUserId = gs.getUserID();
        var filter = this.getParameter('sysparm_filter') || 'active'; // 'active' or 'completed'
        var sessions = [];

        // Determine state filter based on filter parameter
        var stateFilter = (filter === 'completed') ? 'complete' : 'in_session';
        
        // Get sessions where user is facilitator
        var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
        sessionGR.addQuery('status', '!=', 'closed');
        sessionGR.addQuery('facilitator', currentUserId);

        // Apply state filter
        if (filter === 'completed') {
            sessionGR.addQuery('state', 'complete');
        } else {
            // For active filter, show in_session and draft for facilitators
            sessionGR.addQuery('state', 'IN', 'draft,in_session');
        }
        
        sessionGR.orderByDesc('sys_created_on');
        sessionGR.query();

        while (sessionGR.next()) {
            sessions.push(this._buildSessionObject(sessionGR, true));
        }
        
        // Get sessions where user is a participant
        var participantGR = new GlideRecord('x_1447726_planni_0_session_participant');
        participantGR.addQuery('user', currentUserId);
        participantGR.query();
        
        while (participantGR.next()) {
            var sessionId = participantGR.session.toString();

            // Check if we already added this session (as facilitator)
            var alreadyAdded = false;
            for (var i = 0; i < sessions.length; i++) {
                if (sessions[i].sys_id === sessionId) {
                    alreadyAdded = true;
                    break;
                }
            }

            if (!alreadyAdded) {
                var session = new GlideRecord('x_1447726_planni_0_planning_session');
                if (session.get(sessionId) && session.status.toString() !== 'closed') {
                    // For participants (non-facilitators), only show in_session state
                    if (session.facilitator.toString() !== currentUserId) {
                        // Participant/voter - only show in_session
                        if (session.getValue('state') === 'in_session') {
                            sessions.push(this._buildSessionObject(session, false));
                        }
                    } else {
                        // Apply facilitator filter
                        var sessionState = session.getValue('state') || 'draft';
                        if (filter === 'completed' && sessionState === 'complete') {
                            sessions.push(this._buildSessionObject(session, false));
                        } else if (filter !== 'completed' && (sessionState === 'in_session' || sessionState === 'draft')) {
                            sessions.push(this._buildSessionObject(session, false));
                        }
                    }
                }
            }
        }
        
        return JSON.stringify({
            success: true,
            sessions: sessions
        });
    },
    
    /**
     * Build session object with all necessary data
     */
    _buildSessionObject: function(sessionGR, isFacilitator) {
        var currentUserId = gs.getUserID();
        
        // Count participants
        var participantCount = this._getParticipantCount(sessionGR.sys_id.toString());

        // Get scoring method name
        var scoringMethodName = 'Unknown';
        if (sessionGR.scoring_method) {
            var scoringGR = new GlideRecord('x_1447726_planni_0_scoring_method');
            if (scoringGR.get(sessionGR.scoring_method)) {
                scoringMethodName = scoringGR.name.toString();
            }
        }
        
        // Check if user can edit (facilitator or dealer)
        var canEdit = isFacilitator || sessionGR.facilitator.toString() === currentUserId;
        
        return {
            sys_id: sessionGR.sys_id.toString(),
            session_code: sessionGR.session_code.toString(),
            title: sessionGR.name.toString(),
            description: sessionGR.description.toString(),
            status: sessionGR.status.toString(),
            state: sessionGR.getValue('state') || 'draft',
            active: sessionGR.getValue('active') === 'true' || sessionGR.getValue('active') === '1',
            created_by_name: sessionGR.facilitator.getDisplayValue(),
            facilitator_id: sessionGR.facilitator.toString(),
            scoring_method_name: scoringMethodName,
            participant_count: participantCount,
            story_count: this._getStoryCount(sessionGR.sys_id.toString()),
            sys_created_on: sessionGR.sys_created_on.getDisplayValue(),
            can_edit: canEdit
        };
    },

    /**
     * Check if current user is a facilitator for any sessions
     */
    isFacilitator: function() {
        var currentUserId = gs.getUserID();
        
        var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
        sessionGR.addQuery('facilitator', currentUserId);
        sessionGR.addQuery('status', '!=', 'closed');
        sessionGR.setLimit(1);
        sessionGR.query();
        
        return JSON.stringify({
            success: true,
            is_facilitator: sessionGR.hasNext()
        });
    },

    /**
     * Create a new planning session
     */
    createSession: function() {
        var sessionDataStr = this.getParameter('sysparm_session_data');
        if (!sessionDataStr) {
            return this._errorResponse('Session data required');
        }

        try {
            var sessionData = JSON.parse(sessionDataStr);

            // Generate unique session code
            var sessionCode = this._generateSessionCode();
            
            var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
            sessionGR.initialize();
            sessionGR.name = sessionData.title || 'New Session';
            sessionGR.description = sessionData.description || '';
            sessionGR.session_code = sessionCode;
            sessionGR.facilitator = gs.getUserID();
            sessionGR.scoring_method = sessionData.scoring_method;
            sessionGR.status = 'active';
            var sessionId = sessionGR.insert();

            if (sessionId) {
                // Create participant records from groups if provided
                if (sessionData.groups && sessionData.groups.length > 0) {
                    this._createSessionParticipantsFromGroups(sessionId, sessionData.groups);
                }
                // Or create from individual participants
                else if (sessionData.participants && sessionData.participants.length > 0) {
                    this._createSessionParticipants(sessionId, sessionData.participants);
                }

                // Get the created session with populated fields
                sessionGR.get(sessionId);

                var createdSession = {
                    sys_id: sessionGR.sys_id.toString(),
                    session_code: sessionGR.session_code.toString(),
                    title: sessionGR.name.toString(),
                    description: sessionGR.description.toString(),
                    status: sessionGR.status.toString(),
                    facilitator_name: sessionGR.facilitator.getDisplayValue(),
                    scoring_method: sessionGR.scoring_method.toString(),
                    scoring_method_name: sessionGR.scoring_method.getDisplayValue(),
                    can_edit: true
                };

                return JSON.stringify({
                    success: true,
                    session: createdSession,
                    role: 'facilitator',
                    message: 'Session created successfully'
                });
            } else {
                return this._errorResponse('Failed to create session');
            }
        } catch (e) {
            return this._errorResponse('Invalid session data: ' + e.message);
        }
    },

    /**
     * Join an existing session by sys_id
     */
    joinSession: function() {
        var sessionId = this.getParameter('sysparm_session_id');
        if (!sessionId) {
            return this._errorResponse('Session ID required');
        }
        
        var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
        if (!sessionGR.get(sessionId)) {
            return this._errorResponse('Session not found');
        }

        if (sessionGR.status.toString() === 'closed') {
            return this._errorResponse('Session has ended');
        }

        // Determine user role
        var currentUserId = gs.getUserID();
        var role = 'voter'; // default role

        if (currentUserId === sessionGR.facilitator.toString()) {
            role = 'facilitator';
        } else if (gs.hasRole('x_1447726_planni_0_observer')) {
            role = 'observer';
        }

        var sessionData = {
            sys_id: sessionGR.sys_id.toString(),
            session_code: sessionGR.session_code.toString(),
            session_name: sessionGR.name.toString(),
            description: sessionGR.description.toString(),
            status: sessionGR.status.toString(),
            facilitator_name: sessionGR.facilitator.getDisplayValue(),
            scoring_method: sessionGR.scoring_method.toString(),
            scoring_method_name: sessionGR.scoring_method.getDisplayValue(),
            voting_status: this._getVotingStatus(sessionGR.sys_id.toString())
        };

        return JSON.stringify({
            success: true,
            session: sessionData,
            role: role
        });
    },
    
    /**
     * Get comprehensive session data for active monitoring
     */
    getSessionData: function() {
        var sessionId = this.getParameter('sysparm_session_id');
        if (!sessionId) {
            return this._errorResponse('Session ID required');
        }
        
        var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
        if (!sessionGR.get(sessionId)) {
            return this._errorResponse('Session not found');
        }
        
        // Get current story
        var currentStory = this._getCurrentStory(sessionId);
        
        // Get participants
        var participants = this._getSessionParticipants(sessionId);

        // Get voting status
        var votingStatus = this._getVotingStatus(sessionId);

        var sessionData = {
            session: {
                sys_id: sessionGR.sys_id.toString(),
                session_code: sessionGR.session_code.toString(),
                session_name: sessionGR.name.toString(),
                description: sessionGR.description.toString(),
                status: sessionGR.status.toString(),
                facilitator_name: sessionGR.facilitator.getDisplayValue(),
                scoring_method: sessionGR.scoring_method.toString(),
                scoring_method_name: sessionGR.scoring_method.getDisplayValue(),
                voting_status: votingStatus
            },
            current_story: currentStory,
            participants: participants
        };

        return JSON.stringify(sessionData);
    },
    
    /**
     * Get scoring values for a scoring method
     */
    getScoringValues: function() {
        var scoringMethodId = this.getParameter('sysparm_scoring_method_id');
        if (!scoringMethodId) {
            return this._errorResponse('Scoring method ID required');
        }
        
        var scoringGR = new GlideRecord('x_1447726_planni_0_scoring_method');
        if (!scoringGR.get(scoringMethodId)) {
            return this._errorResponse('Scoring method not found');
        }
        
        // Parse values (assuming comma-separated format like "1,2,3,5,8,13,21,?")
        var valuesStr = scoringGR.values.toString();
        var valueArray = valuesStr.split(',');

        var values = [];
        for (var i = 0; i < valueArray.length; i++) {
            var value = valueArray[i].trim();
            if (value) {
                values.push({
                    value: value,
                    display_value: value
                });
            }
        }
        
        return JSON.stringify(values);
    },

    /**
     * Get session participants
     */
    getSessionParticipants: function() {
        var sessionId = this.getParameter('sysparm_session_id');
        if (!sessionId) {
            return this._errorResponse('Session ID required');
        }
        
        var participants = this._getSessionParticipants(sessionId);
        return JSON.stringify(participants);
    },
    
    /**
     * Start voting (facilitator only)
     */
    startVoting: function() {
        var sessionId = this.getParameter('sysparm_session_id');
        
        if (!this._isFacilitator(sessionId)) {
            return this._errorResponse('Only facilitators can start voting');
        }
        
        // For now, we'll just return success
        // In a full implementation, you might update session status or story status
        return JSON.stringify({
            success: true,
            message: 'Voting started successfully'
        });
    },

    /**
     * Reveal votes (facilitator only)
     */
    revealVotes: function() {
        var sessionId = this.getParameter('sysparm_session_id');

        if (!this._isFacilitator(sessionId)) {
            return this._errorResponse('Only facilitators can reveal votes');
        }

        // Get voting results
        var results = this._calculateVotingResults(sessionId);

        return JSON.stringify({
            success: true,
            results: results,
            message: 'Votes revealed successfully'
        });
    },

    /**
     * Reset voting (facilitator only)
     */
    resetVoting: function() {
        var sessionId = this.getParameter('sysparm_session_id');
        
        if (!this._isFacilitator(sessionId)) {
            return this._errorResponse('Only facilitators can reset voting');
        }
        
        // Clear votes for current story (simplified implementation)
        // In reality, you'd clear votes from a votes table

        return JSON.stringify({
            success: true,
            message: 'Voting reset successfully'
        });
    },
    
    /**
     * Move to next story (facilitator only)
     */
    nextStory: function() {
        var sessionId = this.getParameter('sysparm_session_id');
        
        if (!this._isFacilitator(sessionId)) {
            return this._errorResponse('Only facilitators can move to next story');
        }
        
        return JSON.stringify({
            success: true,
            message: 'Moved to next story successfully'
        });
    },

    /**
     * Submit a vote
     */
    submitVote: function() {
        var sessionId = this.getParameter('sysparm_session_id');
        var voteValue = this.getParameter('sysparm_vote_value');

        if (!sessionId || !voteValue) {
            return this._errorResponse('Session ID and vote value required');
        }

        // For now, we'll just return success
        // In a full implementation, you'd save the vote to a votes table
        
        return JSON.stringify({
            success: true,
            message: 'Vote submitted successfully'
        });
    },

    // ==================== HELPER METHODS ====================

    /**
     * Get participant count for a session
     */
    _getParticipantCount: function(sessionId) {
        var participantGR = new GlideRecord('x_1447726_planni_0_session_participant');
        participantGR.addQuery('session', sessionId);
        participantGR.query();
        return participantGR.getRowCount();
    },

    /**
     * Get story count for a session
     */
    _getStoryCount: function(sessionId) {
        var storyGR = new GlideRecord('x_1447726_planni_0_user_story');
        storyGR.addQuery('session', sessionId);
        storyGR.query();
        return storyGR.getRowCount();
    },

    /**
     * Create session participants from groups
     */
    _createSessionParticipantsFromGroups: function(sessionId, groups) {
        try {
            for (var i = 0; i < groups.length; i++) {
                var groupId = groups[i].group_id || groups[i];

                // Get all users in the group
                var groupMemberGR = new GlideRecord('sys_user_grmember');
                groupMemberGR.addQuery('group', groupId);
                groupMemberGR.query();

                while (groupMemberGR.next()) {
                    var userId = groupMemberGR.user.toString();

                    // Check if participant already exists (avoid duplicates)
                    var existingGR = new GlideRecord('x_1447726_planni_0_session_participant');
                    existingGR.addQuery('session', sessionId);
                    existingGR.addQuery('user', userId);
                    existingGR.query();

                    if (!existingGR.hasNext()) {
                        var participantGR = new GlideRecord('x_1447726_planni_0_session_participant');
                        participantGR.initialize();
                        participantGR.session = sessionId;
                        participantGR.user = userId;
                        participantGR.role = 'voter';
                        participantGR.insert();
                    }
                }
            }
        } catch (e) {
            gs.error('Error creating session participants from groups: ' + e.message);
        }
    },

    /**
     * Create session participants
     */
    _createSessionParticipants: function(sessionId, participants) {
        try {
            for (var i = 0; i < participants.length; i++) {
                var participant = participants[i];
                var participantGR = new GlideRecord('x_1447726_planni_0_session_participant');
                participantGR.initialize();
                participantGR.session = sessionId;
                participantGR.user = participant.user_id;
                participantGR.role = participant.role;
                participantGR.insert();
            }
        } catch (e) {
            gs.error('Error creating session participants: ' + e.message);
        }
    },

    /**
     * Get session participants
     */
    _getSessionParticipants: function(sessionId) {
        var participants = [];

        // Get facilitator from session
        var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
        if (sessionGR.get(sessionId)) {
            participants.push({
                sys_id: sessionGR.facilitator.toString(),
                user_id: sessionGR.facilitator.toString(),
                user_name: sessionGR.facilitator.getDisplayValue(),
                role: 'facilitator',
                has_voted: false
            });
        }

        // Get other participants from participants table
        var participantGR = new GlideRecord('x_1447726_planni_0_session_participant');
        participantGR.addQuery('session', sessionId);
        participantGR.query();
        
        while (participantGR.next()) {
            // Skip if this is the facilitator (already added above)
            if (participantGR.user.toString() === sessionGR.facilitator.toString()) {
                continue;
            }

            participants.push({
                sys_id: participantGR.sys_id.toString(),
                user_id: participantGR.user.toString(),
                user_name: participantGR.user.getDisplayValue(),
                role: participantGR.role.toString(),
                has_voted: this._hasUserVoted(sessionId, participantGR.user.toString())
            });
        }

        return participants;
    },
    
    /**
     * Check if user has voted in current story
     */
    _hasUserVoted: function(sessionId, userId) {
        // Simplified - in a full implementation, you'd check the votes table
        // for the current story and this user
        return Math.random() > 0.5;
    },

    /**
     * Get current story for session
     */
    _getCurrentStory: function(sessionId) {
        // Simplified implementation - return sample story
        return {
            sys_id: 'story_001',
            story_title: 'User Authentication System',
            story_description: 'As a user, I want to be able to log in securely so that I can access my personal dashboard.',
            status: 'voting'
        };
    },

    /**
     * Get voting status for session
     */
    _getVotingStatus: function(sessionId) {
        // Simplified - return random status
        var statuses = ['waiting', 'active', 'revealed'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    },

    /**
     * Calculate voting results
     */
    _calculateVotingResults: function(sessionId) {
        // Simplified implementation - return sample results
        var votes = [3, 5, 5, 8, 5, 3];
        var sum = votes.reduce(function(a, b) { return a + b; }, 0);
        var average = (sum / votes.length).toFixed(1);

        // Calculate median
        var sortedVotes = votes.slice().sort(function(a, b) { return a - b; });
        var median = sortedVotes[Math.floor(sortedVotes.length / 2)];

        // Check consensus (simplified - all votes within 2 points)
        var min = Math.min.apply(Math, votes);
        var max = Math.max.apply(Math, votes);
        var consensus = (max - min) <= 2;

        return {
            votes: votes,
            summary: {
                average: average,
                median: median,
                consensus: consensus,
                total_votes: votes.length
            }
        };
    },

    /**
     * Generate unique session code
     */
    _generateSessionCode: function() {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var code = '';
        for (var i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    /**
     * Check if current user is facilitator for the session
     */
    _isFacilitator: function(sessionId) {
        if (!sessionId) return false;
        
        var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
        if (!sessionGR.get(sessionId)) {
            return false;
        }
        
        return (gs.getUserID() === sessionGR.facilitator.toString());
    },
    
    /**
     * Return error response
     */
    _errorResponse: function(message) {
        return JSON.stringify({
            success: false,
            message: message
        });
    },
    
    type: 'PlanningPokerAjax'
});