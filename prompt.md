Lis le fichier prompt.md et intègre ce design Banani dans mon projet Next.js 14 avec TypeScript et Tailwind CSS. This is a UI design exported as HTML/CSS from Banani. Integrate it into my project, adapting it to match my existing tech stack, component library, and styles. Preserve the layout, spacing, and visual design as closely as possible.

Instructions:
- Convert the HTML/CSS into components that fit my project's framework and conventions
- Replace inline styles with my project's styling approach (e.g., Tailwind classes, CSS modules, styled-components)
- Use existing UI components from my project where appropriate
- Ensure the result is responsive and accessible
- Remove any Banani-specific artifacts (export wrappers, CDN scripts)

```html
<design>
<div
  class="export-wrapper"
  style="
    width: 375px;
    min-height: 812px;
    position: relative;
    font-family: var(--font-family-body);
    background-color: var(--background);
  "
>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@100;200;300;400;500;600;700;800;900&family=Geist:wght@100;200;300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&family=IBM+Plex+Sans:wght@100;200;300;400;500;600;700&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Nunito:wght@200;300;400;500;600;700;800;900&family=PT+Serif:wght@400;700&family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:wght@100;300;400;500;700;900&family=Shantell+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
  <html>
    <head>
      <style>
        /*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */
        @layer properties;
        @layer theme, base, components, utilities;
        @layer theme {
          :root,
          :root {
            --font-sans:
              ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
              "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            --font-mono:
              ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
              "Liberation Mono", "Courier New", monospace;
            --color-black: #000;
            --color-white: #fff;
            --spacing: 0.25rem;
            --text-xs: 12px;
            --text-xs--line-height: calc(1 / 0.75);
            --text-sm: 14px;
            --text-sm--line-height: calc(1.25 / 0.875);
            --text-lg: 18px;
            --text-lg--line-height: calc(1.75 / 1.125);
            --text-xl: 20px;
            --text-xl--line-height: calc(1.75 / 1.25);
            --text-2xl: 24px;
            --text-2xl--line-height: calc(2 / 1.5);
            --text-3xl: 30px;
            --text-3xl--line-height: calc(2.25 / 1.875);
            --font-weight-medium: 500;
            --font-weight-semibold: 600;
            --font-weight-bold: 700;
            --font-weight-extrabold: 800;
            --leading-tight: 1.25;
            --radius-sm: 4px;
            --radius-xl: 24px;
            --radius-2xl: 1rem;
            --blur-sm: 8px;
            --blur-md: 12px;
            --blur-lg: 16px;
            --blur-xl: 24px;
            --blur-2xl: 40px;
            --default-font-family: var(--font-sans);
            --default-mono-font-family: var(--font-mono);
            --color-background: #0f172a;
            --color-foreground: #f0f0ff;
            --color-border: #2d2d44;
            --color-input: #1e1e30;
            --color-primary: #2563eb;
            --color-primary-foreground: #ffffff;
            --color-accent: #9333ea;
            --color-accent-foreground: #ffffff;
            --color-violet: #7c3aed;
            --font-body: Inter;
          }
        }
        @layer base {
          *,
          ::after,
          ::before,
          ::backdrop,
          ::file-selector-button {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            border: 0 solid;
          }
          html,
          :root {
            line-height: 1.5;
            -webkit-text-size-adjust: 100%;
            tab-size: 4;
            font-family: var(
              --default-font-family,
              ui-sans-serif,
              system-ui,
              sans-serif,
              "Apple Color Emoji",
              "Segoe UI Emoji",
              "Segoe UI Symbol",
              "Noto Color Emoji"
            );
            font-feature-settings: var(--default-font-feature-settings, normal);
            font-variation-settings: var(
              --default-font-variation-settings,
              normal
            );
            -webkit-tap-highlight-color: transparent;
          }
          hr {
            height: 0;
            color: inherit;
            border-top-width: 1px;
          }
          abbr:where([title]) {
            -webkit-text-decoration: underline dotted;
            text-decoration: underline dotted;
          }
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            font-size: inherit;
            font-weight: inherit;
          }
          a {
            color: inherit;
            -webkit-text-decoration: inherit;
            text-decoration: inherit;
          }
          b,
          strong {
            font-weight: bolder;
          }
          code,
          kbd,
          samp,
          pre {
            font-family: var(
              --default-mono-font-family,
              ui-monospace,
              SFMono-Regular,
              Menlo,
              Monaco,
              Consolas,
              "Liberation Mono",
              "Courier New",
              monospace
            );
            font-feature-settings: var(
              --default-mono-font-feature-settings,
              normal
            );
            font-variation-settings: var(
              --default-mono-font-variation-settings,
              normal
            );
            font-size: 1em;
          }
          small {
            font-size: 80%;
          }
          sub,
          sup {
            font-size: 75%;
            line-height: 0;
            position: relative;
            vertical-align: baseline;
          }
          sub {
            bottom: -0.25em;
          }
          sup {
            top: -0.5em;
          }
          table {
            text-indent: 0;
            border-color: inherit;
            border-collapse: collapse;
          }
          :-moz-focusring {
            outline: auto;
          }
          progress {
            vertical-align: baseline;
          }
          summary {
            display: list-item;
          }
          ol,
          ul,
          menu {
            list-style: none;
          }
          img,
          svg,
          video,
          canvas,
          audio,
          iframe,
          embed,
          object {
            display: block;
            vertical-align: middle;
          }
          img,
          video {
            max-width: 100%;
            height: auto;
          }
          button,
          input,
          select,
          optgroup,
          textarea,
          ::file-selector-button {
            font: inherit;
            font-feature-settings: inherit;
            font-variation-settings: inherit;
            letter-spacing: inherit;
            color: inherit;
            border-radius: 0;
            background-color: transparent;
            opacity: 1;
          }
          :where(select:is([multiple], [size])) optgroup {
            font-weight: bolder;
          }
          :where(select:is([multiple], [size])) optgroup option {
            padding-inline-start: 20px;
          }
          ::file-selector-button {
            margin-inline-end: 4px;
          }
          ::placeholder {
            opacity: 1;
          }
          @supports (not (-webkit-appearance: -apple-pay-button)) or
            (contain-intrinsic-size: 1px) {
            ::placeholder {
              color: currentcolor;
              @supports (color: color-mix(in lab, red, red)) {
                color: color-mix(in oklab, currentcolor 50%, transparent);
              }
            }
          }
          textarea {
            resize: vertical;
          }
          ::-webkit-search-decoration {
            -webkit-appearance: none;
          }
          ::-webkit-date-and-time-value {
            min-height: 1lh;
            text-align: inherit;
          }
          ::-webkit-datetime-edit {
            display: inline-flex;
          }
          ::-webkit-datetime-edit-fields-wrapper {
            padding: 0;
          }
          ::-webkit-datetime-edit,
          ::-webkit-datetime-edit-year-field,
          ::-webkit-datetime-edit-month-field,
          ::-webkit-datetime-edit-day-field,
          ::-webkit-datetime-edit-hour-field,
          ::-webkit-datetime-edit-minute-field,
          ::-webkit-datetime-edit-second-field,
          ::-webkit-datetime-edit-millisecond-field,
          ::-webkit-datetime-edit-meridiem-field {
            padding-block: 0;
          }
          ::-webkit-calendar-picker-indicator {
            line-height: 1;
          }
          :-moz-ui-invalid {
            box-shadow: none;
          }
          button,
          input:where([type="button"], [type="reset"], [type="submit"]),
          ::file-selector-button {
            appearance: button;
          }
          ::-webkit-inner-spin-button,
          ::-webkit-outer-spin-button {
            height: auto;
          }
          [hidden]:where(:not([hidden="until-found"])) {
            display: none !important;
          }
        }
        @layer utilities {
          .pointer-events-none {
            pointer-events: none;
          }
          .absolute {
            position: absolute;
          }
          .fixed {
            position: fixed;
          }
          .relative {
            position: relative;
          }
          .inset-0 {
            inset: calc(var(--spacing) * 0);
          }
          .top-4 {
            top: calc(var(--spacing) * 4);
          }
          .top-\[-10\%\] {
            top: -10%;
          }
          .top-\[30\%\] {
            top: 30%;
          }
          .right-4 {
            right: calc(var(--spacing) * 4);
          }
          .right-\[-20\%\] {
            right: -20%;
          }
          .bottom-0 {
            bottom: calc(var(--spacing) * 0);
          }
          .left-4 {
            left: calc(var(--spacing) * 4);
          }
          .left-\[-10\%\] {
            left: -10%;
          }
          .z-10 {
            z-index: 10;
          }
          .z-50 {
            z-index: 50;
          }
          .-mt-6 {
            margin-top: calc(var(--spacing) * -6);
          }
          .mt-4 {
            margin-top: calc(var(--spacing) * 4);
          }
          .mb-0\.5 {
            margin-bottom: calc(var(--spacing) * 0.5);
          }
          .mb-1 {
            margin-bottom: calc(var(--spacing) * 1);
          }
          .mb-3 {
            margin-bottom: calc(var(--spacing) * 3);
          }
          .mb-4 {
            margin-bottom: calc(var(--spacing) * 4);
          }
          .mb-6 {
            margin-bottom: calc(var(--spacing) * 6);
          }
          .mb-8 {
            margin-bottom: calc(var(--spacing) * 8);
          }
          .block {
            display: block;
          }
          .flex {
            display: flex;
          }
          .size-\[12px\] {
            width: 12px;
            height: 12px;
          }
          .size-\[14px\] {
            width: 14px;
            height: 14px;
          }
          .size-\[18px\] {
            width: 18px;
            height: 18px;
          }
          .size-\[20px\] {
            width: 20px;
            height: 20px;
          }
          .size-\[24px\] {
            width: 24px;
            height: 24px;
          }
          .h-1\.5 {
            height: calc(var(--spacing) * 1.5);
          }
          .h-10 {
            height: calc(var(--spacing) * 10);
          }
          .h-12 {
            height: calc(var(--spacing) * 12);
          }
          .h-14 {
            height: calc(var(--spacing) * 14);
          }
          .h-20 {
            height: calc(var(--spacing) * 20);
          }
          .h-\[30\%\] {
            height: 30%;
          }
          .h-\[40\%\] {
            height: 40%;
          }
          .h-\[360px\] {
            height: 360px;
          }
          .w-1\.5 {
            width: calc(var(--spacing) * 1.5);
          }
          .w-6 {
            width: calc(var(--spacing) * 6);
          }
          .w-10 {
            width: calc(var(--spacing) * 10);
          }
          .w-12 {
            width: calc(var(--spacing) * 12);
          }
          .w-14 {
            width: calc(var(--spacing) * 14);
          }
          .w-20 {
            width: calc(var(--spacing) * 20);
          }
          .w-\[50\%\] {
            width: 50%;
          }
          .w-\[60\%\] {
            width: 60%;
          }
          .w-\[375px\] {
            width: 375px;
          }
          .flex-1 {
            flex: 1;
          }
          .flex-col {
            flex-direction: column;
          }
          .items-center {
            align-items: center;
          }
          .items-end {
            align-items: flex-end;
          }
          .justify-between {
            justify-content: space-between;
          }
          .justify-center {
            justify-content: center;
          }
          .justify-end {
            justify-content: flex-end;
          }
          .gap-1 {
            gap: calc(var(--spacing) * 1);
          }
          .gap-2 {
            gap: calc(var(--spacing) * 2);
          }
          .gap-3 {
            gap: calc(var(--spacing) * 3);
          }
          .gap-4 {
            gap: calc(var(--spacing) * 4);
          }
          .overflow-hidden {
            overflow: hidden;
          }
          .overflow-x-hidden {
            overflow-x: hidden;
          }
          .rounded-2xl {
            border-radius: var(--radius-2xl);
          }
          .rounded-\[20px\] {
            border-radius: 20px;
          }
          .rounded-full {
            border-radius: calc(infinity * 1px);
          }
          .rounded-xl {
            border-radius: var(--radius-xl);
          }
          .border {
            border-style: var(--tw-border-style);
            border-width: 1px;
          }
          .border-2 {
            border-style: var(--tw-border-style);
            border-width: 2px;
          }
          .border-4 {
            border-style: var(--tw-border-style);
            border-width: 4px;
          }
          .border-t {
            border-top-style: var(--tw-border-style);
            border-top-width: 1px;
          }
          .border-\[\#E5E7EB\] {
            border-color: #e5e7eb;
          }
          .border-\[\#F4F4FB\] {
            border-color: #f4f4fb;
          }
          .border-accent {
            border-color: var(--color-accent);
          }
          .border-border {
            border-color: var(--color-border);
          }
          .border-primary {
            border-color: var(--color-primary);
          }
          .border-transparent {
            border-color: transparent;
          }
          .border-white\/5 {
            border-color: color-mix(in srgb, #fff 5%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              border-color: color-mix(
                in oklab,
                var(--color-white) 5%,
                transparent
              );
            }
          }
          .border-white\/10 {
            border-color: color-mix(in srgb, #fff 10%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              border-color: color-mix(
                in oklab,
                var(--color-white) 10%,
                transparent
              );
            }
          }
          .border-white\/20 {
            border-color: color-mix(in srgb, #fff 20%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              border-color: color-mix(
                in oklab,
                var(--color-white) 20%,
                transparent
              );
            }
          }
          .border-white\/30 {
            border-color: color-mix(in srgb, #fff 30%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              border-color: color-mix(
                in oklab,
                var(--color-white) 30%,
                transparent
              );
            }
          }
          .bg-\[\#0F172A\]\/80 {
            background-color: color-mix(in oklab, #0f172a 80%, transparent);
          }
          .bg-\[\#E5E7EB\] {
            background-color: #e5e7eb;
          }
          .bg-\[\#F4F4FB\] {
            background-color: #f4f4fb;
          }
          .bg-accent {
            background-color: var(--color-accent);
          }
          .bg-accent\/20 {
            background-color: color-mix(in srgb, #9333ea 20%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              background-color: color-mix(
                in oklab,
                var(--color-accent) 20%,
                transparent
              );
            }
          }
          .bg-background {
            background-color: var(--color-background);
          }
          .bg-background\/50 {
            background-color: color-mix(in srgb, #0f172a 50%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              background-color: color-mix(
                in oklab,
                var(--color-background) 50%,
                transparent
              );
            }
          }
          .bg-background\/80 {
            background-color: color-mix(in srgb, #0f172a 80%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              background-color: color-mix(
                in oklab,
                var(--color-background) 80%,
                transparent
              );
            }
          }
          .bg-border {
            background-color: var(--color-border);
          }
          .bg-input {
            background-color: var(--color-input);
          }
          .bg-primary {
            background-color: var(--color-primary);
          }
          .bg-primary\/30 {
            background-color: color-mix(in srgb, #2563eb 30%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              background-color: color-mix(
                in oklab,
                var(--color-primary) 30%,
                transparent
              );
            }
          }
          .bg-violet {
            background-color: var(--color-violet);
          }
          .bg-white {
            background-color: var(--color-white);
          }
          .bg-white\/5 {
            background-color: color-mix(in srgb, #fff 5%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              background-color: color-mix(
                in oklab,
                var(--color-white) 5%,
                transparent
              );
            }
          }
          .bg-white\/10 {
            background-color: color-mix(in srgb, #fff 10%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              background-color: color-mix(
                in oklab,
                var(--color-white) 10%,
                transparent
              );
            }
          }
          .bg-white\/20 {
            background-color: color-mix(in srgb, #fff 20%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              background-color: color-mix(
                in oklab,
                var(--color-white) 20%,
                transparent
              );
            }
          }
          .bg-white\/90 {
            background-color: color-mix(in srgb, #fff 90%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              background-color: color-mix(
                in oklab,
                var(--color-white) 90%,
                transparent
              );
            }
          }
          .bg-gradient-to-br {
            --tw-gradient-position: to bottom right in oklab;
            background-image: linear-gradient(var(--tw-gradient-stops));
          }
          .bg-gradient-to-r {
            --tw-gradient-position: to right in oklab;
            background-image: linear-gradient(var(--tw-gradient-stops));
          }
          .bg-gradient-to-t {
            --tw-gradient-position: to top in oklab;
            background-image: linear-gradient(var(--tw-gradient-stops));
          }
          .bg-gradient-to-tr {
            --tw-gradient-position: to top right in oklab;
            background-image: linear-gradient(var(--tw-gradient-stops));
          }
          .from-\[\#0F172A\] {
            --tw-gradient-from: #0f172a;
            --tw-gradient-stops: var(
              --tw-gradient-via-stops,
              var(--tw-gradient-position),
              var(--tw-gradient-from) var(--tw-gradient-from-position),
              var(--tw-gradient-to) var(--tw-gradient-to-position)
            );
          }
          .from-background\/90 {
            --tw-gradient-from: color-mix(in srgb, #0f172a 90%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              --tw-gradient-from: color-mix(
                in oklab,
                var(--color-background) 90%,
                transparent
              );
            }
            --tw-gradient-stops: var(
              --tw-gradient-via-stops,
              var(--tw-gradient-position),
              var(--tw-gradient-from) var(--tw-gradient-from-position),
              var(--tw-gradient-to) var(--tw-gradient-to-position)
            );
          }
          .from-black\/80 {
            --tw-gradient-from: color-mix(in srgb, #000 80%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              --tw-gradient-from: color-mix(
                in oklab,
                var(--color-black) 80%,
                transparent
              );
            }
            --tw-gradient-stops: var(
              --tw-gradient-via-stops,
              var(--tw-gradient-position),
              var(--tw-gradient-from) var(--tw-gradient-from-position),
              var(--tw-gradient-to) var(--tw-gradient-to-position)
            );
          }
          .from-primary {
            --tw-gradient-from: var(--color-primary);
            --tw-gradient-stops: var(
              --tw-gradient-via-stops,
              var(--tw-gradient-position),
              var(--tw-gradient-from) var(--tw-gradient-from-position),
              var(--tw-gradient-to) var(--tw-gradient-to-position)
            );
          }
          .via-\[\#0F172A\]\/40 {
            --tw-gradient-via: color-mix(in oklab, #0f172a 40%, transparent);
            --tw-gradient-via-stops:
              var(--tw-gradient-position),
              var(--tw-gradient-from) var(--tw-gradient-from-position),
              var(--tw-gradient-via) var(--tw-gradient-via-position),
              var(--tw-gradient-to) var(--tw-gradient-to-position);
            --tw-gradient-stops: var(--tw-gradient-via-stops);
          }
          .via-background\/30 {
            --tw-gradient-via: color-mix(in srgb, #0f172a 30%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              --tw-gradient-via: color-mix(
                in oklab,
                var(--color-background) 30%,
                transparent
              );
            }
            --tw-gradient-via-stops:
              var(--tw-gradient-position),
              var(--tw-gradient-from) var(--tw-gradient-from-position),
              var(--tw-gradient-via) var(--tw-gradient-via-position),
              var(--tw-gradient-to) var(--tw-gradient-to-position);
            --tw-gradient-stops: var(--tw-gradient-via-stops);
          }
          .via-black\/20 {
            --tw-gradient-via: color-mix(in srgb, #000 20%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              --tw-gradient-via: color-mix(
                in oklab,
                var(--color-black) 20%,
                transparent
              );
            }
            --tw-gradient-via-stops:
              var(--tw-gradient-position),
              var(--tw-gradient-from) var(--tw-gradient-from-position),
              var(--tw-gradient-via) var(--tw-gradient-via-position),
              var(--tw-gradient-to) var(--tw-gradient-to-position);
            --tw-gradient-stops: var(--tw-gradient-via-stops);
          }
          .to-accent {
            --tw-gradient-to: var(--color-accent);
            --tw-gradient-stops: var(
              --tw-gradient-via-stops,
              var(--tw-gradient-position),
              var(--tw-gradient-from) var(--tw-gradient-from-position),
              var(--tw-gradient-to) var(--tw-gradient-to-position)
            );
          }
          .to-transparent {
            --tw-gradient-to: transparent;
            --tw-gradient-stops: var(
              --tw-gradient-via-stops,
              var(--tw-gradient-position),
              var(--tw-gradient-from) var(--tw-gradient-from-position),
              var(--tw-gradient-to) var(--tw-gradient-to-position)
            );
          }
          .object-cover {
            object-fit: cover;
          }
          .p-0\.5 {
            padding: calc(var(--spacing) * 0.5);
          }
          .p-2 {
            padding: calc(var(--spacing) * 2);
          }
          .p-3 {
            padding: calc(var(--spacing) * 3);
          }
          .p-4 {
            padding: calc(var(--spacing) * 4);
          }
          .p-5 {
            padding: calc(var(--spacing) * 5);
          }
          .px-3 {
            padding-inline: calc(var(--spacing) * 3);
          }
          .px-4 {
            padding-inline: calc(var(--spacing) * 4);
          }
          .px-5 {
            padding-inline: calc(var(--spacing) * 5);
          }
          .px-6 {
            padding-inline: calc(var(--spacing) * 6);
          }
          .py-1 {
            padding-block: calc(var(--spacing) * 1);
          }
          .py-2 {
            padding-block: calc(var(--spacing) * 2);
          }
          .py-3 {
            padding-block: calc(var(--spacing) * 3);
          }
          .py-4 {
            padding-block: calc(var(--spacing) * 4);
          }
          .pt-12 {
            padding-top: calc(var(--spacing) * 12);
          }
          .pb-4 {
            padding-bottom: calc(var(--spacing) * 4);
          }
          .pb-24 {
            padding-bottom: calc(var(--spacing) * 24);
          }
          .pl-5 {
            padding-left: calc(var(--spacing) * 5);
          }
          .font-body {
            font-family: var(--font-body);
          }
          .text-2xl {
            font-size: var(--text-2xl);
            line-height: var(--tw-leading, var(--text-2xl--line-height));
          }
          .text-3xl {
            font-size: var(--text-3xl);
            line-height: var(--tw-leading, var(--text-3xl--line-height));
          }
          .text-lg {
            font-size: var(--text-lg);
            line-height: var(--tw-leading, var(--text-lg--line-height));
          }
          .text-sm {
            font-size: var(--text-sm);
            line-height: var(--tw-leading, var(--text-sm--line-height));
          }
          .text-xl {
            font-size: var(--text-xl);
            line-height: var(--tw-leading, var(--text-xl--line-height));
          }
          .text-xs {
            font-size: var(--text-xs);
            line-height: var(--tw-leading, var(--text-xs--line-height));
          }
          .text-\[10px\] {
            font-size: 10px;
          }
          .text-\[11px\] {
            font-size: 11px;
          }
          .leading-tight {
            --tw-leading: var(--leading-tight);
            line-height: var(--leading-tight);
          }
          .font-bold {
            --tw-font-weight: var(--font-weight-bold);
            font-weight: var(--font-weight-bold);
          }
          .font-extrabold {
            --tw-font-weight: var(--font-weight-extrabold);
            font-weight: var(--font-weight-extrabold);
          }
          .font-medium {
            --tw-font-weight: var(--font-weight-medium);
            font-weight: var(--font-weight-medium);
          }
          .font-semibold {
            --tw-font-weight: var(--font-weight-semibold);
            font-weight: var(--font-weight-semibold);
          }
          .whitespace-nowrap {
            white-space: nowrap;
          }
          .text-\[\#12122A\] {
            color: #12122a;
          }
          .text-\[\#12122A\]\/40 {
            color: color-mix(in oklab, #12122a 40%, transparent);
          }
          .text-\[\#12122A\]\/50 {
            color: color-mix(in oklab, #12122a 50%, transparent);
          }
          .text-\[\#12122A\]\/60 {
            color: color-mix(in oklab, #12122a 60%, transparent);
          }
          .text-\[\#12122A\]\/70 {
            color: color-mix(in oklab, #12122a 70%, transparent);
          }
          .text-accent {
            color: var(--color-accent);
          }
          .text-accent-foreground {
            color: var(--color-accent-foreground);
          }
          .text-foreground {
            color: var(--color-foreground);
          }
          .text-foreground\/40 {
            color: color-mix(in srgb, #f0f0ff 40%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              color: color-mix(
                in oklab,
                var(--color-foreground) 40%,
                transparent
              );
            }
          }
          .text-foreground\/50 {
            color: color-mix(in srgb, #f0f0ff 50%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              color: color-mix(
                in oklab,
                var(--color-foreground) 50%,
                transparent
              );
            }
          }
          .text-foreground\/60 {
            color: color-mix(in srgb, #f0f0ff 60%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              color: color-mix(
                in oklab,
                var(--color-foreground) 60%,
                transparent
              );
            }
          }
          .text-foreground\/70 {
            color: color-mix(in srgb, #f0f0ff 70%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              color: color-mix(
                in oklab,
                var(--color-foreground) 70%,
                transparent
              );
            }
          }
          .text-primary {
            color: var(--color-primary);
          }
          .text-primary-foreground {
            color: var(--color-primary-foreground);
          }
          .text-violet {
            color: var(--color-violet);
          }
          .text-white {
            color: var(--color-white);
          }
          .text-white\/60 {
            color: color-mix(in srgb, #fff 60%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              color: color-mix(in oklab, var(--color-white) 60%, transparent);
            }
          }
          .text-white\/80 {
            color: color-mix(in srgb, #fff 80%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              color: color-mix(in oklab, var(--color-white) 80%, transparent);
            }
          }
          .text-white\/90 {
            color: color-mix(in srgb, #fff 90%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              color: color-mix(in oklab, var(--color-white) 90%, transparent);
            }
          }
          .shadow-\[0_-10px_40px_rgba\(0\,0\,0\,0\.2\)\] {
            --tw-shadow: 0 -10px 40px var(--tw-shadow-color, rgba(0, 0, 0, 0.2));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-\[0_0_10px_rgba\(147\,51\,234\,0\.5\)\] {
            --tw-shadow: 0 0 10px
              var(--tw-shadow-color, rgba(147, 51, 234, 0.5));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-\[0_0_15px_rgba\(37\,99\,235\,0\.4\)\] {
            --tw-shadow: 0 0 15px var(--tw-shadow-color, rgba(37, 99, 235, 0.4));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-\[0_0_15px_rgba\(37\,99\,235\,0\.5\)\] {
            --tw-shadow: 0 0 15px var(--tw-shadow-color, rgba(37, 99, 235, 0.5));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-\[0_0_15px_rgba\(147\,51\,234\,0\.3\)\] {
            --tw-shadow: 0 0 15px
              var(--tw-shadow-color, rgba(147, 51, 234, 0.3));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-\[0_0_20px_rgba\(147\,51\,234\,0\.4\)\] {
            --tw-shadow: 0 0 20px
              var(--tw-shadow-color, rgba(147, 51, 234, 0.4));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-\[0_4px_20px_rgba\(0\,0\,0\,0\.1\)\] {
            --tw-shadow: 0 4px 20px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-\[0_4px_30px_rgba\(0\,0\,0\,0\.1\)\] {
            --tw-shadow: 0 4px 30px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-\[0_10px_30px_rgba\(0\,0\,0\,0\.1\)\] {
            --tw-shadow: 0 10px 30px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-\[0_20px_40px_rgba\(0\,0\,0\,0\.4\)\] {
            --tw-shadow: 0 20px 40px var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-lg {
            --tw-shadow:
              0 10px 15px -3px var(--tw-shadow-color, rgb(0 0 0 / 0.1)),
              0 4px 6px -4px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-md {
            --tw-shadow:
              0 4px 6px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1)),
              0 2px 4px -2px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-sm {
            --tw-shadow:
              0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)),
              0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
            box-shadow:
              var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
              var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
              var(--tw-shadow);
          }
          .shadow-primary\/20 {
            --tw-shadow-color: color-mix(in srgb, #2563eb 20%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              --tw-shadow-color: color-mix(
                in oklab,
                color-mix(in oklab, var(--color-primary) 20%, transparent)
                  var(--tw-shadow-alpha),
                transparent
              );
            }
          }
          .shadow-primary\/30 {
            --tw-shadow-color: color-mix(in srgb, #2563eb 30%, transparent);
            @supports (color: color-mix(in lab, red, red)) {
              --tw-shadow-color: color-mix(
                in oklab,
                color-mix(in oklab, var(--color-primary) 30%, transparent)
                  var(--tw-shadow-alpha),
                transparent
              );
            }
          }
          .blur-\[100px\] {
            --tw-blur: blur(100px);
            filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,)
              var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,)
              var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,);
          }
          .blur-\[120px\] {
            --tw-blur: blur(120px);
            filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,)
              var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,)
              var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,);
          }
          .backdrop-blur-2xl {
            --tw-backdrop-blur: blur(var(--blur-2xl));
            -webkit-backdrop-filter: var(--tw-backdrop-blur,)
              var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
              var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
              var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
              var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
            backdrop-filter: var(--tw-backdrop-blur,)
              var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
              var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
              var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
              var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
          }
          .backdrop-blur-lg {
            --tw-backdrop-blur: blur(var(--blur-lg));
            -webkit-backdrop-filter: var(--tw-backdrop-blur,)
              var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
              var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
              var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
              var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
            backdrop-filter: var(--tw-backdrop-blur,)
              var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
              var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
              var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
              var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
          }
          .backdrop-blur-md {
            --tw-backdrop-blur: blur(var(--blur-md));
            -webkit-backdrop-filter: var(--tw-backdrop-blur,)
              var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
              var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
              var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
              var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
            backdrop-filter: var(--tw-backdrop-blur,)
              var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
              var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
              var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
              var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
          }
          .backdrop-blur-sm {
            --tw-backdrop-blur: blur(var(--blur-sm));
            -webkit-backdrop-filter: var(--tw-backdrop-blur,)
              var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
              var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
              var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
              var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
            backdrop-filter: var(--tw-backdrop-blur,)
              var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
              var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
              var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
              var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
          }
          .backdrop-blur-xl {
            --tw-backdrop-blur: blur(var(--blur-xl));
            -webkit-backdrop-filter: var(--tw-backdrop-blur,)
              var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
              var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
              var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
              var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
            backdrop-filter: var(--tw-backdrop-blur,)
              var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
              var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
              var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
              var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
          }
          .hover\:text-foreground\/80 {
            &:hover {
              @media (hover: hover) {
                color: color-mix(in srgb, #f0f0ff 80%, transparent);
                @supports (color: color-mix(in lab, red, red)) {
                  color: color-mix(
                    in oklab,
                    var(--color-foreground) 80%,
                    transparent
                  );
                }
              }
            }
          }
        }
        @property --tw-border-style {
          syntax: "*";
          inherits: false;
          initial-value: solid;
        }
        @property --tw-gradient-position {
          syntax: "*";
          inherits: false;
        }
        @property --tw-gradient-from {
          syntax: "<color>";
          inherits: false;
          initial-value: #0000;
        }
        @property --tw-gradient-via {
          syntax: "<color>";
          inherits: false;
          initial-value: #0000;
        }
        @property --tw-gradient-to {
          syntax: "<color>";
          inherits: false;
          initial-value: #0000;
        }
        @property --tw-gradient-stops {
          syntax: "*";
          inherits: false;
        }
        @property --tw-gradient-via-stops {
          syntax: "*";
          inherits: false;
        }
        @property --tw-gradient-from-position {
          syntax: "<length-percentage>";
          inherits: false;
          initial-value: 0%;
        }
        @property --tw-gradient-via-position {
          syntax: "<length-percentage>";
          inherits: false;
          initial-value: 50%;
        }
        @property --tw-gradient-to-position {
          syntax: "<length-percentage>";
          inherits: false;
          initial-value: 100%;
        }
        @property --tw-leading {
          syntax: "*";
          inherits: false;
        }
        @property --tw-font-weight {
          syntax: "*";
          inherits: false;
        }
        @property --tw-shadow {
          syntax: "*";
          inherits: false;
          initial-value: 0 0 #0000;
        }
        @property --tw-shadow-color {
          syntax: "*";
          inherits: false;
        }
        @property --tw-shadow-alpha {
          syntax: "<percentage>";
          inherits: false;
          initial-value: 100%;
        }
        @property --tw-inset-shadow {
          syntax: "*";
          inherits: false;
          initial-value: 0 0 #0000;
        }
        @property --tw-inset-shadow-color {
          syntax: "*";
          inherits: false;
        }
        @property --tw-inset-shadow-alpha {
          syntax: "<percentage>";
          inherits: false;
          initial-value: 100%;
        }
        @property --tw-ring-color {
          syntax: "*";
          inherits: false;
        }
        @property --tw-ring-shadow {
          syntax: "*";
          inherits: false;
          initial-value: 0 0 #0000;
        }
        @property --tw-inset-ring-color {
          syntax: "*";
          inherits: false;
        }
        @property --tw-inset-ring-shadow {
          syntax: "*";
          inherits: false;
          initial-value: 0 0 #0000;
        }
        @property --tw-ring-inset {
          syntax: "*";
          inherits: false;
        }
        @property --tw-ring-offset-width {
          syntax: "<length>";
          inherits: false;
          initial-value: 0px;
        }
        @property --tw-ring-offset-color {
          syntax: "*";
          inherits: false;
          initial-value: #fff;
        }
        @property --tw-ring-offset-shadow {
          syntax: "*";
          inherits: false;
          initial-value: 0 0 #0000;
        }
        @property --tw-blur {
          syntax: "*";
          inherits: false;
        }
        @property --tw-brightness {
          syntax: "*";
          inherits: false;
        }
        @property --tw-contrast {
          syntax: "*";
          inherits: false;
        }
        @property --tw-grayscale {
          syntax: "*";
          inherits: false;
        }
        @property --tw-hue-rotate {
          syntax: "*";
          inherits: false;
        }
        @property --tw-invert {
          syntax: "*";
          inherits: false;
        }
        @property --tw-opacity {
          syntax: "*";
          inherits: false;
        }
        @property --tw-saturate {
          syntax: "*";
          inherits: false;
        }
        @property --tw-sepia {
          syntax: "*";
          inherits: false;
        }
        @property --tw-drop-shadow {
          syntax: "*";
          inherits: false;
        }
        @property --tw-drop-shadow-color {
          syntax: "*";
          inherits: false;
        }
        @property --tw-drop-shadow-alpha {
          syntax: "<percentage>";
          inherits: false;
          initial-value: 100%;
        }
        @property --tw-drop-shadow-size {
          syntax: "*";
          inherits: false;
        }
        @property --tw-backdrop-blur {
          syntax: "*";
          inherits: false;
        }
        @property --tw-backdrop-brightness {
          syntax: "*";
          inherits: false;
        }
        @property --tw-backdrop-contrast {
          syntax: "*";
          inherits: false;
        }
        @property --tw-backdrop-grayscale {
          syntax: "*";
          inherits: false;
        }
        @property --tw-backdrop-hue-rotate {
          syntax: "*";
          inherits: false;
        }
        @property --tw-backdrop-invert {
          syntax: "*";
          inherits: false;
        }
        @property --tw-backdrop-opacity {
          syntax: "*";
          inherits: false;
        }
        @property --tw-backdrop-saturate {
          syntax: "*";
          inherits: false;
        }
        @property --tw-backdrop-sepia {
          syntax: "*";
          inherits: false;
        }
        @layer properties {
          @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or
            ((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {
            *,
            ::before,
            ::after,
            ::backdrop {
              --tw-border-style: solid;
              --tw-gradient-position: initial;
              --tw-gradient-from: #0000;
              --tw-gradient-via: #0000;
              --tw-gradient-to: #0000;
              --tw-gradient-stops: initial;
              --tw-gradient-via-stops: initial;
              --tw-gradient-from-position: 0%;
              --tw-gradient-via-position: 50%;
              --tw-gradient-to-position: 100%;
              --tw-leading: initial;
              --tw-font-weight: initial;
              --tw-shadow: 0 0 #0000;
              --tw-shadow-color: initial;
              --tw-shadow-alpha: 100%;
              --tw-inset-shadow: 0 0 #0000;
              --tw-inset-shadow-color: initial;
              --tw-inset-shadow-alpha: 100%;
              --tw-ring-color: initial;
              --tw-ring-shadow: 0 0 #0000;
              --tw-inset-ring-color: initial;
              --tw-inset-ring-shadow: 0 0 #0000;
              --tw-ring-inset: initial;
              --tw-ring-offset-width: 0px;
              --tw-ring-offset-color: #fff;
              --tw-ring-offset-shadow: 0 0 #0000;
              --tw-blur: initial;
              --tw-brightness: initial;
              --tw-contrast: initial;
              --tw-grayscale: initial;
              --tw-hue-rotate: initial;
              --tw-invert: initial;
              --tw-opacity: initial;
              --tw-saturate: initial;
              --tw-sepia: initial;
              --tw-drop-shadow: initial;
              --tw-drop-shadow-color: initial;
              --tw-drop-shadow-alpha: 100%;
              --tw-drop-shadow-size: initial;
              --tw-backdrop-blur: initial;
              --tw-backdrop-brightness: initial;
              --tw-backdrop-contrast: initial;
              --tw-backdrop-grayscale: initial;
              --tw-backdrop-hue-rotate: initial;
              --tw-backdrop-invert: initial;
              --tw-backdrop-opacity: initial;
              --tw-backdrop-saturate: initial;
              --tw-backdrop-sepia: initial;
            }
          }
        }
      </style>
      <link
        rel="preload"
        as="image"
        href="https://storage.googleapis.com/banani-avatars/avatar/male/25-35/African/4"
      />
      <link
        rel="preload"
        as="image"
        href="/api/flow-image/1%3A1%0AA%20sports%20game%20poster"
      />
    </head>
    <body>
      <div class="mobile-screen bg-[#F4F4FB] text-[#12122A] pb-24 font-body">
        <header class="flex justify-between items-center px-5 pt-12 pb-4">
          <div>
            <p class="text-sm text-[#12122A]/70">
              <span data-file="/screens/home-light.jsx" data-idx="0"
                >Bonjour 👋</span
              >
            </p>
            <h1 class="text-2xl font-bold">
              <span data-file="/screens/home-light.jsx" data-idx="1"
                >Arnaud Kevin</span
              >
            </h1>
          </div>
          <img
            src="https://storage.googleapis.com/banani-avatars/avatar/male/25-35/African/4"
            class="w-12 h-12 rounded-full border-2 border-primary"
          />
        </header>
        <div class="px-5 mb-6 flex gap-3">
          <div
            class="flex-1 bg-white rounded-xl px-4 py-3 flex items-center gap-3 border border-[#E5E7EB] shadow-sm"
          >
            <iconify-icon
              icon="lucide:search"
              class="block text-[#12122A]/50"
            ></iconify-icon>
            <div class="text-[#12122A]/50 text-sm flex-1">
              <span data-file="/screens/home-light.jsx" data-idx="2"
                >Rechercher un événement...</span
              >
            </div>
          </div>
          <button
            class="bg-gradient-to-br from-primary to-accent p-3 rounded-xl shadow-md shadow-primary/20"
            data-media-type="banani-button"
          >
            <iconify-icon
              icon="lucide:sliders-horizontal"
              class="block text-white"
            ></iconify-icon>
          </button>
        </div>
        <div class="pl-5 mb-8 flex gap-3 overflow-x-hidden">
          <button
            class="bg-gradient-to-r from-primary to-accent text-white px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap"
            data-media-type="banani-button"
          >
            <span data-file="/screens/home-light.jsx" data-idx="3"
              >Tous</span
            ></button
          ><button
            class="bg-white text-[#12122A]/70 border border-[#E5E7EB] px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm"
            data-media-type="banani-button"
          >
            <span data-file="/screens/home-light.jsx" data-idx="4"
              >Concerts</span
            ></button
          ><button
            class="bg-white text-[#12122A]/70 border border-[#E5E7EB] px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm"
            data-media-type="banani-button"
          >
            <span data-file="/screens/home-light.jsx" data-idx="5"
              >VIP</span
            ></button
          ><button
            class="bg-white text-[#12122A]/70 border border-[#E5E7EB] px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm"
            data-media-type="banani-button"
          >
            <span data-file="/screens/home-light.jsx" data-idx="6">Cinéma</span>
          </button>
        </div>
        <div class="px-5 mb-8">
          <div
            class="rounded-[20px] h-[360px] relative overflow-hidden flex flex-col justify-end p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
            style="
              background-image: url(https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg);
            "
          >
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            ></div>
            <div
              class="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full"
            >
              <span data-file="/screens/home-light.jsx" data-idx="7">VIP</span>
            </div>
            <div
              class="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white border border-white/30"
            >
              <iconify-icon
                icon="lucide:heart"
                class="block size-[18px]"
                style="font-size: 18px"
              ></iconify-icon>
            </div>
            <div class="relative z-10">
              <h2 class="text-3xl font-extrabold text-white leading-tight mb-1">
                <span data-file="/screens/home-light.jsx" data-idx="8"
                  >Brazza Vibe Fest</span
                >
              </h2>
              <p class="text-accent text-sm font-semibold mb-3">
                <span data-file="/screens/home-light.jsx" data-idx="9"
                  >Le plus grand événement de l'année</span
                >
              </p>
              <div class="flex items-center gap-4 text-xs text-white/90 mb-4">
                <div class="flex items-center gap-1 font-medium">
                  <iconify-icon
                    icon="lucide:calendar"
                    class="block size-[14px]"
                    style="font-size: 14px"
                  ></iconify-icon>
                  <span data-file="/screens/home-light.jsx" data-idx="10"
                    >15 Juillet 2024</span
                  >
                </div>
                <div class="flex items-center gap-1 font-medium">
                  <iconify-icon
                    icon="lucide:map-pin"
                    class="block size-[14px]"
                    style="font-size: 14px"
                  ></iconify-icon>
                  <span data-file="/screens/home-light.jsx" data-idx="11"
                    >Stade Éboué</span
                  >
                </div>
              </div>
              <div class="flex justify-between items-end">
                <div>
                  <p class="text-xs text-white/80 mb-0.5 font-medium">
                    <span data-file="/screens/home-light.jsx" data-idx="12"
                      >À partir de</span
                    >
                  </p>
                  <p class="text-2xl font-bold text-white">
                    <span data-file="/screens/home-light.jsx" data-idx="13"
                      >15 000 FCFA</span
                    >
                  </p>
                </div>
                <button
                  class="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md"
                  data-media-type="banani-button"
                >
                  <span data-file="/screens/home-light.jsx" data-idx="14"
                    >Réserver</span
                  >
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-center gap-2 mt-4">
            <div class="w-6 h-1.5 bg-primary rounded-full"></div>
            <div class="w-1.5 h-1.5 bg-[#E5E7EB] rounded-full"></div>
            <div class="w-1.5 h-1.5 bg-[#E5E7EB] rounded-full"></div>
          </div>
        </div>
        <div class="px-5">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">
              <span data-file="/screens/home-light.jsx" data-idx="15"
                >Recommandés pour vous</span
              >
            </h3>
            <a
              class="text-primary text-sm font-semibold"
              data-media-type="banani-button"
              ><span data-file="/screens/home-light.jsx" data-idx="16"
                >Voir tout</span
              ></a
            >
          </div>
          <div class="flex flex-col gap-4">
            <div
              class="bg-white rounded-2xl p-3 flex gap-4 items-center shadow-sm border border-[#E5E7EB]"
            >
              <img
                data-query="A sports game poster"
                data-aspect-ratio="1:1"
                style="aspect-ratio: 1/1"
                src="https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg"
                class="w-20 h-20 rounded-xl object-cover"
              />
              <div class="flex-1">
                <p class="text-primary text-xs font-bold mb-1">
                  <span data-file="/screens/home-light.jsx" data-idx="17"
                    >Sport</span
                  >
                </p>
                <h4 class="font-bold text-sm leading-tight mb-1">
                  <span data-file="/screens/home-light.jsx" data-idx="18"
                    >Derby de Brazzaville</span
                  >
                </h4>
                <div
                  class="text-xs text-[#12122A]/60 flex items-center gap-1 mb-1 font-medium"
                >
                  <iconify-icon
                    icon="lucide:map-pin"
                    class="block size-[12px]"
                    style="font-size: 12px"
                  ></iconify-icon>
                  <span data-file="/screens/home-light.jsx" data-idx="19"
                    >Stade Massamba</span
                  >
                </div>
                <p class="text-sm font-bold">
                  <span data-file="/screens/home-light.jsx" data-idx="20"
                    >2 000 FCFA</span
                  >
                </p>
              </div>
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-sm"
              >
                <iconify-icon
                  icon="lucide:chevron-right"
                  class="block size-[20px]"
                  style="font-size: 20px"
                ></iconify-icon>
              </div>
            </div>
            <div
              class="bg-white rounded-2xl p-3 flex gap-4 items-center shadow-sm border border-[#E5E7EB]"
            >
              <img
                data-query="A sports game poster"
                data-aspect-ratio="1:1"
                style="aspect-ratio: 1/1"
                src="https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg"
                class="w-20 h-20 rounded-xl object-cover"
              />
              <div class="flex-1">
                <p class="text-primary text-xs font-bold mb-1">
                  <span data-file="/screens/home-light.jsx" data-idx="17"
                    >Sport</span
                  >
                </p>
                <h4 class="font-bold text-sm leading-tight mb-1">
                  <span data-file="/screens/home-light.jsx" data-idx="18"
                    >Derby de Brazzaville</span
                  >
                </h4>
                <div
                  class="text-xs text-[#12122A]/60 flex items-center gap-1 mb-1 font-medium"
                >
                  <iconify-icon
                    icon="lucide:map-pin"
                    class="block size-[12px]"
                    style="font-size: 12px"
                  ></iconify-icon>
                  <span data-file="/screens/home-light.jsx" data-idx="19"
                    >Stade Massamba</span
                  >
                </div>
                <p class="text-sm font-bold">
                  <span data-file="/screens/home-light.jsx" data-idx="20"
                    >2 000 FCFA</span
                  >
                </p>
              </div>
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-sm"
              >
                <iconify-icon
                  icon="lucide:chevron-right"
                  class="block size-[20px]"
                  style="font-size: 20px"
                ></iconify-icon>
              </div>
            </div>
          </div>
        </div>
        <nav
          class="fixed bottom-0 w-[375px] bg-white/90 backdrop-blur-xl border-t border-[#E5E7EB] flex justify-between items-center px-6 py-4 z-50"
        >
          <div class="flex flex-col items-center gap-1 text-primary">
            <iconify-icon icon="lucide:compass" class="block"></iconify-icon
            ><span class="text-[10px] font-semibold"
              ><span data-file="/screens/home-light.jsx" data-idx="21"
                >Accueil</span
              ></span
            >
          </div>
          <div class="flex flex-col items-center gap-1 text-[#12122A]/40">
            <iconify-icon icon="lucide:search" class="block"></iconify-icon
            ><span class="text-[10px]"
              ><span data-file="/screens/home-light.jsx" data-idx="22"
                >Explorer</span
              ></span
            >
          </div>
          <div
            class="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 -mt-6 border-4 border-[#F4F4FB]"
          >
            <iconify-icon
              icon="lucide:plus"
              class="block text-white size-[24px]"
              style="font-size: 24px"
            ></iconify-icon>
          </div>
          <div class="flex flex-col items-center gap-1 text-[#12122A]/40">
            <iconify-icon icon="lucide:ticket" class="block"></iconify-icon
            ><span class="text-[10px]"
              ><span data-file="/screens/home-light.jsx" data-idx="23"
                >Commandes</span
              ></span
            >
          </div>
          <div class="flex flex-col items-center gap-1 text-[#12122A]/40">
            <iconify-icon icon="lucide:user" class="block"></iconify-icon
            ><span class="text-[10px]"
              ><span data-file="/screens/home-light.jsx" data-idx="24"
                >Profil</span
              ></span
            >
          </div>
        </nav>
      </div>
    </body>
  </html>
  <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
</div>

</design>
```
Instructions :
1. Crée src/app/globals.css — import Plus Jakarta Sans, variables CSS du design
2. Crée src/components/ui/BottomNav.tsx — nav du bas, lucide-react à la place de iconify
3. Crée src/components/home/HeroCard.tsx — grande carte vedette, lucide-react, props TypeScript
4. Crée src/components/home/CategoryPills.tsx — pills cliquables avec useState
5. Crée src/components/home/EventCard.tsx — cartes compactes, props TypeScript
6. Crée src/app/page.tsx — assemble tout avec mock data congolaise

Règles :
- Garde les classes Tailwind exactes du design
- Remplace tous les iconify-icon par lucide-react
- Supprime data-file, data-idx, data-media-type, le CDN iconify
- TypeScript strict
- Résultat visuellement identique au design Banani