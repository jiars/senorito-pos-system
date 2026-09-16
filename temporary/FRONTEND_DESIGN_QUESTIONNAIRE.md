# Frontend Design Questionnaire

Reply using the question number and choice, for example: `1B, 2A, 3C`. You may also write your own answer. Choices marked **Recommended** are a safe industry-standard starting point.

## A. Product Feel and Brand

1. What should the interface feel like?
   - A. Warm, modern, professional cafe system **(Recommended)**
   - B. Minimal and corporate
   - C. Playful and colorful
   - D. Other: ____

2. Which words should guide the design? Choose 3–5.
   - Clean, warm, premium, friendly, compact, calm, modern, professional, playful, bold
   - Answer: ____

3. Should the application support dark mode?
   - A. Light mode only for now **(Recommended)**
   - B. Light and dark mode now
   - C. Prepare tokens now, implement dark mode later

## B. Target Devices and Responsive Layout

4. What is the exact Figma tablet frame size?
   - Width: ____ px
   - Height: ____ px
   - Orientation: Portrait / Landscape

5. What device will staff mainly use?
   - A. 10–11 inch tablet **(Recommended)**
   - B. Small laptop
   - C. Desktop monitor
   - D. Mixed devices

6. How should the Sidebar behave on tablet?
   - A. Hidden by default; hamburger opens an overlay drawer **(Recommended)**
   - B. Narrow icon-only rail
   - C. Always visible full Sidebar

7. How should the Sidebar behave on desktop?
   - A. Always visible, with optional collapse **(Recommended)**
   - B. Always visible and fixed width
   - C. Hidden like tablet

8. Should the Topbar stay visible while scrolling?
   - A. Yes, sticky **(Recommended)**
   - B. No, scroll with the page

9. Should page content use:
   - A. Fluid width with consistent page padding **(Recommended)**
   - B. Fixed maximum width centered on the page
   - C. Different rule per module

## C. Typography

10. Which main font should redesigned screens use?
    - A. Geist, already installed and aligned with shadcn **(Recommended)**
    - B. Inter, used by many legacy pages
    - C. Another font: ____

11. Preferred typography density:
    - A. Compact but readable for tablet business software **(Recommended)**
    - B. Comfortable with larger text
    - C. Very compact and data-dense

12. Page-title style:
    - A. Strong semibold title with small muted description **(Recommended)**
    - B. Large bold marketing-style title
    - C. Small compact title

## D. Spacing, Size, and Surfaces

13. Preferred spacing system:
    - A. 4px base scale: 4, 8, 12, 16, 24, 32 **(Recommended)**
    - B. 8px base scale
    - C. Follow exact Figma values even when irregular

14. Page density:
    - A. Balanced **(Recommended)**
    - B. Compact
    - C. Spacious

15. Card corner style:
    - A. Medium rounded, around 10–12px **(Recommended)**
    - B. Soft rounded, around 16–20px
    - C. Mostly square, around 4–6px

16. Card separation:
    - A. Light border plus subtle shadow **(Recommended)**
    - B. Shadow only
    - C. Border only
    - D. Flat panels using background contrast

17. Main touch-control height:
    - A. At least 44px for tablet actions **(Recommended)**
    - B. Compact 36–40px controls
    - C. Large 48–52px controls

## E. Colors and Visual Hierarchy

18. Should the existing brown `#7B4030` remain the main brand/CTA color?
    - A. Yes **(Recommended)**
    - B. Use it only for navigation
    - C. Replace it with: ____

19. Should status colors follow familiar meanings?
    - A. Green success, amber warning, red danger, blue information **(Recommended)**
    - B. Use only brand colors
    - C. Follow exact Figma colors regardless of convention

20. Should financial values and stock warnings use stronger visual emphasis?
    - A. Yes, but keep colors accessible and restrained **(Recommended)**
    - B. Use neutral text only
    - C. Use bright color coding

## F. Icons and Actions

