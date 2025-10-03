# Demo Users Setup for Planning Poker

This script creates demo users and groups for testing the Planning Poker application.

## What Gets Created

### Groups
1. **Demo Dealers** - Group for Planning Poker facilitators
2. **Demo Players** - Group for Planning Poker voters/participants

### Demo Dealer Users (3 users)
1. **demo.dealer1** - Alice Facilitator (alice.facilitator@demo.com)
2. **demo.dealer2** - Bob Scrum (bob.scrum@demo.com)
3. **demo.dealer3** - Carol Manager (carol.manager@demo.com)

### Demo Player Users (8 users)
1. **demo.player1** - David Developer (david.developer@demo.com)
2. **demo.player2** - Emma Engineer (emma.engineer@demo.com)
3. **demo.player3** - Frank Programmer (frank.programmer@demo.com)
4. **demo.player4** - Grace Coder (grace.coder@demo.com)
5. **demo.player5** - Henry Backend (henry.backend@demo.com)
6. **demo.player6** - Iris Frontend (iris.frontend@demo.com)
7. **demo.player7** - Jack Fullstack (jack.fullstack@demo.com)
8. **demo.player8** - Kate DevOps (kate.devops@demo.com)

**Default Password:** `Demo123!` (for all demo users)

## How to Run

### Method 1: ServiceNow Scripts - Background

1. Navigate to **System Definition > Scripts - Background** in ServiceNow
2. Copy the entire contents of `create_demo_users.js`
3. Paste into the "Run script" field
4. Click **Run script**
5. Check the output log for confirmation

### Method 2: Using ServiceNow CLI

```bash
cd "/Users/andrewmason/Documents/ServiceNow Projects/planning-poker"
snc script run --file ../planning-poker-v2/create_demo_users.js
```

## Verification

After running the script, verify the setup:

1. **Check Groups:**
   - Navigate to **User Administration > Groups**
   - Search for "Demo Dealers" and "Demo Players"
   - Verify membership counts (3 dealers, 8 players)

2. **Check Users:**
   - Navigate to **User Administration > Users**
   - Search for "demo.dealer" or "demo.player"
   - Verify all 11 users are created and active

3. **Test Login:**
   - Try logging in as one of the demo users
   - Username: `demo.dealer1` (or any other demo user)
   - Password: `Demo123!`

## Usage in Planning Poker

### Creating a Session with Demo Groups

When creating a new Planning Poker session:

1. Click **Create New Session**
2. Fill in session details
3. In the "Add Groups" dropdown, select:
   - **Demo Dealers** - For facilitator testing
   - **Demo Players** - For voter/participant testing
4. Click **Add Group** after selecting each group
5. Create the session

### Testing Different Roles

**Test as Facilitator:**
- Log in as `demo.dealer1`, `demo.dealer2`, or `demo.dealer3`
- Create sessions and manage stories
- See the toggle for completed sessions

**Test as Participant/Voter:**
- Log in as any `demo.player#` user
- Join sessions created by facilitators
- Only see sessions in "in_session" state
- Vote on user stories

## Cleanup (Optional)

If you want to remove the demo users and groups later, run this in Scripts - Background:

```javascript
// Delete demo users
var users = new GlideRecord('sys_user');
users.addQuery('user_name', 'STARTSWITH', 'demo.');
users.query();
while (users.next()) {
    gs.info('Deleting user: ' + users.user_name);
    users.deleteRecord();
}

// Delete demo groups
var groups = new GlideRecord('sys_user_group');
groups.addQuery('name', 'IN', 'Demo Dealers,Demo Players');
groups.query();
while (groups.next()) {
    gs.info('Deleting group: ' + groups.name);
    groups.deleteRecord();
}

gs.info('Demo users and groups cleanup complete');
```

## Notes

- The script is idempotent - you can run it multiple times safely
- If users/groups already exist, it will verify and update group memberships
- All demo users are created with the same password for easy testing
- Demo users are marked as active by default
- Users are automatically added to their respective groups
