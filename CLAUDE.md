# Project Guidelines for Claude Code

---

## General rules

- Follow the general software engineering rules for production projects, such as: Maintainability, compactness, separation of concerns, modularity, structure, correctness, no instable hacks or workarounds, type safety, clean code.

---

## Stack Overview

- **Framework**: Nuxt 4.x (Vue 3 + TypeScript)
- **UI Library**: `@nuxt/ui` v4 — 54 auto-imported components, all prefixed with `U` (e.g., `<UButton>`, `<UCard>`)
- **Styling**: Tailwind CSS (via `@nuxt/ui`) — utility-first, never write raw CSS unless necessary
- **Content**: `@nuxt/content` with MDC (Markdown Components)
- **Icons**: Iconify via `@nuxt/ui` — use the `icon` prop on `<UIcon>` or component `icon` props.

---

## Component Organization

- Custom components go in `app/components/`
- Pages go in `app/pages/`
- Layouts go in `app/layouts/`
- Server API routes go in `app/server/routes/api/`
- Static assets go in `public/`
- All components and composables from Nuxt are **auto-imported** — no explicit import needed

---

## UI Components

- IMPORTANT: Always use `@nuxt/ui` components when one exists for the job. Do not create custom components that duplicate `UButton`, `UCard`, `UModal`, `UForm`, `UInput`, etc.
- Use the `variant`, `color`, and `size` props on components before reaching for custom styling
- For forms, use `<UForm>` with Valibot or Zod schema validation

### Full components list

#### Layout
App, Container, Error, Footer, Header, Main, Sidebar, Theme

#### Element
Alert, Avatar, AvatarGroup, Badge, Banner, Button, Calendar, Card, Chip, Collapsible, FieldGroup, Icon, Kbd, Progress, Separator, Skeleton

#### Form
Checkbox, CheckboxGroup, ColorPicker, FileUpload, Form, FormField, Input, InputDate,InputMenu, InputNumber, InputTags, InputTime, PinInput, RadioGroup, Select, SelectMenu, Slider, Switch, Textarea

#### Data
Accordion, Carousel, Empty, Marquee, ScrollArea, Table, Timeline, Tree, User

#### Navigation
Breadcrumb, CommandPalette, FooterColumns, Link, NavigationMenu, Pagination, Stepper, Tabs

#### Overlay
ContextMenu, Drawer, DropdownMenu, Modal, Popover, Slideover, Toast, Tooltip

#### Page
AuthForm, BlogPost, BlogPosts, ChangelogVersion, ChangelogVersions, Page, PageAnchors, PageAside, PageBody, PageCard, PageColumns, PageCTA, PageFeature, PageGrid, PageHeader, PageHero, PageLinks, PageList, PageLogos, PageSection, PricingPlan, PricingPlans, PricingTable

---

## Design Tokens & Styling

- IMPORTANT: Never hardcode hex/rgb colors. Use Tailwind semantic color classes based on the following theme (deviation from Nuxt defaults marked with *):
  - `primary` → lime*
  - `secondary` → sky*
  - `success` → green
  - `info` → blue
  - `warning` → yellow
  - `error` → red
  - `neutral` → gray*
- Use classes like `text-primary-500`, `bg-error-100`, `border-neutral-200`, etc.
- CSS custom properties are generated in `.nuxt/ui.css` — reference them as `var(--color-primary-500)` only when Tailwind classes aren't sufficient
- Spacing: use Tailwind's default spacing scale (`p-4`, `gap-2`, `mt-8`, etc.) — never hardcode `px` values

---

## Icons

- Use `<UIcon name="i-lucide-arrow-right" />` or the `icon` prop on UI components
- Icon naming: `i-{collection}-{name}` — default collection is Lucide (`i-lucide-*`)
- IMPORTANT: Do not install icon packages (e.g., `heroicons`, `vue-feather`). Use Iconify identifiers.

---

## TypeScript

- Strict mode is enabled — always type component props and emits
- Use `defineProps<{...}>()` and `defineEmits<{...}>()` in `<script setup>`
- Use path aliases: `@/` or `~/` → `app/` directory

---

## Figma MCP Integration

These rules govern all Figma-to-code implementation tasks.

### Design file link
Use this link to get access to the Figma design file of the project: https://www.figma.com/design/RW6itg7TNY7dkujVZHVs1A/KIML-Course-platform?node-id=0-1&t=2MQyGKJyi2UpLZNa-1

### Required Workflow (do not skip steps)

1. Run `get_design_context` with the Figma node ID to get structured design data
2. If the result is too large, run `get_metadata` first to get the node map, then re-fetch only the needed nodes
3. Run `get_screenshot` for a visual reference of the design
4. After you have both `get_design_context` and `get_screenshot`, implement the component
5. Validate the final UI against the Figma screenshot for 1:1 visual parity before marking complete

### Implementation Rules

- Treat `get_design_context` output (React + Tailwind) as a design representation — translate it to Vue 3 `<script setup>` + Tailwind
- Replace any React patterns with Vue 3 equivalents (`v-if`, `v-for`, `defineProps`, `ref`, `computed`, etc.)
- IMPORTANT: Reuse `@nuxt/ui` components wherever possible instead of building from scratch
- Map Figma colors to the project's semantic Tailwind color tokens (see Design Tokens above)
- Map Figma spacing to Tailwind's spacing scale
- IMPORTANT: Never use inline `style=""` for colors or spacing that can be expressed with Tailwind classes

### Asset Handling

- IMPORTANT: If the Figma MCP server returns a `localhost` URL for an image or SVG asset, use that source directly — do not replace it with a placeholder
- Store downloaded/exported assets in `public/assets/`
- IMPORTANT: Do not install new icon libraries — use Iconify identifiers via `<UIcon>`

---

## Code Style

- Vue SFC structure order: `<script setup lang="ts">`, `<template>`, `<style scoped>` (omit `<style>` if unused)
- Prefer composition API (`<script setup>`) over Options API
- Component file names: PascalCase (`MyComponent.vue`)
- No trailing summaries needed after completing tasks
