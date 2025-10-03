// Client-Side Delete Session Functionality
// Add these functions to your unified client script

// ==================== DELETE SESSION ====================

/**
 * Delete a session (draft only)
 */
window.deleteSession = function(sessionId, sessionName, event) {
    // Stop event propagation to prevent joining the session
    if (event) {
        event.stopPropagation();
    }
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete "' + sessionName + '"?\n\nThis action cannot be undone.')) {
        return;
    }
    
    console.log('🗑️  Deleting session:', sessionId);
    
    const ga = new GlideAjax('PlanningPokerAjax');
    ga.addParam('sysparm_name', 'deleteSession');
    ga.addParam('sysparm_session_id', sessionId);
    ga.getXMLAnswer(function(answer) {
        try {
            const response = JSON.parse(answer);
            
            if (response.success) {
                console.log('✅ Session deleted successfully');
                showNotification('Session deleted successfully', 'success');
                
                // Reload sessions to refresh the list
                loadAvailableSessions();
            } else {
                console.error('❌ Delete failed:', response.message);
                showNotification(response.message || 'Failed to delete session', 'error');
            }
        } catch (error) {
            console.error('❌ Error parsing delete response:', error);
            showNotification('Error deleting session', 'error');
        }
    });
};

// ==================== UPDATED SESSION CARD FUNCTION ====================

// Replace your existing createSessionCard function with this updated version:

function createSessionCard(session) {
    const statusClass = getStatusClass(session.state || session.status);
    const statusText = getStatusText(session.state || session.status);
    const isDraft = (session.state === 'draft');
    
    // Build edit button HTML if user can edit
    const editButton = session.can_edit ? 
        '<button onclick="editSession(\'' + session.sys_id + '\'); event.stopPropagation();" class="bg-blue-600 hover:bg-blue-700 text-white px-[1.5vw] py-[1vh] rounded-[0.6vw] text-[1vw] lg:text-[0.9vw] xl:text-[0.8vw] font-medium transition-colors duration-200 mt-[1.5vh] w-full">Manage Stories</button>' : '';
    
    // Add delete button for draft sessions (facilitator only)
    const deleteButton = (session.can_edit && isDraft) ? 
        '<button onclick="deleteSession(\'' + session.sys_id + '\', \'' + escapeHtml(session.title || session.name || 'Untitled Session').replace(/'/g, '\\\'') + '\', event);" class="bg-red-600 hover:bg-red-700 text-white px-[1.5vw] py-[1vh] rounded-[0.6vw] text-[1vw] lg:text-[0.9vw] xl:text-[0.8vw] font-medium transition-colors duration-200 mt-[1vh] w-full flex items-center justify-center gap-[0.5vw]">' +
        '<svg class="w-[1.2vw] h-[1.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' +
        'Delete Draft</button>' : '';
    
    return '<div class="session-card bg-white dark:bg-gray-800 rounded-[1vw] border border-gray-200 dark:border-gray-700 p-[2vw] cursor-pointer hover:shadow-lg transition-shadow duration-200" onclick="joinSession(\'' + session.sys_id + '\')">' +
        '<div class="flex justify-between items-start mb-[1.5vh]">' +
        '<h4 class="font-semibold text-gray-900 dark:text-white text-[1.3vw] lg:text-[1.1vw] xl:text-[1vw]">' + escapeHtml(session.title || session.name || 'Untitled Session') + '</h4>' +
        '<span class="status-badge ' + statusClass + ' text-white text-[0.9vw] lg:text-[0.8vw] xl:text-[0.7vw] px-[1vw] py-[0.5vh] rounded-full ml-[1vw]">' + statusText + '</span>' +
        '</div>' +
        '<p class="text-gray-600 dark:text-gray-300 text-[1vw] lg:text-[0.9vw] xl:text-[0.8vw] mb-[1.5vh]">' + escapeHtml(session.description || 'No description provided') + '</p>' +
        '<div class="space-y-[0.5vh] text-[1vw] lg:text-[0.9vw] xl:text-[0.8vw] text-gray-500 dark:text-gray-400">' +
        '<div class="flex justify-between"><span>Facilitator:</span><span class="font-medium">' + escapeHtml(session.created_by_name || session.facilitator_name || 'Unknown') + '</span></div>' +
        '<div class="flex justify-between"><span>Method:</span><span class="font-medium">' + escapeHtml(session.scoring_method_name || 'Not specified') + '</span></div>' +
        '<div class="flex justify-between"><span>Participants:</span><span class="font-medium">' + (session.participant_count || 0) + '</span></div>' +
        '<div class="flex justify-between"><span>Created:</span><span class="font-medium">' + formatDate(session.sys_created_on) + '</span></div>' +
        '</div>' +
        editButton +
        deleteButton +
        '</div>';
}

// ==================== NOTIFICATION HELPER ====================

// Add this if you don't already have a notification system
function showNotification(message, type) {
    // You can implement this as a toast notification
    // For now, simple alert
    if (type === 'error') {
        alert('Error: ' + message);
    } else {
        console.log('✅ ' + message);
        // Or use a toast library if available
    }
}
