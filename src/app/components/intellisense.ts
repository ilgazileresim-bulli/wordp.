// ─── IntelliSense / Autocomplete Engine ──────────────────────────────────────
// Shared between CodeEditor and FolderCodeEditor

export type CompletionKind = "snippet" | "tag" | "property" | "value" | "keyword" | "function" | "selector";

export interface Completion {
  label: string;          // What is shown in the list
  insert: string;         // What gets inserted
  kind: CompletionKind;
  detail?: string;        // Description shown on the right
}

// ─── HTML ──────────────────────────────────────────────────────────────────────
const HTML_TAGS: Completion[] = [
  { label:"!",         insert:`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Title</title>\n</head>\n<body>\n  \n</body>\n</html>`, kind:"snippet", detail:"HTML Template" },
  { label:"a",         insert:`<a href=""></a>`,                    kind:"tag", detail:"Link" },
  { label:"abbr",      insert:`<abbr title=""></abbr>`,             kind:"tag", detail:"Abbreviation" },
  { label:"article",   insert:`<article>\n  \n</article>`,         kind:"tag", detail:"Article" },
  { label:"aside",     insert:`<aside>\n  \n</aside>`,             kind:"tag", detail:"Aside content" },
  { label:"audio",     insert:`<audio controls>\n  <source src="" type="audio/mpeg" />\n</audio>`, kind:"tag", detail:"Audio" },
  { label:"b",         insert:`<b></b>`,                           kind:"tag", detail:"Bold" },
  { label:"blockquote",insert:`<blockquote>\n  \n</blockquote>`,   kind:"tag", detail:"Blockquote" },
  { label:"body",      insert:`<body>\n  \n</body>`,               kind:"tag", detail:"Body" },
  { label:"br",        insert:`<br />`,                            kind:"tag", detail:"Line break" },
  { label:"button",    insert:`<button type="button"></button>`,   kind:"tag", detail:"Button" },
  { label:"canvas",    insert:`<canvas id="canvas" width="600" height="400"></canvas>`, kind:"tag", detail:"Canvas" },
  { label:"caption",   insert:`<caption></caption>`,               kind:"tag", detail:"Caption" },
  { label:"code",      insert:`<code></code>`,                     kind:"tag", detail:"Code" },
  { label:"col",       insert:`<col />`,                           kind:"tag", detail:"Column" },
  { label:"colgroup",  insert:`<colgroup>\n  \n</colgroup>`,       kind:"tag", detail:"Column group" },
  { label:"data",      insert:`<data value=""></data>`,            kind:"tag", detail:"Data" },
  { label:"datalist",  insert:`<datalist id="">\n  <option value="" />\n</datalist>`, kind:"tag", detail:"Data list" },
  { label:"details",   insert:`<details>\n  <summary></summary>\n  \n</details>`, kind:"tag", detail:"Details" },
  { label:"dialog",    insert:`<dialog>\n  \n</dialog>`,           kind:"tag", detail:"Dialog" },
  { label:"div",       insert:`<div>\n  \n</div>`,                 kind:"tag", detail:"Section" },
  { label:"dl",        insert:`<dl>\n  <dt></dt>\n  <dd></dd>\n</dl>`, kind:"tag", detail:"Definition list" },
  { label:"em",        insert:`<em></em>`,                         kind:"tag", detail:"Emphasis" },
  { label:"embed",     insert:`<embed src="" type="" />`,          kind:"tag", detail:"Embed" },
  { label:"fieldset",  insert:`<fieldset>\n  <legend></legend>\n  \n</fieldset>`, kind:"tag", detail:"Fieldset" },
  { label:"figcaption",insert:`<figcaption></figcaption>`,         kind:"tag", detail:"Figcaption" },
  { label:"figure",    insert:`<figure>\n  \n</figure>`,           kind:"tag", detail:"Figure" },
  { label:"footer",    insert:`<footer>\n  \n</footer>`,           kind:"tag", detail:"Footer" },
  { label:"form",      insert:`<form action="" method="post">\n  \n</form>`, kind:"tag", detail:"Form" },
  { label:"h1",        insert:`<h1></h1>`,                         kind:"tag", detail:"Heading 1" },
  { label:"h2",        insert:`<h2></h2>`,                         kind:"tag", detail:"Heading 2" },
  { label:"h3",        insert:`<h3></h3>`,                         kind:"tag", detail:"Heading 3" },
  { label:"h4",        insert:`<h4></h4>`,                         kind:"tag", detail:"Heading 4" },
  { label:"h5",        insert:`<h5></h5>`,                         kind:"tag", detail:"Heading 5" },
  { label:"h6",        insert:`<h6></h6>`,                         kind:"tag", detail:"Heading 6" },
  { label:"head",      insert:`<head>\n  <meta charset="UTF-8" />\n  <title>Title</title>\n</head>`, kind:"tag", detail:"Head" },
  { label:"header",    insert:`<header>\n  \n</header>`,           kind:"tag", detail:"Header" },
  { label:"hr",        insert:`<hr />`,                            kind:"tag", detail:"Horizontal rule" },
  { label:"html",      insert:`<html lang="en">\n  \n</html>`,     kind:"tag", detail:"HTML root" },
  { label:"i",         insert:`<i></i>`,                           kind:"tag", detail:"Italic" },
  { label:"iframe",    insert:`<iframe src="" title="" width="600" height="400"></iframe>`, kind:"tag", detail:"Iframe" },
  { label:"img",       insert:`<img src="" alt="" />`,             kind:"tag", detail:"Image" },
  { label:"input",     insert:`<input type="text" placeholder="" />`, kind:"tag", detail:"Input" },
  { label:"label",     insert:`<label for=""></label>`,            kind:"tag", detail:"Label" },
  { label:"legend",    insert:`<legend></legend>`,                 kind:"tag", detail:"Legend" },
  { label:"li",        insert:`<li></li>`,                         kind:"tag", detail:"List item" },
  { label:"link",      insert:`<link rel="stylesheet" href="style.css" />`, kind:"tag", detail:"Link" },
  { label:"main",      insert:`<main>\n  \n</main>`,               kind:"tag", detail:"Main content" },
  { label:"mark",      insert:`<mark></mark>`,                     kind:"tag", detail:"Highlight" },
  { label:"meta",      insert:`<meta name="" content="" />`,       kind:"tag", detail:"Meta" },
  { label:"nav",       insert:`<nav>\n  \n</nav>`,                 kind:"tag", detail:"Navigation" },
  { label:"noscript",  insert:`<noscript></noscript>`,             kind:"tag", detail:"Noscript" },
  { label:"object",    insert:`<object data="" type=""></object>`, kind:"tag", detail:"Object" },
  { label:"ol",        insert:`<ol>\n  <li></li>\n</ol>`,          kind:"tag", detail:"Ordered list" },
  { label:"option",    insert:`<option value=""></option>`,        kind:"tag", detail:"Option" },
  { label:"output",    insert:`<output></output>`,                 kind:"tag", detail:"Output" },
  { label:"p",         insert:`<p></p>`,                           kind:"tag", detail:"Paragraph" },
  { label:"picture",   insert:`<picture>\n  <source srcset="" media="" />\n  <img src="" alt="" />\n</picture>`, kind:"tag", detail:"Picture group" },
  { label:"pre",       insert:`<pre></pre>`,                       kind:"tag", detail:"Preformatted text" },
  { label:"progress",  insert:`<progress value="0" max="100"></progress>`, kind:"tag", detail:"Progress" },
  { label:"script",    insert:`<script>\n  \n</script>`,           kind:"tag", detail:"Script" },
  { label:"section",   insert:`<section>\n  \n</section>`,         kind:"tag", detail:"Section" },
  { label:"select",    insert:`<select>\n  <option value=""></option>\n</select>`, kind:"tag", detail:"Select" },
  { label:"small",     insert:`<small></small>`,                   kind:"tag", detail:"Small" },
  { label:"span",      insert:`<span></span>`,                     kind:"tag", detail:"Span" },
  { label:"strong",    insert:`<strong></strong>`,                 kind:"tag", detail:"Strong" },
  { label:"style",     insert:`<style>\n  \n</style>`,             kind:"tag", detail:"Style" },
  { label:"sub",       insert:`<sub></sub>`,                       kind:"tag", detail:"Subscript" },
  { label:"summary",   insert:`<summary></summary>`,               kind:"tag", detail:"Summary" },
  { label:"sup",       insert:`<sup></sup>`,                       kind:"tag", detail:"Superscript" },
  { label:"table",     insert:`<table>\n  <thead>\n    <tr>\n      <th></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td></td>\n    </tr>\n  </tbody>\n</table>`, kind:"tag", detail:"Table" },
  { label:"tbody",     insert:`<tbody>\n  \n</tbody>`,             kind:"tag", detail:"Table body" },
  { label:"td",        insert:`<td></td>`,                         kind:"tag", detail:"Table data" },
  { label:"template",  insert:`<template>\n  \n</template>`,       kind:"tag", detail:"Template" },
  { label:"textarea",  insert:`<textarea rows="4" cols="50"></textarea>`, kind:"tag", detail:"Textarea" },
  { label:"th",        insert:`<th></th>`,                         kind:"tag", detail:"Table header" },
  { label:"thead",     insert:`<thead>\n  \n</thead>`,             kind:"tag", detail:"Table head" },
  { label:"time",      insert:`<time datetime=""></time>`,         kind:"tag", detail:"Time" },
  { label:"title",     insert:`<title></title>`,                   kind:"tag", detail:"Title" },
  { label:"tr",        insert:`<tr>\n  <td></td>\n</tr>`,          kind:"tag", detail:"Table row" },
  { label:"ul",        insert:`<ul>\n  <li></li>\n</ul>`,          kind:"tag", detail:"Unordered list" },
  { label:"var",       insert:`<var></var>`,                       kind:"tag", detail:"Variable" },
  { label:"video",     insert:`<video controls width="640" height="360">\n  <source src="" type="video/mp4" />\n</video>`, kind:"tag", detail:"Video" },
  { label:"lorem",     insert:`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.`, kind:"snippet", detail:"Lorem ipsum" },
  // HTML attribute snippets
  { label:"class",     insert:`class=""`,                          kind:"snippet", detail:"Class attribute" },
  { label:"id",        insert:`id=""`,                             kind:"snippet", detail:"ID attribute" },
  { label:"style",     insert:`style=""`,                          kind:"snippet", detail:"Style attribute" },
  { label:"href",      insert:`href=""`,                           kind:"snippet", detail:"Link" },
  { label:"src",       insert:`src=""`,                            kind:"snippet", detail:"Source" },
  { label:"alt",       insert:`alt=""`,                            kind:"snippet", detail:"Alt text" },
  { label:"type",      insert:`type=""`,                           kind:"snippet", detail:"Type" },
  { label:"placeholder",insert:`placeholder=""`,                   kind:"snippet", detail:"Placeholder" },
  { label:"name",      insert:`name=""`,                           kind:"snippet", detail:"Name" },
  { label:"value",     insert:`value=""`,                          kind:"snippet", detail:"Value" },
  { label:"action",    insert:`action=""`,                         kind:"snippet", detail:"Form action" },
  { label:"method",    insert:`method="post"`,                     kind:"snippet", detail:"Form method" },
  { label:"content",   insert:`content=""`,                        kind:"snippet", detail:"Content" },
  { label:"charset",   insert:`charset="UTF-8"`,                   kind:"snippet", detail:"Charset" },
  { label:"rel",       insert:`rel="stylesheet"`,                  kind:"snippet", detail:"Relationship" },
  { label:"target",    insert:`target="_blank"`,                   kind:"snippet", detail:"Target" },
  { label:"onclick",   insert:`onclick=""`,                        kind:"snippet", detail:"Onclick event" },
  { label:"onsubmit",  insert:`onsubmit=""`,                       kind:"snippet", detail:"Onsubmit event" },
  { label:"colspan",   insert:`colspan=""`,                        kind:"snippet", detail:"Colspan" },
  { label:"rowspan",   insert:`rowspan=""`,                        kind:"snippet", detail:"Rowspan" },
];

