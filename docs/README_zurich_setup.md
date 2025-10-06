# Planning Poker v2 on ServiceNow Zurich

## About this guide
This README walks you—an admin or builder with beginner/intermediate UI Builder experience—through creating the Planning Poker v2 scoped application entirely inside a ServiceNow Zurich instance. Every step references the source artifacts that live in this repository and translates them into point-and-click actions in the platform, including the exact fields, inputs, and Zurich-specific enhancements (Live Data Broker, Redwood components, Now Assist).

> **Tip:** Keep this README open side-by-side with your PDI. Each numbered section ends with green check ✅ milestones so you can track progress.

## Prerequisites
| What you need | Why it matters | Where to obtain/enable |
| --- | --- | --- |
| Zurich (H1 2025) Personal Developer Instance | Access to Live Data Broker, Redwood UI components, Now Assist for App Engine Studio | Request or reset at [developer.servicenow.com](https://developer.servicenow.com/) |
| Admin or App Engine Admin role | Required to create scoped apps, tables, roles, ACLs, and UI experiences | Elevate in your PDI |
| Plugins: App Engine Studio, Experience Builder, DevOps, Flow Designer, Live Data Broker | Power the UI Builder and real-time features used in this guide | System Definition → Plugins |
| This repository (local clone or download) | Contains the canonical JSON definitions and scripts you’ll copy into the instance | `git clone https://github.com/drew-mason/planning-poker-v2.git` |
| Now CLI profile (`snc`) *(optional but recommended later)* | Enables automated deploys once the app is built | `npm install -g @servicenow/cli` then `snc auth login` |

## Artifact quick map
| Repository artifact | Purpose | Where it lands in Zurich |
| --- | --- | --- |
| `src/tables/*.json` | Table schemas | Table Builder / Schema configuration |
| `src/roles/planning_poker_roles.json` | Role names and hierarchy | Roles module |
| `src/server-scripts/PlanningPokerAjax.js` | Script Include logic | Script Include (client-callable) |
| `src/ui-pages/voting_interface.html` | Legacy UI Page markup | UI Builder equivalent or classic UI Page |
| `src/menus/application_menu.json` | App navigation | Application Menu + Modules |
| `src/data/default_data_setup.js` | Seed data script | Background Script |
| `docs/implementation-guide.md` | Functional overview | Reference while testing |

---

## ✅ Step 1 – Create the scoped application shell
1. Launch **App Engine Studio** → **Create App** → **From scratch**.
2. Fill the wizard:
   - **App name:** `Planning Poker v2`
   - **App description:** `Interactive Planning Poker for agile estimation`
   - **Scope name:** it must match `x_1447726_planni_0` (App Engine Studio will prefill based on the name; edit if needed).
   - **Version control:** leave off for now; we’ll connect later.
3. Open the new app in **Studio** (Use "Open in Studio" shortcut from App Engine Studio).

✅ *Milestone:* Scoped app exists and opens in Studio with the correct scope string.

---

## ✅ Step 2 – Set up roles
1. In Studio, navigate to **Security → Roles** → **New** and create the three roles below. The *Name* field must match exactly; Description can be copied.

| Label | Name (sys_id) | Who can assign |
| --- | --- | --- |
| Planning Poker Voter | `x_1447726_planni_0_voter` | `x_1447726_planni_0_facilitator`, `x_1447726_planni_0_admin` |
| Planning Poker Facilitator | `x_1447726_planni_0_facilitator` | `x_1447726_planni_0_admin` |
| Planning Poker Administrator | `x_1447726_planni_0_admin` | `admin` |

2. If you prefer automation, run the snippet below as a **Background Script** after verifying the names above:

```javascript
var roles = [
  {name: 'x_1447726_planni_0_voter', description: 'Planning Poker Voter'},
  {name: 'x_1447726_planni_0_facilitator', description: 'Planning Poker Facilitator'},
  {name: 'x_1447726_planni_0_admin', description: 'Planning Poker Administrator'}
];
roles.forEach(function(r){
  var gr = new GlideRecord('sys_user_role');
  gr.addQuery('name', r.name);
  gr.query();
  if(!gr.next()){
    gr.initialize();
    gr.name = r.name;
    gr.description = r.description;
    gr.insert();
  }
});
```

✅ *Milestone:* All three roles appear under the app scope.

---

## ✅ Step 3 – Build tables and columns
We’ll create four tables. Use Studio’s Table Builder (Zurich lets you paste JSON column definitions, but we’ll walk through the manual steps).

### 3.1 Planning Session (`x_1447726_planni_0_planning_session`)
1. **Create Table** → Name `Planning Session`, extends `Task` (search and select).
2. Add the columns below (Studio automatically includes Task fields like `number`, `short_description`; you can hide or reuse them later).

| Field label | Column name | Type | Mandatory | Notes |
| --- | --- | --- | --- | --- |
| Session Name | `name` | String (100) | ✅ | Display value for sessions |
| Description | `description` | String (4000) | – | Rich session notes |
| Facilitator | `facilitator` | Reference → `sys_user` | ✅ | Owner of the session |
| Status | `status` | Choice | – | Choices: `active`, `completed`, `cancelled` (set default `active`) |
| Scoring Method | `scoring_method` | Reference → `x_1447726_planni_0_scoring_method` | – | Pick the scoring scale |

3. **Choice setup:** For the `status` field, open the dictionary entry → **Choices** tab → add the three values with matching labels. Mark `active` as the default.
4. **Form layout:** Add the fields to the main form (Session Name, Facilitator, Status, Scoring Method, Description).

### 3.2 Session Stories (`x_1447726_planni_0_session_stories`)
1. Create a new table (no parent/extends).
2. Add the columns:

| Field label | Column name | Type | Mandatory | Notes |
| --- | --- | --- | --- | --- |
| Planning Session | `session` | Reference → Planning Session | ✅ | Links story to session |
| Story Number | `story_number` | String (50) | – | Optional JIRA/ADO key |
| Story Title | `story_title` | String (200) | ✅ | Story summary |
| Story Description | `story_description` | String (4000) | – | Long description |
| Acceptance Criteria | `acceptance_criteria` | String (4000) | – | Use multi-line text |
| Final Story Points | `story_points` | String (10) | – | Filled after consensus |
| Status | `status` | Choice | – | Values: `pending`, `voting`, `completed`, `skipped` (default `pending`) |
| Display Order | `order` | Integer | – | Default 100; controls sequencing |
| Voting Started | `voting_started` | Date/Time | – | Populated by Script Include |
| Voting Completed | `voting_completed` | Date/Time | – | Populated when votes reveal |

3. Add the choice values for `status` as listed.
4. Optional: create a **List Layout** grouped by `session` and sorted by `order` to mirror the facilitator view.

### 3.3 Planning Vote (`x_1447726_planni_0_planning_vote`)
1. Create table (no parent).
2. Columns:

| Field label | Column name | Type | Mandatory | Notes |
| --- | --- | --- | --- | --- |
| Planning Session | `session` | Reference → Planning Session | ✅ | Redundant to speed queries |
| Story | `story` | Reference → Session Stories | ✅ | Story being estimated |
| Voter | `voter` | Reference → `sys_user` | ✅ | Participant |
| Vote Value | `vote_value` | String (10) | ✅ | Selected card |
| Vote Time | `vote_time` | Date/Time | ✅ | Auto-filled |
| Final Vote | `is_final_vote` | True/False | – | Reserved for future logic |

3. **Create unique index:** Under the table’s definition, choose **Indexes** → **New**:
   - **Name:** `session_story_voter`
   - **Fields:** `session`, `story`, `voter`
   - Check **Unique**

### 3.4 Scoring Method (`x_1447726_planni_0_scoring_method`)
1. Create table (no parent).
2. Columns:

| Field label | Column name | Type | Mandatory | Notes |
| --- | --- | --- | --- | --- |
| Method Name | `name` | String (100) | ✅ | Mark as **Unique** in Dictionary |
| Description | `description` | String (4000) | – | |
| Valid Values | `values` | String (500) | ✅ | Comma-separated list (e.g., `1,2,3,5,8,?`) |
| Default Method | `is_default` | True/False | – | Default `false` |
| Active | `active` | True/False | – | Default `true` |
| Allow Custom Values | `allow_custom_values` | True/False | – | Default `false` |

✅ *Milestone:* All four tables exist with correct columns, choices, and indexes.

---

## ✅ Step 4 – ACLs and security posture
1. Open **System Security → Access Control (ACL)**, filter by your scope, and verify the automatically created table ACLs. Zurich typically generates CRUD rules when you create tables; adjust so that:
   - Facilitators and Admins can **create/read/update/delete** sessions and stories.
   - Voters need **create/read** on votes (to record their vote) but no delete.
2. To speed things up, run `src/diagnostics/create_acl_permissions.js` using Background Scripts. This script creates role-based ACLs consistent with the app design. Paste the entire file contents and execute in scope `x_1447726_planni_0`.
3. Flush the ACL cache (System Security → Access Control → **Flush**).

✅ *Milestone:* ACL test (impersonate each role) behaves as expected.

---

## ✅ Step 5 – Server logic: Script Include
1. In Studio, go to **Script Includes** → **New**.
2. Fill out the form:
   - **Name:** `PlanningPokerAjax`
   - **Application:** Planning Poker v2 (your scope)
   - **Accessible from:** All application scopes (recommended)
   - **API name:** auto-populated to `x_1447726_planni_0.PlanningPokerAjax`
   - Check **Client callable**
3. Paste the contents of `src/server-scripts/PlanningPokerAjax.js` into the script field.
4. Click **Submit**, then **Test** by impersonating a facilitator and calling `/api/now/ui_page.do?name=voting_interface&sysparm_session_id=<session>` later.

✅ *Milestone:* Script Include saves without errors and appears in the app file list.

---

## ✅ Step 6 – User experience (UI Builder path recommended)
You have two options; Option B leverages Zurich’s strengths.

### Option A (baseline): Classic UI Page
1. In Studio, create **UI Page** → `voting_interface`.
2. Set the `HTML` field to the entire contents of `src/ui-pages/voting_interface.html`.
3. Save. The page is immediately usable, but you won’t benefit from Live Data Broker auto-refresh.

### Option B (recommended): Zurich Workspace in Experience Builder
1. Open **Experience → All Experiences** → **Create experience** → choose **Workspace** template (Redwood theme).
2. Name it `Planning Poker Workspace`; scope should auto-fill.
3. In the **Data** panel, click **Add data source** → **Live Data Broker**.
   - **Name:** `SessionStoriesFeed`
   - **Table:** `Session Stories`
   - **Filter:** `session=<URL parameter session_id>` (use a data filter by creating a state parameter `session_id`).
   - Enable **Subscribe to updates** so UI refreshes when votes change status.
4. Add another Live Data Broker instance for the votes table if you plan to show aggregated stats.
5. Configure the **URL route** `/planning-poker` expecting a query parameter `session_id`.
6. On the canvas, drag these Redwood components:
   - **Heading** (Session title) → bind to `SessionStoriesFeed[0].session.name`.
   - **Experience component → Record Card** for the current story.
   - **Repeater** (Grid) → bind to `SessionStoriesFeed` to list stories with status indicators.
   - **Button group** (for facilitator controls) → set visibility to a condition that checks the user’s role: `gs.hasRole('x_1447726_planni_0_facilitator')` (use Audience conditions in Experience Builder).
   - **Interactive Tile set** → build card-like buttons for each value in the active scoring method. (Easiest approach: create a client script that splits the `values` string into an array and bind it to a repeater of buttons.)
7. Use the **Client Script Editor** inside UI Builder to recreate the GlideAjax calls: Zurich’s UI Builder supports the `snAjax` client SDK. Example skeleton:

```javascript
api.data.fetchSession = async () => {
  const response = await snHttpClient.request({
    url: `/api/now/v1/x_1447726_planni_0/planningpokerajax/getSession`,
    query: { session_id: api.state.session_id }
  });
  api.state.session = response.result;
};
```

*(Replace with the actual REST endpoint you expose; see “Expose Script Include as REST” below.)*

8. Expose your Script Include as a Scripted REST API for easier consumption from UI Builder:
   - **System Web Services → REST → Scripted REST APIs** → New → Name `Planning Poker Ajax`.
   - Create resources `getSession`, `castVote`, etc., calling the same server methods.
   - Update the UI Builder client scripts to call the REST resources using `snHttpClient`.
9. Publish the experience and grab its URL for the menu module in Step 7.

> **Beginner UI Builder tip:** Use **Preview data** to inspect bindings in real time. If a tile or repeater doesn’t show values, open the **Data panel** and confirm your Live Data Broker query returns rows (remember to open the experience with a real `session_id`).

✅ *Milestone:* Either the UI Page loads correctly or the workspace publishes and displays session details.

---

## ✅ Step 7 – Navigation menu
1. In Studio, open **Application Menu** → New.
   - **Title:** `Planning Poker v2`
   - **Hint:** `Interactive Planning Poker for Agile Story Point Estimation`
   - Ensure **Active** is checked.
2. Create modules matching `src/menus/application_menu.json`:

| Title | Type | Target | Roles |
| --- | --- | --- | --- |
| Sessions | List | Planning Session table | Facilitator, Admin |
| Create Session | New Record | Planning Session table | Facilitator, Admin |
| My Sessions | List (with filter `facilitator=javascript:gs.getUserID()`) | Planning Session | Facilitator |
| Join Session | Page | `x_1447726_planni_0_voting_interface` UI Page **or** Workspace route | Voter, Facilitator, Admin |
| Stories | List | Session Stories table | Facilitator, Admin |
| Votes | List | Planning Vote table | Facilitator, Admin |
| Scoring Methods | List | Scoring Method table | Admin |

3. For workspace routing, choose **URL (Dynamic)** and paste the experience URL with `?session_id=` placeholder.

✅ *Milestone:* Application menu shows modules tied to roles when impersonating users.

---

## ✅ Step 8 – Seed data and assign roles
1. Open **System Definition → Scripts – Background**. Ensure scope is Planning Poker v2.
2. Paste the contents of `src/data/default_data_setup.js` and click **Run script**.
3. Review the log for green check output confirming scoring methods, sample session, and stories.
4. Navigate to **User Administration → Users**, assign:
   - Facilitator role to yourself (so you can run controls).
   - Voter role to test accounts.

✅ *Milestone:* Sample session exists with three stories; scoring methods populated.

---

## ✅ Step 9 – Optional Zurich enhancements
| Enhancement | How to implement | Benefit |
| --- | --- | --- |
| Replace polling with Live Data Broker | Subscribe UI Builder components to `Session Stories` and `Planning Vote` tables | Vote tallies update instantly |
| Now Assist code suggestions | When editing Script Include or flows, click **Now Assist** to get GlideRecord boilerplate | Speeds up scripting |
| Flow Designer automation | Create a flow triggered on `Planning Vote` insert to send MS Teams/Slack notifications | Keep team informed |
| DevOps health report | Run **System Diagnostics → App Health** on your scope | Catch missing modules or security issues before deploy |

✅ *Milestone:* At least one Zurich-only enhancement active (optional but recommended).

---

## ✅ Step 10 – Test end-to-end
1. Impersonate a facilitator:
   - Open **Planning Poker v2 → Sessions** → open “Sample Planning Session”.
   - Launch the UI (UI Page or Workspace) with `&session_id=<sys_id>`.
   - Click **Start Voting**; confirm story status moves to `voting`.
2. Impersonate a voter in another browser or incognito window:
   - Navigate to the same session link.
   - Select a card; verify your vote appears and the participant tile shows a check.
3. Back as facilitator, click **Reveal Votes**, confirm results summary appears and `Session Stories` status switches to `completed`.
4. Run the **Diagnostics script** (`src/diagnostics/discover_planning_poker_v2.js`) if you want a quick sanity check of tables/roles/menu wiring.

✅ *Milestone:* Voting workflow works for at least two users.

---

## Troubleshooting checklist
- **Cards aren’t showing in UI Builder:** Ensure your data source returns `scoring_method.values`. If you’re using Live Data Broker, add a **Related records** request for the session’s scoring method.
- **Votes never reveal:** Verify facilitators have the correct role and that `_isFacilitator` helper resolves true. Misassigned roles are the top issue.
- **Duplicate vote errors:** Confirm the unique index on the `Planning Vote` table is active. If not, delete and recreate with the exact field order.
- **ACL denials in logs:** Rerun `create_acl_permissions.js` or inspect ACLs for the votes table; Voter role needs insert/update.
- **Experience Builder data doesn’t refresh:** Confirm the Live Data Broker data source has **Subscribe to updates** checked and that your table has *Stream to client* enabled (Zurich adds this toggle on the table’s form header).

---

## Next steps
- Connect the app to this GitHub repo using Zurich’s **Manage Source Control** wizard for change tracking.
- Set up DevOps pipelines or leverage `npm run deploy` once the `snc` CLI profile is configured.
- Extend the workspace with analytics widgets (e.g., average velocity per session) using Zurich’s ready-to-use dashboard components.

> **You’re done!** Your Zurich PDI now hosts a functional Planning Poker application built entirely from in-platform tools, with a modern experience and real-time updates.
