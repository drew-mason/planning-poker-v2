# Quick Start: Demo Users & Role Security

## ✅ What Was Fixed

**Problem**: demo.player1 could create sessions (should only be facilitators)

**Solution**: 
- ✅ Added role-based access control
- ✅ Create Session button hidden for non-facilitators  
- ✅ Server-side validation blocks unauthorized attempts
- ✅ Demo users script assigns proper roles

---

## 🚀 Run Demo Setup (In 3 Steps)

### Step 1: Open Scripts - Background
Go to: https://dev287878.service-now.com/nav_to.do?uri=sys.scripts.do

### Step 2: Copy & Paste Script
Open `create_demo_users.js` and copy all contents into the script field

### Step 3: Run Script
Click "Run script" button and check output log

---

## 👥 Demo Accounts Created

### Facilitators (CAN create sessions)
| Username | Name | Password | Role |
|----------|------|----------|------|
| demo.dealer1 | Alice Facilitator | Demo123! | ✅ Facilitator |
| demo.dealer2 | Bob Scrum | Demo123! | ✅ Facilitator |
| demo.dealer3 | Carol Manager | Demo123! | ✅ Facilitator |

### Players (CANNOT create sessions)
| Username | Name | Password | Role |
|----------|------|----------|------|
| demo.player1 | David Developer | Demo123! | Participant |
| demo.player2 | Emma Engineer | Demo123! | Participant |
| demo.player3 | Frank Programmer | Demo123! | Participant |
| demo.player4 | Grace Coder | Demo123! | Participant |
| demo.player5 | Henry Backend | Demo123! | Participant |
| demo.player6 | Iris Frontend | Demo123! | Participant |
| demo.player7 | Jack Fullstack | Demo123! | Participant |
| demo.player8 | Kate DevOps | Demo123! | Participant |

### Groups Created
- **Demo Dealers** (3 members)
- **Demo Players** (8 members)

---

## 🧪 Quick Test

### Test #1: Login as Facilitator
```
1. Login: demo.dealer1
2. Password: Demo123!
3. Go to Planning Poker
4. ✅ See "Create Session" button (+)
5. ✅ See "Show Completed Sessions" toggle
6. ✅ Can create new sessions
```

### Test #2: Login as Player  
```
1. Login: demo.player1
2. Password: Demo123!
3. Go to Planning Poker
4. ❌ NO "Create Session" button
5. ❌ NO completed sessions toggle
6. ✅ Can only view in_session sessions
7. ✅ Can join and vote in sessions
```

---

## 🔒 Security Layers

1. **UI Layer**: Button hidden for non-facilitators
2. **Server Layer**: API checks role before creating session
3. **Cannot be bypassed** by client manipulation

---

## 📁 Files Available

- `create_demo_users.js` - Run this to create demo accounts
- `DEMO_USERS_README.md` - Detailed documentation
- `ROLE_SECURITY_DEPLOYED.md` - Complete technical details

---

## 🎯 Direct Links

- **Scripts - Background**: https://dev287878.service-now.com/nav_to.do?uri=sys.scripts.do
- **Planning Poker App**: https://dev287878.service-now.com/x_1447726_planni_0_planning_poker_unified.do
- **User Management**: https://dev287878.service-now.com/sys_user_list.do

---

**Status**: ✅ Deployed and Ready  
**Date**: October 3, 2025
