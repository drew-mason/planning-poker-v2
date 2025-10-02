# Planning Poker v2 - ServiceNow Application

## 🎯 Overview
Interactive Planning Poker application for agile story point estimation in ServiceNow.

## 📋 Project Details
- **Application Name:** Planning Poker v2
- **Scope:** `u_planning_poker_v2`
- **Version:** 2.0.0
- **Repository:** https://github.com/[your-username]/planning-poker-v2
- **ServiceNow Instance:** https://dev287878.service-now.com

## 🏗️ Architecture
- **Tables:** Planning sessions, votes, stories, scoring methods
- **Roles:** Voter, Facilitator, Admin
- **UI Components:** Interactive voting interface, session management
- **Integration:** GitHub source control with ServiceNow import

## 🚀 Development Workflow
1. **Local Development:** Code in this repository
2. **Version Control:** Git commits and branches
3. **ServiceNow Import:** Import application from GitHub
4. **Testing:** Test in ServiceNow development instance
5. **Deployment:** Export update sets or use CI/CD

## 📁 Project Structure
```
planning-poker-v2/
├── README.md
├── package.json
├── .gitignore
├── src/
│   ├── tables/
│   ├── roles/
│   ├── ui-pages/
│   ├── client-scripts/
│   └── server-scripts/
├── docs/
└── tests/
```

## 🔧 Setup Instructions

### Prerequisites
- ServiceNow Developer Instance
- Git and GitHub account
- ServiceNow CLI tools (`snc`, `now-cli`)

### Local Setup
```bash
# Clone repository
git clone https://github.com/[your-username]/planning-poker-v2.git
cd planning-poker-v2

# Install dependencies
npm install

# Configure ServiceNow CLI
snc configure profile set --name dev287878
```

### ServiceNow Setup
1. Create scoped application in ServiceNow Studio
2. Configure GitHub integration in Source Control
3. Import application structure from repository
4. Deploy and test

## 🔄 Git Workflow
- **main:** Production-ready code
- **develop:** Integration branch for features
- **feature/\*:** Individual feature branches
- **hotfix/\*:** Critical bug fixes

## 📚 Documentation
- [ServiceNow Source Control](https://docs.servicenow.com/bundle/xanadu-application-development/page/build/applications/concept/source-control-overview.html)
- [GitHub Integration](https://docs.servicenow.com/bundle/xanadu-application-development/page/build/applications/task/github-integration.html)
- [Planning Poker Requirements](./docs/requirements.md)

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License
MIT License - see [LICENSE](LICENSE) file for details