/**
 * Script to clean up duplicate and unused Planning Poker roles
 * Run this in ServiceNow Scripts - Background
 * 
 * This will DELETE the following unused roles:
 * - x_1447726_planni_0_facilitator (duplicate with underscore)
 * - x_1447726_poker.facilitator (old naming)
 * - x_1447726_poker.user (old naming)
 * - x_1447726_poker.voter (old naming)
 * 
 * KEEPS:
 * - x_1447726_planni_0.facilitator (currently in use with 3 users)
 * - x_1447726_planni_0_admin (for future admin use)
 * - x_1447726_planni_0_voter (for future voter permissions)
 */

(function() {
    var results = {
        deleted: [],
        kept: [],
        errors: []
    };
    
    // Roles to delete (unused/duplicate roles)
    var rolesToDelete = [
        'x_1447726_planni_0_facilitator',  // Duplicate with underscore instead of dot
        'x_1447726_poker.facilitator',     // Old naming convention
        'x_1447726_poker.user',            // Old naming convention
        'x_1447726_poker.voter'            // Old naming convention
    ];
    
    gs.info('=== PLANNING POKER ROLE CLEANUP ===');
    gs.info('Starting cleanup of unused/duplicate roles...');
    gs.info('');
    
    // Delete specified roles
    for (var i = 0; i < rolesToDelete.length; i++) {
        var roleName = rolesToDelete[i];
        
        var roleGR = new GlideRecord('sys_user_role');
        roleGR.addQuery('name', roleName);
        roleGR.query();
        
        if (roleGR.next()) {
            var roleId = roleGR.sys_id.toString();
            var description = roleGR.description.toString();
            
            // Check if role is assigned to any users
            var assignmentGR = new GlideRecord('sys_user_has_role');
            assignmentGR.addQuery('role', roleId);
            assignmentGR.query();
            var assignmentCount = assignmentGR.getRowCount();
            
            if (assignmentCount > 0) {
                gs.warn('⚠️  SKIPPED: ' + roleName);
                gs.warn('   Reason: Role is assigned to ' + assignmentCount + ' user(s)');
                gs.warn('   Cannot delete - remove user assignments first');
                results.errors.push({
                    role: roleName,
                    reason: 'Role has ' + assignmentCount + ' user assignments'
                });
            } else {
                // Safe to delete
                try {
                    roleGR.deleteRecord();
                    gs.info('✅ DELETED: ' + roleName);
                    gs.info('   Sys ID: ' + roleId);
                    gs.info('   Description: ' + description);
                    results.deleted.push({
                        name: roleName,
                        sys_id: roleId,
                        description: description
                    });
                } catch (e) {
                    gs.error('❌ ERROR deleting ' + roleName + ': ' + e.message);
                    results.errors.push({
                        role: roleName,
                        reason: e.message
                    });
                }
            }
        } else {
            gs.info('ℹ️  Role not found: ' + roleName + ' (may have been deleted already)');
        }
        gs.info('');
    }
    
    // List roles that are being kept
    gs.info('=== ROLES KEPT (Active or Reserved) ===');
    
    var keptRoles = [
        'x_1447726_planni_0.facilitator',
        'x_1447726_planni_0_admin',
        'x_1447726_planni_0_voter'
    ];
    
    for (var j = 0; j < keptRoles.length; j++) {
        var keepRoleName = keptRoles[j];
        var keepRoleGR = new GlideRecord('sys_user_role');
        keepRoleGR.addQuery('name', keepRoleName);
        keepRoleGR.query();
        
        if (keepRoleGR.next()) {
            var keepAssignmentGR = new GlideRecord('sys_user_has_role');
            keepAssignmentGR.addQuery('role', keepRoleGR.sys_id.toString());
            keepAssignmentGR.query();
            var keepAssignmentCount = keepAssignmentGR.getRowCount();
            
            gs.info('✓ KEPT: ' + keepRoleName);
            gs.info('  Sys ID: ' + keepRoleGR.sys_id.toString());
            gs.info('  Description: ' + keepRoleGR.description.toString());
            gs.info('  Assigned to: ' + keepAssignmentCount + ' user(s)');
            
            results.kept.push({
                name: keepRoleName,
                sys_id: keepRoleGR.sys_id.toString(),
                description: keepRoleGR.description.toString(),
                user_count: keepAssignmentCount
            });
        }
        gs.info('');
    }
    
    // Summary
    gs.info('=== CLEANUP SUMMARY ===');
    gs.info('Roles deleted: ' + results.deleted.length);
    gs.info('Roles kept: ' + results.kept.length);
    gs.info('Errors/Warnings: ' + results.errors.length);
    gs.info('');
    
    if (results.deleted.length > 0) {
        gs.info('✅ Cleanup completed successfully');
        gs.info('Deleted roles: ' + results.deleted.map(function(r) { return r.name; }).join(', '));
    }
    
    if (results.errors.length > 0) {
        gs.warn('⚠️  Some roles could not be deleted:');
        results.errors.forEach(function(err) {
            gs.warn('  - ' + err.role + ': ' + err.reason);
        });
    }
    
    gs.info('');
    gs.info('=== FINAL ROLE STRUCTURE ===');
    gs.info('Active facilitator role: x_1447726_planni_0.facilitator (with dot)');
    gs.info('Reserved admin role: x_1447726_planni_0_admin');
    gs.info('Reserved voter role: x_1447726_planni_0_voter');
    gs.info('');
    gs.info('All role references in code use: x_1447726_planni_0.facilitator');
    
    return results;
})();
