# Assets

Drop files here and reference them from `index.html` with paths like `assets/logos/your-file.svg` or `assets/images/your-file.jpg`.

## Folder layout

- `assets/logos/` — brand logos (SVG preferred, PNG with transparent background OK).
  - Suggested names: `rippner-mark.svg`, `rippner-wordmark.svg`, `rippner-lockup.svg`
- `assets/images/` — photos and other graphics used across the site.
  - Suggested formats: `.webp` (best for the web), `.jpg`, `.png`
  - Suggested names: `hero.webp`, `juniors-camp.webp`, `coach-action.webp`

## How to use them

Once a file is in place, swap it into the markup. Example — replace the small inline tennis-ball SVG in the top-bar with your real logo:

```html
<!-- in index.html, inside .brand -->
<span class="brand-mark">
  <img src="assets/logos/rippner-mark.svg" alt="Rippner Tennis" width="32" height="32" />
</span>
```

Or set a hero background image in `styles.css`:

```css
.hero {
  background-image: url('assets/images/hero.webp');
  background-size: cover;
  background-position: center;
}
```
