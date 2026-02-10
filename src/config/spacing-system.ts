/**
 * Enhanced Spacing and Visual Rhythm System
 * Comprehensive spacing utilities for consistent visual hierarchy
 */

export const SPACING_SYSTEM = `
/* Enhanced Spacing Scale - 4px base unit */
.space-0 { margin: 0; padding: 0; }

/* Margin Utilities */
.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 0.75rem; }
.m-4 { margin: 1rem; }
.m-5 { margin: 1.25rem; }
.m-6 { margin: 1.5rem; }
.m-8 { margin: 2rem; }
.m-10 { margin: 2.5rem; }
.m-12 { margin: 3rem; }
.m-16 { margin: 4rem; }
.m-20 { margin: 5rem; }
.m-24 { margin: 6rem; }
.m-32 { margin: 8rem; }

/* Margin Top */
.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mt-5 { margin-top: 1.25rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.mt-10 { margin-top: 2.5rem; }
.mt-12 { margin-top: 3rem; }
.mt-16 { margin-top: 4rem; }
.mt-20 { margin-top: 5rem; }
.mt-24 { margin-top: 6rem; }
.mt-32 { margin-top: 8rem; }

/* Margin Bottom */
.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-5 { margin-bottom: 1.25rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mb-12 { margin-bottom: 3rem; }
.mb-16 { margin-bottom: 4rem; }
.mb-20 { margin-bottom: 5rem; }
.mb-24 { margin-bottom: 6rem; }
.mb-32 { margin-bottom: 8rem; }

/* Margin Left */
.ml-0 { margin-left: 0; }
.ml-1 { margin-left: 0.25rem; }
.ml-2 { margin-left: 0.5rem; }
.ml-3 { margin-left: 0.75rem; }
.ml-4 { margin-left: 1rem; }
.ml-5 { margin-left: 1.25rem; }
.ml-6 { margin-left: 1.5rem; }
.ml-8 { margin-left: 2rem; }
.ml-10 { margin-left: 2.5rem; }
.ml-12 { margin-left: 3rem; }
.ml-16 { margin-left: 4rem; }
.ml-20 { margin-left: 5rem; }
.ml-24 { margin-left: 6rem; }
.ml-32 { margin-left: 8rem; }

/* Margin Right */
.mr-0 { margin-right: 0; }
.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
.mr-3 { margin-right: 0.75rem; }
.mr-4 { margin-right: 1rem; }
.mr-5 { margin-right: 1.25rem; }
.mr-6 { margin-right: 1.5rem; }
.mr-8 { margin-right: 2rem; }
.mr-10 { margin-right: 2.5rem; }
.mr-12 { margin-right: 3rem; }
.mr-16 { margin-right: 4rem; }
.mr-20 { margin-right: 5rem; }
.mr-24 { margin-right: 6rem; }
.mr-32 { margin-right: 8rem; }

/* Horizontal Margin */
.mx-0 { margin-left: 0; margin-right: 0; }
.mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
.mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
.mx-3 { margin-left: 0.75rem; margin-right: 0.75rem; }
.mx-4 { margin-left: 1rem; margin-right: 1rem; }
.mx-5 { margin-left: 1.25rem; margin-right: 1.25rem; }
.mx-6 { margin-left: 1.5rem; margin-right: 1.5rem; }
.mx-8 { margin-left: 2rem; margin-right: 2rem; }
.mx-10 { margin-left: 2.5rem; margin-right: 2.5rem; }
.mx-12 { margin-left: 3rem; margin-right: 3rem; }
.mx-16 { margin-left: 4rem; margin-right: 4rem; }
.mx-20 { margin-left: 5rem; margin-right: 5rem; }
.mx-24 { margin-left: 6rem; margin-right: 6rem; }
.mx-32 { margin-left: 8rem; margin-right: 8rem; }

/* Vertical Margin */
.my-0 { margin-top: 0; margin-bottom: 0; }
.my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
.my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
.my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; }
.my-4 { margin-top: 1rem; margin-bottom: 1rem; }
.my-5 { margin-top: 1.25rem; margin-bottom: 1.25rem; }
.my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
.my-8 { margin-top: 2rem; margin-bottom: 2rem; }
.my-10 { margin-top: 2.5rem; margin-bottom: 2.5rem; }
.my-12 { margin-top: 3rem; margin-bottom: 3rem; }
.my-16 { margin-top: 4rem; margin-bottom: 4rem; }
.my-20 { margin-top: 5rem; margin-bottom: 5rem; }
.my-24 { margin-top: 6rem; margin-bottom: 6rem; }
.my-32 { margin-top: 8rem; margin-bottom: 8rem; }

/* Padding Utilities */
.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.p-10 { padding: 2.5rem; }
.p-12 { padding: 3rem; }
.p-16 { padding: 4rem; }
.p-20 { padding: 5rem; }
.p-24 { padding: 6rem; }
.p-32 { padding: 8rem; }

/* Padding Top */
.pt-0 { padding-top: 0; }
.pt-1 { padding-top: 0.25rem; }
.pt-2 { padding-top: 0.5rem; }
.pt-3 { padding-top: 0.75rem; }
.pt-4 { padding-top: 1rem; }
.pt-5 { padding-top: 1.25rem; }
.pt-6 { padding-top: 1.5rem; }
.pt-8 { padding-top: 2rem; }
.pt-10 { padding-top: 2.5rem; }
.pt-12 { padding-top: 3rem; }
.pt-16 { padding-top: 4rem; }
.pt-20 { padding-top: 5rem; }
.pt-24 { padding-top: 6rem; }
.pt-32 { padding-top: 8rem; }

/* Padding Bottom */
.pb-0 { padding-bottom: 0; }
.pb-1 { padding-bottom: 0.25rem; }
.pb-2 { padding-bottom: 0.5rem; }
.pb-3 { padding-bottom: 0.75rem; }
.pb-4 { padding-bottom: 1rem; }
.pb-5 { padding-bottom: 1.25rem; }
.pb-6 { padding-bottom: 1.5rem; }
.pb-8 { padding-bottom: 2rem; }
.pb-10 { padding-bottom: 2.5rem; }
.pb-12 { padding-bottom: 3rem; }
.pb-16 { padding-bottom: 4rem; }
.pb-20 { padding-bottom: 5rem; }
.pb-24 { padding-bottom: 6rem; }
.pb-32 { padding-bottom: 8rem; }

/* Padding Left */
.pl-0 { padding-left: 0; }
.pl-1 { padding-left: 0.25rem; }
.pl-2 { padding-left: 0.5rem; }
.pl-3 { padding-left: 0.75rem; }
.pl-4 { padding-left: 1rem; }
.pl-5 { padding-left: 1.25rem; }
.pl-6 { padding-left: 1.5rem; }
.pl-8 { padding-left: 2rem; }
.pl-10 { padding-left: 2.5rem; }
.pl-12 { padding-left: 3rem; }
.pl-16 { padding-left: 4rem; }
.pl-20 { padding-left: 5rem; }
.pl-24 { padding-left: 6rem; }
.pl-32 { padding-left: 8rem; }

/* Padding Right */
.pr-0 { padding-right: 0; }
.pr-1 { padding-right: 0.25rem; }
.pr-2 { padding-right: 0.5rem; }
.pr-3 { padding-right: 0.75rem; }
.pr-4 { padding-right: 1rem; }
.pr-5 { padding-right: 1.25rem; }
.pr-6 { padding-right: 1.5rem; }
.pr-8 { padding-right: 2rem; }
.pr-10 { padding-right: 2.5rem; }
.pr-12 { padding-right: 3rem; }
.pr-16 { padding-right: 4rem; }
.pr-20 { padding-right: 5rem; }
.pr-24 { padding-right: 6rem; }
.pr-32 { padding-right: 8rem; }

/* Horizontal Padding */
.px-0 { padding-left: 0; padding-right: 0; }
.px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.px-8 { padding-left: 2rem; padding-right: 2rem; }
.px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
.px-12 { padding-left: 3rem; padding-right: 3rem; }
.px-16 { padding-left: 4rem; padding-right: 4rem; }
.px-20 { padding-left: 5rem; padding-right: 5rem; }
.px-24 { padding-left: 6rem; padding-right: 6rem; }
.px-32 { padding-left: 8rem; padding-right: 8rem; }

/* Vertical Padding */
.py-0 { padding-top: 0; padding-bottom: 0; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }
.py-24 { padding-top: 6rem; padding-bottom: 6rem; }
.py-32 { padding-top: 8rem; padding-bottom: 8rem; }

/* Gap Utilities */
.gap-0 { gap: 0; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-5 { gap: 1.25rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
.gap-10 { gap: 2.5rem; }
.gap-12 { gap: 3rem; }
.gap-16 { gap: 4rem; }
.gap-20 { gap: 5rem; }
.gap-24 { gap: 6rem; }
.gap-32 { gap: 8rem; }

/* Gap X */
.gap-x-0 { column-gap: 0; }
.gap-x-1 { column-gap: 0.25rem; }
.gap-x-2 { column-gap: 0.5rem; }
.gap-x-3 { column-gap: 0.75rem; }
.gap-x-4 { column-gap: 1rem; }
.gap-x-5 { column-gap: 1.25rem; }
.gap-x-6 { column-gap: 1.5rem; }
.gap-x-8 { column-gap: 2rem; }
.gap-x-10 { column-gap: 2.5rem; }
.gap-x-12 { column-gap: 3rem; }
.gap-x-16 { column-gap: 4rem; }
.gap-x-20 { column-gap: 5rem; }
.gap-x-24 { column-gap: 6rem; }
.gap-x-32 { column-gap: 8rem; }

/* Gap Y */
.gap-y-0 { row-gap: 0; }
.gap-y-1 { row-gap: 0.25rem; }
.gap-y-2 { row-gap: 0.5rem; }
.gap-y-3 { row-gap: 0.75rem; }
.gap-y-4 { row-gap: 1rem; }
.gap-y-5 { row-gap: 1.25rem; }
.gap-y-6 { row-gap: 1.5rem; }
.gap-y-8 { row-gap: 2rem; }
.gap-y-10 { row-gap: 2.5rem; }
.gap-y-12 { row-gap: 3rem; }
.gap-y-16 { row-gap: 4rem; }
.gap-y-20 { row-gap: 5rem; }
.gap-y-24 { row-gap: 6rem; }
.gap-y-32 { row-gap: 8rem; }

/* Space Between Utilities */
.space-x-0 > :not([hidden]) ~ :not([hidden]) { margin-left: 0; }
.space-x-1 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.25rem; }
.space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.5rem; }
.space-x-3 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.75rem; }
.space-x-4 > :not([hidden]) ~ :not([hidden]) { margin-left: 1rem; }
.space-x-5 > :not([hidden]) ~ :not([hidden]) { margin-left: 1.25rem; }
.space-x-6 > :not([hidden]) ~ :not([hidden]) { margin-left: 1.5rem; }
.space-x-8 > :not([hidden]) ~ :not([hidden]) { margin-left: 2rem; }
.space-x-10 > :not([hidden]) ~ :not([hidden]) { margin-left: 2.5rem; }
.space-x-12 > :not([hidden]) ~ :not([hidden]) { margin-left: 3rem; }
.space-x-16 > :not([hidden]) ~ :not([hidden]) { margin-left: 4rem; }
.space-x-20 > :not([hidden]) ~ :not([hidden]) { margin-left: 5rem; }
.space-x-24 > :not([hidden]) ~ :not([hidden]) { margin-left: 6rem; }
.space-x-32 > :not([hidden]) ~ :not([hidden]) { margin-left: 8rem; }

.space-y-0 > :not([hidden]) ~ :not([hidden]) { margin-top: 0; }
.space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
.space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
.space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
.space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
.space-y-5 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.25rem; }
.space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
.space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
.space-y-10 > :not([hidden]) ~ :not([hidden]) { margin-top: 2.5rem; }
.space-y-12 > :not([hidden]) ~ :not([hidden]) { margin-top: 3rem; }
.space-y-16 > :not([hidden]) ~ :not([hidden]) { margin-top: 4rem; }
.space-y-20 > :not([hidden]) ~ :not([hidden]) { margin-top: 5rem; }
.space-y-24 > :not([hidden]) ~ :not([hidden]) { margin-top: 6rem; }
.space-y-32 > :not([hidden]) ~ :not([hidden]) { margin-top: 8rem; }

/* Negative Margin Utilities */
.-m-1 { margin: -0.25rem; }
.-m-2 { margin: -0.5rem; }
.-m-3 { margin: -0.75rem; }
.-m-4 { margin: -1rem; }
.-m-5 { margin: -1.25rem; }
.-m-6 { margin: -1.5rem; }
.-m-8 { margin: -2rem; }
.-m-10 { margin: -2.5rem; }
.-m-12 { margin: -3rem; }
.-m-16 { margin: -4rem; }
.-m-20 { margin: -5rem; }
.-m-24 { margin: -6rem; }
.-m-32 { margin: -8rem; }

.-mx-1 { margin-left: -0.25rem; margin-right: -0.25rem; }
.-mx-2 { margin-left: -0.5rem; margin-right: -0.5rem; }
.-mx-3 { margin-left: -0.75rem; margin-right: -0.75rem; }
.-mx-4 { margin-left: -1rem; margin-right: -1rem; }
.-mx-5 { margin-left: -1.25rem; margin-right: -1.25rem; }
.-mx-6 { margin-left: -1.5rem; margin-right: -1.5rem; }
.-mx-8 { margin-left: -2rem; margin-right: -2rem; }
.-mx-10 { margin-left: -2.5rem; margin-right: -2.5rem; }
.-mx-12 { margin-left: -3rem; margin-right: -3rem; }
.-mx-16 { margin-left: -4rem; margin-right: -4rem; }
.-mx-20 { margin-left: -5rem; margin-right: -5rem; }
.-mx-24 { margin-left: -6rem; margin-right: -6rem; }
.-mx-32 { margin-left: -8rem; margin-right: -8rem; }

.-my-1 { margin-top: -0.25rem; margin-bottom: -0.25rem; }
.-my-2 { margin-top: -0.5rem; margin-bottom: -0.5rem; }
.-my-3 { margin-top: -0.75rem; margin-bottom: -0.75rem; }
.-my-4 { margin-top: -1rem; margin-bottom: -1rem; }
.-my-5 { margin-top: -1.25rem; margin-bottom: -1.25rem; }
.-my-6 { margin-top: -1.5rem; margin-bottom: -1.5rem; }
.-my-8 { margin-top: -2rem; margin-bottom: -2rem; }
.-my-10 { margin-top: -2.5rem; margin-bottom: -2.5rem; }
.-my-12 { margin-top: -3rem; margin-bottom: -3rem; }
.-my-16 { margin-top: -4rem; margin-bottom: -4rem; }
.-my-20 { margin-top: -5rem; margin-bottom: -5rem; }
.-my-24 { margin-top: -6rem; margin-bottom: -6rem; }
.-my-32 { margin-top: -8rem; margin-bottom: -8rem; }

/* Auto Margin */
.m-auto { margin: auto; }
.mx-auto { margin-left: auto; margin-right: auto; }
.my-auto { margin-top: auto; margin-bottom: auto; }
.mt-auto { margin-top: auto; }
.mr-auto { margin-right: auto; }
.mb-auto { margin-bottom: auto; }
.ml-auto { margin-left: auto; }

/* Visual Rhythm Utilities */
.section-spacing { padding: 4rem 0; }
.section-spacing-sm { padding: 2rem 0; }
.section-spacing-lg { padding: 6rem 0; }
.section-spacing-xl { padding: 8rem 0; }

.content-spacing { padding: 2rem; }
.content-spacing-sm { padding: 1rem; }
.content-spacing-lg { padding: 3rem; }
.content-spacing-xl { padding: 4rem; }

.card-spacing { padding: 1.5rem; }
.card-spacing-sm { padding: 1rem; }
.card-spacing-lg { padding: 2rem; }
.card-spacing-xl { padding: 2.5rem; }

.list-spacing li { margin-bottom: 0.75rem; }
.list-spacing-sm li { margin-bottom: 0.5rem; }
.list-spacing-lg li { margin-bottom: 1rem; }

.form-spacing { gap: 1.5rem; }
.form-spacing-sm { gap: 1rem; }
.form-spacing-lg { gap: 2rem; }

/* Responsive Spacing */
@media (max-width: 640px) {
  .sm-m-0 { margin: 0; }
  .sm-m-2 { margin: 0.5rem; }
  .sm-m-4 { margin: 1rem; }
  .sm-m-6 { margin: 1.5rem; }
  .sm-m-8 { margin: 2rem; }
  
  .sm-p-0 { padding: 0; }
  .sm-p-2 { padding: 0.5rem; }
  .sm-p-4 { padding: 1rem; }
  .sm-p-6 { padding: 1.5rem; }
  .sm-p-8 { padding: 2rem; }
  
  .sm-gap-0 { gap: 0; }
  .sm-gap-2 { gap: 0.5rem; }
  .sm-gap-4 { gap: 1rem; }
  .sm-gap-6 { gap: 1.5rem; }
  .sm-gap-8 { gap: 2rem; }
}

@media (min-width: 768px) {
  .md-m-0 { margin: 0; }
  .md-m-4 { margin: 1rem; }
  .md-m-6 { margin: 1.5rem; }
  .md-m-8 { margin: 2rem; }
  .md-m-12 { margin: 3rem; }
  
  .md-p-0 { padding: 0; }
  .md-p-4 { padding: 1rem; }
  .md-p-6 { padding: 1.5rem; }
  .md-p-8 { padding: 2rem; }
  .md-p-12 { padding: 3rem; }
  
  .md-gap-0 { gap: 0; }
  .md-gap-4 { gap: 1rem; }
  .md-gap-6 { gap: 1.5rem; }
  .md-gap-8 { gap: 2rem; }
  .md-gap-12 { gap: 3rem; }
}

@media (min-width: 1024px) {
  .lg-m-0 { margin: 0; }
  .lg-m-6 { margin: 1.5rem; }
  .lg-m-8 { margin: 2rem; }
  .lg-m-12 { margin: 3rem; }
  .lg-m-16 { margin: 4rem; }
  
  .lg-p-0 { padding: 0; }
  .lg-p-6 { padding: 1.5rem; }
  .lg-p-8 { padding: 2rem; }
  .lg-p-12 { padding: 3rem; }
  .lg-p-16 { padding: 4rem; }
  
  .lg-gap-0 { gap: 0; }
  .lg-gap-6 { gap: 1.5rem; }
  .lg-gap-8 { gap: 2rem; }
  .lg-gap-12 { gap: 3rem; }
  .lg-gap-16 { gap: 4rem; }
}

/* Proportional Spacing */
.proportional-spacing-sm { margin: 1rem; padding: 1rem; }
.proportional-spacing { margin: 1.5rem; padding: 1.5rem; }
.proportional-spacing-lg { margin: 2rem; padding: 2rem; }
.proportional-spacing-xl { margin: 3rem; padding: 3rem; }

/* Golden Ratio Spacing */
.golden-sm { margin: 0.618rem; padding: 0.618rem; }
.golden { margin: 1rem; padding: 1rem; }
.golden-lg { margin: 1.618rem; padding: 1.618rem; }
.golden-xl { margin: 2.618rem; padding: 2.618rem; }
`;

