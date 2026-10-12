# mintcommerce landing

Independent Next.js App Router application in `apps/landing`, using TypeScript, Tailwind CSS 4, and GSAP with ScrollTrigger. The manifest declares dependencies; none were installed and no commands, builds, or tests were run while creating these files.

## Experience

- Animated Admin / Seller / Buyer explorer with keyboard tab navigation and a fixed preview size.
- Marketplace and seller dashboard illustrations with selectable reporting periods.
- Buyer storefront with search, categories, add-to-cart, quantity removal, and cart clearing. Preview interactions are local and submit no orders.
- Desktop scroll-driven story with a pinned preview. Mobile and reduced-motion layouts show each experience inline.
- Connected ecosystem illustration, role-specific feature lists, responsive navigation, and in-page calls to action.
- GSAP scopes and media queries are reverted on unmount. Reduced-motion preferences are respected.

## Design and product sources

Semantic palette tokens follow repository `color-system.md`: primary teal `#0F9985`, mint `#F4FFFC` / `#E8FBF6`, navy `#172538`, and canonical text and border colors. Teal 700 is used for readable accent text and primary button surfaces.

Content is based on existing Admin overview/people/order/analytics pages, Seller product/inventory/commerce/analytics pages, Buyer order pages, and `apps/shop` catalog/cart/checkout. Existing applications use demo/mock workflows. Checkout is explicitly described as demo checkout; the page does not claim live payments or backend integration. Preview values are illustrative.

## Integration

This app is independent of `apps/web` (Vite) and `apps/shop` (Next.js). No existing app files are changed. CTAs navigate to page sections, so dashboard/shop deployment URLs are not assumed. The package manifest defines a development and production port of 3002. A maintainer can install the declared dependencies and validate the app when command execution is authorized. No lockfile is generated without installation.

## Animation code

GSAP logic lives in `animations/`: `use-landing-animations.ts` handles page entrances and accents, `use-role-transition.ts` handles role switching, and `use-experience-story.ts` handles scroll storytelling. Components call these hooks and keep UI state and markup.