// ─── CSS ───────────────────────────────────────────────────────────────────────
const CSS_COMPLETIONS: Completion[] = [
  // ─── Snippets (Ready Codes) ───
  { label:"body",           insert:`body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n  box-sizing: border-box;\n}`,            kind:"snippet", detail:"Body reset" },
  { label:"reset",          insert:`* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}`,                                          kind:"snippet", detail:"CSS reset" },
  { label:"flex",           insert:`display: flex;\njustify-content: center;\nalign-items: center;\ngap: 16px;`,                               kind:"snippet", detail:"Flex box" },
  { label:"grid",           insert:`display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 16px;`,                                       kind:"snippet", detail:"Grid layout" },
  { label:"card",           insert:`.card {\n  background: #fff;\n  border-radius: 16px;\n  padding: 24px;\n  box-shadow: 0 4px 24px rgba(0,0,0,0.1);\n}`, kind:"snippet", detail:"Card component" },
  { label:"btn",            insert:`.btn {\n  display: inline-flex;\n  align-items: center;\n  padding: 10px 20px;\n  background: #6366f1;\n  color: #fff;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: 600;\n  transition: all 0.2s;\n}`, kind:"snippet", detail:"Button style" },
  { label:"glass",          insert:`background: rgba(255,255,255,0.1);\nbackdrop-filter: blur(20px);\nborder: 1px solid rgba(255,255,255,0.2);\nborder-radius: 16px;`, kind:"snippet", detail:"Glass effect" },
  { label:"gradient",       insert:`background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`, kind:"snippet", detail:"Gradient" },
  { label:"shadow",         insert:`box-shadow: 0 4px 24px rgba(0,0,0,0.15);`, kind:"snippet", detail:"Shadow" },
  { label:"transition",     insert:`transition: all 0.3s ease;`, kind:"snippet", detail:"Transition" },
  { label:"anim",           insert:`@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to   { opacity: 1; transform: translateY(0); }\n}`, kind:"snippet", detail:"Animation" },
  { label:"media",          insert:`@media (max-width: 768px) {\n  \n}`, kind:"snippet", detail:"Media query" },
  { label:"var",            insert:`:root {\n  --primary: #6366f1;\n  --secondary: #a855f7;\n  --bg: #0f172a;\n  --text: #f1f5f9;\n}`, kind:"snippet", detail:"CSS variables" },
  { label:"hover",          insert:`:hover {\n  \n}`,             kind:"snippet", detail:"On hover" },
  { label:"before",         insert:`::before {\n  content: '';\n  display: block;\n}`, kind:"snippet", detail:"::before" },
  { label:"after",          insert:`::after {\n  content: '';\n  display: block;\n}`, kind:"snippet", detail:"::after" },
  { label:"center",         insert:`display: flex;\njustify-content: center;\nalign-items: center;`, kind:"snippet", detail:"Center align" },
  { label:"fullscreen",     insert:`width: 100vw;\nheight: 100vh;\nmargin: 0;\npadding: 0;\noverflow: hidden;`, kind:"snippet", detail:"Fullscreen" },
  { label:"circle",         insert:`width: 48px;\nheight: 48px;\nborder-radius: 50%;\nflex-shrink: 0;`, kind:"snippet", detail:"Circle" },
  { label:"truncate",       insert:`white-space: nowrap;\noverflow: hidden;\ntext-overflow: ellipsis;`, kind:"snippet", detail:"Truncate text" },
  
  // Advanced Snippets (Modern Techniques)
  { label:"resp-img",       insert:`max-width: 100%;\nheight: auto;\ndisplay: block;\nobject-fit: cover;`, kind:"snippet", detail:"Responsive image" },
  { label:"text-grad",      insert:`background: linear-gradient(to right, #6366f1, #a855f7);\n-webkit-background-clip: text;\n-webkit-text-fill-color: transparent;`, kind:"snippet", detail:"Text gradient" },
  { label:"hide-scroll",    insert:`scrollbar-width: none;\n-ms-overflow-style: none;\n&::-webkit-scrollbar {\n  display: none;\n}`, kind:"snippet", detail:"Hide scrollbar" },
  { label:"sticky-top",     insert:`position: sticky;\ntop: 0;\nz-index: 1000;`, kind:"snippet", detail:"Sticky top" },
  { label:"aspect-square",  insert:`aspect-ratio: 1 / 1;\nobject-fit: cover;`, kind:"snippet", detail:"Square ratio" },

  // ─── Properties (Features) ───
  { label:"accent-color",      insert:`accent-color: `,    kind:"property", detail:"Accent color" },
  { label:"align-content",    insert:`align-content: `,    kind:"property", detail:"Align content (flex/grid)" },
  { label:"align-items",      insert:`align-items: `,      kind:"property", detail:"Align items (flex/grid)" },
  { label:"align-self",       insert:`align-self: `,       kind:"property", detail:"Align self" },
  { label:"all",              insert:`all: unset;`,        kind:"property", detail:"Reset all styles" },
  { label:"animation",        insert:`animation: name 1s ease infinite;`, kind:"property", detail:"Animation" },
  { label:"animation-delay",  insert:`animation-delay: 0.5s;`, kind:"property", detail:"Animation delay" },
  { label:"animation-direction", insert:`animation-direction: alternate;`, kind:"property", detail:"Animation direction" },
  { label:"animation-duration", insert:`animation-duration: 300ms;`, kind:"property", detail:"Animation duration" },
  { label:"animation-fill-mode", insert:`animation-fill-mode: forwards;`, kind:"property", detail:"Animation fill mode" },
  { label:"animation-iteration-count", insert:`animation-iteration-count: infinite;`, kind:"property", detail:"Iteration count" },
  { label:"animation-name",    insert:`animation-name: fadeIn;`, kind:"property", detail:"Animation name" },
  { label:"animation-play-state", insert:`animation-play-state: paused;`, kind:"property", detail:"Play state" },
  { label:"animation-timing-function", insert:`animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);`, kind:"property", detail:"Timing function" },
  { label:"appearance",       insert:`appearance: none;`,  kind:"property", detail:"Appearance" },
  { label:"aspect-ratio",     insert:`aspect-ratio: 16 / 9;`, kind:"property", detail:"Aspect ratio" },
  { label:"backdrop-filter",  insert:`backdrop-filter: blur(8px);`, kind:"property", detail:"Backdrop filter" },
  { label:"backface-visibility", insert:`backface-visibility: hidden;`, kind:"property", detail:"Backface visibility" },
  { label:"background",       insert:`background: `,       kind:"property", detail:"Background" },
  { label:"background-attachment", insert:`background-attachment: `, kind:"property", detail:"Background attachment" },
  { label:"background-blend-mode", insert:`background-blend-mode: multiply;`, kind:"property", detail:"Blend mode" },
  { label:"background-clip",  insert:`background-clip: padding-box;`, kind:"property", detail:"Background clip" },
  { label:"background-color", insert:`background-color: `, kind:"property", detail:"Background color" },
  { label:"background-image", insert:`background-image: url('');`, kind:"property", detail:"Background image" },
  { label:"background-origin", insert:`background-origin: border-box;`, kind:"property", detail:"Background origin" },
  { label:"background-position", insert:`background-position: center;`, kind:"property", detail:"Position" },
  { label:"background-repeat", insert:`background-repeat: no-repeat;`, kind:"property", detail:"Repeat" },
  { label:"background-size",  insert:`background-size: cover;`,  kind:"property", detail:"Size" },
  { label:"border",           insert:`border: 1px solid #ccc;`, kind:"property", detail:"Border" },
  { label:"border-bottom",    insert:`border-bottom: `,    kind:"property", detail:"Bottom border" },
  { label:"border-collapse",  insert:`border-collapse: collapse;`, kind:"property", detail:"Border collapse" },
  { label:"border-color",     insert:`border-color: `,     kind:"property", detail:"Color" },
  { label:"border-image",     insert:`border-image: `,     kind:"property", detail:"Image" },
  { label:"border-left",      insert:`border-left: `,      kind:"property", detail:"Left border" },
  { label:"border-radius",    insert:`border-radius: 8px;`, kind:"property", detail:"Border radius" },
  { label:"border-right",     insert:`border-right: `,     kind:"property", detail:"Right border" },
  { label:"border-spacing",   insert:`border-spacing: 0;`, kind:"property", detail:"Spacing" },
  { label:"border-style",     insert:`border-style: solid;`, kind:"property", detail:"Style" },
  { label:"border-top",       insert:`border-top: `,       kind:"property", detail:"Top border" },
  { label:"border-width",     insert:`border-width: 1px;`, kind:"property", detail:"Width" },
  { label:"bottom",           insert:`bottom: 0;`,         kind:"property", detail:"Bottom distance" },
  { label:"box-shadow",       insert:`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);`, kind:"property", detail:"Box shadow" },
  { label:"box-sizing",       insert:`box-sizing: border-box;`, kind:"property", detail:"Box sizing" },
  { label:"break-after",      insert:`break-after: auto;`, kind:"property", detail:"Break after" },
  { label:"break-before",     insert:`break-before: auto;`, kind:"property", detail:"Break before" },
  { label:"break-inside",     insert:`break-inside: avoid;`, kind:"property", detail:"Break inside" },
  { label:"caption-side",     insert:`caption-side: bottom;`, kind:"property", detail:"Caption side" },
  { label:"caret-color",      insert:`caret-color: #6366f1;`, kind:"property", detail:"Caret color" },
  { label:"clear",            insert:`clear: both;`,       kind:"property", detail:"Clear" },
  { label:"clip",             insert:`clip: rect(0, 0, 0, 0);`, kind:"property", detail:"Clip" },
  { label:"clip-path",        insert:`clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);`, kind:"property", detail:"Clip path" },
  { label:"color",            insert:`color: `,            kind:"property", detail:"Text color" },
  { label:"column-count",     insert:`column-count: 3;`,   kind:"property", detail:"Column count" },
  { label:"column-fill",      insert:`column-fill: balance;`, kind:"property", detail:"Column fill" },
  { label:"column-gap",       insert:`column-gap: 20px;`,  kind:"property", detail:"Column gap" },
  { label:"column-rule",      insert:`column-rule: 1px solid #ddd;`, kind:"property", detail:"Column rule" },
  { label:"columns",          insert:`columns: 2 auto;`,   kind:"property", detail:"Columns" },
  { label:"content",          insert:`content: '';`,       kind:"property", detail:"Content (::before/::after)" },
  { label:"counter-increment", insert:`counter-increment: section;`, kind:"property", detail:"Counter increment" },
  { label:"counter-reset",    insert:`counter-reset: section;`, kind:"property", detail:"Counter reset" },
  { label:"cursor",           insert:`cursor: pointer;`,   kind:"property", detail:"Cursor type" },
  { label:"direction",        insert:`direction: ltr;`,    kind:"property", detail:"Direction" },
  { label:"display",          insert:`display: `,          kind:"property", detail:"Display type" },
  { label:"empty-cells",      insert:`empty-cells: hide;`, kind:"property", detail:"Empty cells" },
  { label:"filter",           insert:`filter: blur(4px);`, kind:"property", detail:"Filter" },
  { label:"flex",             insert:`flex: 1 1 0%;`,      kind:"property", detail:"Flex" },
  { label:"flex-basis",       insert:`flex-basis: auto;`,  kind:"property", detail:"Flex basis" },
  { label:"flex-direction",   insert:`flex-direction: column;`, kind:"property", detail:"Flex direction" },
  { label:"flex-flow",        insert:`flex-flow: row wrap;`, kind:"property", detail:"Flex flow" },
  { label:"flex-grow",        insert:`flex-grow: 1;`,      kind:"property", detail:"Flex grow" },
  { label:"flex-shrink",      insert:`flex-shrink: 1;`,    kind:"property", detail:"Flex shrink" },
  { label:"flex-wrap",        insert:`flex-wrap: wrap;`,   kind:"property", detail:"Flex wrap" },
  { label:"float",            insert:`float: left;`,       kind:"property", detail:"Float" },
  { label:"font",             insert:`font: `,             kind:"property", detail:"Font (shorthand)" },
  { label:"font-family",      insert:`font-family: 'Inter', sans-serif;`, kind:"property", detail:"Font family" },
  { label:"font-feature-settings", insert:`font-feature-settings: 'cv11';`, kind:"property", detail:"Font feature settings" },
  { label:"font-kerning",     insert:`font-kerning: auto;`, kind:"property", detail:"Font kerning" },
  { label:"font-size",        insert:`font-size: 16px;`,   kind:"property", detail:"Font size" },
  { label:"font-size-adjust", insert:`font-size-adjust: 0.5;`, kind:"property", detail:"Font size adjust" },
  { label:"font-stretch",     insert:`font-stretch: normal;`, kind:"property", detail:"Font stretch" },
  { label:"font-style",       insert:`font-style: italic;`, kind:"property", detail:"Font style" },
  { label:"font-variant",     insert:`font-variant: small-caps;`, kind:"property", detail:"Font variant" },
  { label:"font-weight",      insert:`font-weight: 600;`,  kind:"property", detail:"Font weight" },
  { label:"gap",              insert:`gap: 16px;`,         kind:"property", detail:"Gap" },
  { label:"grid",             insert:`grid: `,             kind:"property", detail:"Grid" },
  { label:"grid-area",        insert:`grid-area: `,        kind:"property", detail:"Grid area" },
  { label:"grid-auto-columns", insert:`grid-auto-columns: `, kind:"property", detail:"Grid auto columns" },
  { label:"grid-auto-flow",   insert:`grid-auto-flow: row;`, kind:"property", detail:"Grid auto flow" },
  { label:"grid-auto-rows",    insert:`grid-auto-rows: `,   kind:"property", detail:"Grid auto rows" },
  { label:"grid-column",      insert:`grid-column: span 2;`, kind:"property", detail:"Grid column" },
  { label:"grid-column-end",  insert:`grid-column-end: `,  kind:"property", detail:"Grid column end" },
  { label:"grid-column-gap",  insert:`grid-column-gap: `,  kind:"property", detail:"Grid column gap" },
  { label:"grid-column-start", insert:`grid-column-start: `, kind:"property", detail:"Grid column start" },
  { label:"grid-gap",         insert:`grid-gap: `,         kind:"property", detail:"Grid gap" },
  { label:"grid-row",         insert:`grid-row: span 2;`,  kind:"property", detail:"Grid row" },
  { label:"grid-row-end",     insert:`grid-row-end: `,     kind:"property", detail:"Grid row end" },
  { label:"grid-row-gap",     insert:`grid-row-gap: `,     kind:"property", detail:"Grid row gap" },
  { label:"grid-row-start",   insert:`grid-row-start: `,   kind:"property", detail:"Grid row start" },
  { label:"grid-template",    insert:`grid-template: `,    kind:"property", detail:"Grid template" },
  { label:"grid-template-areas", insert:`grid-template-areas: 'header header' 'main sidebar';`, kind:"property", detail:"Grid template areas" },
  { label:"grid-template-columns", insert:`grid-template-columns: repeat(3, 1fr);`, kind:"property", detail:"Grid template columns" },
  { label:"grid-template-rows",    insert:`grid-template-rows: repeat(2, auto);`, kind:"property", detail:"Grid template rows" },
  { label:"height",           insert:`height: 100%;`,      kind:"property", detail:"Height" },
  { label:"hyphens",          insert:`hyphens: auto;`,     kind:"property", detail:"Hyphens" },
  { label:"image-rendering",  insert:`image-rendering: pixelated;`, kind:"property", detail:"Image rendering" },
  { label:"isolation",        insert:`isolation: isolate;`, kind:"property", detail:"Isolation" },
  { label:"justify-content",  insert:`justify-content: center;`, kind:"property", detail:"Justify content" },
  { label:"justify-items",    insert:`justify-items: center;`, kind:"property", detail:"Justify items" },
  { label:"justify-self",     insert:`justify-self: center;`, kind:"property", detail:"Justify self" },
  { label:"left",             insert:`left: 0;`,           kind:"property", detail:"Left distance" },
  { label:"letter-spacing",   insert:`letter-spacing: 0.025em;`, kind:"property", detail:"Letter spacing" },
  { label:"line-height",      insert:`line-height: 1.5;`,  kind:"property", detail:"Line height" },
  { label:"list-style",       insert:`list-style: none;`,  kind:"property", detail:"List style" },
  { label:"list-style-image", insert:`list-style-image: `, kind:"property", detail:"List style image" },
  { label:"list-style-position", insert:`list-style-position: inside;`, kind:"property", detail:"List style position" },
  { label:"list-style-type",  insert:`list-style-type: disc;`, kind:"property", detail:"List style type" },
  { label:"margin",           insert:`margin: `,           kind:"property", detail:"Margin" },
  { label:"margin-bottom",    insert:`margin-bottom: `,    kind:"property", detail:"Bottom margin" },
  { label:"margin-left",      insert:`margin-left: `,      kind:"property", detail:"Left margin" },
  { label:"margin-right",     insert:`margin-right: `,     kind:"property", detail:"Right margin" },
  { label:"margin-top",       insert:`margin-top: `,       kind:"property", detail:"Top margin" },
  { label:"mask",             insert:`mask: `,             kind:"property", detail:"Mask" },
  { label:"mask-image",       insert:`mask-image: `,       kind:"property", detail:"Mask image" },
  { label:"max-height",       insert:`max-height: 100vh;`, kind:"property", detail:"Max height" },
  { label:"max-width",        insert:`max-width: 1200px;`, kind:"property", detail:"Max width" },
  { label:"min-height",       insert:`min-height: auto;`,  kind:"property", detail:"Min height" },
  { label:"min-width",        insert:`min-width: 0;`,      kind:"property", detail:"Min width" },
  { label:"mix-blend-mode",   insert:`mix-blend-mode: screen;`, kind:"property", detail:"Mix blend mode" },
  { label:"object-fit",       insert:`object-fit: cover;`, kind:"property", detail:"Object fit" },
  { label:"object-position",  insert:`object-position: center;`, kind:"property", detail:"Object position" },
  { label:"opacity",          insert:`opacity: 0.5;`,      kind:"property", detail:"Opacity" },
  { label:"order",            insert:`order: 1;`,          kind:"property", detail:"Order" },
  { label:"outline",          insert:`outline: 2px solid #6366f1;`, kind:"property", detail:"Outline" },
  { label:"outline-offset",   insert:`outline-offset: 2px;`, kind:"property", detail:"Outline offset" },
  { label:"overflow",         insert:`overflow: hidden;`,  kind:"property", detail:"Overflow" },
  { label:"overflow-x",       insert:`overflow-x: auto;`,  kind:"property", detail:"Overflow X" },
  { label:"overflow-y",       insert:`overflow-y: scroll;`, kind:"property", detail:"Overflow Y" },
  { label:"padding",          insert:`padding: 16px;`,     kind:"property", detail:"Padding" },
  { label:"padding-bottom",   insert:`padding-bottom: `,   kind:"property", detail:"Bottom padding" },
  { label:"padding-left",     insert:`padding-left: `,     kind:"property", detail:"Left padding" },
  { label:"padding-right",    insert:`padding-right: `,    kind:"property", detail:"Right padding" },
  { label:"padding-top",      insert:`padding-top: `,      kind:"property", detail:"Top padding" },
  { label:"perspective",      insert:`perspective: 1000px;`, kind:"property", detail:"Perspective" },
  { label:"place-content",    insert:`place-content: center;`, kind:"property", detail:"Place content" },
  { label:"place-items",      insert:`place-items: center;`, kind:"property", detail:"Place items" },
  { label:"place-self",       insert:`place-self: center;`, kind:"property", detail:"Place self" },
  { label:"pointer-events",   insert:`pointer-events: none;`, kind:"property", detail:"Pointer events" },
  { label:"position",         insert:`position: relative;`, kind:"property", detail:"Position type" },
  { label:"quotes",           insert:`quotes: '"' '"';`,  kind:"property", detail:"Quotes" },
  { label:"resize",           insert:`resize: both;`,      kind:"property", detail:"Resize" },
  { label:"right",            insert:`right: 0;`,          kind:"property", detail:"Right distance" },
  { label:"row-gap",          insert:`row-gap: 16px;`,     kind:"property", detail:"Row gap" },
  { label:"scroll-behavior",  insert:`scroll-behavior: smooth;`, kind:"property", detail:"Scroll behavior" },
  { label:"scroll-margin",    insert:`scroll-margin: 20px;`, kind:"property", detail:"Scroll margin" },
  { label:"scroll-padding",   insert:`scroll-padding: 20px;`, kind:"property", detail:"Scroll padding" },
  { label:"scroll-snap-align", insert:`scroll-snap-align: start;`, kind:"property", detail:"Scroll snap align" },
  { label:"scroll-snap-type",  insert:`scroll-snap-type: y mandatory;`, kind:"property", detail:"Scroll snap type" },
  { label:"table-layout",     insert:`table-layout: fixed;`, kind:"property", detail:"Table layout" },
  { label:"text-align",       insert:`text-align: center;`, kind:"property", detail:"Text align" },
  { label:"text-decoration",  insert:`text-decoration: underline;`, kind:"property", detail:"Text decoration" },
  { label:"text-decoration-color", insert:`text-decoration-color: #6366f1;`, kind:"property", detail:"Text decoration color" },
  { label:"text-indent",      insert:`text-indent: 20px;`, kind:"property", detail:"Text indent" },
  { label:"text-overflow",    insert:`text-overflow: ellipsis;`, kind:"property", detail:"Text overflow" },
  { label:"text-shadow",      insert:`text-shadow: 2px 2px 4px rgba(0,0,0,0.2);`, kind:"property", detail:"Text shadow" },
  { label:"text-transform",   insert:`text-transform: uppercase;`, kind:"property", detail:"Text transform" },
  { label:"top",              insert:`top: 0;`,              kind:"property", detail:"Top distance" },
  { label:"transform",        insert:`transform: scale(1.1);`, kind:"property", detail:"Transform" },
  { label:"transform-origin", insert:`transform-origin: center;`, kind:"property", detail:"Transform origin" },
  { label:"transform-style",  insert:`transform-style: preserve-3d;`, kind:"property", detail:"Transform style" },
  { label:"transition",       insert:`transition: all 0.3s ease;`, kind:"property", detail:"Transition shorthand" },
  { label:"transition-delay", insert:`transition-delay: 100ms;`, kind:"property", detail:"Transition delay" },
  { label:"transition-duration", insert:`transition-duration: 300ms;`, kind:"property", detail:"Transition duration" },
  { label:"transition-property", insert:`transition-property: opacity;`, kind:"property", detail:"Transition property" },
  { label:"transition-timing-function", insert:`transition-timing-function: linear;`, kind:"property", detail:"Transition timing function" },
  { label:"user-select",      insert:`user-select: none;`, kind:"property", detail:"User select" },
  { label:"vertical-align",   insert:`vertical-align: middle;`, kind:"property", detail:"Vertical align" },
  { label:"visibility",       insert:`visibility: hidden;`, kind:"property", detail:"Visibility" },
  { label:"white-space",      insert:`white-space: nowrap;`, kind:"property", detail:"White space" },
  { label:"width",            insert:`width: 100%;`,       kind:"property", detail:"Width" },
  { label:"will-change",      insert:`will-change: transform;`, kind:"property", detail:"Will change" },
  { label:"word-break",       insert:`word-break: break-all;`, kind:"property", detail:"Word break" },
  { label:"word-spacing",     insert:`word-spacing: 2px;`, kind:"property", detail:"Word spacing" },
  { label:"word-wrap",        insert:`word-wrap: break-word;`, kind:"property", detail:"Word wrap" },
  { label:"writing-mode",     insert:`writing-mode: vertical-rl;`, kind:"property", detail:"Writing mode" },
  { label:"z-index",          insert:`z-index: 50;`,       kind:"property", detail:"Z-index" },

  // ─── Values & Key Presets ───
  { label:"display:flex",     insert:`display: flex;`,     kind:"value", detail:"Flex box" },
  { label:"display:grid",     insert:`display: grid;`,     kind:"value", detail:"Grid layout" },
  { label:"display:block",    insert:`display: block;`,    kind:"value", detail:"Block" },
  { label:"display:inline-block", insert:`display: inline-block;`, kind:"value", detail:"Inline-block" },
  { label:"display:none",     insert:`display: none;`,     kind:"value", detail:"Hide" },
  { label:"position:absolute", insert:`position: absolute;`, kind:"value", detail:"Absolute position" },
  { label:"position:relative", insert:`position: relative;`, kind:"value", detail:"Relative position" },
  { label:"position:fixed",    insert:`position: fixed;`,    kind:"value", detail:"Fixed position" },
  { label:"position:sticky",   insert:`position: sticky;`,   kind:"value", detail:"Sticky position" },
  { label:"flex-direction:row", insert:`flex-direction: row;`, kind:"value", detail:"Horizontal flow" },
  { label:"flex-direction:column", insert:`flex-direction: column;`, kind:"value", detail:"Vertical flow" },
  { label:"justify-content:center", insert:`justify-content: center;`, kind:"value", detail:"Center" },
  { label:"justify-content:space-between", insert:`justify-content: space-between;`, kind:"value", detail:"Space between" },
  { label:"align-items:center", insert:`align-items: center;`, kind:"value", detail:"Vertical center" },
  { label:"color:white",      insert:`color: #ffffff;`,    kind:"value", detail:"White" },
  { label:"color:black",      insert:`color: #000000;`,    kind:"value", detail:"Black" },
  { label:"color:transparent", insert:`color: transparent;`, kind:"value", detail:"Transparent" },
  { label:"background:transparent", insert:`background: transparent;`, kind:"value", detail:"Transparent background" },
  { label:"cursor:pointer",   insert:`cursor: pointer;`,   kind:"value", detail:"Cursor: Hand" },
  { label:"overflow:hidden",  insert:`overflow: hidden;`,  kind:"value", detail:"Hide overflow" },
  { label:"overflow:auto",    insert:`overflow: auto;`,    kind:"value", detail:"Auto scroll" },
  { label:"white",            insert:`#ffffff`,            kind:"value", detail:"Plain White" },
  { label:"black",            insert:`#000000`,            kind:"value", detail:"Plain Black" },
  { label:"transparent",      insert:`transparent`,        kind:"value", detail:"Transparent" },
  { label:"currentcolor",     insert:`currentColor`,       kind:"value", detail:"Current color" },
];


