# CPAnalyzer Design System

## 🎨 Color Theme

### Consistent Design Principles

This application uses a monochromatic blue theme from shadcn/ui. All colors are defined as CSS variables in `globals.css`, making it easy to change the entire theme by updating the variables in one place.

### Color Scheme

#### Theme Variables
The application uses semantic color variables that automatically adapt to light/dark mode:

- **Primary**: Main actions, active states, emphasis
- **Secondary**: Subtle backgrounds, secondary actions
- **Destructive**: Errors, warnings, delete actions
- **Muted**: Inactive states, subtle text
- **Accent**: Hover states, focus indicators
- **Background/Foreground**: Base colors for content

#### Component Color Mapping

##### Filters
- **Active**: `secondary` variant (subtle blue background)
- **Inactive**: `outline` variant (transparent with border)

##### Cards
- **High severity** (Conflicts, Risks): `destructive` variant badges
- **Medium severity** (Near-conflicts, Info): `secondary` variant badges
- **Low severity** (Ambiguity): `default` variant badges

##### Buttons
- **Primary actions**: Default variant (uses primary color)
- **Secondary actions**: `secondary` variant
- **Utility actions**: `ghost` variant
- **Danger actions**: `ghost` with destructive hover

##### Feedback
- **Positive**: Primary color with low opacity
- **Negative**: Destructive color with low opacity

### Design Rules

1. **No hardcoded colors**: All colors use theme variables (bg-primary, text-muted-foreground, etc.)
2. **Consistent opacity**: Use /10, /20, /50 for subtle variations
3. **Monochromatic**: Everything uses shades of blue from the theme
4. **Semantic naming**: Colors indicate function, not appearance
5. **Dark mode support**: All colors work in both light and dark modes

### How to Change the Theme

To change the color scheme:

1. Open `src/app/globals.css`
2. Update the color values in `:root` (light mode) and `.dark` (dark mode)
3. All components will automatically use the new colors

Example: To change from blue to purple, update the hue values in the oklch color definitions.

### Component Guidelines

#### Badges
- Use semantic variants: default, secondary, destructive, outline
- No custom color classes

#### Buttons
- Use semantic variants based on action type
- Primary actions use default variant
- No custom background colors

#### Cards
- Use border and background from theme
- Subtle backgrounds use primary/5 or muted/50

### Accessibility
- All color combinations meet WCAG contrast requirements
- Don't rely solely on color to convey information
- Interactive elements have clear hover/focus states using accent color

---

**Remember**: The theme is fully centralized. To change any color, update the CSS variables in globals.css, not individual components. 