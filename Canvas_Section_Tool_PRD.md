**Product Requirements Document (PRD)**

**Project Name:** Canvas Section Management Tool
**Owner:** [Anwar / Canvas LMS Admin]
**Target Platform:** Canvas LMS (LTI 1.3 compatible)
**Technology Stack:** Express.js + ltijs + MongoDB + Railway
**Delivery Methodology:** Agile (Scrum / Iterative Sprints)
**Version:** 2.1 (Updated with Business Logic Clarifications)
**Last Updated:** [Current Date]

---

## 1. **Overview**

The Section Management Tool is a lightweight, educator-friendly LTI 1.3 application built using Express.js and the ltijs library, deployed on Railway with MongoDB. This tool streamlines the creation, allocation, and management of student sections directly within Canvas LMS using Canvas API with admin access, designed to augment or replace limitations of existing systems such as Canvas Groups and AllocatePlus.

**Key Technology Changes:**
- **Platform:** Railway (vs Vercel) for better MongoDB integration
- **Framework:** Express.js + ltijs (vs Next.js) for proven LTI handling
- **Database:** MongoDB (vs PostgreSQL/Supabase) for simplified session management
- **Architecture:** Unified Express application (vs frontend/backend separation)
- **Canvas Integration:** Canvas API with admin access for direct section management

---

## 2. **Goals & Objectives**

* Enable educators to create and manage sections within Canvas intuitively
* Automatically balance student-to-educator ratios (target: 1:25)
* Support manual and automated student allocation workflows
* Integrate census date workflows (pre-finalization and locking)
* Ensure privacy-safe section naming and student visibility handling
* Provide a future-ready tool that can be scaled or commercialized
* **New:** Leverage proven LTI library for faster, more reliable development
* **New:** Handle enrollment changes efficiently with manual LIC control

**Success Metrics:**
* 90% reduction in time spent on section management
* 100% compliance with student privacy requirements
* 95% accuracy in automated student allocation
* < 1% error rate in section assignments
* 100% uptime during critical census periods
* **New:** < 48 hours development time for core LTI integration (vs weeks)
* **New:** 100% detection of unassigned students when LIC accesses tool

---

## 3. **Key Features & Requirements**