// ─── JavaScript ────────────────────────────────────────────────────────────────
// ─── JavaScript ────────────────────────────────────────────────────────────────
const JS_COMPLETIONS: Completion[] = [
  // Snippets
  { label:"cl",          insert:`console.log()`,              kind:"snippet", detail:"console.log" },
  { label:"log",         insert:`console.log()`,              kind:"snippet", detail:"console.log" },
  { label:"fn",          insert:`function name() {\n  \n}`,   kind:"snippet", detail:"Function" },
  { label:"arrow",       insert:`const name = () => {\n  \n};`, kind:"snippet", detail:"Arrow function" },
  { label:"class",       insert:`class Name {\n  constructor() {\n    \n  }\n\n  method() {\n    \n  }\n}`, kind:"snippet", detail:"Class" },
  { label:"async",       insert:`async function name() {\n  try {\n    const result = await ;\n  } catch (err) {\n    console.error(err);\n  }\n}`, kind:"snippet", detail:"Async function" },
  { label:"if",          insert:`if (condition) {\n  \n}`,    kind:"snippet", detail:"Condition" },
  { label:"ife",         insert:`if (condition) {\n  \n} else {\n  \n}`, kind:"snippet", detail:"if/else" },
  { label:"for",         insert:`for (let i = 0; i < array.length; i++) {\n  \n}`, kind:"snippet", detail:"for loop" },
  { label:"forof",       insert:`for (const item of array) {\n  \n}`, kind:"snippet", detail:"for...of" },
  { label:"forin",       insert:`for (const key in object) {\n  \n}`, kind:"snippet", detail:"for...in" },
  { label:"while",       insert:`while (condition) {\n  \n}`, kind:"snippet", detail:"while loop" },
  { label:"switch",      insert:`switch (value) {\n  case 'a':\n    break;\n  default:\n    break;\n}`, kind:"snippet", detail:"switch" },
  { label:"try",         insert:`try {\n  \n} catch (err) {\n  console.error(err);\n}`, kind:"snippet", detail:"try/catch" },
  { label:"fetch",       insert:`fetch('url')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));`, kind:"snippet", detail:"Fetch API" },
  { label:"promise",     insert:`new Promise((resolve, reject) => {\n  \n});`, kind:"snippet", detail:"Promise" },
  { label:"map",         insert:`array.map((item) => {\n  return item;\n});`, kind:"snippet", detail:"Array.map" },
  { label:"filter",      insert:`array.filter((item) => item);`, kind:"snippet", detail:"Array.filter" },
  { label:"reduce",      insert:`array.reduce((acc, item) => {\n  return acc;\n}, 0);`, kind:"snippet", detail:"Array.reduce" },
  { label:"find",        insert:`array.find((item) => item.id === id);`, kind:"snippet", detail:"Array.find" },
  { label:"qs",          insert:`document.querySelector('')`, kind:"snippet", detail:"querySelector" },
  { label:"qsa",         insert:`document.querySelectorAll('')`, kind:"snippet", detail:"querySelectorAll" },
  { label:"ae",          insert:`element.addEventListener('click', (e) => {\n  \n});`, kind:"snippet", detail:"addEventListener" },
  { label:"set",         insert:`setTimeout(() => {\n  \n}, 1000);`, kind:"snippet", detail:"setTimeout" },
  { label:"int",         insert:`setInterval(() => {\n  \n}, 1000);`, kind:"snippet", detail:"setInterval" },
  { label:"raf",         insert:`requestAnimationFrame(function loop() {\n  \n  requestAnimationFrame(loop);\n});`, kind:"snippet", detail:"requestAnimationFrame" },
  { label:"imp",         insert:`import  from '';`, kind:"snippet", detail:"import" },
  { label:"exp",         insert:`export default `, kind:"snippet", detail:"export default" },
  { label:"iife",        insert:`(function() {\n  \n})();`, kind:"snippet", detail:"IIFE" },
  // Keywords
  { label:"const",        insert:`const `,         kind:"keyword", detail:"Constant" },
  { label:"let",          insert:`let `,           kind:"keyword", detail:"Variable" },
  { label:"var",          insert:`var `,           kind:"keyword", detail:"Variable (legacy)" },
  { label:"return",       insert:`return `,        kind:"keyword", detail:"Return" },
  { label:"typeof",       insert:`typeof `,        kind:"keyword", detail:"Type of" },
  { label:"instanceof",   insert:`instanceof `,    kind:"keyword", detail:"Instance of?" },
  { label:"new",          insert:`new `,           kind:"keyword", detail:"New object" },
  { label:"delete",       insert:`delete `,        kind:"keyword", detail:"Delete" },
  { label:"void",         insert:`void `,          kind:"keyword", detail:"Void" },
  { label:"throw",        insert:`throw new Error('')`, kind:"keyword", detail:"Throw error" },
  { label:"await",        insert:`await `,         kind:"keyword", detail:"Await" },
  { label:"yield",        insert:`yield `,         kind:"keyword", detail:"Yield" },
  { label:"debugger",     insert:`debugger;`,      kind:"keyword", detail:"Debugger" },
  { label:"break",        insert:`break;`,         kind:"keyword", detail:"Break" },
  { label:"continue",     insert:`continue;`,      kind:"keyword", detail:"Continue" },
  // Built-ins
  { label:"console",      insert:`console.`,       kind:"function", detail:"Console" },
  { label:"console.log",  insert:`console.log()`,  kind:"function", detail:"Log to console" },
  { label:"console.error",insert:`console.error()`, kind:"function", detail:"Log error" },
  { label:"console.warn", insert:`console.warn()`, kind:"function", detail:"Log warning" },
  { label:"console.table",insert:`console.table()`, kind:"function", detail:"Log table" },
  { label:"JSON.parse",   insert:`JSON.parse()`,   kind:"function", detail:"JSON parse" },
  { label:"JSON.stringify",insert:`JSON.stringify(, null, 2)`, kind:"function", detail:"JSON stringify" },
  { label:"Math.random",  insert:`Math.random()`,  kind:"function", detail:"Random number" },
  { label:"Math.floor",   insert:`Math.floor()`,   kind:"function", detail:"Floor" },
  { label:"Math.ceil",    insert:`Math.ceil()`,    kind:"function", detail:"Ceil" },
  { label:"Math.round",   insert:`Math.round()`,   kind:"function", detail:"Round" },
  { label:"Math.max",     insert:`Math.max()`,     kind:"function", detail:"Maximum" },
  { label:"Math.min",     insert:`Math.min()`,     kind:"function", detail:"Minimum" },
  { label:"Math.abs",     insert:`Math.abs()`,     kind:"function", detail:"Absolute value" },
  { label:"Math.pow",     insert:`Math.pow(base, exp)`, kind:"function", detail:"Power" },
  { label:"Math.sqrt",    insert:`Math.sqrt()`,    kind:"function", detail:"Square root" },
  { label:"Math.PI",      insert:`Math.PI`,        kind:"function", detail:"PI number" },
  { label:"parseInt",     insert:`parseInt(, 10)`, kind:"function", detail:"Parse int" },
  { label:"parseFloat",   insert:`parseFloat()`,   kind:"function", detail:"Parse float" },
  { label:"isNaN",        insert:`isNaN()`,        kind:"function", detail:"Is NaN?" },
  { label:"isFinite",     insert:`isFinite()`,     kind:"function", detail:"Is finite?" },
  { label:"String",       insert:`String()`,       kind:"function", detail:"Convert to string" },
  { label:"Number",       insert:`Number()`,       kind:"function", detail:"Convert to number" },
  { label:"Boolean",      insert:`Boolean()`,      kind:"function", detail:"Convert to boolean" },
  { label:"Array.from",   insert:`Array.from()`,   kind:"function", detail:"Array from" },
  { label:"Array.isArray",insert:`Array.isArray()`, kind:"function", detail:"Is array?" },
  { label:"Object.keys",  insert:`Object.keys()`,  kind:"function", detail:"Keys" },
  { label:"Object.values",insert:`Object.values()`, kind:"function", detail:"Values" },
  { label:"Object.entries",insert:`Object.entries()`, kind:"function", detail:"Entries" },
  { label:"Object.assign",insert:`Object.assign({}, )`, kind:"function", detail:"Merge" },
  { label:"localStorage", insert:`localStorage.`,  kind:"function", detail:"Local storage" },
  { label:"localStorage.getItem",  insert:`localStorage.getItem('')`, kind:"function", detail:"Read" },
  { label:"localStorage.setItem",  insert:`localStorage.setItem('', )`, kind:"function", detail:"Write" },
  { label:"localStorage.removeItem",insert:`localStorage.removeItem('')`, kind:"function", detail:"Delete" },
  { label:"sessionStorage",insert:`sessionStorage.`, kind:"function", detail:"Session storage" },
  { label:"document",     insert:`document.`,      kind:"function", detail:"Document" },
  { label:"document.getElementById",   insert:`document.getElementById('')`, kind:"function", detail:"Select by ID" },
  { label:"document.querySelector",    insert:`document.querySelector('')`,  kind:"function", detail:"Select by CSS" },
  { label:"document.querySelectorAll", insert:`document.querySelectorAll('')`, kind:"function", detail:"Select all" },
  { label:"document.createElement",   insert:`document.createElement('')`, kind:"function", detail:"Create element" },
  { label:"document.createTextNode",  insert:`document.createTextNode('')`, kind:"function", detail:"Create text" },
  { label:"window",       insert:`window.`,        kind:"function", detail:"Window" },
  { label:"window.location", insert:`window.location`, kind:"function", detail:"Location" },
  { label:"window.history",  insert:`window.history`, kind:"function", detail:"History" },
  { label:"Date.now",     insert:`Date.now()`,     kind:"function", detail:"Date now" },
  { label:"new Date",     insert:`new Date()`,     kind:"function", detail:"Date object" },
  { label:"setTimeout",   insert:`setTimeout(() => {\n  \n}, 1000)`, kind:"function", detail:"Delay" },
  { label:"setInterval",  insert:`setInterval(() => {\n  \n}, 1000)`, kind:"function", detail:"Interval" },
  { label:"clearTimeout", insert:`clearTimeout(id)`, kind:"function", detail:"Clear timeout" },
  { label:"clearInterval",insert:`clearInterval(id)`, kind:"function", detail:"Clear interval" },
  { label:"requestAnimationFrame", insert:`requestAnimationFrame(callback)`, kind:"function", detail:"RAF" },
  { label:"alert",        insert:`alert('')`,      kind:"function", detail:"Alert" },
  { label:"confirm",      insert:`confirm('')`,    kind:"function", detail:"Confirm" },
  { label:"prompt",       insert:`prompt('')`,     kind:"function", detail:"Prompt" },
];

