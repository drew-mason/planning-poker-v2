/**
 * SIMPLE Planning Poker Ajax Script for Debugging
 * Use this to test basic functionality
 */

var PlanningPokerAjax = Class.create();
PlanningPokerAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    /**
     * Test function to verify Script Include is working
     */
    test: function() {
        return JSON.stringify({
            success: true,
            message: 'Script Include is working!',
            timestamp: new Date().toISOString()
        });
    },
    
    /**
     * Get current user information - simplified
     */
    getCurrentUser: function() {
        try {
            var user = gs.getUser();
            return JSON.stringify({
                success: true,
                user: {
                    sys_id: user.getID(),
                    user_name: user.getUserName(),
                    display_name: user.getDisplayName()
                }
            });
        } catch (e) {
            gs.error('getCurrentUser error: ' + e.message);
            return JSON.stringify({
                success: false,
                error: e.message
            });
        }
    },
    
    /**
     * Get all sessions - simplified
     */
    getAllSessions: function() {
        try {
            var sessionGR = new GlideRecord('x_1447726_planni_0_planning_session');
            sessionGR.orderByDesc('sys_created_on');
            sessionGR.query();
            
            var sessions = [];
            while (sessionGR.next()) {
                sessions.push({
                    sys_id: sessionGR.getUniqueValue(),
                    session_code: sessionGR.getValue('session_code') || 'N/A',
                    session_name: sessionGR.getValue('name'), 
                    description: sessionGR.getValue('description') || '',
                    status: sessionGR.getValue('status') || 'unknown',
                    facilitator_name: sessionGR.facilitator.getDisplayValue() || 'Unknown'
                });
            }
            
            return JSON.stringify({
                success: true,
                sessions: sessions,
                count: sessions.length
            });
        } catch (e) {
            gs.error('getAllSessions error: ' + e.message);
            return JSON.stringify({
                success: false,
                error: e.message
            });
        }
    },
    
    /**
     * Get scoring methods - simplified
     */
    getScoringMethods: function() {
        try {
            var methods = [
                {
                    sys_id: 'default-fib',
                    name: 'Fibonacci (1, 2, 3, 5, 8, 13, 21)',
                    values: '1,2,3,5,8,13,21'
                },
                {
                    sys_id: 'default-tshirt', 
                    name: 'T-Shirt Sizes (XS, S, M, L, XL, XXL)',
                    values: 'XS,S,M,L,XL,XXL'
                }
            ];
            
            return JSON.stringify({
                success: true,
                methods: methods
            });
        } catch (e) {
            gs.error('getScoringMethods error: ' + e.message);
            return JSON.stringify({
                success: false,
                error: e.message
            });
        }
    },
    
    type: 'PlanningPokerAjax'
});