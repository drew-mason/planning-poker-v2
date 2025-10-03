#!/bin/bash
# Step 3: Update Script Include using direct file upload

echo "=== STEP 3: UPDATE SCRIPT INCLUDE (Alternative Method) ==="
echo ""

SCRIPT_INCLUDE_ID="b496bb1e83d8b6101d51c9a6feaad31e"

# First, let's check if we can update via CLI with proper escaping
echo "Creating update script..."

cat > /tmp/update_script.js << 'SCRIPT_EOF'
// Update getScoringValues to use child table
var si = new GlideRecord('sys_script_include');
if (si.get('b496bb1e83d8b6101d51c9a6feaad31e')) {
    var oldScript = si.script.toString();
    
    // Replace getScoringValues method
    var getScoringValuesNew = `    /**
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
    },`;
    
    // Find old method
    var oldMethodStart = oldScript.indexOf('getScoringValues: function()');
    if (oldMethodStart === -1) {
        gs.error('Could not find getScoringValues method');
    } else {
        var oldMethodEnd = oldScript.indexOf('\n    /**', oldMethodStart + 1);
        if (oldMethodEnd === -1) {
            oldMethodEnd = oldScript.indexOf('\n    getSessionParticipants:', oldMethodStart + 1);
        }
        
        if (oldMethodEnd !== -1) {
            var newScript = oldScript.substring(0, oldMethodStart) + 
                           getScoringValuesNew + '\n' +
                           oldScript.substring(oldMethodEnd);
            
            si.script = newScript;
            si.update();
            
            gs.info('✅ Script Include updated successfully!');
            gs.info('New mod_count: ' + si.sys_mod_count);
        } else {
            gs.error('Could not find end of method');
        }
    }
} else {
    gs.error('Script Include not found');
}
SCRIPT_EOF

echo "Script created at /tmp/update_script.js"
echo ""
echo "To apply the update, run this in ServiceNow Scripts - Background:"
echo "-----------------------------------------------------------"
cat /tmp/update_script.js
echo "-----------------------------------------------------------"
echo ""
echo "Or run it now via CLI:"
echo "  cat /tmp/update_script.js | snc script execute"
