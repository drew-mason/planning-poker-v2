# Planning Poker Troubleshooting Guide 🚨

## When "Nothing Works" - Debug Steps

### 🔍 **Step 1: Use Simple Debugging Version**

**Replace your Script Include with:** `SIMPLE_SCRIPT_INCLUDE.js`
**Replace your Client Script with:** `SIMPLE_CLIENT_SCRIPT.js`

This will:
- ✅ Test basic Script Include connectivity
- ✅ Show diagnostic information on the page
- ✅ Verify database connections
- ✅ Test DOM elements
- ✅ Display detailed error messages

### 🔧 **Step 2: Common Issues & Fixes**

#### **Issue 1: Script Include Not Found**
```
Error: "PlanningPokerAjax is not defined"
```
**Fix:**
1. Go to **System Definition > Script Includes**
2. Search for **PlanningPokerAjax**
3. Make sure **Client callable = true**
4. Make sure **Active = true**
5. Save the record

#### **Issue 2: Field Name Mismatches**
```
Error: "Invalid field name"
```
**Check these field mappings:**
- `session_name` → `name` (in planning_session table)
- `story` → `user_story` (in planning_vote table)
- `user` → `voter` (in planning_vote table)
- `vote_value` → `estimate` (in planning_vote table)

#### **Issue 3: Missing Tables/Fields**
```
Error: "Invalid table name"
```
**Verify all tables exist:**
```bash
# Check each table
snc record query --table x_1447726_planni_0_planning_session --limit 1
snc record query --table x_1447726_planni_0_session_participant --limit 1  
snc record query --table x_1447726_planni_0_user_story --limit 1
snc record query --table x_1447726_planni_0_planning_vote --limit 1
snc record query --table x_1447726_planni_0_scoring_method --limit 1
```

#### **Issue 4: UI Page Configuration**
**Check these settings:**
1. **UI Page Category:** General
2. **Processing Script:** [Leave empty]
3. **HTML:** Contains the modal and view structure
4. **Client Script:** Contains the JavaScript functionality

### 🎯 **Step 3: Systematic Testing**

#### **Test 1: Basic Script Include**
1. Use the simple version
2. Open browser console (F12)
3. Look for diagnostic messages
4. Check if "Script Include: Working" appears

#### **Test 2: Database Connectivity**
```javascript
// Run in browser console
window.debugPlanningPoker.runDiagnostics();
```

#### **Test 3: DOM Elements**
1. Check if diagnostic div appears in top-right
2. Verify all required HTML elements exist
3. Test navigation tabs

### 🔨 **Step 4: Progressive Fixes**

#### **Fix 1: Start with Simple Version**
1. Copy `SIMPLE_SCRIPT_INCLUDE.js` to ServiceNow Script Include
2. Copy `SIMPLE_CLIENT_SCRIPT.js` to UI Page Client Script
3. Test basic functionality
4. Look at diagnostic results

#### **Fix 2: Verify Database Structure**
```bash
# Test each table individually
snc record query --table x_1447726_planni_0_planning_session --fields name,session_code,status --limit 5
```

#### **Fix 3: Check ServiceNow Logs**
1. Go to **System Logs > System Log > All**
2. Filter by **Source = PlanningPokerAjax**
3. Look for recent error messages

### 🚀 **Step 5: Gradual Enhancement**

Once simple version works:

1. **Add session loading** functionality
2. **Add session creation** functionality  
3. **Add participant management**
4. **Add voting functionality**

### 📋 **Diagnostic Checklist**

- [ ] GlideAjax available in browser
- [ ] Script Include callable and active
- [ ] All database tables exist
- [ ] All required fields exist
- [ ] UI Page properly configured
- [ ] No JavaScript console errors
- [ ] Diagnostic div shows success messages

### 🆘 **Emergency Reset**

If everything is broken:

1. **Use simple versions** from this guide
2. **Test with mock data** (no database calls)
3. **Verify step by step** each component
4. **Check ServiceNow system logs** for errors
5. **Test in different browser** to rule out caching

### 🔍 **Debug Output Example**

When working, you should see:
```
✅ GlideAjax is available
✅ Script Include is working  
✅ Sessions loaded: 2 sessions
✅ Element found: sessions-grid
✅ Sessions displayed
```

When broken, you'll see:
```
❌ GlideAjax is NOT available
❌ Element missing: sessions-grid
❌ Script Include error: [specific error]
```

## Next Steps

1. **Start with simple debugging version**
2. **Follow diagnostic results** 
3. **Fix issues one by one**
4. **Gradually restore full functionality**

The simple version will tell you exactly what's broken! 🎯