export const SPACING_CONFIG = {
  // Base spacing unit
  base: 4,
  
  // Spacing scale (multiples of base unit)
  scale: {
    0: 0,
    1: 0.25,   // 1px
    2: 0.5,    // 2px
    3: 0.75,   // 3px
    4: 1,      // 4px
    5: 1.25,   // 5px
    6: 1.5,    // 6px
    8: 2,      // 8px
    10: 2.5,   // 10px
    12: 3,     // 12px
    16: 4,     // 16px
    20: 5,     // 20px
    24: 6,     // 24px
    32: 8,     // 32px
  },
  
  // Common spacing patterns
  patterns: {
    tight: { margin: 0.5, padding: 0.5, gap: 0.5 },
    normal: { margin: 1, padding: 1, gap: 1 },
    loose: { margin: 1.5, padding: 1.5, gap: 1.5 },
    extraLoose: { margin: 2, padding: 2, gap: 2 },
  },
  
  // Component-specific spacing
  components: {
    button: { paddingX: 1.5, paddingY: 0.75, gap: 0.5 },
    input: { paddingX: 1, paddingY: 0.75, gap: 0.5 },
    card: { padding: 1.5, gap: 1, margin: 1 },
    modal: { padding: 2, gap: 1.5, margin: 1 },
    form: { gap: 1.5, margin: 1 },
    list: { gap: 0.75, padding: 1 },
    grid: { gap: 1, padding: 1 },
  },
  
  // Section spacing
  sections: {
    small: { padding: 2, margin: 1 },
    medium: { padding: 4, margin: 2 },
    large: { padding: 6, margin: 3 },
    extraLarge: { padding: 8, margin: 4 },
  },
};

export const getSpacingValue = (key: keyof typeof SPACING_CONFIG.scale) => {
  return SPACING_CONFIG.scale[key];
};

export const getComponentSpacing = (component: keyof typeof SPACING_CONFIG.components) => {
  return SPACING_CONFIG.components[component];
};

export const getSectionSpacing = (size: keyof typeof SPACING_CONFIG.sections) => {
  return SPACING_CONFIG.sections[size];
};

export default SPACING_SYSTEM;