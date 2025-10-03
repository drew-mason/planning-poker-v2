// Step 3: Update PlanningPokerAjax Script Include
// Run this in Scripts - Background: https://dev287878.service-now.com/nav_to.do?uri=sys.scripts.do

(function() {
    var SCRIPT_INCLUDE_ID = 'b496bb1e83d8b6101d51c9a6feaad31e';
    
    gs.info('=== UPDATING PLANNINGPOKERAJAX SCRIPT INCLUDE ===');
    
    var si = new GlideRecord('sys_script_include');
    if (!si.get(SCRIPT_INCLUDE_ID)) {
        gs.error('❌ Script Include not found: ' + SCRIPT_INCLUDE_ID);
        return;
    }
    
    var oldScript = si.script.toString();
    gs.info('Current script length: ' + oldScript.length + ' chars');
    gs.info('Current mod_count: ' + si.sys_mod_count);
    
    // NEW getScoringValues method
    var newGetScoringValues = '    /**\n' +
        '     * Get scoring values for a scoring method\n' +
        '     */\n' +
        '    getScoringValues: function() {\n' +
        '        var scoringMethodId = this.getParameter(\'sysparm_scoring_method_id\');\n' +
        '        if (!scoringMethodId) {\n' +
        '            return this._errorResponse(\'Scoring method ID required\');\n' +
        '        }\n' +
        '        \n' +
        '        // Query child table for values\n' +
        '        var valueGR = new GlideRecord(\'u_x_1447726_planni_0_scoring_value\');\n' +
        '        valueGR.addQuery(\'u_scoring_method\', scoringMethodId);\n' +
        '        valueGR.addQuery(\'u_active\', true);\n' +
        '        valueGR.orderBy(\'u_sequence\');\n' +
        '        valueGR.query();\n' +
        '        \n' +
        '        var values = [];\n' +
        '        while (valueGR.next()) {\n' +
        '            values.push({\n' +
        '                sys_id: valueGR.sys_id.toString(),\n' +
        '                display_value: valueGR.u_display_value.toString(),\n' +
        '                actual_value: parseFloat(valueGR.u_actual_value.toString()),\n' +
        '                sequence: parseInt(valueGR.u_sequence.toString()),\n' +
        '                description: valueGR.u_description.toString() || \'\'\n' +
        '            });\n' +
        '        }\n' +
        '        \n' +
        '        return JSON.stringify({\n' +
        '            success: true,\n' +
        '            values: values,\n' +
        '            count: values.length\n' +
        '        });\n' +
        '    },';
    
    // Find and replace getScoringValues method
    var oldMethodStart = oldScript.indexOf('getScoringValues: function()');
    if (oldMethodStart === -1) {
        gs.error('❌ Could not find getScoringValues method');
        return;
    }
    
    gs.info('Found getScoringValues at position: ' + oldMethodStart);
    
    // Find next method (end of current method)
    var oldMethodEnd = oldScript.indexOf('\n    /**', oldMethodStart + 50);
    if (oldMethodEnd === -1) {
        oldMethodEnd = oldScript.indexOf('\n    getSessionParticipants:', oldMethodStart);
    }
    
    if (oldMethodEnd === -1) {
        gs.error('❌ Could not find end of getScoringValues method');
        return;
    }
    
    gs.info('Method ends at position: ' + oldMethodEnd);
    
    // Replace the method
    var newScript = oldScript.substring(0, oldMethodStart) + 
                    newGetScoringValues + '\n' +
                    oldScript.substring(oldMethodEnd);
    
    gs.info('New script length: ' + newScript.length + ' chars');
    
    // Update the record
    si.script = newScript;
    si.update();
    
    gs.info('');
    gs.info('=== UPDATE COMPLETE ===');
    gs.info('✅ Script Include updated successfully!');
    gs.info('New mod_count: ' + si.sys_mod_count);
    gs.info('');
    gs.info('Changes made:');
    gs.info('  • getScoringValues() now queries u_x_1447726_planni_0_scoring_value child table');
    gs.info('  • Returns display_value, actual_value, sequence, and description');
    gs.info('');
    gs.info('Next: Test the voting interface with T-shirt sizes or ? card');
    
})();
