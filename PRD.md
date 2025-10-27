# Sales Call Assistant - Product Requirements Document

An interactive sales call assistant that transforms cold calling from static script-reading into a dynamic, guided experience with real-time decision support and qualification tracking.

**Experience Qualities**:
1. **Confident** - The interface provides clear guidance at every decision point, eliminating hesitation and empowering sales reps to navigate calls smoothly
2. **Focused** - Visual hierarchy and spatial design keep attention on the current script and next action, reducing cognitive load during high-pressure conversations
3. **Responsive** - Instant feedback to every interaction creates a sense of control and momentum throughout the call process

**Complexity Level**: Light Application (multiple features with basic state)
This is a guided workflow tool with state management for call progress, qualification tracking, and analytics - but doesn't require authentication or complex backend systems in this implementation.

## Essential Features

### 1. Pre-Call Setup
- **Functionality**: Form to capture prospect information and select call objective before starting
- **Purpose**: Ensures reps are prepared and all necessary context is captured before engaging
- **Trigger**: User clicks "New Call" from dashboard
- **Progression**: Dashboard → Setup Form (prospect info + objective) → Review talking points → Start Call button → Live call interface
- **Success criteria**: All required fields validated, call timer starts, script loads for selected objective

### 2. Interactive Call Flow with Decision Buttons
- **Functionality**: Large, color-coded script sections with prominent response buttons that dynamically update the conversation path
- **Purpose**: Guides reps through qualification without requiring memorization, adapting in real-time to client responses
- **Trigger**: Call starts or user clicks a response button
- **Progression**: Display script question → User clicks client response (Yes/No/Unsure) → Script updates to appropriate next section → Qualification checklist auto-updates → Repeat until call concludes
- **Success criteria**: Response buttons trigger script changes within 100ms, qualification status updates automatically, conversation flows logically to conclusion

### 3. Real-Time Qualification Tracking
- **Functionality**: Live checklist showing qualification criteria completion with progress visualization
- **Purpose**: Provides instant visibility into whether prospect meets criteria, preventing wasted time on unqualified leads
- **Trigger**: Automatically updates as response buttons are clicked
- **Progression**: Checklist starts empty → Each decision point marks criteria complete/incomplete → Progress bar fills → Status changes color (red/yellow/green) → Final qualification determined
- **Success criteria**: Checklist updates synchronously with script progression, clear visual distinction between qualified/unqualified states

### 4. Call Recording Interface
- **Functionality**: Browser-based audio recording with waveform visualization, timer, and playback controls
- **Purpose**: Creates accountability, enables coaching, and provides reference for follow-up actions
- **Trigger**: Auto-starts when call begins (or manual start)
- **Progression**: Click record → Audio capture begins → Waveform displays → Timer counts → Stop recording → Audio saved with call metadata → Available for playback in call history
- **Success criteria**: Clean audio capture, recording persists with call data, playback works with timestamp markers

### 5. Post-Call Summary & Analytics
- **Functionality**: Automatic call outcome classification, captured information display, and aggregated performance metrics
- **Purpose**: Eliminates manual logging, provides coaching insights, tracks conversion rates across qualification stages
- **Trigger**: User clicks "End Call" 
- **Progression**: Call ends → Summary screen displays outcome + key data → Notes can be added → Save to history → Return to dashboard with updated analytics
- **Success criteria**: Call data persists, analytics dashboard shows accurate metrics, historical calls are searchable and reviewable

## Edge Case Handling

- **Mid-call navigation away** - Auto-save call progress and prompt to resume or discard on return
- **Recording failure** - Display warning banner, allow call to continue without recording, log error
- **Rapid button clicking** - Debounce response buttons to prevent state conflicts
- **No microphone permission** - Gracefully disable recording features, show clear message about permission requirement
- **Long calls (>1 hour)** - Chunk recordings for browser memory management, display extended timer format
- **Qualification dead-end** - Provide "Back" button to revise previous responses if rep realizes they made an error
- **Empty call history** - Show helpful empty state with "Make your first call" prompt and feature overview

## Design Direction

The design should feel professional, focused, and confidence-inspiring - like a mission control dashboard for sales conversations. The interface should project calm authority with clean typography, generous spacing, and purposeful use of color to communicate status and guide attention. This is a tool for high-stakes conversations, so every element must be instantly readable and unambiguous. Minimal interface that gets out of the way during calls, revealing detailed data only when needed for analysis.

## Color Selection

Triadic color scheme using blue (trust/professionalism), green (success/qualified), and coral (urgency/attention) to create clear semantic meaning throughout the interface.

- **Primary Color**: Deep Professional Blue (oklch(0.45 0.15 250)) - Communicates trust and competence, used for main actions and script display
- **Secondary Colors**: 
  - Soft Slate (oklch(0.55 0.02 250)) for supporting UI elements and inactive states
  - Light Background (oklch(0.97 0.01 250)) for content areas