| ID  | Feature                          | Description                                                                              | Priority | Implementation Notes |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------- | -------- | ------------------- |
| F1  | Educator-Driven Section Creation | Simple UI to create, edit, and manage sections within Canvas using admin API             | P0       | Express routes + MongoDB collections + Canvas API |
| F2  | Automated Student Allocation     | System automatically assigns students to sections based on a 1:25 ratio                  | P0       | Algorithm in Express middleware |
| F3  | Manual Student Assignment UI     | Educators can manually select students and assign to sections via an intuitive interface | P0       | Interactive HTML + Canvas API |
| F4  | Census Date Handling             | Sections are provisional until 2-week default census date; lock afterward              | P0       | MongoDB date fields + validation |
| F5  | Fairness & Ratio Logic           | Ensure student load is balanced fairly among educators                                   | P0       | JavaScript balancing algorithms |
| F6  | Internal vs Display Names        | Allow educators to set an internal name and a student-facing name per section           | P1       | MongoDB document structure |
| F7  | Student Visibility Toggle        | Educator can toggle if section name is visible to students                              | P1       | Boolean flags in MongoDB |
| F8  | Soft Governance Warning          | Trigger warning if a sensitive term is used in the display name                         | P1       | Server-side keyword checking |
| F9  | Rebalancing Workflow             | Tool can redistribute students to maintain ratios when enrollment shifts occur          | P1       | Dynamic recalculation logic |
| F10 | Educator Override                | Educators can override any auto-allocation manually before finalization                  | P0       | UI controls + override logging |
| F11 | CSV Upload Option                | Advanced users can upload CSV to manage student-section mappings                        | P2       | File upload + parsing middleware |
| F12 | LTI-Based Integration            | Tool is built as an LTI tool compatible with Canvas API & authentication                | P0       | **Simplified with ltijs library** |
| F13 | Audit Trail                      | All section changes are logged for transparency and compliance                          | P1       | MongoDB audit collection |
| F14 | Real-Time Dashboard              | View section stats, educator loads, and distribution visuals                            | P1       | Live data via Express + Chart.js |
| F15 | Smart Section Movement with Dual Enrollment | ADD vs MOVE logic based on discussion activity + timeline-based dual enrollment cleanup | P0       | **Critical for ACU 8-week terms** |
| F16 | Intelligent Role Detection       | Automatically scan course for OFs (Teachers) and Students, guide role assignment        | P0       | Canvas API + role validation |
| F17 | OF-Centric Allocation Engine     | Calculate optimal sections based on OF availability and student:OF ratios               | P0       | Smart allocation algorithms |
| F18 | Best Practice Recommendations    | Visual indicators for ideal vs acceptable ratios with budget reality warnings           | P0       | Real-time ratio calculations |
| F19 | LIC Override with Justification  | Require justification when exceeding 35 students per OF, audit trail for compliance     | P0       | Override validation + logging |
| F20 | **NEW:** Unassigned Student Detection | Identify students not allocated to any tool-created section | P0 | Canvas API scanning + MongoDB comparison |
| F21 | **NEW:** Section Name Validation | Prevent duplicate section names across entire course | P0 | Canvas API validation + real-time checking |
| F22 | **NEW:** Existing Section Integration | Display existing Canvas sections alongside tool-created ones | P1 | Canvas API + dashboard display |
| F23 | **NEW:** Post-Census Manual Control | Require manual LIC intervention for enrollment changes after census | P0 | Date validation + approval workflow |

---

## 4. **User Roles & Permissions**

| Role | Permissions | Access Level | LTI Implementation |
|------|-------------|--------------|-------------------|
| LIC (Lecturer in Charge) | - All section management decisions<br>- Assign/reassign OFs to sections<br>- Move students between sections<br>- Override student:OF ratios<br>- Set census date and policies<br>- Emergency overrides and justifications<br>- **NEW:** Manual approval of post-census changes | Course Level | Canvas role: Instructor/Admin |
| OF (Online Facilitator) | **No tool access** - Subject of allocation<br>- Receives notifications about assignments<br>- Notified of student moves affecting them | Course Level | Canvas role: Teacher/TA (allocated by LIC) |
| Unit Coordinator | **Observer role only**<br>- View section allocations<br>- View audit trail<br>- No modification permissions | Course Level | Canvas role: Observer/Admin |
| Canvas Admin | - Install/configure tool<br>- Global settings<br>- Technical troubleshooting<br>- Override system restrictions | Institution Level | Platform admin detection |
| Student | **No tool access** - Subject of allocation<br>- Receives notifications about section assignments<br>- Views assigned section in Canvas | Course Level | Canvas role: Student (allocated by LIC) |

**Role Hierarchy:**
- **LIC** = **ONLY active user** - Human in the Loop (HITL) decision maker
- **OF** = **Subject of allocation** - Gets assigned to sections by LIC
- **Student** = **Subject of allocation** - Gets assigned to sections by LIC  
- **UC** = **Observer only** - Can view but not modify
- **Canvas Admin** = **Technical support** - Installation and troubleshooting

---

## 5. **User Stories**

### Primary LIC Workflows

