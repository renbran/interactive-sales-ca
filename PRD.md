# Scholarix Telesales System - Product Requirements Document

A production-ready telesales web application implementing the complete Scholarix World-Class Telesales Script - "The No-Escape System" designed to turn cold calls into committed demos in under 5 minutes.

**Target Market**: UAE Decision-Makers in Real Estate, Consulting, Retail, Trading, and Logistics
**Objective**: Achieve 40%+ demo booking rate with 3-5 minute average call duration
**Value Proposition**: Odoo + AI automation deployment in 14 days at 40% below market price (limited to 40 slots)

## Experience Qualities

1. **Confident** - The interface eliminates hesitation by providing world-class scripts with built-in objection handlers and exact phrasing at every decision point
2. **Focused** - Visual hierarchy keeps attention on the current script phase and next action, reducing cognitive load during high-pressure conversations
3. **Empowering** - Real-time qualification tracking and pro tips position the sales rep as an elite closer, not a script reader

## Complexity Level

**Light Application** (multiple features with basic state)  
Interactive workflow tool with call state management, SPIN-based qualification tracking, and performance analytics. No authentication required in initial version - focuses purely on the telesales methodology execution.

## Essential Features

### 1. Pre-Call Intelligence Gathering
- **Functionality**: Structured form capturing prospect name, title, company, industry, phone, email, WhatsApp, and call objective
- **Purpose**: Ensures reps have complete intel before engaging, with industry-specific pain points auto-loaded into scripts
- **Trigger**: User clicks "Start New Call" button
- **Progression**: Dashboard → Pre-Call Setup Modal → Industry selection → Auto-load pain points → Mental frame reminder → Start Call → Live interface
- **Success criteria**: All required fields validated, industry pain points displayed, scripts personalized with prospect data

### 2. Dynamic Scholarix Script Flow
- **Functionality**: Phase-based script display with response buttons that adapt conversation path based on SPIN methodology (Situation, Problem, Implication, Need-Payoff)
- **Purpose**: Guides reps through proven conversion methodology without memorization, handling objections with world-class responses
- **Trigger**: Call starts or user selects prospect response
- **Progression**: Opening → Permission Hook → Discovery (SPIN) → Teaching Moment → Demo Offer → Objection Handling → Close/Follow-up
- **Success criteria**: Scripts update within 100ms, prospect info auto-fills placeholders, response buttons clearly indicate positive/negative/objection paths

### 3. Real-Time SPIN Qualification
- **Functionality**: Six-point checklist tracking: Uses Manual Process, Pain Point Identified, Pain Quantified, Value Acknowledged, Time Committed, Demo Booked
- **Purpose**: Provides instant visibility into deal quality and qualification progress using proven SPIN selling criteria
- **Trigger**: Automatically updates as script progresses and responses selected
- **Progression**: Empty checkist → Items check off as qualification criteria met → Progress bar fills → Status changes (Just Started → In Progress → Strong Lead → Demo Booked)
- **Success criteria**: Qualification updates synchronously with script, clear visual distinction between qualified/unqualified/in-progress states

### 4. Post-Call Follow-Up System
- **Functionality**: Call outcome classification with notes capture and automated follow-up reminders based on Scholarix methodology
- **Purpose**: Ensures proper follow-through on demo bookings (calendar invite within 1 hour, WhatsApp confirmation, etc.)
- **Trigger**: User clicks "End Call"
- **Progression**: Call ends → Summary modal displays outcome + qualification + duration → Add notes → Save → Reminder for follow-up actions → Return to analytics
- **Success criteria**: Call data persists with useKV, demo bookings trigger specific follow-up checklist, all data searchable in history

