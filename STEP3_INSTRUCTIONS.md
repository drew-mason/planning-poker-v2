# Step 3: Update Script Include

## Status: Ready to Execute

You have two options:

---

## Option 1: Run JavaScript in ServiceNow (RECOMMENDED)

1. **Open Scripts - Background**
   - URL: https://dev287878.service-now.com/nav_to.do?uri=sys.scripts.do

2. **Copy and paste** the contents of: `step3_update_script_include.js`

3. **Click "Run script"**

4. **Expected output:**
   ```
   === UPDATING PLANNINGPOKERAJAX SCRIPT INCLUDE ===
   Current script length: 28578 chars
   Current mod_count: 9
   Found getScoringValues at position: XXXX
   Method ends at position: XXXX
   New script length: XXXX chars
   
   === UPDATE COMPLETE ===
   ✅ Script Include updated successfully!
   New mod_count: 10
   ```

---

## Option 2: Manual Update in Studio

If the script doesn't work, manually update in Studio:

1. **Open Studio** → Planning Poker app
2. **Find Script Include**: PlanningPokerAjax
3. **Find the method**: `getScoringValues: function()`
4. **Replace with** the new version (see below)

### New getScoringValues Method:

```javascript
/**
 * Get scoring values for a scoring method
 */
getScoringValues: function() {
    var scoringMethodId = this.getParameter('sysparm_scoring_method_id');
    if (!scoringMethodId) {
        return this._errorResponse('Scoring method ID required');
    }
    
    // Query child table for values
    var valueGR = new GlideRecord('u_x_1447726_planni_0_scoring_value');
    valueGR.addQuery('u_scoring_method', scoringMethodId);
    valueGR.addQuery('u_active', true);
    valueGR.orderBy('u_sequence');
    valueGR.query();
    
    var values = [];
    while (valueGR.next()) {
        values.push({
            sys_id: valueGR.sys_id.toString(),
            display_value: valueGR.u_display_value.toString(),
            actual_value: parseFloat(valueGR.u_actual_value.toString()),
            sequence: parseInt(valueGR.u_sequence.toString()),
            description: valueGR.u_description.toString() || ''
        });
    }
    
    return JSON.stringify({
        success: true,
        values: values,
        count: values.length
    });
},
```

---

## What Changed?

### Before (Old Method):
- Parsed comma-separated string: `"1,2,3,5,8,13,?"`
- No distinction between display and actual values
- No way to exclude special values from calculations

### After (New Method):
- Queries child table: `u_x_1447726_planni_0_scoring_value`
- Returns both `display_value` and `actual_value`
- Returns `sequence` for proper ordering
- Returns `description` for tooltips
- Special values like `?` have `actual_value = -1` (excluded from averages)

---

## Testing After Update

1. **Test T-Shirt Sizes:**
   - Create a session with "T-Shirt Sizes" scoring method
   - Verify voting cards show: XS, S, M, L, XL, XXL
   - Submit votes and verify calculations use actual values (1,2,3,5,8,13)

2. **Test Special Cards:**
   - Create session with "Modified Fibonacci" (has ? card)
   - Vote with ? card
   - Verify ? is excluded from average calculation

3. **Verify Data:**
   ```
   snc record query --table u_x_1447726_planni_0_scoring_value --limit 5
   ```

---

## Next Steps After This Update

- Step 4: Test the interface
- Step 5: Add tooltips/descriptions to voting cards
- Step 6: Update any reports that use voting data
- Step 7: Consider deprecating old `values` field on scoring_method table

---

**Ready?** Run `step3_update_script_include.js` in Scripts - Background!
