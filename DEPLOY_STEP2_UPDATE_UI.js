/**
 * STEP 2: Update UI Page to add delete button
 * Run this AFTER STEP 1 completes successfully
 * Copy and paste this ENTIRE script into Scripts - Background
 * URL: https://dev287878.service-now.com/nav_to.do?uri=sys.scripts.do
 */

(function() {
    var UI_PAGE_ID = 'bc6cb75683d8b6101d51c9a6feaad352';
    
    gs.info('=== UPDATING UI PAGE FOR DELETE BUTTON ===');
    
    var page = new GlideRecord('sys_ui_page');
    if (!page.get(UI_PAGE_ID)) {
        gs.error('❌ UI Page not found');
        return;
    }
    
    var clientScript = page.client_script.toString();
    gs.info('Current client script length: ' + clientScript.length);
    
    // Step 1: Add deleteSession function if not exists
    if (clientScript.indexOf('window.deleteSession') === -1) {
        gs.info('Adding window.deleteSession function...');
        
        var deleteFunction = '\n    /**\n' +
            '     * Delete a session (draft only)\n' +
            '     */\n' +
            '    window.deleteSession = function(sessionId, sessionName, event) {\n' +
            '        if (event) {\n' +
            '            event.stopPropagation();\n' +
            '        }\n' +
            '        \n' +
            '        if (!confirm(\'Are you sure you want to delete "\' + sessionName + \'"?\\n\\nThis action cannot be undone.\')) {\n' +
            '            return;\n' +
            '        }\n' +
            '        \n' +
            '        console.log(\'🗑️  Deleting session:\', sessionId);\n' +
            '        \n' +
            '        const ga = new GlideAjax(\'PlanningPokerAjax\');\n' +
            '        ga.addParam(\'sysparm_name\', \'deleteSession\');\n' +
            '        ga.addParam(\'sysparm_session_id\', sessionId);\n' +
            '        ga.getXMLAnswer(function(answer) {\n' +
            '            try {\n' +
            '                const response = JSON.parse(answer);\n' +
            '                \n' +
            '                if (response.success) {\n' +
            '                    console.log(\'✅ Session deleted successfully\');\n' +
            '                    alert(\'Session deleted successfully\');\n' +
            '                    loadAvailableSessions();\n' +
            '                } else {\n' +
            '                    console.error(\'❌ Delete failed:\', response.message);\n' +
            '                    alert(response.message || \'Failed to delete session\');\n' +
            '                }\n' +
            '            } catch (error) {\n' +
            '                console.error(\'❌ Error parsing delete response:\', error);\n' +
            '                alert(\'Error deleting session\');\n' +
            '            }\n' +
            '        });\n' +
            '    };\n';
        
        // Find where to insert - look for other window functions or before initialization
        var insertPos = clientScript.indexOf('\n    // Initialize');
        if (insertPos === -1) {
            insertPos = clientScript.indexOf('\n    // ==================== INITIALIZATION ====================');
        }
        if (insertPos === -1) {
            insertPos = clientScript.lastIndexOf('window.') + 200; // After last window function
        }
        
        if (insertPos > 0 && insertPos < clientScript.length) {
            clientScript = clientScript.substring(0, insertPos) + deleteFunction + clientScript.substring(insertPos);
            gs.info('✅ Added deleteSession function');
        } else {
            gs.error('❌ Could not find insertion point for deleteSession function');
        }
    } else {
        gs.info('⚠️  deleteSession function already exists');
    }
    
    // Step 2: Replace createSessionCard function with updated version
    var createStart = clientScript.indexOf('function createSessionCard(session) {');
    if (createStart === -1) {
        gs.error('❌ Could not find createSessionCard function');
        return;
    }

    var utilityMarker = clientScript.indexOf('\n    // ==================== UTILITY FUNCTIONS ====================', createStart);
    if (utilityMarker === -1) {
        gs.error('❌ Could not determine end of createSessionCard function');
        return;
    }

    var existingCreate = clientScript.substring(createStart, utilityMarker);

    var updatedCreateLines = [
        "function createSessionCard(session) {",
        "        const statusClass = getStatusClass(session.state || session.status);",
        "        const statusText = getStatusText(session.state || session.status);",
        "        const isDraft = (session.state || '').toString() === 'draft';",
        "        const sessionName = session.title || session.name || 'Untitled Session';",
        "        const safeSessionName = sessionName.replace(/\\\\/g, '\\\\').replace(/'/g, '\\'');",
        "",
        "        const deleteButton = (session.can_edit && isDraft) ?",
        "            '\\u003cbutton onclick=\"deleteSession(\\\\'' + session.sys_id + '\\', \\'' + safeSessionName + '\\', event);\" class=\"bg-red-600 hover:bg-red-700 text-white px-[1.5vw] py-[1vh] rounded-[0.6vw] text-[1vw] lg:text-[0.9vw] xl:text-[0.8vw] font-medium transition-colors duration-200 mt-[1vh] w-full flex items-center justify-center gap-[0.5vw]\"\\u003e' +",
        "                '\\u003csvg class=\"w-[1.2vw] h-[1.2vw]\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"\\u003e' +",
        "                    '\\u003cpath stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\"\\u003e\\u003c/path\\u003e' +",
        "                '\\u003c/svg\\u003eDelete Draft\\u003c/button\\u003e' : '',",
        "",
        "        return '\\u003cdiv class=\"session-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200\" onclick=\"joinSession(\\\\'' + session.sys_id + '\\')\"\\u003e' +",
        "            '\\u003cdiv class=\"flex justify-between items-start mb-3\"\\u003e' +",
        "            '\\u003ch4 class=\"font-semibold text-gray-900 dark:text-white text-sm\"\\u003e' + escapeHtml(sessionName) + '\\u003c/h4\\u003e' +",
        "            '\\u003cspan class=\"status-badge ' + statusClass + ' text-white text-xs px-2 py-1 rounded-full ml-2\"\\u003e' + statusText + '\\u003c/span\\u003e' +",
        "            '\\u003c/div\\u003e' +",
        "            '\\u003cp class=\"text-gray-600 dark:text-gray-300 text-xs mb-3\"\\u003e' + escapeHtml(session.description || 'No description provided') + '\\u003c/p\\u003e' +",
        "            '\\u003cdiv class=\"space-y-1 text-xs text-gray-500 dark:text-gray-400\"\\u003e' +",
        "            '\\u003cdiv class=\"flex justify-between\"\\u003e\\u003cspan\\u003eFacilitator:\\u003c/span\\u003e\\u003cspan class=\"font-medium\"\\u003e' + escapeHtml(session.created_by_name || session.facilitator_name || 'Unknown') + '\\u003c/span\\u003e\\u003c/div\\u003e' +",
        "            '\\u003cdiv class=\"flex justify-between\"\\u003e\\u003cspan\\u003eMethod:\\u003c/span\\u003e\\u003cspan class=\"font-medium\"\\u003e' + escapeHtml(session.scoring_method_name || 'Not specified') + '\\u003c/span\\u003e\\u003c/div\\u003e' +",
        "            '\\u003cdiv class=\"flex justify-between\"\\u003e\\u003cspan\\u003eParticipants:\\u003c/span\\u003e\\u003cspan class=\"font-medium\"\\u003e' + (session.participant_count || 0) + '\\u003c/span\\u003e\\u003c/div\\u003e' +",
        "            '\\u003cdiv class=\"flex justify-between\"\\u003e\\u003cspan\\u003eCreated:\\u003c/span\\u003e\\u003cspan class=\"font-medium\"\\u003e' + formatDate(session.sys_created_on) + '\\u003c/span\\u003e\\u003c/div\\u003e' +",
        "            '\\u003c/div\\u003e' +",
        "            deleteButton +",
        "            '\\u003c/div\\u003e';",
        "    }"
    ];

    var updatedCreate = updatedCreateLines.join('\n');

    if (existingCreate === updatedCreate + '\n\n') {
        gs.info('ℹ️ createSessionCard already up to date');
    } else {
        clientScript = clientScript.substring(0, createStart) + updatedCreate + '\n\n' + clientScript.substring(utilityMarker);
        gs.info('✅ Replaced createSessionCard function with updated version');
    }
    
    gs.info('New client script length: ' + clientScript.length);
    
    // Update the page
    page.client_script = clientScript;
    page.update();
    
    gs.info('');
    gs.info('=== UI PAGE UPDATED ===');
    gs.info('✅ Delete button functionality added!');
    gs.info('New mod_count: ' + page.sys_mod_count);
    gs.info('');
    gs.info('DEPLOYMENT COMPLETE!');
    gs.info('Refresh your Planning Poker page to see the delete buttons on draft sessions');
    
})();
