## Introduction and purpose
The course platform serves as the first "place-to-go" for students (besides the Moodle course) when it comes to matters relating to our course. It features the following main components:
1. A list of lecture materials, sorted by semester and then by lecture
2. A list of programming tasks for the current semester, with a submission infrastructure for solutions
3. An account-less authentication system for students with centrally provided credentials to associate them with their submissions
4. An overview for students to compile and submit their final portfolio report, consisting of their valid submissions and a video report

---
## Pages
Page structure:
- Home page: `/`
	- Lecture materials: `/materials`
	- Programming tasks: `/tasks`
	- Final submission: `/final-submission`
	- Profile settings: `/profile`

For all subpages, the first element in the main body is a `PageHero` text containing the page title ("Lecture materials", "Programming tasks", etc.)

### Home page
Route: `/` (two variants in Figma: `/ (authenticated)` and `/ (unauthenticated)`)
The entry page of the application consisting of the following parts:
- Minimal header section (common for all sub-pages; see [[Course platform - Specification#Common header|Course platform - Specification > Common header]] for specifics)
- Centered `PageHero` text with the title of the course "Einführung in Maschinelles Lernen & Künstliche Intelligenz", with the subtitle "Grünbauer, René; Nemes, Tamás"
- A theme selector toggle below the hero text (light/dark/system)
- `Separator` element with a text "Quick access"
- The main part of the page then consists of a bento-style overview/quick-access board of the different functionalities of the platform. Each box is related to one of the platform functions:
	- Top row: Lecture materials
	- Bottom-left: Programming tasks
	- Bottom-right: Final portfolio submission
- Minimal footer with copyright note and privacy notice (common for all sub-pages; see [[Course platform - Specification#Common footer|Course platform - Specification > Common footer]] for specifics)

The bento-box sections each contain a title, a description, a button taking the user to the route and a compressed preview of the contents of the page (which contents exactly and how they are structured is detailed in the respective page's section). If the user is unauthenticated (see [[Course platform - Specification#Authentication]]), the bento boxes for the programming tasks and the final submission should instead contain a centered lock icon in their content areas, with a text below it that reads "Sign in to access (box name)".

#### Common header
The `Header` element is displayed on all pages and has two states, depending on the user's authentication status.
1. **Authenticated:** The header will display its full `NavigationMenu` element in the center with the subpages "Lecture materials", "Programming tasks", "Portfolio". In the `right` slot, the header will show the text "Hello, <strong>(name)</strong>!" with the username inserted and next to it on the right side a "Profile settings" button (`soft` variant). When clicked, this button redirects the user to the `/profile` route.
2. **Not authenticated:** The `NavigationMenu` element in the center will only contain the link "Lecture materials". In the `right` slot, the header will show the text "Not signed in" and next to it a "How to sign in" button (`primary` variant). Upon clicking the button, a modal pops up with a text explaining the login procedure. Make it a placeholder for now.
Independent of the state, the `title` slot of the header should always be a clickable text saying "Einführung in KI & ML" in the primary color that leads to the home page.

#### Common footer
The footer section is displayed on all pages and contains the following elements:
- `left` slot: Copyright notice (Tamás Nemes, current year).
- `default` slot: `NavigationMenu` with the two links "Imprint" and "Privacy notice". Both lead to subpages containing the respective legal texts (make it a placeholder for now).

### Lecture materials page
Route: `/materials`
The user can access this page by:
- Typing in the route to the browser
- Clicking the corresponding link in the `NavigationMenu` of the header
- Clicking the button in the corresponding bento box section on the home page

As all sub-pages, the first element is a centered hero-text containing the page title; subtitle: "Slides, referenced animations and other materials by unit." Below it, the overview for the lecture materials.
- Lecture materials are grouped by semester name and then by lecture title.
- The semester name is a drop-down selector (`SelectMenu`) stretching the whole width of the center container, with the current semester being the default selection and with the label "Choose a semester:". The drop-down list options are divided into two groups: The current semester name under the "Current semester" section, and the rest under the "Previous semesters" section.
- Below the selector, a H1 displaying "Lectures", followed by the lectures list. Rhe lectures are being displayed as a grid of boxes (`PageCard`s inside a `PageGrid`), with an icon in `primary` color, the lecture title and a square chevron-right button (`subtle`) in each box.

Clicking on a lecture card navigates to the `/materials/[semester name]/[lecture title]` route. This page has the following components from top to bottom:
- The same centered hero-text as before at the same location
- A navigable breadcrumb showing `"Lecture materials" > "[Semester name]" > "[Lecture title] - [Lecture subtitle]"`
- A square back arrow button (`ghost` variant), and next to it a H1 displaying "Materials". When clicking the button, the user gets returned to the `/materials` page with its previous semester selection preserved.
- The list of lecture materials (as `ScrollArea` containing full-width `PageCard` elements).

Each lecture material is a title text with an associated link, and a card consists of the following elements:
- The title of the lecture material
- A primary `Button` with the text "Open", as well as a secondary button only with the `clipboard-copy` icon (grouped via a `FieldGroup`). Upon clicking, the first button opens the link in a new tab, and the second button copies the link to the clipboard.
- The link is not displayed on the UI.

### Programming tasks page
Route: `/tasks`
Do not implement yet.

### Final report page
Route: `/final-submission`
Do not implement yet.

### Profile settings page
Route: `/profile`
Do not implement yet.

---
## Infrastructure

### Database
As a database, **SQLite** is used. During development, a local `.db` file is used, and during production, the database URL for **Turso** is swapped in from the environment variables. For file storage (storing the source code and solution CSV files from student's task submissions), **Cloudflare R2** is used. The bucket is kept private and when a user uploads files, a Nuxt API route securely pipes it to R2.

#### Schema
Semesters table:
```sql
-- When a semester ends, all students associated with a specific semester_id can be deleted.
CREATE TABLE semesters (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'WS2026', 'SS2027'
    display_name VARCHAR(50) UNIQUE NOT NULL,
    passing_threshold INTEGER NOT NULL
);
```

Students table:
```sql
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,           -- A UUID or standard internal ID
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    public_alias VARCHAR(50) UNIQUE,      -- Displayed on the leaderboard, NULL on default
    token_hash VARCHAR(255) NOT NULL,     -- SHA-256 hash of their access token
    semester_id VARCHAR(50) NOT NULL,     -- For bulk deletion at semester end
    
    -- Final Portfolio Legal & Submission
    accepted_portfolio_tos BOOLEAN DEFAULT FALSE,
    portfolio_tos_accepted_at TIMESTAMP,
    portfolio_video_link TEXT,            -- URL to their video report
    
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);
```

Tasks table: Stores the rules and state of the programming assignments.
```sql
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    serial_num INTEGER NOT NULL,          -- e.g., Task 1, Task 2
    semester_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    baseline_score FLOAT NOT NULL,
    
    -- Time constraints
    unlock_time TIMESTAMP NOT NULL,
    submission_deadline TIMESTAMP NOT NULL,
    
    -- Rate limits
    max_daily_submissions INTEGER NOT NULL,
    max_overall_submissions INTEGER NOT NULL,
    
    -- Cloudflare R2 pointer for the master solution
    master_solution_csv_key VARCHAR(255) NOT NULL, 
    
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);
```

Submissions table:
```sql
CREATE TABLE submissions (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    
    submission_serial_num INTEGER NOT NULL, -- e.g., This is the student's 3rd attempt
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score FLOAT,
    
    -- Cloudflare R2 pointers for the student's uploaded files (for plagiarism checks)
    source_code_file_key VARCHAR(255) NOT NULL, -- e.g., 'ws2026/task1/student123_v3.ipynb'
    student_csv_file_key VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

Student-task state: Tracks the overarching status of a student for a specific task, including which submission they ultimately selected for their final grade.
```sql
CREATE TABLE student_task_states (
    student_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    
    -- Status enum: 'NOT_COMPLETED', 'PASSED', 'FAILED'
    status VARCHAR(20) DEFAULT 'NOT_COMPLETED', 
    
    -- The specific submission the student chose for their final grade
    selected_final_submission_id VARCHAR(50),
    
    PRIMARY KEY (student_id, task_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    -- SET NULL ensures that if a submission is deleted, the state record survives
    FOREIGN KEY (selected_final_submission_id) REFERENCES submissions(id) ON DELETE SET NULL 
);
```

#### Implementation notes
- **Daily submissions reset:** There are upper limits for both daily and overall submissions for programming tasks. Whether a submission is surpassing any limit is computed on-the-fly. When a user submits, query the database: `SELECT COUNT(*) FROM submissions WHERE student_id = ? AND task_id = ? AND date >= CURRENT_DATE`. If it's `>= max_daily_submissions`, reject it.
### Authentication
A user of the platform is in either of two states: **Authenticated** or **unauthenticated**. Data associated with an authenticated user:
- Full name
- University contact email address

The platform employs a **passwordless, token-based** authentication system for minimal friction and ease of use, while being low cost for the deployer and high security. The system will hereafter be referred to as the **Semester Token** system.

1. At the start of the semester, every student receives an email sent automatically from Brevo containing a unique URL with a secure generated cryptographic token, similar to a PAT.
2. When they visit this link once, the server side validates the key and sets a secure `HttpOnly` cookie in their browser that lasts for 6 months.
3. Upon returning to the platform, the platform searches for this cookie and if present and correct, the user is authenticated. If the user clears cookies or switches devices, they have to click the link in the email again.
4. Additionally to the full name and email address, the database associates the SHA-256 hash of the generated token to every user.

Since the cookie is the user's only proof of identity for the whole semester, it must be secure.

| Attribute  | Value         |
| ---------- | ------------- |
| `HttpOnly` | True          |
| `Secure`   | True          |
| `SameSite` | Lax or Strict |
| `Max-Age`  | 6 months      |

### CMS
For the lecture materials, task handouts and task descriptions, a CMS via the `@nuxt/content` package is used. The following content is managed by this system and deployed automatically upon push:
- Objects representing the lecture materials:
	- List of `(icon, title, link)` objects associated to a semester and lecture unit
	- Stored in a JSON file inside the repo
- Task descriptions:
	- Stored as MD files inside the repo and rendered correctly in the UI (including Latex formulas)
- Handout ZIP files:
	- Placed in the `public/` directory
	- Served upon download request of the user

### Deployment and hosting
**Vercel** is used for deploying and hosting the course platform. It also runs the serverless functions from the `server/api/` route, handling, among other functions, the grading logic (comaring the student's solution CSV against the master CSV and calculating a numerical score). As for the limited timeout of these functions, it is critical that the grading logic and all serverless API functions are implemented efficiently.

---
## Styling
The project platform's UI uses the **NuxtUI** package and its pre-made components. The semantic color scheme is defined in the table below, where a `*` marks a deviation from the standard color palette of NuxtUI:

| Semantic  | Associated Tailwind color |
| --------- | ------------------------- |
| primary   | lime*                     |
| secondary | sky*                      |
| success   | green                     |
| info      | blue                      |
| warning   | yellow                    |
| error     | red                       |
| neutral   | gray*                     |
This color scheme should be set as fixed for the project at the appropriate location.