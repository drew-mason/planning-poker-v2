// Add Delete Session to Script Include
// Run this in Scripts - Background: https://dev287878.service-now.com/nav_to.do?uri=sys.scripts.do

(function() {
    var SCRIPT_INCLUDE_ID = 'b496bb1e83d8b6101d51c9a6feaad31e';
    
    gs.info('=== ADDING DELETE SESSION METHOD ===');
    
    var si = new GlideRecord('sys_script_include');
    if (!si.get(SCRIPT_INCLUDE_ID)) {
        gs.error('❌ Script Include not found');
        return;
    }
    
    var script = si.script.toString();
    
    // New deleteSession method
    var deleteSessionMethod = '\n    /**\n' +
        '     * Delete a session (facilitator only, draft state only)\n' +
        '     */\n' +
        '    deleteSession: function() {\n' +
        '        var sessionId = this.getParameter(\'sysparm_session_id\');\n' +
        '        if (!sessionId) {\n' +
        '            return this._errorResponse(\'Session ID required\');\n' +
        '        }\n' +
        '        \n' +
        '        var sessionGR = new GlideRecord(\'x_1447726_planni_0_planning_session\');\n' +
        '        if (!sessionGR.get(sessionId)) {\n' +
        '            return this._errorResponse(\'Session not found\');\n' +
        '        }\n' +
        '        \n' +
        '        // Check if user is facilitator\n' +
        '        var currentUserId = gs.getUserID();\n' +
        '        if (sessionGR.facilitator.toString() !== currentUserId && !gs.hasRole(\'admin\')) {\n' +
        '            return this._errorResponse(\'Only the facilitator can delete this session\');\n' +
        '        }\n' +
        '        \n' +
        '        // Check if session is in draft state\n' +
        '        var sessionState = sessionGR.getValue(\'state\') || \'draft\';\n' +
        '        if (sessionState !== \'draft\') {\n' +
        '            return this._errorResponse(\'Only draft sessions can be deleted. This session is: \' + sessionState);\n' +
        '        }\n' +
        '        \n' +
        '        var sessionName = sessionGR.name.toString();\n' +
        '        var sessionCode = sessionGR.session_code.toString();\n' +
        '        \n' +
        '        // Delete related participants\n' +
        '        var participantGR = new GlideRecord(\'x_1447726_planni_0_session_participant\');\n' +
        '        participantGR.addQuery(\'session\', sessionId);\n' +
        '        participantGR.deleteMultiple();\n' +
        '        \n' +
        '        // Delete related stories (if any)\n' +
        '        var storyGR = new GlideRecord(\'x_1447726_planni_0_user_story\');\n' +
        '        storyGR.addQuery(\'session\', sessionId);\n' +
        '        storyGR.deleteMultiple();\n' +
        '        \n' +
        '        // Delete the session\n' +
        '        sessionGR.deleteRecord();\n' +
        '        \n' +
        '        gs.info(\'Session deleted: \' + sessionName + \' (\' + sessionCode + \') by user \' + currentUserId);\n' +
        '        \n' +
        '        return JSON.stringify({\n' +
        '            success: true,\n' +
        '            message: \'Session "\' + sessionName + \'" deleted successfully\'\n' +
        '        });\n' +
        '    },\n';
    
    // Find where to insert (before the startVoting method or before helper methods section)
    var insertPosition = script.indexOf('\n    // ==================== HELPER METHODS ====================');
    if (insertPosition === -1) {
        insertPosition = script.indexOf('\n    /**\n     * Start voting');
    }
    
    if (insertPosition === -1) {
        gs.error('❌ Could not find insertion point');
        return;
    }
    
    gs.info('Inserting deleteSession method at position: ' + insertPosition);
    
    // Insert the method
    var newScript = script.substring(0, insertPosition) + 
                    deleteSessionMethod +
                    script.substring(insertPosition);
    
    // Update the record
    si.script = newScript;
    si.update();
    
    gs.info('✅ Delete session method added successfully!');
    gs.info('New mod_count: ' + si.sys_mod_count);
    
})();