// ─── Priority score ────────────────────────────────────────────────────────────
// High priority tags/properties always appear at the top
const HTML_PRIORITY: Record<string, number> = {
  "div":1, "span":2, "p":3, "a":4, "img":5, "button":6, "input":7,
  "h1":8, "h2":9, "h3":10, "ul":11, "li":12, "form":13, "nav":14,
  "section":15, "header":16, "footer":17, "main":18, "article":19,
  "table":20, "tr":21, "td":22, "th":23, "select":24, "option":25,
  "textarea":26, "label":27, "script":28, "style":29, "link":30,
  "meta":31, "title":32, "head":33, "body":34, "html":35, "!":0,
};
const CSS_PRIORITY: Record<string, number> = {
  "display":1, "color":2, "background":3, "width":4, "height":5,
  "flex":6, "grid":7, "margin":8, "padding":9, "border":10,
  "font-size":11, "font-weight":12, "font-family":13, "position":14,
  "top":15, "left":16, "right":17, "bottom":18, "z-index":19,
  "overflow":20, "opacity":21, "transform":22, "transition":23,
  "border-radius":24, "box-shadow":25, "gap":26, "cursor":27,
  "aspect-ratio":28, "backdrop-filter":29, "object-fit":30,
  "row-gap":31, "column-gap":32,
};
const JS_PRIORITY: Record<string, number> = {
  "const":1, "let":2, "function":3, "return":4, "if":5,
  "for":6, "console.log":7, "cl":8, "fn":9, "async":10,
  "fetch":11, "document":12, "window":13, "arrow":14,
  "map":15, "filter":16, "class":17, "try":18,
};

