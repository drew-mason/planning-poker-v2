/**
 * STEP 0: Switch to Default Update Set (Run this FIRST)
 * This fixes the "recently modified in different update set" issue
 * Copy and paste this into Scripts - Background
 * URL: https://dev287878.service-now.com/nav_to.do?uri=sys.scripts.do
 */

(function() {
    gs.info('=== SWITCHING TO DEFAULT UPDATE SET ===');
    
    // Get the "Default" update set
    var updateSetGR = new GlideRecord('sys_update_set');
    updateSetGR.addQuery('name', 'Default');
    updateSetGR.addQuery('state', 'in progress');
    updateSetGR.query();
    
    if (updateSetGR.next()) {
        // Set this as the current update set for this session
        var updateSetId = updateSetGR.sys_id.toString();
        gs.setCurrentApplicationId(updateSetId);
        
        gs.info('✅ Switched to Default update set');
        gs.info('Update Set: ' + updateSetGR.name);
        gs.info('Update Set ID: ' + updateSetId);
        gs.info('');
        gs.info('Now you can run STEP 1 and STEP 2');
    } else {
        gs.error('❌ Default update set not found or not in progress');
        gs.info('');
        gs.info('Alternative: Create a new update set for Planning Poker changes');
        
        // Check current update set
        var currentSet = gs.getCurrentUpdateSetName();
        gs.info('Current update set: ' + currentSet);
    }
})();
