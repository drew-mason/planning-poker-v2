# Add Delete Session Feature

## Quick Start

Run the automated script:
```bash
cd "/Users/andrewmason/Documents/ServiceNow Projects/planning-poker"
python3 add_delete_session_feature.py
```

OR follow manual steps below.

---

## Manual Installation

### Step 1: Add deleteSession Method to Script Include

1. **Open Scripts - Background**
   - URL: https://dev287878.service-now.com/nav_to.do?uri=sys.scripts.do

2. **Run this script:**

```javascript
// Copy from add_delete_session_method.js
```

OR manually edit PlanningPokerAjax Script Include and add this method before the HELPER METHODS section:

```javascript
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
```

---

### Step 2: Add Client-Side Function

Edit the UI Page (planning_poker_unified) client script and add this function in the GLOBAL FUNCTIONS section:

```javascript
/**
 * Delete a session (draft only)
 */
window.deleteSession = function(sessionId, sessionName, event) {
    if (event) {
        event.stopPropagation();
    }
    
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
                alert('Session deleted successfully');
                loadAvailableSessions();
            } else {
                console.error('❌ Delete failed:', response.message);
                alert(response.message || 'Failed to delete session');
            }
        } catch (error) {
            console.error('❌ Error parsing delete response:', error);
            alert('Error deleting session');
        }
    });
};
```

---

### Step 3: Update createSessionCard Function

Find the `createSessionCard` function and modify it:

1. **After the `const editButton = ...` line, add:**

```javascript
const isDraft = (session.state === 'draft');
const deleteButton = (session.can_edit && isDraft) ? 
    '<button onclick="deleteSession(\'' + session.sys_id + '\', \'' + escapeHtml(session.title || session.name || 'Untitled Session').replace(/'/g, '\\\'') + '\', event);" class="bg-red-600 hover:bg-red-700 text-white px-[1.5vw] py-[1vh] rounded-[0.6vw] text-[1vw] lg:text-[0.9vw] xl:text-[0.8vw] font-medium transition-colors duration-200 mt-[1vh] w-full flex items-center justify-center gap-[0.5vw]">' +
    '<svg class="w-[1.2vw] h-[1.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' +
    'Delete Draft</button>' : '';
```

2. **In the return statement, after `editButton +`, add:**

```javascript
            deleteButton +
```

So the end of the return statement looks like:
```javascript
        '</div>' +
        editButton +
        deleteButton +
        '</div>';
```

---

## Features

✅ **Draft Sessions Only**: Only sessions in "draft" state can be deleted  
✅ **Facilitator Only**: Only the facilitator who created the session can delete it  
✅ **Confirmation Dialog**: User must confirm before deletion  
✅ **Cascading Delete**: Automatically deletes participants and stories  
✅ **Red Button**: Visually distinct red "Delete Draft" button with trash icon  
✅ **Auto Refresh**: Session list refreshes after deletion  

## Security

- Server-side validation ensures only facilitator can delete
- State check prevents deletion of in_session or completed sessions
- Confirmation prevents accidental deletion
- Audit log records who deleted what

## Testing

1. **Create a draft session** as a facilitator
2. **See the red "Delete Draft" button** at the bottom of the session card
3. **Click delete** and confirm
4. **Session should disappear** from the list
5. **Try with in_session** - button should not appear
6. **Try as non-facilitator** - button should not appear

---

## Files Created

- `add_delete_session_method.js` - Script to add method to Script Include
- `add_delete_session_feature.py` - Automated deployment script
- `delete_session_client_code.js` - Client-side code snippets
- `DELETE_SESSION_INSTRUCTIONS.md` - This file

---

**Ready to deploy!** 🚀
