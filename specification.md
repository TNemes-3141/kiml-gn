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
This route is **only accessible to authenticated users**. Use middleware to check for authentication status. The user can access this page by:
- Typing in the route to the browser
- Clicking the corresponding link in the `NavigationMenu` of the header
- Clicking the button in the corresponding bento box section on the home page

As all sub-pages, the first element is a centered hero-text containing the page title; subtitle: "Overview of assigned tasks and your progress".

#### Starting page: `/tasks`
Frame in Figma: `/tasks`
From top to bottom:
- Blue card with `i-lucide-info` icon, text and two buttons: "Dismiss", which removes the card, and "Do not show again", which removes the card and sets a cookie to mark the preference. Text content: "Here, you can see all programming tasks that will be assigned during the semester. A blue open lock icon shows the tasks that can currently be edited. Please note the deadline dates for submission. Only the tasks that show the status “Submitted” have been submitted properly and are eligible for grading (pass/fail). Please note you need to pass at least (i) out of (j) tasks to complete your final submission.", where:
	- (i) is the `passing_threshold` value of the DB record of the current semester ("current semester" is defined as the record in the `semesters` table with the latest `start_date`; see [[Course platform - Specification#Schema]] for reference)
	- (j) is the number of records in the `tasks` table where `semester_id` is the ID of the current semester
- Red card with `i-lucide-octagon-alert` icon, text and no buttons. Text content: "All deadlines are strict and we do not accept late submissions! Deadline extensions cannot be granted. It is your individual responsibility to start solving the tasks early enough so that you can hand in your results on time. In particular, the checking engine for scoring submissions can take a substantial amount of time to run on the server."
- Progress bar (color `primary`) with label "Tasks passed:" above and a large text "(x) / (y)" to the right, where:
	- (x) is the number of records from the `student_task_states` table where `student_id` == currently authenticated student and `status` == PASSED
	- (y) is the same number as (i) above.
- H1 with `class="mb-6 mt-10 text-4xl font-bold"` and the text "Task overview"
- Task overview list

The task overview list shows all task records of the current semester as a card in structured format:
- **Icon**: Grey `i-lucide-lock` if `unlock_time` is in the future; or `i-lucide-lock-open` in the `secondary` color if `unlock_time` is in the past
- **Title:** Substitute the string "Task #(a): (b)" with `serial_num` for (a) and `title` for (b)
- **Status**: `UBadge` component
	- If task not unlocked yet: "Locked", color `neutral`, variant `subtle`
	- If task unlocked and status of student task state is NOT_COMPLETED: "Not completed", color `warning`, variant `subtle`
	- If task unlocked and status of student task state is PASSED: "Passed", color `success`, variant `subtle`
	- If task unlocked and status of student task state is FAILED: "Failed", color `error`, variant `subtle`
- **Opens at:** `unlock_time` in `dd.mm.yyyy hh.mm.ss timezone` format
- **Deadline:** `submission_deadline` in `dd.mm.yyyy hh.mm.ss timezone` format
- At the bottom right, an "Open" button with a right arrow icon (color: `neutral`, variant: `solid`) is placed. When pressed, it redirects to the `/tasks/[task-slug]/details` page. If the task is not unlocked yet, the button is disabled.

#### Task details: `/tasks/[task-slug]/details`
Frame in Figma: `/tasks/task-1-neuronale-netzwerke/details`

#### Solution and leaderboard: `/tasks/[task-slug]/solution`
Frame in Figma: `/tasks/task-1-neuronale-netzwerke/solution

#### Submit: ``/tasks/[task-slug]/submission`
Frame in Figma: `/tasks/task-1-neuronale-netzwerke/submission`

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
-- The latest semester by start_date is considered the current semester.
CREATE TABLE semesters (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'ws2026', 'ss2027'
    display_name VARCHAR(50) UNIQUE NOT NULL,
    passing_threshold INTEGER NOT NULL,
    start_date TEXT NOT NULL -- ISO 8601 date, e.g., '2026-03-15'
);
```

Students table:
```sql
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,           -- A UUID or standard internal ID
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    public_alias VARCHAR(50) UNIQUE,      -- Displayed on the leaderboard, NULL on default
    token_hash VARCHAR(255),     -- SHA-256 hash of their access token, NULL if not logged in yet
    semester_id VARCHAR(50) NOT NULL,     -- For bulk deletion at semester end
    first_login_at TIMESTAMP,
    -- Final Portfolio Legal & Submission
    accepted_portfolio_tos BOOLEAN DEFAULT FALSE,
    portfolio_tos_accepted_at TIMESTAMP,
    portfolio_video_link TEXT,            -- URL to their video report
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);

CREATE INDEX idx_students_token_hash ON students(token_hash); -- Make hashes fast to search
```

Tasks table: Stores the rules and state of the programming assignments.
```sql
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    serial_num INTEGER NOT NULL,          -- e.g., Task 1, Task 2
    semester_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,          -- e.g. Neuronale Netzwerke
    slug VARCHAR(255) NOT NULL,           -- e.g. neuronale-netzwerke
    baseline_score FLOAT NOT NULL,
    -- Time constraints; IMPORTANT: Both are timestamped (offset from UTC).
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

#### First login flow
The link that will be sent to the user will have the following route:
```
https://domain.com/login?token={raw_token}
```

When the student opens this link, the project platform will do the following steps:
1. Verify the token's hash against the records in the `students` table of the DB
2. If there is a match:
	1. If the `first_login_at` column of the record is not null and older than six months, reject the login attempt.
3. If the attempt survived:
	1. Store the cookie with the hash on the device
	2. Mark the user as authenticated and set the `first_login_at` entry in the student's DB record to the current timestamp
	3. Redirect to the home page, with a toast message using `useToast()` from NuxtUI saying "Logged in successfully!". The toast should ONLY be visible the one time the user navigates to the `/login` route with the correct token.

The route `/login` should have a fallback mechanism for when no token is given, the token's hash is not matching any in the DB. In this case, redirect to the home page without authenticating the user and display an error message in a toast: "Login failed: Account not found. Refer to the instructions in How to log in at the top of the page." If the login is rejected because of a timeout, the toast should say "Login failed: Your access link has expired."

#### Authentication after first login

### CMS
For the lecture materials, task handouts and task descriptions, a CMS via the `@nuxt/content` package is used. The following content is managed by this system and deployed automatically upon push:
- Objects representing the lecture materials:
    - List of `(icon, title, link)` objects associated to a semester and lecture unit
    - Stored in a TS file inside the repo
- Task descriptions:
    - Stored as MD files inside the repo and rendered correctly in the UI (including Latex formulas)
- Placed in the `public/` directory (e.g. `public/handouts/task-1.zip`)
    - Served as static files at their public path (e.g. `/handouts/task-1.zip`)

#### Task description files
Task descriptions are stored as Markdown files in `content/tasks/` at the project root, one per task. Each file uses YAML frontmatter with `title` and `slug` fields, where `slug` matches the task's `slug` column in the database:

```
content/
  tasks/
    neuronale-netzwerke.md
    entscheidungsbaeume.md
```

**Querying and rendering:** In a page component, use `queryCollection` to fetch the parsed content by slug, and `<ContentRenderer>` to render it:
```vue
<script setup lang="ts">
// The slug comes from the route parameter, e.g. /tasks/neuronale-netzwerke/details
const route = useRoute()
const { data: description } = await useAsyncData(() =>
  queryCollection('content').path(`/tasks/${route.params.slug}`).first()
)
</script>

<template>
  <ContentRenderer v-if="description" :value="description" />
</template>
```

Raw `.md` source files are never exposed to the client. Nuxt Content compiles them at build time and serves only the parsed AST through its internal API.

### Solution checking
The platform grades student submissions by comparing the student's uploaded CSV against a **master solution CSV** for each task. The `tasks` table contains a `master_solution_csv_key` column that points to the file.

#### Storage
| Environment   | Storage location      | `master_solution_csv_key` value          |
| ------------- | --------------------- | ---------------------------------------- |
| Development   | `server/assets/solutions/` (bundled with Nitro, not publicly accessible) | Filename, e.g. `task1_example_master.csv` |
| Production    | Cloudflare R2 bucket (private) | R2 object key, e.g. `ss2026/task1_master.csv` |

**Development layout:**
```
server/
  assets/
    solutions/
      task1_example_master.csv
      task2_example_master.csv
```

#### Reading the master solution in an API route
Use Nitro's storage API for local development and the R2 SDK for production. Example pattern:

```ts
async function getMasterSolution(csvKey: string): Promise<string> {
  const r2Url = process.env.R2_BUCKET_URL
  if (r2Url) {
    // Production: fetch from Cloudflare R2
    const response = await fetch(`${r2Url}/${csvKey}`)
    return await response.text()
  }
  // Development: read from server/assets/solutions/
  const storage = useStorage('assets:server')
  const content = await storage.getItem(`solutions/${csvKey}`)
  if (!content) throw createError({ statusCode: 500, message: `Master solution not found: ${csvKey}` })
  return content as string
}
```

The grading API route (to be implemented) will call this function, parse both CSVs, and compute a numerical score (e.g. accuracy or F1-score depending on the task).

### Deployment and hosting
**Vercel** is used for deploying and hosting the course platform. It also runs the serverless functions from the `server/api/` route.

---
## Styling
The project platform's UI uses the **NuxtUI** package and its pre-made components. The semantic color scheme is defined in the table below, where a `*` marks a deviation from the standard color palette of NuxtUI:

| Semantic  | Associated Tailwind color |
| --------- | ------------------------- |
| primary   | lime*                     |
| secondary | sky*                      |
| success   | green                     |
| info      | blue                      |
| warning   | yellow                    |
| error     | red                       |
| neutral   | gray*                     |

This color scheme should be set as fixed for the project at the appropriate location.