* **US1:** As a LIC, I want to see how many new students enrolled since my last allocation so I can decide how to handle them
* **US2:** As a LIC, I want to manually decide what to do with post-census enrollments rather than automatic processing
* **US3:** As a LIC, I want to be prevented from creating sections with duplicate names so I avoid Canvas conflicts
* **US4:** As a LIC, I want to see existing Canvas sections alongside my tool-created sections for full visibility
* **US5:** As a LIC, I want the tool to only check for changes when I actively use it, not continuously
* **US6:** As a LIC, I want to auto-allocate students into balanced sections so that I don't have to do it manually
* **US7:** As a LIC, I want to manually assign students to sections via a simple UI so that I can maintain control
* **US8:** As a LIC, I want to preview and approve auto-assignments before saving them
* **US9:** As a LIC, I want to hide section names from students or rename them appropriately to avoid student distress
* **US10:** As a LIC, I want to receive a warning when using potentially problematic section names so I can correct them
* **US11:** As a LIC, I want to override automated logic to move specific students where needed
* **US12:** As a LIC, I want students who are moved between sections to have temporary access to their previous section so they can complete ongoing work
* **US13:** As a LIC, I want to configure how long students retain access to their previous section after being moved

### Unit Coordinator

* As a lead educator, I want to define the census date so that section locking aligns with university policy
* As a lead educator, I want to lock section allocations post-census to prevent further changes
* As a lead educator, I want to review an audit trail of section changes
* **New:** As a lead educator, I want to see real-time updates when other educators make changes

### Timeline-Based Dual Enrollment Management

**Automated Scanning Schedule:**
- **Week 1:** Daily scanning for new enrollments and dual enrollment review
- **Week 2:** Every 2 days scanning for enrollment changes and cleanup opportunities  
- **Week 3:** Weekly scanning for dual enrollment status review
- **Week 4+:** Manual LIC-triggered scanning only