### 5. Performance Analytics Dashboard
- **Functionality**: Aggregated metrics showing total calls, demos booked, conversion rate, average duration, and qualification breakdown
- **Purpose**: Tracks progress toward 40%+ booking rate target, identifies improvement areas
- **Trigger**: User navigates to Analytics tab
- **Progression**: Dashboard loads → Display key metrics → Show qualification funnel → Highlight conversion rate vs 40% target → Present call history trends
- **Success criteria**: Metrics calculate accurately from call history, conversion rate prominently displayed, visual indicators for meeting/missing 40% target

## Edge Case Handling

- **Mid-call browser refresh** - useKV auto-saves active call state; prompt to resume on page load
- **Missing prospect data during script** - Placeholders display [NAME], [COMPANY] if not provided; rep fills verbally
- **Rapid response clicking** - Debounce buttons 300ms to prevent state conflicts
- **No calls in history** - Display empty state with "Make your first call" CTA and methodology overview
- **Demo booked without contact info** - Warning modal: "Add email/WhatsApp for follow-up reminders"
- **Long objection loops** - Breadcrumb trail shows script path; "Go Back" option if rep realizes wrong turn
- **Conversion rate below 20%** - Analytics dashboard shows warning banner with methodology review prompts

## Design Direction

The design should feel like a premium sales enablement tool for elite closers - professional, focused, and confidence-inspiring. Think mission control meets luxury car dashboard: clean lines, purposeful color coding for call phases, generous whitespace that doesn't distract during live conversations. The interface should project calm authority with typography that's instantly readable under pressure. Minimal chrome, maximum clarity - every element earns its place by directly supporting the close.

## Color Selection

**Triadic scheme** using Deep Professional Blue (trust/authority), Vibrant Coral Orange (urgency/action), and Success Green (achievement), creating clear semantic meaning for call phases and qualification states.

- **Primary Color**: Deep Professional Blue (oklch(0.42 0.18 260)) - Trust and competence for main UI chrome and opening phase
- **Secondary Colors**: 
  - Soft Slate (oklch(0.94 0.005 250)) for backgrounds and inactive states
  - Light Background (oklch(0.98 0.005 250)) for main canvas
- **Accent Color**: Vibrant Coral Orange (oklch(0.60 0.22 30)) - Creates urgency for CTAs, demo offers, and key actions
- **Success Green**: (oklch(0.58 0.17 145)) - Qualified leads, demo bookings, positive responses
- **Warning Yellow**: (oklch(0.70 0.15 75)) - Objection phases and caution states
- **Destructive Red**: (oklch(0.55 0.24 25)) - Disqualified leads and negative outcomes

**Foreground/Background Pairings**:
- Background Light (oklch(0.98 0.005 250)): Dark Text (oklch(0.20 0.015 250)) - Ratio 14.2:1 ✓
- Card White (oklch(1 0 0)): Dark Text (oklch(0.20 0.015 250)) - Ratio 16.5:1 ✓
- Primary Blue (oklch(0.42 0.18 260)): White (oklch(1 0 0)) - Ratio 8.9:1 ✓
- Accent Orange (oklch(0.60 0.22 30)): White (oklch(1 0 0)) - Ratio 5.2:1 ✓
- Success Green (oklch(0.58 0.17 145)): White (oklch(1 0 0)) - Ratio 4.9:1 ✓

## Font Selection

**Inter** provides the professional clarity and excellent screen readability required for high-pressure sales calls, with clear numerical distinction for metrics and excellent multilingual support for UAE market (Arabic names, English scripts).

- **Typographic Hierarchy**:
  - H1 (App Title): Inter SemiBold/32px/-0.02em tracking
  - H2 (Phase Headers): Inter SemiBold/24px/-0.01em tracking
  - H3 (Card Titles): Inter SemiBold/20px/normal
  - Script Display: Inter Medium/18px/1.6 line-height (highly readable during calls)
  - Response Buttons: Inter Medium/15px/normal
  - Body Text: Inter Regular/15px/1.5 line-height
  - Small Text (Metadata): Inter Regular/13px/muted color
  - Metrics (Large): Inter SemiBold/48px/tight (dashboard stats)

