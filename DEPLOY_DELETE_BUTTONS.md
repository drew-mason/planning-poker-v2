# 🚀 DEPLOY DELETE SESSION FEATURE

## The delete buttons aren't showing because the scripts need to run in ServiceNow

Follow these 2 simple steps:

---

## STEP 1: Add Server Method (2 minutes)

1. **Open Scripts - Background in ServiceNow:**
   ```
   https://dev287878.service-now.com/nav_to.do?uri=sys.scripts.do
   ```

2. **Copy the ENTIRE contents** of this file:
   ```
   DEPLOY_STEP1_ADD_DELETE_METHOD.js
   ```

3. **Paste into the "Run script" field**

4. **Click "Run script"**

5. **Look for this output:**
   ```
   === SCRIPT INCLUDE UPDATED ===
   ✅ deleteSession method added successfully!
   New mod_count: 10
   ```

---

## STEP 2: Add UI Button (2 minutes)

1. **Still in Scripts - Background**

2. **Copy the ENTIRE contents** of this file:
   ```
   DEPLOY_STEP2_UPDATE_UI.js
   ```

3. **Paste into the "Run script" field**

4. **Click "Run script"**

5. **Look for this output:**
   ```
   === UI PAGE UPDATED ===
   ✅ Delete button functionality added!
   New mod_count: 19
   
   DEPLOYMENT COMPLETE!
   ```

---

## STEP 3: Test It!

1. **Refresh your Planning Poker page** (Ctrl+F5 or Cmd+Shift+R)

2. **Go to the Hub view**

3. **Look at a DRAFT session** - you should see:
   - Blue "Manage Stories" button
   - Red "Delete Draft" button with trash icon 🗑️

4. **Look at an IN_SESSION session** - you should see:
   - Blue "Manage Stories" button
   - NO delete button (correct!)

5. **Click the delete button:**
   - Confirmation dialog appears
   - Click OK
   - Session disappears from list

---

## Troubleshooting

### Issue: Still no delete buttons after running scripts

**Solution 1: Clear browser cache**
- Press Ctrl+Shift+Del (Windows) or Cmd+Shift+Del (Mac)
- Clear cached images and files
- Refresh page

**Solution 2: Hard refresh**
- Windows: Ctrl+F5
- Mac: Cmd+Shift+R

**Solution 3: Check if scripts ran successfully**
```javascript
// Run this in Scripts - Background to verify:
var si = new GlideRecord('sys_script_include');
si.get('b496bb1e83d8b6101d51c9a6feaad31e');
gs.info('Has deleteSession: ' + (si.script.indexOf('deleteSession') !== -1));

var page = new GlideRecord('sys_ui_page');
page.get('bc6cb75683d8b6101d51c9a6feaad352');
gs.info('Has deleteSession function: ' + (page.client_script.indexOf('window.deleteSession') !== -1));
gs.info('Has deleteButton: ' + (page.client_script.indexOf('const deleteButton') !== -1));
```

Expected output:
```
Has deleteSession: true
Has deleteSession function: true
Has deleteButton: true
```

---

## Quick Reference

| What | Where |
|------|-------|
| Server method | DEPLOY_STEP1_ADD_DELETE_METHOD.js |
| UI updates | DEPLOY_STEP2_UPDATE_UI.js |
| Scripts Background | https://dev287878.service-now.com/nav_to.do?uri=sys.scripts.do |
| Planning Poker URL | https://dev287878.service-now.com/x_1447726_planni_0_planning_poker_unified.do |

---

## What You'll See

### Draft Session Card (Facilitator View)
```
┌────────────────────────────────────┐
│ My Planning Session        [Draft] │
│                                    │
│ Facilitator: You                   │
│ Method: Fibonacci                  │
│ Participants: 5                    │
│                                    │
│ [    Manage Stories    ]  ← Blue   │
│ [ 🗑️  Delete Draft     ]  ← Red    │
└────────────────────────────────────┘
```

### In-Session Card (Facilitator View)
```
┌────────────────────────────────────┐
│ Active Session    [In Session]     │
│                                    │
│ Facilitator: You                   │
│ Method: T-Shirt Sizes              │
│ Participants: 8                    │
│                                    │
│ [    Manage Stories    ]  ← Blue   │
│ (No delete button - correct!)      │
└────────────────────────────────────┘
```

---

**Ready? Run STEP 1 first, then STEP 2!** 🎯