- **Accent Color**: Vibrant Coral (oklch(0.65 0.19 25)) - Creates urgency for key actions like "Start Call" and warning states
- **Success Green**: (oklch(0.65 0.15 150)) - Indicates qualified leads and positive outcomes
- **Warning Yellow**: (oklch(0.75 0.13 85)) - Shows objection handling and caution states
- **Foreground/Background Pairings**:
  - Background Light (oklch(0.97 0.01 250)): Dark Text (oklch(0.25 0.02 250)) - Ratio 10.2:1 ✓
  - Card (oklch(1 0 0)): Dark Text (oklch(0.25 0.02 250)) - Ratio 12.8:1 ✓
  - Primary Blue (oklch(0.45 0.15 250)): White (oklch(1 0 0)) - Ratio 8.1:1 ✓
  - Accent Coral (oklch(0.65 0.19 25)): White (oklch(1 0 0)) - Ratio 4.6:1 ✓
  - Success Green (oklch(0.65 0.15 150)): White (oklch(1 0 0)) - Ratio 4.8:1 ✓
  - Muted Slate (oklch(0.92 0.01 250)): Medium Text (oklch(0.45 0.02 250)) - Ratio 5.2:1 ✓

## Font Selection

The typeface should be highly legible under pressure with clear numerical distinction for metrics. Inter provides the professional clarity and excellent screen readability required for scanning scripts mid-conversation, while maintaining a modern, approachable character.

- **Typographic Hierarchy**:
  - H1 (Dashboard Title): Inter SemiBold/32px/tight tracking/-0.02em
  - H2 (Section Headers): Inter SemiBold/24px/tight tracking/-0.01em
  - H3 (Card Titles): Inter Medium/18px/normal tracking
  - Script Display: Inter Regular/22px/relaxed line-height 1.6 (highly readable during calls)
  - Body Text: Inter Regular/15px/normal line-height 1.5
  - Small Text (Metadata): Inter Regular/13px/normal tracking/muted color
  - Buttons: Inter Medium/15px/normal tracking
  - Metrics (Large): Inter SemiBold/48px/tight tracking (dashboard stats)

## Animations

Motion should feel immediate and purposeful - like flipping to the next page in a playbook rather than elaborate transitions. The overall feeling is efficient progression with subtle celebratory moments for achievements.

- **Purposeful Meaning**: Animations communicate state changes (script advancing, qualification updating) and provide satisfying feedback for successful outcomes (demo booked)
- **Hierarchy of Movement**:
  - Script transitions: Quick fade + subtle slide (200ms) - highest priority for seamless conversation flow
  - Button feedback: Immediate scale press (100ms) + color change - instant tactile response
  - Qualification checklist items: Check animation (300ms) with subtle bounce - satisfying progress indicator
  - Dashboard metrics: Count-up animation on mount (800ms) - draws attention to performance numbers
  - Call outcome celebration: Confetti burst for demo bookings - memorable positive reinforcement

## Component Selection

- **Components**:
  - **Card** - Primary container for script display, prospect info, call controls (with subtle shadow for depth)
  - **Button** - Decision responses with size='lg' and full width, primary variant for positive actions, outline for secondary
  - **Progress** - Qualification percentage visualization in header
  - **Badge** - Qualification status indicators with color variants (destructive/warning/success)
  - **Separator** - Visual division between major interface sections
  - **Tabs** - Dashboard navigation between Live Call / History / Analytics
  - **Dialog** - Pre-call setup modal, post-call summary overlay
  - **Textarea** - Post-call notes input
  - **Input** - Prospect information forms
  - **Select** - Call objective picker
  - **Checkbox** - Qualification criteria checklist items (custom styled with animations)
  - **ScrollArea** - Call history list and script content overflow
  - **Alert** - Recording status indicators and error messages

- **Customizations**:
  - Custom waveform visualization component for audio recording (Canvas-based)
  - Large response button group component with keyboard shortcuts overlay
  - Call timer component with hours:minutes:seconds format
  - Confetti animation component for demo bookings (canvas-based particle system)
  - Interactive decision tree visualization for analytics

- **States**:
  - Buttons: Clear hover elevation, active press scale (0.98), disabled opacity with cursor-not-allowed
  - Response buttons: Selected state with border accent and checkmark icon, hover with subtle scale (1.02)
  - Recording button: Pulsing red dot when active, static when paused
  - Qualification items: Pending (gray), Complete (green with check), Failed (red with x), animated transitions

- **Icon Selection**:
  - Phone (call start/active): Represents calling action
  - PhoneDisconnect (end call): Clear call termination
  - Record (recording): Universal recording symbol
  - Pause/Play (recording controls): Standard media controls
  - CheckCircle (qualification complete): Positive progress
  - XCircle (disqualified): Negative indicator
  - Clock (call timer): Time representation
  - User (prospect info): Person identifier
  - ChartBar (analytics): Data visualization
  - ListChecks (qualification checklist): Criteria tracking
  - ArrowRight (script progression): Forward movement
  - ArrowLeft (go back): Correction option
  - SpeakerHigh (playback): Audio indicator

- **Spacing**: 
  - Dashboard grid gap: 6 (24px) for major sections
  - Card internal padding: 6 (24px) for comfortable reading
  - Button group gaps: 3 (12px) for clear separation
  - Qualification checklist items: 2 (8px) for compact list
  - Script paragraphs: 4 (16px) for clear thought separation

- **Mobile**:
  - Stack three-column layout vertically: Script → Controls → Checklist
  - Prospect info collapses to accordion at top
  - Response buttons remain large and thumb-friendly (min 48px height)
  - Dashboard metrics switch to 1-column grid
  - Call history table becomes card list
  - Waveform visualization scales down but remains visible
  - Reduce script font size to 18px for mobile, maintain readability
