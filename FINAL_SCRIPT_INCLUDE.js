var PlanningPokerAjax = Class.create();
PlanningPokerAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getCurrentUser: function() {
        try {
            var user = gs.getUser();
            return JSON.stringify({
                success: true,
                user: {
                    sys_id: user.getID(),
                    name: user.getDisplayName(),
                    user_name: user.getName()
                }
            });
        } catch (e) {
            gs.error('PlanningPoker getCurrentUser error: ' + e.message);
            return JSON.stringify({
                success: false,
                error: 'Failed to get current user: ' + e.message
            });
        }
    },

    getScoringMethods: function() {
        try {
            var methods = [];
            var gr = new GlideRecord('x_1447726_planni_0_scoring_method');
            gr.addActiveQuery();
            gr.orderBy('name');
            gr.query();
            
            while (gr.next()) {
                methods.push({
                    sys_id: gr.getUniqueValue(),
                    name: gr.getValue('name'),
                    values: gr.getValue('values')
                });
            }
            
            return JSON.stringify({
                success: true,
                methods: methods
            });
        } catch (e) {
            gs.error('PlanningPoker getScoringMethods error: ' + e.message);
            return JSON.stringify({
                success: false,
                error: 'Failed to get scoring methods: ' + e.message
            });
        }
    },

    createSession: function() {
        try {
            var sessionName = this.getParameter('session_name');
            var description = this.getParameter('description');
            var scoringMethodId = this.getParameter('scoring_method');
            
            if (!sessionName || !scoringMethodId) {
                return JSON.stringify({
                    success: false,
                    error: 'Session name and scoring method are required'
                });
            }
            
            var sessionGr = new GlideRecord('x_1447726_planni_0_planning_session');
            sessionGr.initialize();
            sessionGr.setValue('name', sessionName);
            sessionGr.setValue('description', description || '');
            sessionGr.setValue('scoring_method', scoringMethodId);
            sessionGr.setValue('facilitator', gs.getUserID());
            sessionGr.setValue('status', 'active');
            
            var sessionId = sessionGr.insert();
            
            if (sessionId) {
                // Add facilitator as participant
                this._addParticipant(sessionId, gs.getUserID(), 'scrum_master');
                
                return JSON.stringify({
                    success: true,
                    session: {
                        sys_id: sessionId,
                        name: sessionName,
                        description: description,
                        status: 'active'
                    }
                });
            } else {
                return JSON.stringify({
                    success: false,
                    error: 'Failed to create session'
                });
            }
        } catch (e) {
            gs.error('PlanningPoker createSession error: ' + e.message);
            return JSON.stringify({
                success: false,
                error: 'Failed to create session: ' + e.message
            });
        }
    },

    joinSession: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var role = this.getParameter('role') || 'developer';
            
            if (!sessionId) {
                return JSON.stringify({
                    success: false,
                    error: 'Session ID is required'
                });
            }
            
            // Check if session exists
            var sessionGr = new GlideRecord('x_1447726_planni_0_planning_session');
            if (!sessionGr.get(sessionId)) {
                return JSON.stringify({
                    success: false,
                    error: 'Session not found'
                });
            }
            
            // Check if user is already a participant
            var existingParticipant = new GlideRecord('x_1447726_planni_0_session_participant');
            existingParticipant.addQuery('session', sessionId);
            existingParticipant.addQuery('user', gs.getUserID());
            existingParticipant.addQuery('active', true);
            existingParticipant.query();
            
            if (existingParticipant.hasNext()) {
                return JSON.stringify({
                    success: false,
                    error: 'You are already participating in this session'
                });
            }
            
            // Add as participant
            var participantId = this._addParticipant(sessionId, gs.getUserID(), role);
            
            if (participantId) {
                return JSON.stringify({
                    success: true,
                    session: {
                        sys_id: sessionId,
                        name: sessionGr.getValue('name'),
                        description: sessionGr.getValue('description'),
                        status: sessionGr.getValue('status')
                    }
                });
            } else {
                return JSON.stringify({
                    success: false,
                    error: 'Failed to join session'
                });
            }
        } catch (e) {
            gs.error('PlanningPoker joinSession error: ' + e.message);
            return JSON.stringify({
                success: false,
                error: 'Failed to join session: ' + e.message
            });
        }
    },

    getSessionDetails: function() {
        try {
            var sessionId = this.getParameter('session_id');
            
            if (!sessionId) {
                return JSON.stringify({
                    success: false,
                    error: 'Session ID is required'
                });
            }
            
            var sessionGr = new GlideRecord('x_1447726_planni_0_planning_session');
            if (!sessionGr.get(sessionId)) {
                return JSON.stringify({
                    success: false,
                    error: 'Session not found'
                });
            }
            
            // Get participants
            var participants = [];
            var partGr = new GlideRecord('x_1447726_planni_0_session_participant');
            partGr.addQuery('session', sessionId);
            partGr.addQuery('active', true);
            partGr.query();
            
            while (partGr.next()) {
                var userGr = new GlideRecord('sys_user');
                if (userGr.get(partGr.getValue('user'))) {
                    participants.push({
                        sys_id: partGr.getUniqueValue(),
                        user_id: userGr.getUniqueValue(),
                        user_name: userGr.getValue('name'),
                        display_name: userGr.getDisplayValue(),
                        role: partGr.getValue('role')
                    });
                }
            }
            
            // Get user stories
            var stories = [];
            var storyGr = new GlideRecord('x_1447726_planni_0_user_story');
            storyGr.addQuery('session', sessionId);
            storyGr.orderBy('sys_created_on');
            storyGr.query();
            
            while (storyGr.next()) {
                stories.push({
                    sys_id: storyGr.getUniqueValue(),
                    title: storyGr.getValue('title'),
                    description: storyGr.getValue('description'),
                    status: storyGr.getValue('status'),
                    final_estimate: storyGr.getValue('final_estimate')
                });
            }
            
            // Get scoring method
            var scoringMethod = null;
            var methodGr = new GlideRecord('x_1447726_planni_0_scoring_method');
            if (methodGr.get(sessionGr.getValue('scoring_method'))) {
                scoringMethod = {
                    sys_id: methodGr.getUniqueValue(),
                    name: methodGr.getValue('name'),
                    values: methodGr.getValue('values')
                };
            }
            
            return JSON.stringify({
                success: true,
                session: {
                    sys_id: sessionGr.getUniqueValue(),
                    name: sessionGr.getValue('name'),
                    description: sessionGr.getValue('description'),
                    status: sessionGr.getValue('status'),
                    facilitator: sessionGr.getValue('facilitator'),
                    participants: participants,
                    user_stories: stories,
                    scoring_method: scoringMethod
                }
            });
        } catch (e) {
            gs.error('PlanningPoker getSessionDetails error: ' + e.message);
            return JSON.stringify({
                success: false,
                error: 'Failed to get session details: ' + e.message
            });
        }
    },

    addUserStory: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var title = this.getParameter('title');
            var description = this.getParameter('description');
            
            if (!sessionId || !title) {
                return JSON.stringify({
                    success: false,
                    error: 'Session ID and title are required'
                });
            }
            
            var storyGr = new GlideRecord('x_1447726_planni_0_user_story');
            storyGr.initialize();
            storyGr.setValue('session', sessionId);
            storyGr.setValue('title', title);
            storyGr.setValue('description', description || '');
            storyGr.setValue('status', 'pending');
            
            var storyId = storyGr.insert();
            
            if (storyId) {
                return JSON.stringify({
                    success: true,
                    story: {
                        sys_id: storyId,
                        title: title,
                        description: description,
                        status: 'pending'
                    }
                });
            } else {
                return JSON.stringify({
                    success: false,
                    error: 'Failed to create user story'
                });
            }
        } catch (e) {
            gs.error('PlanningPoker addUserStory error: ' + e.message);
            return JSON.stringify({
                success: false,
                error: 'Failed to add user story: ' + e.message
            });
        }
    },

    submitVote: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            var estimate = this.getParameter('estimate');
            
            if (!sessionId || !storyId || !estimate) {
                return JSON.stringify({
                    success: false,
                    error: 'Session ID, story ID, and estimate are required'
                });
            }
            
            // Check if vote already exists
            var existingVote = new GlideRecord('x_1447726_planni_0_planning_vote');
            existingVote.addQuery('session', sessionId);
            existingVote.addQuery('user_story', storyId);
            existingVote.addQuery('voter', gs.getUserID());
            existingVote.query();
            
            var voteGr;
            if (existingVote.hasNext()) {
                existingVote.next();
                voteGr = existingVote;
            } else {
                voteGr = new GlideRecord('x_1447726_planni_0_planning_vote');
                voteGr.initialize();
                voteGr.setValue('session', sessionId);
                voteGr.setValue('user_story', storyId);
                voteGr.setValue('voter', gs.getUserID());
            }
            
            voteGr.setValue('estimate', estimate);
            
            var voteId = existingVote.hasNext() ? voteGr.update() : voteGr.insert();
            
            if (voteId) {
                return JSON.stringify({
                    success: true,
                    vote: {
                        sys_id: existingVote.hasNext() ? voteGr.getUniqueValue() : voteId,
                        estimate: estimate
                    }
                });
            } else {
                return JSON.stringify({
                    success: false,
                    error: 'Failed to submit vote'
                });
            }
        } catch (e) {
            gs.error('PlanningPoker submitVote error: ' + e.message);
            return JSON.stringify({
                success: false,
                error: 'Failed to submit vote: ' + e.message
            });
        }
    },

    getVotingResults: function() {
        try {
            var sessionId = this.getParameter('session_id');
            var storyId = this.getParameter('story_id');
            
            if (!sessionId || !storyId) {
                return JSON.stringify({
                    success: false,
                    error: 'Session ID and story ID are required'
                });
            }
            
            var votes = [];
            var voteGr = new GlideRecord('x_1447726_planni_0_planning_vote');
            voteGr.addQuery('session', sessionId);
            voteGr.addQuery('user_story', storyId);
            voteGr.query();
            
            while (voteGr.next()) {
                var voterGr = new GlideRecord('sys_user');
                if (voterGr.get(voteGr.getValue('voter'))) {
                    votes.push({
                        voter_id: voterGr.getUniqueValue(),
                        voter_name: voterGr.getDisplayValue(),
                        estimate: voteGr.getValue('estimate')
                    });
                }
            }
            
            return JSON.stringify({
                success: true,
                votes: votes
            });
        } catch (e) {
            gs.error('PlanningPoker getVotingResults error: ' + e.message);
            return JSON.stringify({
                success: false,
                error: 'Failed to get voting results: ' + e.message
            });
        }
    },

    _addParticipant: function(sessionId, userId, role) {
        try {
            var partGr = new GlideRecord('x_1447726_planni_0_session_participant');
            partGr.initialize();
            partGr.setValue('session', sessionId);
            partGr.setValue('user', userId);
            partGr.setValue('role', role);
            partGr.setValue('active', true);
            
            return partGr.insert();
        } catch (e) {
            gs.error('PlanningPoker _addParticipant error: ' + e.message);
            return null;
        }
    },

    type: 'PlanningPokerAjax'
});