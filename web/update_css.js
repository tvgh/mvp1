const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const replacement = `
/* Modern Diff2Html Styling (Single Column) */
.d2h-wrapper {
  background-color: #fdf6e3 !important; /* Solarized light bg */
  color: #586e75 !important;
  font-family: 'JetBrains Mono', 'Consolas', monospace !important;
}

.d2h-file-header {
  background-color: #eee8d5 !important;
  color: #586e75 !important;
  border-bottom: 1px solid #dcd3b6 !important;
}

.d2h-file-list-wrapper {
  margin-bottom: 1rem !important;
}

.d2h-file-list-header {
  text-align: left !important;
}

/* Single column line numbers */
.d2h-code-linenumber {
  width: 3.5em !important;
  background-color: #fdf6e3 !important;
  color: #268bd2 !important;
  border: none !important;
  text-align: right !important;
  padding: 0 0.5em !important;
}

.d2h-cntx .line-num1 { display: none !important; }
.d2h-cntx .line-num2 { display: inline-block !important; }

.d2h-del .line-num1 { display: inline-block !important; }
.d2h-del .line-num2 { display: none !important; }
.d2h-del .line-num1::after { content: '-'; }

.d2h-ins .line-num1 { display: none !important; }
.d2h-ins .line-num2 { display: inline-block !important; }
.d2h-ins .line-num2::after { content: '+'; }

/* Hide default prefix */
.d2h-code-line-prefix {
  display: none !important;
}
.d2h-code-line-ctn {
  margin-left: 0.25em;
  display: inline-block;
}

/* Line colors */
.d2h-code-line {
  color: #586e75 !important;
}

.d2h-del {
  background-color: #fbe9e9 !important;
}
.d2h-code-line del {
  background-color: #f6c6c6 !important;
  text-decoration: none !important;
  border-radius: 2px;
}

.d2h-ins {
  background-color: #eaf5ea !important;
}
.d2h-code-line ins {
  background-color: #c6e6c6 !important;
  text-decoration: none !important;
  border-radius: 2px;
}

.d2h-info {
  background-color: #eee8d5 !important;
  color: #586e75 !important;
}

.d2h-files-diff {
  border: none !important;
}

.d2h-file-diff {
  border-radius: 8px !important;
  overflow: hidden !important;
  border: 1px solid #dcd3b6 !important;
}

/* Dark mode adjustments */
.dark .d2h-wrapper {
  background-color: var(--color-surface) !important;
  color: var(--color-on-surface) !important;
}
.dark .d2h-file-header {
  background-color: var(--color-surface-container-high) !important;
  color: var(--color-on-surface) !important;
  border-bottom: 1px solid var(--color-outline-variant) !important;
}
.dark .d2h-code-linenumber {
  background-color: var(--color-surface) !important;
  color: var(--color-outline) !important;
}
.dark .d2h-code-line {
  color: var(--color-on-surface) !important;
}
.dark .d2h-del {
  background-color: rgba(220, 38, 38, 0.2) !important; /* Tailwind red-600 with opacity */
}
.dark .d2h-code-line del {
  background-color: rgba(220, 38, 38, 0.4) !important;
  color: #fff !important;
}
.dark .d2h-ins {
  background-color: rgba(22, 163, 74, 0.2) !important; /* Tailwind green-600 with opacity */
}
.dark .d2h-code-line ins {
  background-color: rgba(22, 163, 74, 0.4) !important;
  color: #fff !important;
}
.dark .d2h-info {
  background-color: var(--color-surface-container-high) !important;
  color: var(--color-on-surface-variant) !important;
}
.dark .d2h-file-diff {
  border-color: var(--color-outline-variant) !important;
}
`;

const startIndex = css.indexOf('.d2h-file-header');
if (startIndex !== -1) {
  const endMarker = '.card {';
  const endIndex = css.indexOf(endMarker);
  
  if (endIndex !== -1) {
    css = css.substring(0, startIndex) + replacement + '\n' + css.substring(endIndex);
    fs.writeFileSync('src/index.css', css);
    console.log('Successfully updated CSS');
  } else {
    console.error('Could not find end marker');
  }
} else {
  console.error('Could not find start marker');
}
