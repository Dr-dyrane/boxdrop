# The BoxDrop Law: Design System 🎨

**Immutable rules for the BoxDrop visual language. No exceptions.**

---

## 1. The No-Border Rule
You are **strictly forbidden** from using CSS borders (`border`, `border-width`) to separate elements. Visual separation is achieved exclusively through:

- **Frosted Glass:** `backdrop-blur-md`, `bg-white/10`
- **Depth & Elevation:** Subtle shadows and semantic layering.
- **Whitespace:** Luxury is silence.

## 2. Color as State
Color is never decorative. It must represent a transition or a meaning:
- **Primary/Action:** Brand intent.
- **Success/Warning/Destructive:** Semantic system feedback.
- **Background/Foreground:** High-contrast monochrome base.

## 3. Motion Explains
Animations show cause → effect.
- **Slide, Fade, Morph:** Standard transitions.
- **Never Bounce:** BoxDrop is calm and confident, not playful.
- **Spatial Memory:** Transitions must respect where the user came from.

## 4. Progressive Disclosure
Show only what is needed *now*.
- Secondary actions stay hidden until intent (hover/focus) appears.
- Forms reveal one input at a time.
- Contextual FAB morphs based on page-level priority.