21. Icon library for all newly redesigned screens:
    - A. Lucide React, while keeping Bootstrap Icons only on unmigrated pages **(Recommended)**
    - B. Bootstrap Icons everywhere
    - C. Another library: ____

22. Button style:
    - A. Rounded rectangles with clear primary/secondary/ghost/destructive variants **(Recommended)**
    - B. Pill buttons
    - C. Mostly icon-only actions

23. Destructive actions should:
    - A. Use red styling and require confirmation **(Recommended)**
    - B. Use neutral styling until confirmation
    - C. Other: ____

24. Table row actions on tablet:
    - A. Compact icon buttons with tooltips **(Recommended)**
    - B. Text buttons
    - C. One overflow menu

## G. Forms, Tables, and Modals

25. Input-label style:
    - A. Normal label above input **(Recommended for business forms)**
    - B. Floating labels like Login
    - C. Placeholder-only

26. Large tables on tablet should:
    - A. Keep important columns and allow controlled horizontal scroll **(Recommended)**
    - B. Convert every row into a card
    - C. Hide secondary columns behind row details

27. Preferred modal behavior on tablet:
    - A. Centered modal for small forms; side sheet/full screen for large forms **(Recommended)**
    - B. Centered modal for everything
    - C. Full-screen modal for everything

28. Should filters open as:
    - A. Compact popover/dropdown for simple filters and Sheet for complex filters **(Recommended)**
    - B. Always visible toolbar
    - C. Full modal

## H. Feedback and Motion

29. Loading preference:
    - A. Skeletons for content, spinner for buttons, blocking overlay only for critical transactions **(Recommended)**
    - B. Spinner everywhere
    - C. Full-screen loading for every request

30. Empty states should include:
    - A. Icon, short explanation, and relevant action **(Recommended)**
    - B. Text only
    - C. Illustration and detailed instructions

31. Animation level:
    - A. Subtle 150–250ms transitions **(Recommended)**
    - B. Almost no animation
    - C. More visible animation

32. Respect `prefers-reduced-motion`?
    - A. Yes **(Recommended)**
    - B. No preference

## I. Navigation and Screenshot Questions

33. In the Topbar screenshot, should `Synced` and `Not synced` appear at the same time?
    - A. No; they are mutually exclusive states **(Recommended)**
    - B. Yes; they represent different systems. Explain: ____

34. What should clicking the user area open?
    - A. Small account menu with Profile and Logout **(Recommended)**
    - B. Go directly to Profile
    - C. Do nothing

35. Breadcrumbs should appear:
    - A. On every back-office page **(Recommended)**
    - B. Only on nested pages
    - C. Hide them on tablet

36. When page actions do not fit on tablet:
    - A. Keep the main action visible and move secondary actions into an overflow menu **(Recommended)**
    - B. Wrap actions to another row
    - C. Make all actions icon-only

37. Should Top Selling Items scroll horizontally on tablet?
    - A. Yes **(Recommended)**
    - B. Wrap into multiple rows
    - C. Show only a fixed number

## J. Content and Accessibility

38. Interface language:
    - A. English **(Recommended)**
    - B. Taglish
    - C. Filipino

39. Accessibility target:
    - A. WCAG AA contrast, keyboard access, focus states, and proper labels **(Recommended)**
    - B. Basic accessibility only

40. What should be redesigned first after Login and Loading?
    - A. Shared AppShell, Sidebar, Topbar, Breadcrumbs, and PageLayout **(Recommended)**
    - B. Dashboard immediately
    - C. Another module: ____

## Final Preferences

41. What parts of the current Login design do you definitely want to keep?
    - Answer: ____

42. What UI styles do you dislike and never want used?
    - Answer: ____

43. Give 1–3 applications or websites whose interface style you like.
    - Answer: ____

44. Is exact Figma matching more important than using one perfectly consistent design system?
    - A. Consistency first, with close Figma matching **(Recommended)**
    - B. Exact Figma matching first
    - C. Decide per screen

45. Any final non-negotiable preferences?
    - Answer: ____