function getPriority(lang: EditorLang, label: string): number {
  const p = lang === "html" ? HTML_PRIORITY[label] :
            lang === "css"  ? CSS_PRIORITY[label]  :
            JS_PRIORITY[label];
  return p ?? 999;
}

// ─── Lookup functions ──────────────────────────────────────────────────────────
export type EditorLang = "html" | "css" | "js" | "ts" | "other";

export function getCompletions(lang: EditorLang, word: string): Completion[] {
  if (!word || word.length < 1) return [];
  const lower = word.toLowerCase();

  let list: Completion[] = [];
  if (lang === "html") list = HTML_TAGS;
  else if (lang === "css") list = CSS_COMPLETIONS;
  else if (lang === "js" || lang === "ts") list = JS_COMPLETIONS;
  else return [];

  const normLang: EditorLang = lang === "ts" ? "js" : lang;

  // Exact match (label === word) to the top
  const exact   = list.filter(c => c.label.toLowerCase() === lower);
  // Starts with match, ordered by priority
  const starts  = list
    .filter(c => c.label.toLowerCase().startsWith(lower) && c.label.toLowerCase() !== lower)
    .sort((a, b) => getPriority(normLang, a.label) - getPriority(normLang, b.label));
  // Contains match
  const contains = list
    .filter(c => !c.label.toLowerCase().startsWith(lower) && c.label.toLowerCase().includes(lower))
    .sort((a, b) => getPriority(normLang, a.label) - getPriority(normLang, b.label));

  return [...exact, ...starts, ...contains].slice(0, 12);
}

