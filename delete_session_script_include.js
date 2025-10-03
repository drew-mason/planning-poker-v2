// Add Delete Session Functionality
// Part 1: Script Include Method
// Add this to PlanningPokerAjax Script Include

/**
 * Delete a session (facilitator only, draft state only)
 */
deleteSession: function() {
    var sessionId = this.getParameter('sysparm_session_id');
    if (!sessionId) {
        return this._errorResponse('Session ID required');
    }
    
    var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
    if (!sessionGR.get(sessionId)) {
        return this._errorResponse('Session not found');
    }
    
    // Check if user is facilitator
    var currentUserId = gs.getUserID();
    if (sessionGR.facilitator.toString() !== currentUserId && !gs.hasRole('admin')) {
        return this._errorResponse('Only the facilitator can delete this session');
    }
    
    // Check if session is in draft state
    var sessionState = sessionGR.getValue('state') || 'draft';
    if (sessionState !== 'draft') {
        return this._errorResponse('Only draft sessions can be deleted. This session is: ' + sessionState);
    }
    
    var sessionName = sessionGR.name.toString();
    var sessionCode = sessionGR.session_code.toString();
    
    // Delete related participants
    var participantGR = new GlideRecord('x_1447726_planni_0_session_participant');
    participantGR.addQuery('session', sessionId);
    participantGR.deleteMultiple();
    
    // Delete related stories (if any)
    var storyGR = new GlideRecord('x_1447726_planni_0_user_story');
    storyGR.addQuery('session', sessionId);
    storyGR.deleteMultiple();
    
    // Delete the session
    sessionGR.deleteRecord();
    
    gs.info('Session deleted: ' + sessionName + ' (' + sessionCode + ') by user ' + currentUserId);
    
    return JSON.stringify({
        success: true,
        message: 'Session "' + sessionName + '" deleted successfully'
    });
},