**Dual Enrollment Cleanup Process:**
\`\`\`
WHEN automated scan runs OR LIC opens dashboard:
1. Calculate age of all dual enrollments
2. If dual enrollment ≥ 7 days old:
   ┌─────────────────────────────────────────┐
   │ 🔔 DUAL ENROLLMENT REVIEW               │
   ├─────────────────────────────────────────┤
   │ Students in multiple sections (7+ days): │
   │ • Student A: Sec 1+2 (8 days) [Clean]  │
   │ • Student B: Sec 2+3 (9 days) [Clean]  │
   │                                         │
   │ Recent dual enrollments (<7 days):      │
   │ • Student C: Sec 1+3 (3 days)          │
   │                                         │
   │ [📋 Clean Up Selected] [⏰ Review Later]│
   └─────────────────────────────────────────┘
3. LIC can manually remove from old sections when appropriate
4. System logs all cleanup actions for audit trail
\`\`\`

**Business Rules:**
- Dual enrollment automatically flagged at 7 days (notification only)
- LIC retains full control over cleanup timing
- No forced automated removal from sections
- Timeline-based scanning reduces manual monitoring workload during critical weeks

#### Core LIC Workflow (Human in the Loop)
\`\`\`
1. LIC accesses Canvas Section Management Tool
2. Tool scans course and displays:
   ┌─────────────────────────────────────────┐
   │ 📊 COURSE OVERVIEW                      │
   ├─────────────────────────────────────────┤
   │ Total Students: 75                      │
   │ Existing Canvas Sections: 1             │
   │ Tool-Created Sections: 0                │
   │ Unassigned Students: 75                 │
   │ OFs (Teachers) Detected: 3              │
   │                                         │
   │ ⚠️  New enrollments since last check: 2 │
   │                                         │
   │ Recommended: 3 sections (25 each)       │
   │ [✅ Proceed with Auto-Allocation]       │
   │ [🎯 Manual Assignment Mode]             │
   │ [⚙️ Adjust Settings]                    │
   └─────────────────────────────────────────┘
3. LIC reviews recommendations and chooses action
4. Tool validates section names against ALL Canvas sections
5. LIC can manually reassign any student or OF to any section
6. Tool validates and warns about ratio violations
7. LIC implements final allocation decisions
\`\`\`

#### F20: Unassigned Student Detection Workflow
\`\`\`
1. Tool queries Canvas for current course enrollment
2. Tool queries MongoDB for current section assignments
3. Tool identifies students in Canvas but not in any tool-created section
4. Dashboard displays:
   - Total enrolled students
   - Students in tool-created sections
   - Students in existing Canvas sections (read-only)
   - Unassigned students requiring allocation
5. LIC can allocate unassigned students to existing or new sections
\`\`\`

#### F21: Section Name Validation Workflow
\`\`\`
1. LIC attempts to create new section with name "Section A"
2. Tool queries Canvas API for ALL existing sections in course
3. If duplicate found:
   ┌─────────────────────────────────────────┐
   │ ❌ SECTION NAME CONFLICT                │
   │ "Section A" already exists in Canvas    │
   │ Type: Existing Canvas Section           │
   │ Suggested: "Section A (New)" or         │
   │           "Tutorial A"                  │
   │ [❌ Cancel] [✏️ Choose Different Name]  │
   └─────────────────────────────────────────┘
4. LIC must choose different name to proceed
5. Tool validates new name before allowing creation
\`\`\`

#### F23: Post-Census Manual Control Workflow
\`\`\`
PRE-CENSUS (First 2 weeks):
1. New student enrolls in Canvas
2. LIC opens tool
3. Tool detects unassigned student
4. Tool prompts: "1 new student detected - allocate now?"
5. LIC allocates student normally

POST-CENSUS (After 2 weeks):
1. New student enrolls in Canvas
2. LIC opens tool
3. Tool detects post-census enrollment
   ┌─────────────────────────────────────────┐
   │ ⚠️  POST-CENSUS ENROLLMENT DETECTED     │
   │ Student: [Name]                         │
   │ Enrolled: [Date] (after census)         │
   │ Requires justification for allocation   │
   │ [✅ Allocate with Justification]        │
   │ [❌ Leave Unassigned]                   │
   │ [📋 Escalate to Unit Coordinator]       │
   └─────────────────────────────────────────┘
4. LIC provides justification for audit trail
5. Tool logs post-census allocation with reason
\`\`\`

#### F16: Intelligent Role Detection Workflow
\`\`\`
1. LIC opens section management tool
2. Tool retrieves course enrollment via Canvas API
3. Tool counts Students (role: student) and OFs (role: teacher/ta)
4. If OFs found: Display current ratios and proceed to allocation
5. If no OFs found: Guide LIC through role assignment process
6. Tool suggests course members who could be assigned Teacher role
7. LIC assigns Teacher roles (either in tool or manually in Canvas)
8. Tool re-scans and proceeds with section planning
\`\`\`

#### F17: OF-Centric Allocation Engine Workflow
\`\`\`
1. LIC opens section management tool
2. Calculate student count and OF count
3. Apply business rules for section creation
4. Present recommended section structure to LIC showing:
   - Suggested number of sections
   - Recommended students per section  
   - Suggested OF assignments per section
5. LIC can accept auto-allocation OR manually assign:
   - Specific OFs to specific sections
   - Specific students to specific sections
   - Override recommended ratios with justification
6. Tool implements all assignments (students AND OFs)
\`\`\`

#### F18: Best Practice Recommendations Display
\`\`\`
Visual Indicators:
🟢 IDEAL: 1-25 students per OF
🟡 ACCEPTABLE: 26-35 students per OF  
🔴 REQUIRES JUSTIFICATION: 36+ students per OF

Dashboard shows:
- Current ratios for each proposed section
- Total course student:OF ratio
- Budget reality warnings
- Alternative staffing suggestions
\`\`\`

#### F15: Smart Section Movement with Dual Enrollment Workflow
\`\`\`
STUDENT MOVE PROCESS WITH ACTIVITY-BASED LOGIC:

1. LIC initiates student move from Section A to Section B
2. System scans student's discussion activity in Section A:
   - Checks for posts in graded discussions
   - Identifies recent activity (last 72 hours)
   - Counts ongoing discussion threads
3. Smart Move Logic:
   ┌─────────────────────────────────────────┐
   │ 🔄 SMART MOVE DETECTION                 │
   │ Student: [Name]                         │
   │ From: Section A → To: Section B         │
   │                                         │
   │ IF Active Discussions Found:            │
   │ ✅ ADD to Section B (keeping A)         │
   │ → Student enrolled in both sections     │
   │ → Flagged for cleanup review            │
   │                                         │
   │ IF No Active Discussions:               │
   │ ➡️ MOVE from Section A to Section B     │
   │ → Clean single section transfer         │
   │                                         │
   │ [✅ Proceed] [❌ Cancel]                │
   └─────────────────────────────────────────┘
4. System implements decision automatically:
   - ADD: Student appears in both sections in Canvas
   - MOVE: Student removed from A, added to B
5. Dual enrollment tracking begins for ADD cases
\`\`\`

---

## 6. **Business Rules & Logic**

### Census Date Management
- **Default:** 2 weeks from course start date
- **Lock Behavior:** Post-census changes require justification and audit trail
- **Grace Period:** 48 hours post-census for emergency moves with justification
- **Override Authority:** Only LIC can approve post-census changes

### Student Enrollment Handling
- **Pre-Census:** Tool detects new students when LIC accesses it (manual trigger)
- **Post-Census:** Manual LIC intervention required for all new enrollments
- **Continuous Monitoring:** Tool does NOT automatically sync - only on LIC access
- **Student Removal:** If student drops from Canvas, automatically removed from tool sections

### Section Naming Rules
- **Uniqueness:** Must be unique across ALL Canvas sections (existing + tool-created)
- **Validation:** Real-time checking against Canvas API
- **Conflict Resolution:** Tool suggests alternative names
- **Character Limits:** Follow Canvas section naming constraints

### Data Synchronization Strategy
- **On-Demand Only:** Tool syncs with Canvas only when LIC actively uses it
- **No Background Polling:** No automatic checking for changes
- **Conflict Detection:** When LIC opens tool, scan for data inconsistencies
- **External Changes:** Ignore direct Canvas modifications outside tool scope

---

## 7. **Non-Functional Requirements**

### Performance
* Page load time < 2 seconds (improved with Express.js)
* API response time < 500ms (MongoDB local queries)
* Support for up to 5,000 students per course
* Handle up to 100 concurrent users
* **New:** Sub-100ms LTI launch time (ltijs optimization)
* **New:** Canvas API validation response < 1 second

### Security
* LTI 1.3 authentication via ltijs
* HTTPS encryption via Railway
* Role-based access control from Canvas
* Audit logging of all changes in MongoDB
* Data encryption at rest via Railway/MongoDB
* **New:** Automatic JWT validation and session management
* **New:** Canvas API admin access with proper scope limitation

### Accessibility
* WCAG 2.1 AA compliance
* Keyboard navigation
* Screen reader support
* High contrast mode
* Responsive design (mobile-first with Express templating)

### Compatibility
* Modern browsers (Chrome, Firefox, Safari, Edge)
* Canvas mobile app support
* Tablet-friendly interface
* Minimum screen width: 320px
* **New:** Railway deployment compatibility

### Reliability
* 99.9% uptime (Railway SLA)
* Automatic error recovery via ltijs
* Data backup every 24 hours (MongoDB automated)
* Disaster recovery via Railway
* **New:** Built-in LTI error handling and retry logic

---

## 8. **Technology Stack Details**

### Frontend
* **Template Engine:** EJS or Handlebars (server-side rendering)
* **Styling:** Tailwind CSS (CDN or compiled)
* **JavaScript:** Vanilla JS + Chart.js for dashboards
* **UI Framework:** Bootstrap or custom CSS grid
* **Interactive Elements:** Drag-and-drop for manual allocation, real-time ratio indicators, impact warning dialogs
* **Discussion API Integration:** Monitor post activity, detect graded vs non-graded discussions
* **Notification System:** Multi-stakeholder alert system for section moves

### Backend
* **Framework:** Express.js 4.18+
* **LTI Library:** ltijs 5.9+ (handles all LTI 1.3 complexity)
* **Authentication:** Canvas OAuth2 via ltijs
* **API Client:** Axios for Canvas API calls with admin access
* **Session Management:** MongoDB via ltijs
* **Business Logic:** OF detection, ratio calculations, allocation algorithms, section validation

### Database
* **Engine:** MongoDB 6.0+
* **Hosting:** Railway's built-in MongoDB service
* **ODM:** Mongoose for schema validation
* **Indexing:** Compound indexes for performance
* **Collections:** sections, allocations, settings, audit_logs, role_assignments, override_justifications, dual_enrollments, discussion_activity, unassigned_students

### Deployment
* **Platform:** Railway
* **CI/CD:** GitHub integration with Railway
* **Environment:** Development, Staging, Production
* **Monitoring:** Railway logs + optional external monitoring
* **Background Jobs:** node-cron for timeline-based scanning (weeks 1-3), dual enrollment cleanup notifications, and role validation
* **Canvas Discussion API:** Monitor participation, detect graded activities
* **Email/Canvas Notifications:** Multi-party notification system

---

## 9. **Assumptions**

* All students are already enrolled in the Canvas course
* Census date logic can be managed at the course level (default: 2 weeks)
* Educator-to-student ratio defaults to 1:25 but can be overridden
* Canvas API access with admin permissions is available via LTI context
* LTI 1.3 is supported by the Canvas instance
* Internet connectivity is reliable
* Users have modern web browsers
* **New:** Railway platform stability and MongoDB availability
* **New:** ltijs library continues active maintenance
* **New:** Canvas admin will provide necessary API permissions for section management
* **New:** Most courses start with one default Canvas section
* **New:** Tool operates on manual LIC trigger, not continuous background monitoring

---

## 10. **Out of Scope (MVP)**

* Real-time collaborative editing during section allocation
* Advanced cross-course analytics and reporting
* Mobile-specific native app features
* Integration with non-Canvas LMS platforms
* Custom branding beyond Canvas theme sync
* Bulk import/export of historical section data
* Public API endpoints for external tool integration
* Multi-language internationalization support
* **Removed:** Complex frontend/backend API design (unified in Express)
* **New:** Automatic continuous synchronization with Canvas
* **New:** Management of existing Canvas sections (read-only display only)
* **New:** SIS (Student Information System) integration

## 10.1 **Post-MVP Priority Features**

### Enhanced F15 Sub-Features (Future Iterations)
**F15.6: Smart Discussion Thread Tracking**
- Track specific thread participation vs general discussion activity
- Identify which discussion threads require completion
- Granular access control at thread level rather than entire discussion

**F15.7: Cross-Course Temporary Access**
- Handle students enrolled in multiple courses with same OF
- Coordinate temporary access across related course sections
- Institution-wide OF workload visibility

**F15.8: Advanced Notification Preferences**
- Customizable notification timing and frequency
- Integration with institutional email systems
- Student preference management for communication methods

### Future Business Features
**F24: SIS Integration**
- Sync with Student Information System for official enrollment data
- Handle SIS-driven enrollment changes
- Cross-reference with institutional student records

**F25: Multi-Course Analytics**
- View OF workload across multiple courses
- Institution-wide section allocation reporting
- Budget planning and resource allocation insights

---

## 11. **Open Questions**

* How should overlapping Canvas/AllocatePlus sections be handled during transition period?
* Should the tool support import/export of allocation templates for reuse across courses?
* Do we offer analytics on section performance effectiveness (post-MVP)?
* What specific justification categories should be available for post-census changes?
* How should the tool handle students who audit the course vs enrolled students?
* **New:** Should we use Railway's Redis addon for Canvas API response caching?
* **New:** How to handle MongoDB connection limits under high load during peak enrollment periods?
* **Post-MVP:** What should be the default temporary access duration for discussion continuity?
* **Post-MVP:** Should the system detect discussion grading completion to trigger early access removal?
* **Post-MVP:** How should emergency override notifications be escalated within the institution?
* **Business:** Should there be institution-level policies that override course-level LIC decisions?

---

## 12. **Updated Sprint Breakdown**

| Sprint   | Goal                                                         | Deliverables | Time Estimate |
| -------- | ------------------------------------------------------------ | ------------ | ------------- |
| Sprint 0 | Railway setup, ltijs integration, MongoDB schema design     | - Railway deployment<br>- LTI authentication<br>- Database setup | 2-3 days |
| Sprint 1 | Role detection and Canvas API integration (F16)             | - Student/OF counting<br>- Role assignment workflow<br>- Canvas API client with admin access | 3-4 days |
| Sprint 2 | Unassigned student detection and section validation (F20, F21, F22) | - Canvas section scanning<br>- Name conflict detection<br>- Existing section display | 3-4 days |
| Sprint 3 | Smart allocation engine and best practice indicators (F17, F18) | - OF-centric algorithms<br>- Ratio calculations<br>- Visual indicators | 4-5 days |
| Sprint 4 | Enhanced temporary access and impact detection (F15)        | - Move impact detection<br>- Discussion activity scanning<br>- Warning interface | 4-5 days |
| Sprint 5 | Section CRUD and manual assignment interface                | - Section management<br>- Manual override UI<br>- Preview system | 3-4 days |
| Sprint 6 | Post-census control and justification system (F23, F19)    | - Census date enforcement<br>- Post-census approval workflow<br>- Justification tracking | 3-4 days |
| Sprint 7 | Notification system and temporary access automation (F15)   | - Multi-party notifications<br>- Auto-cleanup jobs<br>- Emergency overrides | 3-4 days |
| Sprint 8 | Dashboard, governance warnings, and user experience        | - Real-time dashboard<br>- Name validation<br>- User guidance | 2-3 days |
| Sprint 9 | Testing, documentation, and production deployment           | - Comprehensive testing<br>- User documentation<br>- Production setup | 3-4 days |

**Total Estimated Time:** 30-39 days (increased due to additional business logic requirements)

**Critical Path Dependencies:**
- Canvas Discussion API access and permissions
- Canvas enrollment manipulation capabilities  
- Email notification system integration
- Background job reliability for access cleanup
- **New:** Canvas API admin access configuration
- **New:** Section name validation API performance

---

## 13. **Risk Assessment & Mitigation**

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| ltijs library limitations | High | Low | Evaluate alternatives, contribute to open source |
| Railway service downtime | Medium | Low | Implement health checks, backup deployment plan |
| MongoDB connection limits | Medium | Medium | Connection pooling, Railway scaling |
| Canvas API rate limiting | High | Medium | Implement caching, request throttling, admin API optimization |
| **NEW:** Canvas admin API access revoked | High | Low | Document permission requirements, backup authentication method |
| **NEW:** Section name validation performance | Medium | Medium | Cache Canvas section lists, optimize API calls |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User adoption resistance | High | Medium | Training materials, gradual rollout |
| Performance under load | Medium | Medium | Load testing, scaling strategy |
| Data privacy concerns | High | Low | Audit trail, compliance documentation |
| **NEW:** Post-census policy conflicts | Medium | Medium | Clear escalation procedures, institutional policy alignment |
| **NEW:** Manual workflow slows adoption | Medium | Low | Intuitive UI design, efficiency metrics tracking |

### Operational Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| LIC unavailable during critical periods | High | Medium | Backup LIC designation, emergency procedures |
| Canvas section conflicts with external tools | Medium | Medium | Read-only approach to existing sections, clear scope boundaries |
| Post-census enrollment surge | Medium | Low | Automated detection, clear approval workflows |

---

## 14. **Success Criteria & KPIs**

### Development Metrics
* LTI integration complete in < 1 week
* 95% test coverage for core functionality
* Zero critical security vulnerabilities
* < 2 second page load times
* **NEW:** 100% accuracy in section name conflict detection
* **NEW:** < 1 second Canvas API validation response time

### Business Metrics
* 80% of courses have optimal OF:student ratios (≤25:1) within 1 month
* 95% of section allocations completed without manual intervention
* 90% reduction in LIC time spent on section management
* Zero instances of >50 students per OF without proper justification
* 95% user satisfaction rating from LICs
* **NEW:** 100% detection rate for unassigned students
* **NEW:** Zero section naming conflicts in production
* **NEW:** 95% of post-census enrollments handled within 24 hours

### Academic Continuity Metrics
* 95% of moved students with active discussions complete ongoing work without disruption
* <2% of students report academic impact from section moves
* 100% of graded discussions maintain assessment integrity during transitions
* <5 second response time for move impact detection and warning display
* **NEW:** 100% audit trail completeness for post-census changes

### Discussion Continuity Performance  
* 99.9% accurate detection of active discussion participation
* 100% successful temporary access grants when approved by LIC
* 95% automatic access cleanup success rate within 24 hours of expiry
* <1% false positive rate for impact warning triggers

### Notification System Effectiveness
* 98% successful delivery of section move notifications to all parties
* <2 hour notification delivery time for urgent moves
* 90% user satisfaction with notification clarity and timing
* Zero missed notifications for graded discussion deadlines

### Technical Performance
* OF role detection accuracy: >98%
* Allocation algorithm performance: <2 seconds for 200 students
* 99.9% uptime during critical enrollment periods
* < 500ms API response times for ratio calculations
* Successful Canvas API integration with <1% failure rate
* **NEW:** Canvas section validation accuracy: 100%
* **NEW:** Unassigned student detection accuracy: >99%

---

## 15. **Data Management & Privacy**

### Data Retention
* Section data: Until course end + 1 year
* Audit logs: 5 years minimum (compliance requirement)
* User sessions: 24 hours (ltijs default)
* Canvas API tokens: Session-based only
* **NEW:** Justification records: 7 years (institutional policy)
* **NEW:** Temporary access logs: Until course end + 1 year

### Privacy Compliance
* No PII stored beyond Canvas-provided data
* Audit trail for all data access
* Right to deletion support
* Data encryption in transit and at rest
* **NEW:** FERPA compliance for student section assignments
* **NEW:** Secure handling of justification text (potential sensitive content)

### Backup Strategy
* Railway automated MongoDB backups
* Daily export of critical data
* Point-in-time recovery capability
* Disaster recovery testing quarterly
* **NEW:** Separate backup of audit logs for compliance
* **NEW:** Canvas API permission verification and recovery procedures

---

## 16. **Migration from Previous Architecture**

### What Changed
* **Hosting:** Vercel → Railway (better database support)
* **Framework:** Next.js → Express.js (simpler architecture)
* **Database:** PostgreSQL → MongoDB (better ltijs integration)
* **LTI Handling:** Custom → ltijs library (proven solution)
* **NEW:** Business Logic Updates based on operational requirements

### Migration Benefits
* Faster development timeline
* Reduced complexity
* Better LTI compliance
* Simplified deployment
* Lower maintenance overhead
* **NEW:** Clearer business rules and user workflows
* **NEW:** More pragmatic approach to Canvas integration

### Migration Risks
* Team learning curve for MongoDB
* Railway platform dependency
* ltijs library dependency
* **NEW:** Canvas admin API dependency
* **NEW:** Business logic complexity increase

---

This updated PRD v2.1 incorporates the clarified business logic for enrollment handling, section management, and operational workflows while maintaining technical feasibility and user-centric design principles.
