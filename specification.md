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
From top to bottom:
- `UHero` text with composed string: Substitute "Task #(a): (b)" with `serial_num` for (a) and `title` for (b)
- `UStepper` component that shows the current sub-page for the task: "Task details" (current), "Solution and leaderboard", and "Submit". This component is common between all task sub-pages and can be used to navigate between this, the `/solution` and the `/submission` routes.
- Another component for navigation: "Previous" and "Next" buttons (color: `neutral`, variant: `soft`) with arrow icons. In this route, only the "Next" button is shown, which navigates to `/solution`.
- Card (variant: `soft`) titled "Task description" and containing the rendered Markdown of the task description (see [[CMS > Task description files]] for implementation details). The filename will be `[task-slug].md`.
- Card titled "Task materials" with two buttons stretching the entire width of the card: "Download handout files" with `i-lucide-file-archive` icon, which downloads the ZIP file with the name `[task-slug].md` from the `public/handouts/` directory, and "Edit online in Google Colab" with `i-lucide-globe` icon, opening the link in the task's `online_editor_link` record in a new tab.

#### Solution and leaderboard: `/tasks/[task-slug]/solution`
Frame in Figma: `/tasks/task-1-neuronale-netzwerke/solution`
Content area from top to bottom:
- **Stats area:**
	- Progress bar (color `secondary`) with the label "Limit for uploaded solutions today (resets at 23:59:59):" and in bold the progress marker as text: "(x) / (y)" where (x)=count of records in the `submissions` table with `student_id`== current student, `task_id` == current task and `submitted_at` is in the current date, and (y)=`max_daily_submissions` of the task
	- Progress bar (color `secondary`) with the label "Limit for uploaded solutions in total:" and in bold the progress marker as text: "(x) / (y)" where (x)=count of records in the `submissions` table with `student_id`== current student and `task_id` == current task, and (y)=`max_overall_submissions` of the task
	- A label "Baseline to beat:" and below the `baseline_score` of the task in big bold letters
- **Solution area:** Two `UPageCard` components next to each other where "Solution submission" takes up a third of the width, and "Your solution" takes up two thirds of the width. If the screen gets too narrow: Render below instead of next to each other. These two cards should have the same height if rendered next to each other and are **not rendered if the task deadline has passed.** In this case, a card with the text "Task is closed; no more solution uploads are allowed." is displayed instead.
	- "Solution submission": Submission form with form verification. All fields are mandatory. Description "Upload your solution file (generated predictions) and your source code and press "Make a submission".". Two file upload fields: One for the solution file that only takes CSV files (the form should verify this), and one for the source code file that only takes .py or .ipynb files (this should also be verified). The text input field "Public alias for leaderboard" with the description "(Caution: You can only choose this once!)" is only shown if the `public_alias` of the student's record is NULL. Use NuxtUI form components and form verification via Zod. Before allowing the submission of the form, when the public alias is chosen for the first time, verify via DB query that it is unique, and reject the submission if it's not. If the form is valid and all fields are complete, update the `students` record with the `public_alias` if it was given, and the `submissions` table with the current submission. For now, set the `score` field to a random number between 0.0 and 1.0 for demo purposes. Note that during development, the submitted files need to be saved locally, whereas in deployment (if the API key is given), the files need to be uploaded to R2. Implement this architecture. 
	- "Your solutions": `UTable` component with pagination, showing the records in the `submissions` table where `student_id` == current student. Colums are "Number" (`submission_serial_num`), "Date and time" (`submitted_at`, formatted), "Score" (`score`) and "Passes baseline" (shows green `UBadge` if `score` of the submission greater than or equal to the `baseline_score` of the task, red `UBadge` otherwise). For an example code with paginated tables, see https://ui.nuxt.com/docs/components/table at the "With pagination" section.
