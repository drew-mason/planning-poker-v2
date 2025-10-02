/**
 * ACL Permissions Setup for Planning Poker v2
 * Scope: x_1447726_planni_0
 * 
 * Creates proper Access Control List (ACL) permissions for all Planning Poker tables
 * Run this in ServiceNow Background Scripts (Global scope)
 */

gs.info("=== CREATING ACL PERMISSIONS FOR PLANNING POKER V2 ===");

// Define the tables and their expected ACL permissions
var tables = [
    'x_1447726_planni_0_planning_session',
    'x_1447726_planni_0_planning_vote',
    'x_1447726_planni_0_session_stories',
    'x_1447726_planni_0_scoring_method'
];

// Define roles
var roles = {
    voter: 'x_1447726_planni_0_voter',
    facilitator: 'x_1447726_planni_0_facilitator',
    admin: 'x_1447726_planni_0_admin'
};

// ACL Configuration
var aclConfigs = [
    // Planning Session ACLs
    {
        table: 'x_1447726_planni_0_planning_session',
        operation: 'read',
        roles: [roles.voter, roles.facilitator, roles.admin],
        condition: ''
    },
    {
        table: 'x_1447726_planni_0_planning_session',
        operation: 'create',
        roles: [roles.facilitator, roles.admin],
        condition: ''
    },
    {
        table: 'x_1447726_planni_0_planning_session',
        operation: 'write',
        roles: [roles.facilitator, roles.admin],
        condition: ''
    },
    {
        table: 'x_1447726_planni_0_planning_session',
        operation: 'delete',
        roles: [roles.admin],
        condition: ''
    },
    
    // Planning Vote ACLs
    {
        table: 'x_1447726_planni_0_planning_vote',
        operation: 'read',
        roles: [roles.voter, roles.facilitator, roles.admin],
        condition: ''
    },
    {
        table: 'x_1447726_planni_0_planning_vote',
        operation: 'create',
        roles: [roles.voter, roles.facilitator, roles.admin],
        condition: ''
    },
    {
        table: 'x_1447726_planni_0_planning_vote',
        operation: 'write',
        roles: [roles.voter, roles.facilitator, roles.admin],
        condition: 'gs.getUserID() == current.voter'
    },
    {
        table: 'x_1447726_planni_0_planning_vote',
        operation: 'delete',
        roles: [roles.facilitator, roles.admin],
        condition: ''
    },
    
    // Session Stories ACLs
    {
        table: 'x_1447726_planni_0_session_stories',
        operation: 'read',
        roles: [roles.voter, roles.facilitator, roles.admin],
        condition: ''
    },
    {
        table: 'x_1447726_planni_0_session_stories',
        operation: 'create',
        roles: [roles.facilitator, roles.admin],
        condition: ''
    },
    {
        table: 'x_1447726_planni_0_session_stories',
        operation: 'write',
        roles: [roles.facilitator, roles.admin],
        condition: ''
    },
    {
        table: 'x_1447726_planni_0_session_stories',
        operation: 'delete',
        roles: [roles.facilitator, roles.admin],
        condition: ''
    },
    
    // Scoring Method ACLs
    {
        table: 'x_1447726_planni_0_scoring_method',
        operation: 'read',
        roles: [roles.voter, roles.facilitator, roles.admin],
        condition: ''
    },
    {
        table: 'x_1447726_planni_0_scoring_method',
        operation: 'create',
        roles: [roles.admin],
        condition: ''
    },
    {
        table: 'x_1447726_planni_0_scoring_method',
        operation: 'write',
        roles: [roles.admin],
        condition: ''
    },
    {
        table: 'x_1447726_planni_0_scoring_method',
        operation: 'delete',
        roles: [roles.admin],
        condition: ''
    }
];

// Function to create or update ACL
function createACL(config) {
    // Check if ACL already exists
    var existingACL = new GlideRecord('sys_security_acl');
    existingACL.addQuery('name', config.table);
    existingACL.addQuery('operation', config.operation);
    existingACL.query();
    
    var aclGR;
    if (existingACL.next()) {
        gs.info("   Updating existing ACL for " + config.table + "." + config.operation);
        aclGR = existingACL;
    } else {
        gs.info("   Creating new ACL for " + config.table + "." + config.operation);
        aclGR = new GlideRecord('sys_security_acl');
    }
    
    aclGR.name = config.table;
    aclGR.operation = config.operation;
    aclGR.active = true;
    aclGR.condition = config.condition;
    aclGR.description = 'Planning Poker v2 - ' + config.operation + ' access for ' + config.table;
    aclGR.type = 'record';
    
    if (existingACL.next()) {
        aclGR.update();
    } else {
        aclGR.insert();
    }
    
    var aclSysId = aclGR.sys_id;
    
    // Add roles to ACL
    for (var j = 0; j < config.roles.length; j++) {
        var roleName = config.roles[j];
        
        // Check if role exists
        var roleGR = new GlideRecord('sys_user_role');
        roleGR.addQuery('name', roleName);
        roleGR.query();
        
        if (roleGR.next()) {
            // Check if ACL role relationship already exists
            var aclRoleGR = new GlideRecord('sys_security_acl_role');
            aclRoleGR.addQuery('sys_security_acl', aclSysId);
            aclRoleGR.addQuery('sys_user_role', roleGR.sys_id);
            aclRoleGR.query();
            
            if (!aclRoleGR.next()) {
                // Create the relationship
                var newAclRole = new GlideRecord('sys_security_acl_role');
                newAclRole.sys_security_acl = aclSysId;
                newAclRole.sys_user_role = roleGR.sys_id;
                newAclRole.insert();
                gs.info("     Added role: " + roleName);
            } else {
                gs.info("     Role already exists: " + roleName);
            }
        } else {
            gs.info("     ⚠️  Role not found: " + roleName);
        }
    }
}

// Create all ACLs
gs.info("\nCreating ACL permissions...\n");

for (var i = 0; i < aclConfigs.length; i++) {
    createACL(aclConfigs[i]);
}

gs.info("\n=== ACL CREATION COMPLETE ===");
gs.info("✅ Created/Updated " + aclConfigs.length + " ACL configurations");
gs.info("🔄 Remember to flush ACL cache: System Security > Access Control (ACL) > Flush ACL cache");
gs.info("👥 Don't forget to assign roles to users who need access!");