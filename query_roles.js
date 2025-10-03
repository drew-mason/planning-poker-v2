/**
 * Script to query and display all roles related to Planning Poker
 * Run this in ServiceNow Scripts - Background
 */

(function() {
    var results = {
        planning_poker_roles: [],
        facilitator_roles: [],
        observer_roles: [],
        all_app_roles: [],
        duplicate_check: {}
    };
    
    // Query all roles that might be related to Planning Poker
    var roleGR = new GlideRecord('sys_user_role');
    roleGR.addQuery('name', 'CONTAINS', 'x_1447726')
        .addOrCondition('name', 'CONTAINS', 'facilitator')
        .addOrCondition('name', 'CONTAINS', 'poker')
        .addOrCondition('name', 'CONTAINS', 'observer')
        .addOrCondition('name', 'CONTAINS', 'planni_0');
    roleGR.orderBy('name');
    roleGR.query();
    
    gs.info('=== PLANNING POKER RELATED ROLES ===');
    gs.info('Total roles found: ' + roleGR.getRowCount());
    gs.info('');
    
    while (roleGR.next()) {
        var roleName = roleGR.name.toString();
        var roleData = {
            name: roleName,
            sys_id: roleGR.sys_id.toString(),
            description: roleGR.description.toString(),
            created_on: roleGR.sys_created_on.toString(),
            created_by: roleGR.sys_created_by.toString()
        };
        
        // Check for duplicates
        if (!results.duplicate_check[roleName]) {
            results.duplicate_check[roleName] = [];
        }
        results.duplicate_check[roleName].push(roleData.sys_id);
        
        // Categorize the role
        if (roleName.indexOf('x_1447726_planni_0') >= 0) {
            results.all_app_roles.push(roleData);
        }
        
        if (roleName.indexOf('facilitator') >= 0) {
            results.facilitator_roles.push(roleData);
        }
        
        if (roleName.indexOf('observer') >= 0) {
            results.observer_roles.push(roleData);
        }
        
        // Log individual role
        gs.info('Role: ' + roleName);
        gs.info('  Sys ID: ' + roleData.sys_id);
        gs.info('  Description: ' + roleData.description);
        gs.info('  Created: ' + roleData.created_on + ' by ' + roleData.created_by);
        gs.info('');
    }
    
    // Check for duplicates
    gs.info('=== DUPLICATE CHECK ===');
    var hasDuplicates = false;
    for (var roleName in results.duplicate_check) {
        if (results.duplicate_check[roleName].length > 1) {
            hasDuplicates = true;
            gs.warn('⚠️  DUPLICATE FOUND: ' + roleName);
            gs.warn('  Number of duplicates: ' + results.duplicate_check[roleName].length);
            gs.warn('  Sys IDs: ' + results.duplicate_check[roleName].join(', '));
            gs.warn('');
        }
    }
    
    if (!hasDuplicates) {
        gs.info('✅ No duplicate roles found');
    }
    gs.info('');
    
    // Summary
    gs.info('=== SUMMARY ===');
    gs.info('Total App Roles (x_1447726_planni_0.*): ' + results.all_app_roles.length);
    gs.info('Facilitator Roles: ' + results.facilitator_roles.length);
    gs.info('Observer Roles: ' + results.observer_roles.length);
    gs.info('');
    
    // Check role assignments
    gs.info('=== ROLE ASSIGNMENTS ===');
    for (var i = 0; i < results.all_app_roles.length; i++) {
        var role = results.all_app_roles[i];
        var assignmentGR = new GlideRecord('sys_user_has_role');
        assignmentGR.addQuery('role', role.sys_id);
        assignmentGR.query();
        
        gs.info('Role: ' + role.name);
        gs.info('  Assigned to ' + assignmentGR.getRowCount() + ' users');
        
        if (assignmentGR.getRowCount() > 0) {
            var userCount = 0;
            while (assignmentGR.next() && userCount < 10) {
                gs.info('    - ' + assignmentGR.user.getDisplayValue() + ' (' + assignmentGR.user.user_name + ')');
                userCount++;
            }
            if (assignmentGR.getRowCount() > 10) {
                gs.info('    ... and ' + (assignmentGR.getRowCount() - 10) + ' more');
            }
        }
        gs.info('');
    }
    
    return results;
})();
