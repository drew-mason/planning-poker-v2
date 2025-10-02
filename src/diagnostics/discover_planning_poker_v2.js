/**
 * Discovery Script for Planning Poker v2 Application
 * Scope: x_1447726_planni_0
 * 
 * Run this in ServiceNow Background Scripts (Global scope) to discover
 * all components of the Planning Poker v2 application.
 */

gs.info("=== PLANNING POKER V2 DISCOVERY SCRIPT ===");
gs.info("Searching for scope: x_1447726_planni_0");

// 1. Check if the scoped application exists
var appGR = new GlideRecord('sys_app');
appGR.addQuery('scope', 'x_1447726_planni_0');
appGR.query();

gs.info("\n--- APPLICATION INFORMATION ---");
if (appGR.next()) {
    gs.info("✅ Application Found: " + appGR.name);
    gs.info("   Scope: " + appGR.scope);
    gs.info("   Version: " + appGR.version);
    gs.info("   Status: " + (appGR.active ? "Active" : "Inactive"));
    gs.info("   Sys ID: " + appGR.sys_id);
} else {
    gs.info("❌ No scoped application found with scope 'x_1447726_planni_0'");
}

// 2. Find all tables in this scope
var tableGR = new GlideRecord('sys_db_object');
tableGR.addQuery('name', 'STARTSWITH', 'x_1447726_planni_0_');
tableGR.query();

gs.info("\n--- TABLES IN SCOPE ---");
var tableCount = 0;
while (tableGR.next()) {
    tableCount++;
    gs.info("✅ Table " + tableCount + ": " + tableGR.name);
    gs.info("   Label: " + tableGR.label);
    gs.info("   Sys ID: " + tableGR.sys_id);
}

if (tableCount === 0) {
    gs.info("❌ No tables found in scope 'x_1447726_planni_0'");
}

// 3. Find all roles in this scope
var roleGR = new GlideRecord('sys_user_role');
roleGR.addQuery('name', 'STARTSWITH', 'x_1447726_planni_0_');
roleGR.query();

gs.info("\n--- ROLES IN SCOPE ---");
var roleCount = 0;
while (roleGR.next()) {
    roleCount++;
    gs.info("✅ Role " + roleCount + ": " + roleGR.name);
    gs.info("   Description: " + roleGR.description);
    gs.info("   Sys ID: " + roleGR.sys_id);
}

if (roleCount === 0) {
    gs.info("❌ No roles found in scope 'x_1447726_planni_0'");
}

// 4. Find UI Pages in this scope
var pageGR = new GlideRecord('sys_ui_page');
pageGR.addQuery('name', 'STARTSWITH', 'x_1447726_planni_0_');
pageGR.query();

gs.info("\n--- UI PAGES IN SCOPE ---");
var pageCount = 0;
while (pageGR.next()) {
    pageCount++;
    gs.info("✅ UI Page " + pageCount + ": " + pageGR.name);
    gs.info("   Description: " + pageGR.description);
    gs.info("   Endpoint: " + pageGR.name + ".do");
    gs.info("   Sys ID: " + pageGR.sys_id);
}

if (pageCount === 0) {
    gs.info("❌ No UI pages found in scope 'x_1447726_planni_0'");
}

// 5. Find Application Menus
var menuGR = new GlideRecord('sys_app_application');
menuGR.addQuery('scope', 'x_1447726_planni_0');
menuGR.query();

gs.info("\n--- APPLICATION MENUS ---");
var menuCount = 0;
while (menuGR.next()) {
    menuCount++;
    gs.info("✅ Application Menu " + menuCount + ": " + menuGR.title);
    gs.info("   Active: " + (menuGR.active ? "Yes" : "No"));
    gs.info("   Hint: " + menuGR.hint);
    gs.info("   Sys ID: " + menuGR.sys_id);
}

if (menuCount === 0) {
    gs.info("❌ No application menus found in scope 'x_1447726_planni_0'");
}

// 6. Find Application Modules (menu items)
var moduleGR = new GlideRecord('sys_app_module');
moduleGR.addQuery('application.scope', 'x_1447726_planni_0');
moduleGR.query();

gs.info("\n--- APPLICATION MODULES ---");
var moduleCount = 0;
while (moduleGR.next()) {
    moduleCount++;
    gs.info("✅ Module " + moduleCount + ": " + moduleGR.title);
    gs.info("   Application: " + moduleGR.application.getDisplayValue());
    gs.info("   Active: " + (moduleGR.active ? "Yes" : "No"));
    gs.info("   Link Type: " + moduleGR.link_type);
    gs.info("   Sys ID: " + moduleGR.sys_id);
}

if (moduleCount === 0) {
    gs.info("❌ No application modules found in scope 'x_1447726_planni_0'");
}

gs.info("\n=== DISCOVERY COMPLETE ===");
gs.info("Summary:");
gs.info("- Tables: " + tableCount);
gs.info("- Roles: " + roleCount);
gs.info("- UI Pages: " + pageCount);
gs.info("- App Menus: " + menuCount);
gs.info("- Modules: " + moduleCount);