#!/usr/bin/env python3
"""
Add Delete Session Feature
- Adds deleteSession method to Script Include
- Updates client script to show delete button on draft sessions
"""

import subprocess
import json

SCRIPT_INCLUDE_ID = 'b496bb1e83d8b6101d51c9a6feaad31e'
UI_PAGE_ID = 'bc6cb75683d8b6101d51c9a6feaad352'

def run_snc_command(args):
    """Run ServiceNow CLI command"""
    result = subprocess.run(['snc'] + args, capture_output=True, text=True)
    return result.stdout

def extract_json(output):
    """Extract JSON from CLI output"""
    start = output.find('{')
    if start == -1:
        return None
    count = 0
    end = start
    for i in range(start, len(output)):
        if output[i] == '{':
            count += 1
        elif output[i] == '}':
            count -= 1
            if count == 0:
                end = i + 1
                break
    return json.loads(output[start:end])

def main():
    print("=== ADDING DELETE SESSION FEATURE ===\n")
    
    # Step 1: Add deleteSession method to Script Include
    print("1. Fetching Script Include...")
    output = run_snc_command([
        'record', 'query',
        '--table', 'sys_script_include',
        '--query', f'sys_id={SCRIPT_INCLUDE_ID}',
        '--fields', 'script',
        '--limit', '1',
        '-o', 'json'
    ])
    
    data = extract_json(output)
    if not data or not data.get('result'):
        print("   ❌ Failed to fetch Script Include")
        return
    
    script = data['result'][0]['script']
    print(f"   ✅ Fetched (length: {len(script)} chars)\n")
    
    # Check if deleteSession already exists
    if 'deleteSession: function()' in script:
        print("   ⚠️  deleteSession method already exists, skipping...\n")
    else:
        print("2. Adding deleteSession method...")
        
        delete_method = '''
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
'''
        
        # Find insertion point
        insert_pos = script.find('\n    // ==================== HELPER METHODS ====================')
        if insert_pos == -1:
            insert_pos = script.find('\n    /**\n     * Start voting')
        
        if insert_pos == -1:
            print("   ❌ Could not find insertion point")
            return
        
        new_script = script[:insert_pos] + delete_method + script[insert_pos:]
        
        # Update via CLI
        script_escaped = json.dumps(new_script)
        output = run_snc_command([
            'record', 'update',
            '--table', 'sys_script_include',
            '--sys-id', SCRIPT_INCLUDE_ID,
            '--data', f'{{"script":{script_escaped}}}',
            '-o', 'json'
        ])
        
        print("   ✅ Added deleteSession method\n")
    
    # Step 2: Update UI Page client script
    print("3. Fetching UI Page...")
    output = run_snc_command([
        'record', 'query',
        '--table', 'sys_ui_page',
        '--query', f'sys_id={UI_PAGE_ID}',
        '--fields', 'client_script',
        '--limit', '1',
        '-o', 'json'
    ])
    
    data = extract_json(output)
    if not data or not data.get('result'):
        print("   ❌ Failed to fetch UI Page")
        return
    
    client_script = data['result'][0]['client_script']
    print(f"   ✅ Fetched (length: {len(client_script)} chars)\n")
    
    # Check if deleteSession function already exists
    if 'window.deleteSession' in client_script:
        print("   ⚠️  deleteSession function already exists in client script\n")
    else:
        print("4. Adding deleteSession client function...")
        
        delete_function = '''
    /**
     * Delete a session (draft only)
     */
    window.deleteSession = function(sessionId, sessionName, event) {
        if (event) {
            event.stopPropagation();
        }
        
        if (!confirm('Are you sure you want to delete "' + sessionName + '"?\\n\\nThis action cannot be undone.')) {
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
'''
        
        # Add after other window functions
        insert_pos = client_script.find('\n    // ==================== GLOBAL FUNCTIONS ====================')
        if insert_pos != -1:
            # Find end of global functions section
            insert_pos = client_script.find('\n    // Initialize', insert_pos)
            if insert_pos == -1:
                insert_pos = len(client_script) - 200
        else:
            insert_pos = len(client_script) - 200
        
        new_client_script = client_script[:insert_pos] + delete_function + client_script[insert_pos:]
        print("   ✅ Added deleteSession function\n")
    
    # Step 3: Update createSessionCard function
    print("5. Updating createSessionCard function...")
    
    if 'deleteSession' in client_script:
        print("   ⚠️  Delete button code may already exist\n")
    else:
        # Find createSessionCard function
        card_start = new_client_script.find('function createSessionCard(session) {')
        if card_start == -1:
            print("   ❌ Could not find createSessionCard function")
        else:
            # Find the editButton line
            edit_button_pos = new_client_script.find("const editButton = session.can_edit ?", card_start)
            if edit_button_pos != -1:
                # Add isDraft check and deleteButton after editButton
                next_line = new_client_script.find('\n', edit_button_pos + 200)
                
                insert_code = '''
    
    const isDraft = (session.state === 'draft');
    const deleteButton = (session.can_edit && isDraft) ? 
        '<button onclick="deleteSession(\\'' + session.sys_id + '\\', \\'' + escapeHtml(session.title || session.name || 'Untitled Session').replace(/'/g, '\\\\\\'') + '\\', event);" class="bg-red-600 hover:bg-red-700 text-white px-[1.5vw] py-[1vh] rounded-[0.6vw] text-[1vw] lg:text-[0.9vw] xl:text-[0.8vw] font-medium transition-colors duration-200 mt-[1vh] w-full flex items-center justify-center gap-[0.5vw]">' +
        '<svg class="w-[1.2vw] h-[1.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' +
        'Delete Draft</button>' : '';
'''
                
                new_client_script = new_client_script[:next_line] + insert_code + new_client_script[next_line:]
                
                # Now add deleteButton to the return statement
                # Find editButton in the return and add deleteButton after it
                return_pos = new_client_script.find('editButton +', card_start)
                if return_pos != -1:
                    new_client_script = new_client_script[:return_pos + 11] + '\n            deleteButton +' + new_client_script[return_pos + 11:]
                
                print("   ✅ Updated createSessionCard function\n")
            else:
                print("   ⚠️  Could not find editButton line\n")
    
    # Update UI Page
    print("6. Updating UI Page...")
    client_escaped = json.dumps(new_client_script)
    output = run_snc_command([
        'record', 'update',
        '--table', 'sys_ui_page',
        '--sys-id', UI_PAGE_ID,
        '--data', f'{{"client_script":{client_escaped}}}',
        '-o', 'json'
    ])
    
    print("   ✅ UI Page updated\n")
    
    print("=== DELETE SESSION FEATURE ADDED ===")
    print("\nFeatures:")
    print("  • Delete button appears on draft sessions for facilitators")
    print("  • Confirmation dialog before deletion")
    print("  • Deletes session, participants, and stories")
    print("  • Only facilitators can delete their draft sessions")
    print("  • In-session and completed sessions cannot be deleted")
    print("\nTest it:")
    print("  1. Create a draft session")
    print("  2. See red 'Delete Draft' button")
    print("  3. Click and confirm deletion")
    print("  4. Session should disappear from list")

if __name__ == '__main__':
    main()
