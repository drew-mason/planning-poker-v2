getCurrentUser: function() {
    try {
        var user = gs.getUser();
        
        // More defensive - check if user methods exist
        if (!user) {
            gs.error('PlanningPokerAjax.getCurrentUser: gs.getUser() returned null');
            return JSON.stringify({
                sys_id: gs.getUserID() || 'unknown',
                user_name: gs.getUserName() || 'unknown',
                display_name: gs.getUserDisplayName() || 'User',
                email: ''
            });
        }
        
        var userData = {
            sys_id: user.getID() || gs.getUserID() || 'unknown',
            user_name: user.getUserName() || gs.getUserName() || 'unknown',
            display_name: user.getDisplayName() || gs.getUserDisplayName() || 'User',
            email: user.getEmail() || ''
        };
        
        gs.info('PlanningPokerAjax.getCurrentUser: Returning user data for ' + userData.user_name);
        
        return JSON.stringify(userData);
    } catch (e) {
        gs.error('PlanningPokerAjax.getCurrentUser: Error - ' + e.message);
        // Return fallback data
        return JSON.stringify({
            sys_id: gs.getUserID() || 'unknown',
            user_name: gs.getUserName() || 'unknown',
            display_name: gs.getUserDisplayName() || 'User',
            email: ''
        });
    }
},