- **Leaderboard:** Full-width `UPageCard` with `i-lucide-trophy` icon in `primary` color, containing a `UTable` displaying the best submissions. The data is pulled from the `submissions` DB record, filtered for the `task_id`, ordered by `score` in decreasing order and only keeping one best-scoring submission from each individual student. Before displaying the leaderboard, the students are anonymized by removing `student_id` and replacing it with their `public_alias` from the `students` table. When implementing this, figure out a way to optimize this to be as fast and with as little number of requests as possible, e.g. by creating a view on a JOIN. Three columns: "Rank" (numerical integer rank, with #1 for best), "Name" (`public_alias`) and "Score" (`score` float, this column sticks to the right end of the table). The table should not be scrollable and can take up as much vertical space as it needs.

All tables should reflect the current state accurately, e.g., need to refresh when the student makes a submission. The leaderboard table does not need to refresh on its own, in regular intervals or similar; only if the student makes a new submission, hard-reloads the page or navigates to a different step using the stepper and then back.

#### Submit: `/tasks/[task-slug]/submission`
Frame in Figma: `/tasks/task-1-neuronale-netzwerke/submission`

### Final report page
Route: `/portfolio`
Frame in Figma: `/portfolio`
This route is **only accessible to authenticated users**. Use middleware to check for authentication status. The user can access this page by:
- Typing in the route to the browser
- Clicking the corresponding link in the `NavigationMenu` of the header
- Clicking the button in the corresponding bento box section on the home page

As all sub-pages, the first element is a centered hero-text containing the page title and subtitle.

Content area from top to bottom:
- **Rules:** A card component (`soft` variant), with rule text in MD format. The rule text is rendered with `@nuxt/content` and the source markdown is in `/content/portfolio/rules.md` with a `title` prop.
- A H1 titled "Current progress"
- **Current progress display:** Stacked indicators showing how much of the requirements the student has alread met.
  - Progress bar (color `primary`) with label "Programming tasks passed:" above and a large text "(x) / (y)" to the right, where (x) is the number of records from the `student_task_states` table where `student_id` == currently authenticated student and `status` == PASSED, and (y) is the `passing_threshold` value of the DB record of the current semester ("current semester" is defined as the record in the `semesters` table with the latest `start_date`)
  - Progress bar in the same layout as the first, this time with label "Video report URL submitted:". The text this time shows "(z) / 1", where (z) is 0 if the `portfolio_video_link` column of the student's record is NULL, and 1 otherwise.
  - A label "Portfolio submission deadline:" and below the `portfolio_submission_deadline` value of the current semester in big bold letters, in the format "dd.mm.yyyy hh:mm:ss tz" (German format)
- **Status box:** `UPageCard` component with title "Status" that can have two states.
  - Submission incomplete: If the `portfolio_video_link` column of the student's record is NULL. Then: Red card (color `error`), `i-lucide-octagon-alert` icon, with text "You have not finished handing in your portfolio yet and would currently fail the course."
  - Submission complete: If the `portfolio_video_link` column of the student's record is not NULL. Then: Green card (color `success`), `i-lucide-check` icon, with text "You have handed in your portfolio successfully! Your submission was received and will be graded."
- A H1 titled "Portfolio submission"
- The **portfolio submission form**. All fields are required. Use proper form verification to ensure all required inputs are present and in the correct format before the Submit button becomes available. If the student does not fulfill the eligibility criteria, i.e. did not pass the required amount of programming tasks during the semester, the submission form is **not shown**. Instead: text "Portfolio submission not available. You did not pass the required amount of programming tasks." in color `error`.
  - `UFormInput` field, title "Video report URL:", help text "Please provide a public link of a video explaining your solution.", placeholder "https://...".
  - `UCheckbox` with text "I hereby confirm that I am the sole author of the video above."
  - `UCheckbox` with text "I hereby confirm that the submitted video URL is correct, the video under the URL will be publicly accessible until four weeks after the portfolio submission deadline and the video is not longer than 3 minutes."
  - `UCheckbox` with text "I hereby confirm that I've read and acknowledged the rules regarding plagiarism.", with the plagiarism rule text.
  - "Submit portfolio" button (variant `solid`, color `primary`).

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
    start_date TEXT NOT NULL, -- ISO 8601 date, e.g., '2026-03-15'
    portfolio_submission_deadline TIMESTAMP NOT NULL
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
    online_editor_link TEXT NOT NULL UNIQUE,
    grading_endpoint VARCHAR(255) NOT NULL,
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
    grading_error TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

Student-task state: Tracks the overarching status of a student for a specific task, including which submission they ultimately selected for their final grade.
```sql
CREATE TABLE student_task_states (
    student_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    -- Status enum: 'NOT_COMPLETED', 'COMPLETED', 'PASSED', 'FAILED'
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

#### Architecture
Grading is **asynchronous**: the submit endpoint registers the submission with `score = NULL`, responds immediately, then fires-and-forgets a call to `/api/internal/grade`. That endpoint reads both CSVs, calls the task-specific grading endpoint, and writes the score back to the `submissions` table. The client polls `/api/tasks/[slug]/submissions` every 2 seconds until the score appears.

```
submit.post.ts
  → INSERT submission (score = NULL)
  → respond to client
  → $fetch /api/internal/grade { submissionId, taskId }   ← fire-and-forget
        → read master CSV (assets:server or R2)
        → read student CSV (local disk or R2)
        → $fetch /api/grading/[task-slug] { masterCsv, studentCsv }
        → UPDATE submissions SET score = ?
```

#### Master CSV storage
Master CSVs are stored exclusively in `server/assets/solutions/` and bundled into the Nitro output at build time — in **both** development and production. They are never publicly accessible and never stored in R2. The `master_solution_csv_key` column holds the filename (e.g. `task1_example_master.csv`).

Read via `readMasterCsv(filename)` in `server/utils/read-master-csv.ts`, which uses `useStorage('assets:server')` in all environments. Adding a new task requires placing the master CSV in `server/assets/solutions/` and deploying.

#### Per-task grading endpoints
Each task has a dedicated grading endpoint at `server/api/grading/[task-slug].post.ts`. The `tasks.grading_endpoint` column stores its path (e.g. `/api/grading/neuronale-netzwerke`). All endpoints are protected by the `grading-guard` middleware (`X-Internal-Token` header required) and share the contract defined in `server/utils/grading.ts`:

```ts
interface GradingRequest  { masterCsv: string; studentCsv: string }
interface GradingResponse { score: number }   // score ∈ [0, 1], higher = better
```

To add a new task: create a new grading endpoint file, add the `master_solution_csv_key` to `server/assets/solutions/`, set `grading_endpoint` in the seed/DB record, and deploy.

#### Pre-submission validation
Before the submission is registered, `submit.post.ts` calls `getCsvDimensions()` on both CSVs and rejects (HTTP 400) if the row or column counts differ. This catches obviously malformed submissions fast, without a network round-trip.

#### Implemented grading metrics

| Task | Metric | Details |
|---|---|---|
| Neuronale Netzwerke | R² (coefficient of determination) | Single-column CSV (`price_CHF`). $R^2 = 1 - \frac{\sum(y^*_i - y_i)^2}{\sum(y^*_i - \bar{y}^*)^2}$, clamped to [0, 1]. |
| Entscheidungsbäume | Macro-averaged F1 | Columns `id`, `predicted_label`. Evaluated on test split (`split === 1`) of master CSV. |

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