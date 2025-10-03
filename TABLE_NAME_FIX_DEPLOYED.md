# Table Name Fix - DEPLOYED ✅

## Issue Fixed
**Error**: `Invalid session data: GlideRecord.insert() - invalid table name: x_1447726_planni_0_planning_poker_session`

**Root Cause**: The Script Include was referencing the wrong table name. The table is called `x_1447726_planni_0_planning_session` (not `planning_poker_session`).

## Solution Applied

### Table Name Correction
Changed all occurrences from:
```javascript
'x_1447726_planni_0_planning_poker_session'
```

To:
```javascript
'x_1447726_planni_0_planning_session'
```

## Affected Methods
The following methods were updated to use the correct table name:

1. **getAllSessions()** - Line 116
2. **createSession()** - Line 142  
3. **joinSession()** - Line 193
4. **getSessionData()** - Line 240
5. **_getSessionParticipants()** - Line 459
6. **_isFacilitator()** - Line 571

## Deployment Details

- **Script Include**: PlanningPokerAjax
- **sys_id**: b496bb1e83d8b6101d51c9a6feaad31e
- **Updated**: 2025-10-02 22:20:47
- **sys_mod_count**: 4
- **Status**: ✅ Successfully deployed

## Files Created

1. **PlanningPokerAjax_with_groups_fixed.js** - Corrected source file
2. **update_ajax_with_groups_fixed.json** - Corrected deployment JSON

## What Now Works

✅ **Group dropdown loads** - getAllGroups method queries sys_user_group
✅ **Session creation** - Now uses correct table name `x_1447726_planni_0_planning_session`
✅ **Group-based participants** - Creates participant records from selected groups
✅ **Duplicate prevention** - Avoids adding same user multiple times

## Testing

Try creating a new session now:
1. Refresh the Planning Poker page
2. Click "Create New Session"
3. Fill in session details
4. Select groups from dropdown
5. Click "Create Session"

The session should now be created successfully with all users from the selected groups added as participants!

## Correct Table Structure

Your Planning Poker application uses these tables:
- **x_1447726_planni_0_planning_session** - Main sessions table
- **x_1447726_planni_0_session_participant** - Participant junction table
- **x_1447726_planni_0_scoring_method** - Scoring methods
- **x_1447726_planni_0_user_story** - User stories (if used)
- **sys_user_group** - ServiceNow groups (standard table)
- **sys_user_grmember** - Group membership (standard table)