// ─── Emmet Parser ─────────────────────────────────────────────────────────────
// div.container → <div class="container">\n  \n</div>
// div.a.b       → <div class="a b">
// div#main      → <div id="main">
// div.box#hero  → <div class="box" id="hero">
// span.red      → <span class="red"></span>

const EMMET_BLOCK = new Set(["div","section","article","aside","header","footer","main","nav","form","ul","ol","li","table","tr","td","th","thead","tbody","fieldset","figure","details","dialog","blockquote","pre"]);
const EMMET_VOID  = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);

export function parseEmmet(word: string): string | null {
  // Must contain . or # to be an Emmet expression, and start with a letter
  if (!word.includes(".") && !word.includes("#")) return null;
  // Match tag followed by any combination of .class and #id
  const tagMatch = word.match(/^([a-zA-Z][a-zA-Z0-9]*)([.#][a-zA-Z0-9_][a-zA-Z0-9._#-]*)?$/);
  if (!tagMatch) return null;
  const tag = tagMatch[1].toLowerCase();

  // Parse segments: .class or #id
  const segments = word.slice(tag.length).split(/(?=[.#])/).filter(Boolean);
  const classes: string[] = [];
  let id = "";
  for (const seg of segments) {
    if (seg.startsWith(".")) { const c = seg.slice(1); if (c) classes.push(c); }
    else if (seg.startsWith("#")) { const i = seg.slice(1); if (i) id = i; }
  }

  const attrs: string[] = [];
  if (id)             attrs.push(`id="${id}"`);
  if (classes.length) attrs.push(`class="${classes.join(" ")}"`);
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";

  if (EMMET_VOID.has(tag)) return `<${tag}${attrStr} />`;
  if (EMMET_BLOCK.has(tag)) return `<${tag}${attrStr}>\n  \n</${tag}>`;
  return `<${tag}${attrStr}></${tag}>`;
}

// ─── Language Context Detection ───────────────────────────────────────────────
export function getLanguageContext(code: string, cursor: number, fileLang: EditorLang): EditorLang {
  if (fileLang !== "html") return fileLang;
  
  const before = code.substring(0, cursor);
  
  // 1. Are we inside style="..." attribute?
  const lastStyleAttr = before.lastIndexOf('style="');
  const lastStyleAttrS = before.lastIndexOf("style='");
  const lastAttr = Math.max(lastStyleAttr, lastStyleAttrS);
  
  if (lastAttr !== -1) {
    const quote = before[lastAttr + 6]; // " or '
    const afterAttr = before.substring(lastAttr + 7);
    if (!afterAttr.includes(quote)) {
      return "css";
    }
  }

  // 2. Are we inside <style> tag?
  const lastStyleOpen = before.lastIndexOf("<style");
  const lastStyleClose = before.lastIndexOf("</style>");
  if (lastStyleOpen > lastStyleClose) return "css";

  // 3. Are we inside <script> tag?
  const lastScriptOpen = before.lastIndexOf("<script");
  const lastScriptClose = before.lastIndexOf("</script>");
  if (lastScriptOpen > lastScriptClose) return "js";

  return "html";
}

// ─── Kind colors & icons ────────────────────────────────────────────────────────
export function kindColor(kind: CompletionKind): string {
  return {
    snippet:  "text-violet-400",
    tag:      "text-orange-400",
    property: "text-cyan-400",
    value:    "text-green-400",
    keyword:  "text-blue-400",
    function: "text-yellow-400",
    selector: "text-pink-400",
  }[kind];
}
export function kindLabel(kind: CompletionKind): string {
  return {
    snippet:  "snip",
    tag:      "tag",
    property: "prop",
    value:    "val",
    keyword:  "kw",
    function: "fn",
    selector: "sel",
  }[kind];
}
