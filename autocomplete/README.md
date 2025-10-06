# Autocomplete Stubs (Zurich Release)

This folder provides editor-side type and API hints for building the Planning Poker v2 scoped app on **ServiceNow Zurich (2025 H1)**. It is **not** deployed to your instance; the files live only in the repository so VS Code (or any TypeScript-aware editor) can surface Glide API completions and inline documentation while you script.

## How to use
- Keep the `autocomplete` directory at the workspace root so your editor can resolve relative imports from `jsconfig.json`.
- Open any `.js`, `.ts`, or `.jsx` file within the repo; the definitions in `client.d.ts`, `server.d.ts`, and `GlideQuery.js` will power IntelliSense, parameter hints, and doc popovers.
- If you add new Script Includes or client scripts, reference the Zurich APIs described below to stay aligned with the platform release.

## Zurich-specific reference links
> All links open the ServiceNow Developer Site with the **Release** filter set to **Zurich**. When browsing manually, always confirm the release picker in the top-right corner is set to Zurich.

### Core server APIs
- [GlideRecord (Zurich)](https://developer.servicenow.com/dev.do#!/reference/api/zurich/server/no-namespace/c_GlideRecordAPI)
- [GlideAjax (Zurich)](https://developer.servicenow.com/dev.do#!/reference/api/zurich/server/no-namespace/c_GlideAjaxAPI)
- [GlideDateTime (Zurich)](https://developer.servicenow.com/dev.do#!/reference/api/zurich/server/no-namespace/c_GlideDateTimeAPI)
- [Scripted REST APIs](https://developer.servicenow.com/dev.do#!/reference/api/zurich/rest/c_ScriptedRESTAPI)

### Advanced server-side topics
- [Scoped Script Includes & Namespaces](https://developer.servicenow.com/dev.do#!/reference/api/zurich/server/scoped_script_include)
- [GlideQuery (Zurich)](https://developer.servicenow.com/dev.do#!/reference/api/zurich/server/no-namespace/c_GlideQueryAPI)
- [GlideAggregate & Analytics](https://developer.servicenow.com/dev.do#!/reference/api/zurich/server/no-namespace/c_GlideAggregateAPI)
- [Transaction & Session Management](https://developer.servicenow.com/dev.do#!/reference/api/zurich/server/no-namespace/c_GlideSessionAPI)
- [Asynchronous Processing (Events & Queues)](https://developer.servicenow.com/dev.do#!/reference/api/zurich/server/no-namespace/c_GlideSystemAPI#r_GlideSystem-eventQueue)

### Client & UI Builder APIs
- [Now Experience UI Framework](https://developer.servicenow.com/dev.do#!/reference/api/zurich/ui-component/c_NowExperienceUIFramework)
- [UI Builder Client Scripts](https://developer.servicenow.com/dev.do#!/reference/api/zurich/ui-builder-client/c_UIBuilderClientAPI)
- [Experience Audience Conditions](https://developer.servicenow.com/dev.do#!/reference/api/zurich/ui-component/c_AudienceConditionsAPI)

### Real-time & data providers
- [Live Data Broker](https://developer.servicenow.com/dev.do#!/reference/api/zurich/ui-data-provider/c_LiveDataBrokerAPI)
- [UI Data Providers](https://developer.servicenow.com/dev.do#!/reference/api/zurich/ui-data-provider/c_UIDataProvidersAPI)

### Automation & Flow
- [Flow Designer Actions](https://developer.servicenow.com/dev.do#!/reference/api/zurich/flow/c_FlowDesignerActionsAPI)
- [Subflows & Triggers](https://developer.servicenow.com/dev.do#!/reference/api/zurich/flow/c_SubflowAPI)
- [Decision Tables & Policies](https://developer.servicenow.com/dev.do#!/reference/api/zurich/decision_tables/c_DecisionTableAPI)
- [Process Automation Designer](https://developer.servicenow.com/dev.do#!/reference/api/zurich/process_automation/c_ProcessAutomationAPI)

### Security & platform
- [Scoped Application Guidelines](https://developer.servicenow.com/dev.do#!/reference/api/zurich/app-engine/c_ScopedApplications)
- [Access Control (ACL) API](https://developer.servicenow.com/dev.do#!/reference/api/zurich/server/no-namespace/c_AccessControlAPI)
- [DevOps & Source Control](https://developer.servicenow.com/dev.do#!/reference/api/zurich/devops/c_DevOpsAPI)
- [Instance Scan & Health Rules](https://developer.servicenow.com/dev.do#!/reference/api/zurich/instance_scan/c_InstanceScanAPI)
- [Security Incident Response Integrations](https://developer.servicenow.com/dev.do#!/reference/api/zurich/security/c_SecurityAPI)

### Update sets & deployment packaging
- [Update Set API](https://developer.servicenow.com/dev.do#!/reference/api/zurich/server/no-namespace/c_UpdateSetAPI)
- [Update Set Best Practices](https://developer.servicenow.com/dev.do#!/reference/bundle/zurich-application-development/page/build/applications/concept/update-set-best-practices.html)

### Performance & observability
- [MetricBase & Time Series APIs](https://developer.servicenow.com/dev.do#!/reference/api/zurich/metricbase/c_MetricBaseAPI)
- [Performance Analytics](https://developer.servicenow.com/dev.do#!/reference/api/zurich/performance_analytics/c_PerformanceAnalyticsAPI)
- [Log Export & Event Management](https://developer.servicenow.com/dev.do#!/reference/api/zurich/it_operations_management/c_EventManagementAPI)

### Integration & platform services
- [IntegrationHub Spokes & Actions](https://developer.servicenow.com/dev.do#!/reference/api/zurich/integrationhub/c_IntegrationHubAPI)
- [MID Server Scripting](https://developer.servicenow.com/dev.do#!/reference/api/zurich/mid_server/c_MIDServerAPI)
- [GraphQL & REST Table APIs](https://developer.servicenow.com/dev.do#!/reference/api/zurich/integration/c_GraphQLAPI)
- [Virtual Agent Designer](https://developer.servicenow.com/dev.do#!/reference/api/zurich/virtual_agent/c_VirtualAgentAPI)

### Testing & quality automation
- [ATF Step Configuration](https://developer.servicenow.com/dev.do#!/reference/api/zurich/auto_test/c_AutomatedTestFrameworkAPI)
- [Unit Testing Framework](https://developer.servicenow.com/dev.do#!/reference/api/zurich/unit_test/c_UnitTestingAPI)
- [Source Control Diff & Review](https://developer.servicenow.com/dev.do#!/reference/api/zurich/source_control/c_SourceControlAPI)

## Lessons learned & instance-specific notes
Whenever we discover behavior, workarounds, or fixes that aren’t covered in the Zurich reference docs, log them here so we can reproduce the outcome consistently.

| Date | Scenario | Symptom / Gap | Fix or Workaround | Follow-up |
| --- | --- | --- | --- | --- |
| _TBD_ | _Example:_ Update set validation | _Example:_ Record left out due to dictionary exclusion | Add table to **Update Set Includes** list before export | _Example:_ Automate via script include |

**How to add an entry**
1. Note the instance or environment where the issue occurred (PDI, dev, prod clone, etc.).
2. Summarize the exact steps or conditions that exposed the gap not covered in the docs.
3. Record the resolution you applied (script fix, dictionary change, ACL tweak, etc.).
4. List any knock-on tasks (tests to run next time, docs to update, automation ideas).
5. Commit the update so the whole team has the history.

This section ensures future update sets—and any Zurich-specific customizations—carry forward every lesson we’ve learned hands-on, even when the official docs are silent.

## Updating the stubs
1. Check the Zurich docs for new or changed APIs.
2. Add or adjust signatures in `client.d.ts` or `server.d.ts` as needed (keep them declarative—no runtime logic).
3. For convenient chaining examples, extend `GlideQuery.js` with the newer Zurich operators, mirroring the documentation examples.
4. Keep comments concise and always cite the URL of the Zurich doc you mirrored so we can trace future changes.

## Why keep everything Zurich-aligned?
- Ensures IntelliSense matches the methods, parameters, and behaviors actually available in your Zurich PDI.
- Prevents accidental use of deprecated or pre-Zurich APIs that might break when deployed.
- Makes onboarding easier for contributors who rely on the autocomplete hints while scripting server-side logic or building UI Builder experiences.

Happy scripting! Keep the release filter on Zurich whenever you reference the developer site to maintain parity with your instance.