## Animations

Motion should feel immediate and purposeful - like advancing through a playbook, not waiting for transitions. Efficiency with moments of celebration for demo bookings.

- **Purposeful Meaning**: Script transitions communicate forward progress in the sales funnel; qualification checks provide satisfying feedback for hitting milestones
- **Hierarchy of Movement**:
  - Script phase changes: Quick crossfade (150ms) - instant feel, no waiting
  - Response button press: Immediate scale (100ms) + ripple effect - tactile confirmation
  - Qualification items checking: Checkmark scale + subtle bounce (250ms) - satisfying progress
  - Demo booking celebration: Confetti burst + success modal scale-in (400ms) - memorable win moment
  - Metric count-ups on dashboard: Animate from 0 (600ms) - draws attention to performance

## Component Selection

- **Components**:
  - **Card** - Primary container for script, prospect info, call controls (subtle shadow for depth, rounded corners per --radius)
  - **Button** - Response selection with size='lg' and full width, color-coded by response type (positive=green, negative=muted, objection=warning)
  - **Progress** - Qualification percentage with color transitions (muted → warning → success as progress increases)
  - **Badge** - Call phase indicators (color-coded: opening=blue, discovery=orange, teaching=yellow, close=green, objection=red)
  - **Separator** - Visual division between script sections and metadata
  - **Tabs** - Dashboard navigation (Live Call / History / Analytics)
  - **Dialog** - Pre-call setup and post-call summary modals with backdrop
  - **Textarea** - Post-call notes capture
  - **Input** - Prospect information forms with clear labels
  - **Select** - Industry and call objective pickers with searchable options
  - **ScrollArea** - Script content and call history lists
  - **Toaster (Sonner)** - Success notifications for demo bookings and call saves

- **Customizations**:
  - Call timer component with real-time seconds counter (MM:SS format, prominent display)
  - Industry pain point auto-display based on selection (Real Estate → deal tracking chaos, etc.)
  - Script phase progress indicator showing Opening → Discovery → Teaching → Close flow
  - Demo booking celebration with confetti particles (canvas-based, 2-second burst)
  - Conversion rate gauge with 40% target line and color coding (red <20%, yellow 20-39%, green 40%+)

- **States**:
  - Buttons: Clear hover lift (2px), active press scale (0.97), disabled opacity (0.5) with cursor-not-allowed
  - Response buttons: Selected state with border glow and checkmark icon before transition
  - Call phase badges: Pulsing animation on active phase, muted on completed phases
  - Qualification items: Pending (gray circle), Complete (green checkmark with fill), Failed (red X with fill)

- **Icon Selection** (Phosphor Icons):
  - Phone (call start/active), PhoneDisconnect (end call), Clock (timer), User (prospect)
  - CheckCircle (qualification complete), XCircle (disqualified), Circle (pending)
  - Target (qualification section), ChartBar (analytics), ClockCounterClockwise (history)
  - Lightbulb (pro tips), ArrowRight (script progression), Warning (objection phase)
  - Confetti (demo booked celebration)

- **Spacing**: 
  - Dashboard grid: gap-6 (24px) for major sections
  - Card padding: p-6 (24px) for comfortable reading
  - Script paragraphs: space-y-4 (16px) for clear thought separation
  - Response button grid: gap-2 (8px) for compact but clear selection
  - Qualification checklist: space-y-3 (12px) for scannable list

- **Mobile**:
  - Stack three-column layout vertically: Script (top) → Qualification (middle) → Controls (bottom, sticky)
  - Prospect info collapses to compact header bar with expand toggle
  - Response buttons remain large and thumb-friendly (min 48px height, full width)
  - Dashboard metrics switch to 1-column grid with larger touch targets
  - Script font size scales to 16px on mobile while maintaining 1.6 line-height
  - Call history switches from table to card-based list with swipe actions
