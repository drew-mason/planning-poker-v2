/**
 * Script to create demo users and groups for Planning Poker testing
 * Run this in ServiceNow Scripts - Background
 */

(function() {
    var results = {
        groups: [],
        dealers: [],
        players: [],
        errors: []
    };
    
    // Create Demo Dealers Group
    var dealerGroup = new GlideRecord('sys_user_group');
    dealerGroup.addQuery('name', 'Demo Dealers');
    dealerGroup.query();
    
    if (!dealerGroup.next()) {
        dealerGroup.initialize();
        dealerGroup.name = 'Demo Dealers';
        dealerGroup.description = 'Demo group for Planning Poker facilitators/dealers';
        dealerGroup.type = 'Planning Poker Facilitators';
        dealerGroup.active = true;
        var dealerGroupId = dealerGroup.insert();
        results.groups.push({name: 'Demo Dealers', sys_id: dealerGroupId});
        gs.info('Created Demo Dealers group: ' + dealerGroupId);
    } else {
        var dealerGroupId = dealerGroup.sys_id.toString();
        results.groups.push({name: 'Demo Dealers', sys_id: dealerGroupId, status: 'already exists'});
        gs.info('Demo Dealers group already exists: ' + dealerGroupId);
    }
    
    // Create Demo Players Group
    var playerGroup = new GlideRecord('sys_user_group');
    playerGroup.addQuery('name', 'Demo Players');
    playerGroup.query();
    
    if (!playerGroup.next()) {
        playerGroup.initialize();
        playerGroup.name = 'Demo Players';
        playerGroup.description = 'Demo group for Planning Poker voters/players';
        playerGroup.type = 'Planning Poker Voters';
        playerGroup.active = true;
        var playerGroupId = playerGroup.insert();
        results.groups.push({name: 'Demo Players', sys_id: playerGroupId});
        gs.info('Created Demo Players group: ' + playerGroupId);
    } else {
        var playerGroupId = playerGroup.sys_id.toString();
        results.groups.push({name: 'Demo Players', sys_id: playerGroupId, status: 'already exists'});
        gs.info('Demo Players group already exists: ' + playerGroupId);
    }
    
    // Get or create Planning Poker Facilitator role
    var facilitatorRole = new GlideRecord('sys_user_role');
    facilitatorRole.addQuery('name', 'x_1447726_planni_0.facilitator');
    facilitatorRole.query();
    
    if (!facilitatorRole.next()) {
        facilitatorRole.initialize();
        facilitatorRole.name = 'x_1447726_planni_0.facilitator';
        facilitatorRole.description = 'Planning Poker Facilitator - Can create and manage sessions';
        facilitatorRole.assignable_by = '';
        var facilitatorRoleId = facilitatorRole.insert();
        gs.info('Created facilitator role: ' + facilitatorRoleId);
    } else {
        var facilitatorRoleId = facilitatorRole.sys_id.toString();
        gs.info('Facilitator role already exists: ' + facilitatorRoleId);
    }
    
    // Create Demo Dealer Users
    var dealerUsers = [
        {user_name: 'demo.dealer1', first_name: 'Alice', last_name: 'Facilitator', email: 'alice.facilitator@demo.com'},
        {user_name: 'demo.dealer2', first_name: 'Bob', last_name: 'Scrum', email: 'bob.scrum@demo.com'},
        {user_name: 'demo.dealer3', first_name: 'Carol', last_name: 'Manager', email: 'carol.manager@demo.com'}
    ];
    
    for (var i = 0; i < dealerUsers.length; i++) {
        var dealerData = dealerUsers[i];
        
        // Check if user exists
        var existingDealer = new GlideRecord('sys_user');
        existingDealer.addQuery('user_name', dealerData.user_name);
        existingDealer.query();
        
        if (!existingDealer.next()) {
            var dealer = new GlideRecord('sys_user');
            dealer.initialize();
            dealer.user_name = dealerData.user_name;
            dealer.first_name = dealerData.first_name;
            dealer.last_name = dealerData.last_name;
            dealer.email = dealerData.email;
            dealer.active = true;
            dealer.user_password.setDisplayValue('Demo123!'); // Set default password
            var dealerId = dealer.insert();
            
            if (dealerId) {
                results.dealers.push({
                    user_name: dealerData.user_name,
                    name: dealerData.first_name + ' ' + dealerData.last_name,
                    sys_id: dealerId
                });
                gs.info('Created dealer user: ' + dealerData.user_name + ' (' + dealerId + ')');
                
                // Add to Demo Dealers group
                var dealerMember = new GlideRecord('sys_user_grmember');
                dealerMember.initialize();
                dealerMember.group = dealerGroupId;
                dealerMember.user = dealerId;
                dealerMember.insert();
                gs.info('Added ' + dealerData.user_name + ' to Demo Dealers group');
                
                // Add facilitator role
                var dealerRoleMember = new GlideRecord('sys_user_has_role');
                dealerRoleMember.initialize();
                dealerRoleMember.user = dealerId;
                dealerRoleMember.role = facilitatorRoleId;
                dealerRoleMember.state = 'active';
                dealerRoleMember.insert();
                gs.info('Added facilitator role to ' + dealerData.user_name);
            } else {
                results.errors.push('Failed to create dealer: ' + dealerData.user_name);
            }
        } else {
            var dealerId = existingDealer.sys_id.toString();
            results.dealers.push({
                user_name: dealerData.user_name,
                name: dealerData.first_name + ' ' + dealerData.last_name,
                sys_id: dealerId,
                status: 'already exists'
            });
            gs.info('Dealer user already exists: ' + dealerData.user_name);
            
            // Ensure they're in the group
            var checkMember = new GlideRecord('sys_user_grmember');
            checkMember.addQuery('group', dealerGroupId);
            checkMember.addQuery('user', dealerId);
            checkMember.query();
            
            if (!checkMember.next()) {
                var dealerMember = new GlideRecord('sys_user_grmember');
                dealerMember.initialize();
                dealerMember.group = dealerGroupId;
                dealerMember.user = dealerId;
                dealerMember.insert();
                gs.info('Added existing user ' + dealerData.user_name + ' to Demo Dealers group');
            }
            
            // Ensure they have facilitator role
            var checkRole = new GlideRecord('sys_user_has_role');
            checkRole.addQuery('user', dealerId);
            checkRole.addQuery('role', facilitatorRoleId);
            checkRole.query();
            
            if (!checkRole.next()) {
                var dealerRoleMember = new GlideRecord('sys_user_has_role');
                dealerRoleMember.initialize();
                dealerRoleMember.user = dealerId;
                dealerRoleMember.role = facilitatorRoleId;
                dealerRoleMember.state = 'active';
                dealerRoleMember.insert();
                gs.info('Added facilitator role to existing user ' + dealerData.user_name);
            }
        }
    }
    
    // Create Demo Player Users
    var playerUsers = [
        {user_name: 'demo.player1', first_name: 'David', last_name: 'Developer', email: 'david.developer@demo.com'},
        {user_name: 'demo.player2', first_name: 'Emma', last_name: 'Engineer', email: 'emma.engineer@demo.com'},
        {user_name: 'demo.player3', first_name: 'Frank', last_name: 'Programmer', email: 'frank.programmer@demo.com'},
        {user_name: 'demo.player4', first_name: 'Grace', last_name: 'Coder', email: 'grace.coder@demo.com'},
        {user_name: 'demo.player5', first_name: 'Henry', last_name: 'Backend', email: 'henry.backend@demo.com'},
        {user_name: 'demo.player6', first_name: 'Iris', last_name: 'Frontend', email: 'iris.frontend@demo.com'},
        {user_name: 'demo.player7', first_name: 'Jack', last_name: 'Fullstack', email: 'jack.fullstack@demo.com'},
        {user_name: 'demo.player8', first_name: 'Kate', last_name: 'DevOps', email: 'kate.devops@demo.com'}
    ];
    
    for (var j = 0; j < playerUsers.length; j++) {
        var playerData = playerUsers[j];
        
        // Check if user exists
        var existingPlayer = new GlideRecord('sys_user');
        existingPlayer.addQuery('user_name', playerData.user_name);
        existingPlayer.query();
        
        if (!existingPlayer.next()) {
            var player = new GlideRecord('sys_user');
            player.initialize();
            player.user_name = playerData.user_name;
            player.first_name = playerData.first_name;
            player.last_name = playerData.last_name;
            player.email = playerData.email;
            player.active = true;
            player.user_password.setDisplayValue('Demo123!'); // Set default password
            var playerId = player.insert();
            
            if (playerId) {
                results.players.push({
                    user_name: playerData.user_name,
                    name: playerData.first_name + ' ' + playerData.last_name,
                    sys_id: playerId
                });
                gs.info('Created player user: ' + playerData.user_name + ' (' + playerId + ')');
                
                // Add to Demo Players group
                var playerMember = new GlideRecord('sys_user_grmember');
                playerMember.initialize();
                playerMember.group = playerGroupId;
                playerMember.user = playerId;
                playerMember.insert();
                gs.info('Added ' + playerData.user_name + ' to Demo Players group');
            } else {
                results.errors.push('Failed to create player: ' + playerData.user_name);
            }
        } else {
            var playerId = existingPlayer.sys_id.toString();
            results.players.push({
                user_name: playerData.user_name,
                name: playerData.first_name + ' ' + playerData.last_name,
                sys_id: playerId,
                status: 'already exists'
            });
            gs.info('Player user already exists: ' + playerData.user_name);
            
            // Ensure they're in the group
            var checkPlayerMember = new GlideRecord('sys_user_grmember');
            checkPlayerMember.addQuery('group', playerGroupId);
            checkPlayerMember.addQuery('user', playerId);
            checkPlayerMember.query();
            
            if (!checkPlayerMember.next()) {
                var playerMember = new GlideRecord('sys_user_grmember');
                playerMember.initialize();
                playerMember.group = playerGroupId;
                playerMember.user = playerId;
                playerMember.insert();
                gs.info('Added existing user ' + playerData.user_name + ' to Demo Players group');
            }
        }
    }
    
    // Print summary
    gs.info('=== DEMO SETUP COMPLETE ===');
    gs.info('Groups created/verified: ' + results.groups.length);
    gs.info('Dealer users created/verified: ' + results.dealers.length);
    gs.info('Player users created/verified: ' + results.players.length);
    
    if (results.errors.length > 0) {
        gs.error('Errors encountered: ' + results.errors.length);
        results.errors.forEach(function(error) {
            gs.error('  - ' + error);
        });
    }
    
    // Return results as JSON for easy viewing
    gs.info('Results: ' + JSON.stringify(results, null, 2));
    
    return results;
})();
