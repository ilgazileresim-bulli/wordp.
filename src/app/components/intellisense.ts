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
  { label:"!",         insert:`<!DOCTYPE html>\n<html lang="tr">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Başlık</title>\n</head>\n<body>\n  \n</body>\n</html>`, kind:"snippet", detail:"HTML Şablonu" },
  { label:"a",         insert:`<a href=""></a>`,                    kind:"tag", detail:"Bağlantı" },
  { label:"abbr",      insert:`<abbr title=""></abbr>`,             kind:"tag", detail:"Kısaltma" },
  { label:"article",   insert:`<article>\n  \n</article>`,         kind:"tag", detail:"Makale" },
  { label:"aside",     insert:`<aside>\n  \n</aside>`,             kind:"tag", detail:"Yan içerik" },
  { label:"audio",     insert:`<audio controls>\n  <source src="" type="audio/mpeg" />\n</audio>`, kind:"tag", detail:"Ses" },
  { label:"b",         insert:`<b></b>`,                           kind:"tag", detail:"Kalın" },
  { label:"blockquote",insert:`<blockquote>\n  \n</blockquote>`,   kind:"tag", detail:"Alıntı" },
  { label:"body",      insert:`<body>\n  \n</body>`,               kind:"tag", detail:"Gövde" },
  { label:"br",        insert:`<br />`,                            kind:"tag", detail:"Satır sonu" },
  { label:"button",    insert:`<button type="button"></button>`,   kind:"tag", detail:"Düğme" },
  { label:"canvas",    insert:`<canvas id="canvas" width="600" height="400"></canvas>`, kind:"tag", detail:"Çizim alanı" },
  { label:"caption",   insert:`<caption></caption>`,               kind:"tag", detail:"Başlık" },
  { label:"code",      insert:`<code></code>`,                     kind:"tag", detail:"Kod" },
  { label:"col",       insert:`<col />`,                           kind:"tag", detail:"Sütun" },
  { label:"colgroup",  insert:`<colgroup>\n  \n</colgroup>`,       kind:"tag", detail:"Sütun grubu" },
  { label:"data",      insert:`<data value=""></data>`,            kind:"tag", detail:"Veri" },
  { label:"datalist",  insert:`<datalist id="">\n  <option value="" />\n</datalist>`, kind:"tag", detail:"Öneri listesi" },
  { label:"details",   insert:`<details>\n  <summary></summary>\n  \n</details>`, kind:"tag", detail:"Detay" },
  { label:"dialog",    insert:`<dialog>\n  \n</dialog>`,           kind:"tag", detail:"Diyalog" },
  { label:"div",       insert:`<div>\n  \n</div>`,                 kind:"tag", detail:"Bölüm" },
  { label:"dl",        insert:`<dl>\n  <dt></dt>\n  <dd></dd>\n</dl>`, kind:"tag", detail:"Tanım listesi" },
  { label:"em",        insert:`<em></em>`,                         kind:"tag", detail:"Vurgu" },
  { label:"embed",     insert:`<embed src="" type="" />`,          kind:"tag", detail:"Gömme" },
  { label:"fieldset",  insert:`<fieldset>\n  <legend></legend>\n  \n</fieldset>`, kind:"tag", detail:"Alan grubu" },
  { label:"figcaption",insert:`<figcaption></figcaption>`,         kind:"tag", detail:"Şekil başlığı" },
  { label:"figure",    insert:`<figure>\n  \n</figure>`,           kind:"tag", detail:"Şekil" },
  { label:"footer",    insert:`<footer>\n  \n</footer>`,           kind:"tag", detail:"Alt bilgi" },
  { label:"form",      insert:`<form action="" method="post">\n  \n</form>`, kind:"tag", detail:"Form" },
  { label:"h1",        insert:`<h1></h1>`,                         kind:"tag", detail:"Başlık 1" },
  { label:"h2",        insert:`<h2></h2>`,                         kind:"tag", detail:"Başlık 2" },
  { label:"h3",        insert:`<h3></h3>`,                         kind:"tag", detail:"Başlık 3" },
  { label:"h4",        insert:`<h4></h4>`,                         kind:"tag", detail:"Başlık 4" },
  { label:"h5",        insert:`<h5></h5>`,                         kind:"tag", detail:"Başlık 5" },
  { label:"h6",        insert:`<h6></h6>`,                         kind:"tag", detail:"Başlık 6" },
  { label:"head",      insert:`<head>\n  <meta charset="UTF-8" />\n  <title>Başlık</title>\n</head>`, kind:"tag", detail:"Baş kısım" },
  { label:"header",    insert:`<header>\n  \n</header>`,           kind:"tag", detail:"Üst bilgi" },
  { label:"hr",        insert:`<hr />`,                            kind:"tag", detail:"Yatay çizgi" },
  { label:"html",      insert:`<html lang="tr">\n  \n</html>`,     kind:"tag", detail:"HTML kökü" },
  { label:"i",         insert:`<i></i>`,                           kind:"tag", detail:"İtalik" },
  { label:"iframe",    insert:`<iframe src="" title="" width="600" height="400"></iframe>`, kind:"tag", detail:"Çerçeve" },
  { label:"img",       insert:`<img src="" alt="" />`,             kind:"tag", detail:"Resim" },
  { label:"input",     insert:`<input type="text" placeholder="" />`, kind:"tag", detail:"Giriş" },
  { label:"label",     insert:`<label for=""></label>`,            kind:"tag", detail:"Etiket" },
  { label:"legend",    insert:`<legend></legend>`,                 kind:"tag", detail:"Açıklama" },
  { label:"li",        insert:`<li></li>`,                         kind:"tag", detail:"Liste öğesi" },
  { label:"link",      insert:`<link rel="stylesheet" href="style.css" />`, kind:"tag", detail:"Bağlantı" },
  { label:"main",      insert:`<main>\n  \n</main>`,               kind:"tag", detail:"Ana içerik" },
  { label:"mark",      insert:`<mark></mark>`,                     kind:"tag", detail:"Vurgula" },
  { label:"meta",      insert:`<meta name="" content="" />`,       kind:"tag", detail:"Meta" },
  { label:"nav",       insert:`<nav>\n  \n</nav>`,                 kind:"tag", detail:"Gezinti" },
  { label:"noscript",  insert:`<noscript></noscript>`,             kind:"tag", detail:"Scriptsiz" },
  { label:"object",    insert:`<object data="" type=""></object>`, kind:"tag", detail:"Nesne" },
  { label:"ol",        insert:`<ol>\n  <li></li>\n</ol>`,          kind:"tag", detail:"Sıralı liste" },
  { label:"option",    insert:`<option value=""></option>`,        kind:"tag", detail:"Seçenek" },
  { label:"output",    insert:`<output></output>`,                 kind:"tag", detail:"Çıktı" },
  { label:"p",         insert:`<p></p>`,                           kind:"tag", detail:"Paragraf" },
  { label:"picture",   insert:`<picture>\n  <source srcset="" media="" />\n  <img src="" alt="" />\n</picture>`, kind:"tag", detail:"Resim grubu" },
  { label:"pre",       insert:`<pre></pre>`,                       kind:"tag", detail:"Biçimli metin" },
  { label:"progress",  insert:`<progress value="0" max="100"></progress>`, kind:"tag", detail:"İlerleme" },
  { label:"script",    insert:`<script>\n  \n</script>`,           kind:"tag", detail:"Script" },
  { label:"section",   insert:`<section>\n  \n</section>`,         kind:"tag", detail:"Bölüm" },
  { label:"select",    insert:`<select>\n  <option value=""></option>\n</select>`, kind:"tag", detail:"Açılır liste" },
  { label:"small",     insert:`<small></small>`,                   kind:"tag", detail:"Küçük" },
  { label:"span",      insert:`<span></span>`,                     kind:"tag", detail:"Satır içi" },
  { label:"strong",    insert:`<strong></strong>`,                 kind:"tag", detail:"Güçlü" },
  { label:"style",     insert:`<style>\n  \n</style>`,             kind:"tag", detail:"Stil" },
  { label:"sub",       insert:`<sub></sub>`,                       kind:"tag", detail:"Alt simge" },
  { label:"summary",   insert:`<summary></summary>`,               kind:"tag", detail:"Özet" },
  { label:"sup",       insert:`<sup></sup>`,                       kind:"tag", detail:"Üst simge" },
  { label:"table",     insert:`<table>\n  <thead>\n    <tr>\n      <th></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td></td>\n    </tr>\n  </tbody>\n</table>`, kind:"tag", detail:"Tablo" },
  { label:"tbody",     insert:`<tbody>\n  \n</tbody>`,             kind:"tag", detail:"Tablo gövdesi" },
  { label:"td",        insert:`<td></td>`,                         kind:"tag", detail:"Tablo hücresi" },
  { label:"template",  insert:`<template>\n  \n</template>`,       kind:"tag", detail:"Şablon" },
  { label:"textarea",  insert:`<textarea rows="4" cols="50"></textarea>`, kind:"tag", detail:"Metin alanı" },
  { label:"th",        insert:`<th></th>`,                         kind:"tag", detail:"Tablo başlığı" },
  { label:"thead",     insert:`<thead>\n  \n</thead>`,             kind:"tag", detail:"Tablo başı" },
  { label:"time",      insert:`<time datetime=""></time>`,         kind:"tag", detail:"Zaman" },
  { label:"title",     insert:`<title></title>`,                   kind:"tag", detail:"Başlık" },
  { label:"tr",        insert:`<tr>\n  <td></td>\n</tr>`,          kind:"tag", detail:"Tablo satırı" },
  { label:"ul",        insert:`<ul>\n  <li></li>\n</ul>`,          kind:"tag", detail:"Sırasız liste" },
  { label:"var",       insert:`<var></var>`,                       kind:"tag", detail:"Değişken" },
  { label:"video",     insert:`<video controls width="640" height="360">\n  <source src="" type="video/mp4" />\n</video>`, kind:"tag", detail:"Video" },
  { label:"lorem",     insert:`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.`, kind:"snippet", detail:"Lorem ipsum" },
  // HTML attribute snippets
  { label:"class",     insert:`class=""`,                          kind:"snippet", detail:"Sınıf özelliği" },
  { label:"id",        insert:`id=""`,                             kind:"snippet", detail:"ID özelliği" },
  { label:"style",     insert:`style=""`,                          kind:"snippet", detail:"Stil özelliği" },
  { label:"href",      insert:`href=""`,                           kind:"snippet", detail:"Bağlantı" },
  { label:"src",       insert:`src=""`,                            kind:"snippet", detail:"Kaynak" },
  { label:"alt",       insert:`alt=""`,                            kind:"snippet", detail:"Alternatif metin" },
  { label:"type",      insert:`type=""`,                           kind:"snippet", detail:"Tür" },
  { label:"placeholder",insert:`placeholder=""`,                   kind:"snippet", detail:"Yer tutucu" },
  { label:"name",      insert:`name=""`,                           kind:"snippet", detail:"Ad" },
  { label:"value",     insert:`value=""`,                          kind:"snippet", detail:"Değer" },
  { label:"action",    insert:`action=""`,                         kind:"snippet", detail:"Form aksiyonu" },
  { label:"method",    insert:`method="post"`,                     kind:"snippet", detail:"Form metodu" },
  { label:"content",   insert:`content=""`,                        kind:"snippet", detail:"İçerik" },
  { label:"charset",   insert:`charset="UTF-8"`,                   kind:"snippet", detail:"Karakter seti" },
  { label:"rel",       insert:`rel="stylesheet"`,                  kind:"snippet", detail:"İlişki" },
  { label:"target",    insert:`target="_blank"`,                   kind:"snippet", detail:"Hedef" },
  { label:"onclick",   insert:`onclick=""`,                        kind:"snippet", detail:"Tıklama olayı" },
  { label:"onsubmit",  insert:`onsubmit=""`,                       kind:"snippet", detail:"Gönderme olayı" },
  { label:"colspan",   insert:`colspan=""`,                        kind:"snippet", detail:"Sütun birleştir" },
  { label:"rowspan",   insert:`rowspan=""`,                        kind:"snippet", detail:"Satır birleştir" },
];

// ─── CSS ───────────────────────────────────────────────────────────────────────
const CSS_COMPLETIONS: Completion[] = [
  // ─── Snippets (Hazır Kodlar) ───
  { label:"body",           insert:`body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n  box-sizing: border-box;\n}`,            kind:"snippet", detail:"Body sıfırlama" },
  { label:"reset",          insert:`* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}`,                                          kind:"snippet", detail:"CSS sıfırla" },
  { label:"flex",           insert:`display: flex;\njustify-content: center;\nalign-items: center;\ngap: 16px;`,                               kind:"snippet", detail:"Flex kutu" },
  { label:"grid",           insert:`display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 16px;`,                                       kind:"snippet", detail:"Grid düzen" },
  { label:"card",           insert:`.card {\n  background: #fff;\n  border-radius: 16px;\n  padding: 24px;\n  box-shadow: 0 4px 24px rgba(0,0,0,0.1);\n}`, kind:"snippet", detail:"Kart bileşeni" },
  { label:"btn",            insert:`.btn {\n  display: inline-flex;\n  align-items: center;\n  padding: 10px 20px;\n  background: #6366f1;\n  color: #fff;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: 600;\n  transition: all 0.2s;\n}`, kind:"snippet", detail:"Düğme stili" },
  { label:"glass",          insert:`background: rgba(255,255,255,0.1);\nbackdrop-filter: blur(20px);\nborder: 1px solid rgba(255,255,255,0.2);\nborder-radius: 16px;`, kind:"snippet", detail:"Cam efekti" },
  { label:"gradient",       insert:`background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`, kind:"snippet", detail:"Gradyan" },
  { label:"shadow",         insert:`box-shadow: 0 4px 24px rgba(0,0,0,0.15);`, kind:"snippet", detail:"Gölge" },
  { label:"transition",     insert:`transition: all 0.3s ease;`, kind:"snippet", detail:"Geçiş" },
  { label:"anim",           insert:`@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to   { opacity: 1; transform: translateY(0); }\n}`, kind:"snippet", detail:"Animasyon" },
  { label:"media",          insert:`@media (max-width: 768px) {\n  \n}`, kind:"snippet", detail:"Medya sorgusu" },
  { label:"var",            insert:`:root {\n  --primary: #6366f1;\n  --secondary: #a855f7;\n  --bg: #0f172a;\n  --text: #f1f5f9;\n}`, kind:"snippet", detail:"CSS değişkenleri" },
  { label:"hover",          insert:`:hover {\n  \n}`,             kind:"snippet", detail:"Üzerine gelince" },
  { label:"before",         insert:`::before {\n  content: '';\n  display: block;\n}`, kind:"snippet", detail:"::before" },
  { label:"after",          insert:`::after {\n  content: '';\n  display: block;\n}`, kind:"snippet", detail:"::after" },
  { label:"center",         insert:`display: flex;\njustify-content: center;\nalign-items: center;`, kind:"snippet", detail:"Ortala" },
  { label:"fullscreen",     insert:`width: 100vw;\nheight: 100vh;\nmargin: 0;\npadding: 0;\noverflow: hidden;`, kind:"snippet", detail:"Tam ekran" },
  { label:"circle",         insert:`width: 48px;\nheight: 48px;\nborder-radius: 50%;\nflex-shrink: 0;`, kind:"snippet", detail:"Daire" },
  { label:"truncate",       insert:`white-space: nowrap;\noverflow: hidden;\ntext-overflow: ellipsis;`, kind:"snippet", detail:"Kırp" },
  
  // Advanced Snippets (Modern Teknikler)
  { label:"resp-img",       insert:`max-width: 100%;\nheight: auto;\ndisplay: block;\nobject-fit: cover;`, kind:"snippet", detail:"Duyarlı resim" },
  { label:"text-grad",      insert:`background: linear-gradient(to right, #6366f1, #a855f7);\n-webkit-background-clip: text;\n-webkit-text-fill-color: transparent;`, kind:"snippet", detail:"Yazı gradyanı" },
  { label:"hide-scroll",    insert:`scrollbar-width: none;\n-ms-overflow-style: none;\n&::-webkit-scrollbar {\n  display: none;\n}`, kind:"snippet", detail:"Kaydırma çubuğunu gizle" },
  { label:"sticky-top",     insert:`position: sticky;\ntop: 0;\nz-index: 1000;`, kind:"snippet", detail:"Yapışkan üst" },
  { label:"aspect-square",  insert:`aspect-ratio: 1 / 1;\nobject-fit: cover;`, kind:"snippet", detail:"Kare oran" },

  // ─── Properties (Özellikler) ───
  { label:"accent-color",      insert:`accent-color: `,    kind:"property", detail:"Vurgu rengi" },
  { label:"align-content",    insert:`align-content: `,    kind:"property", detail:"İçerik hizala (flex/grid)" },
  { label:"align-items",      insert:`align-items: `,      kind:"property", detail:"Öğe hizala (flex/grid)" },
  { label:"align-self",       insert:`align-self: `,       kind:"property", detail:"Öz-hizalama" },
  { label:"all",              insert:`all: unset;`,        kind:"property", detail:"Tüm stilleri sıfırla" },
  { label:"animation",        insert:`animation: name 1s ease infinite;`, kind:"property", detail:"Animasyon" },
  { label:"animation-delay",  insert:`animation-delay: 0.5s;`, kind:"property", detail:"Animasyon gecikmesi" },
  { label:"animation-direction", insert:`animation-direction: alternate;`, kind:"property", detail:"Animasyon yönü" },
  { label:"animation-duration", insert:`animation-duration: 300ms;`, kind:"property", detail:"Animasyon süresi" },
  { label:"animation-fill-mode", insert:`animation-fill-mode: forwards;`, kind:"property", detail:"Animasyon bitiş hali" },
  { label:"animation-iteration-count", insert:`animation-iteration-count: infinite;`, kind:"property", detail:"Tekrar sayısı" },
  { label:"animation-name",    insert:`animation-name: fadeIn;`, kind:"property", detail:"Animasyon adı" },
  { label:"animation-play-state", insert:`animation-play-state: paused;`, kind:"property", detail:"Oynatma durumu" },
  { label:"animation-timing-function", insert:`animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);`, kind:"property", detail:"Hız eğrisi" },
  { label:"appearance",       insert:`appearance: none;`,  kind:"property", detail:"Görünüm" },
  { label:"aspect-ratio",     insert:`aspect-ratio: 16 / 9;`, kind:"property", detail:"Görüntü oranı" },
  { label:"backdrop-filter",  insert:`backdrop-filter: blur(8px);`, kind:"property", detail:"Arka plan filtresi" },
  { label:"backface-visibility", insert:`backface-visibility: hidden;`, kind:"property", detail:"Arka yüz görünürlüğü" },
  { label:"background",       insert:`background: `,       kind:"property", detail:"Arka plan" },
  { label:"background-attachment", insert:`background-attachment: `, kind:"property", detail:"Bağlı arka plan" },
  { label:"background-blend-mode", insert:`background-blend-mode: multiply;`, kind:"property", detail:"Karışım modu" },
  { label:"background-clip",  insert:`background-clip: padding-box;`, kind:"property", detail:"Arka plan kırpma" },
  { label:"background-color", insert:`background-color: `, kind:"property", detail:"Arka plan rengi" },
  { label:"background-image", insert:`background-image: url('');`, kind:"property", detail:"Arka plan resmi" },
  { label:"background-origin", insert:`background-origin: border-box;`, kind:"property", detail:"Arka plan başlangıcı" },
  { label:"background-position", insert:`background-position: center;`, kind:"property", detail:"Konum" },
  { label:"background-repeat", insert:`background-repeat: no-repeat;`, kind:"property", detail:"Tekrar" },
  { label:"background-size",  insert:`background-size: cover;`,  kind:"property", detail:"Boyut" },
  { label:"border",           insert:`border: 1px solid #ccc;`, kind:"property", detail:"Kenarlık" },
  { label:"border-bottom",    insert:`border-bottom: `,    kind:"property", detail:"Alt kenarlık" },
  { label:"border-collapse",  insert:`border-collapse: collapse;`, kind:"property", detail:"Kenarlık birleştirme" },
  { label:"border-color",     insert:`border-color: `,     kind:"property", detail:"Rengi" },
  { label:"border-image",     insert:`border-image: `,     kind:"property", detail:"Resmi" },
  { label:"border-left",      insert:`border-left: `,      kind:"property", detail:"Sol kenarlık" },
  { label:"border-radius",    insert:`border-radius: 8px;`, kind:"property", detail:"Köşe yuvarlama" },
  { label:"border-right",     insert:`border-right: `,     kind:"property", detail:"Sağ kenarlık" },
  { label:"border-spacing",   insert:`border-spacing: 0;`, kind:"property", detail:"Boşluğu" },
  { label:"border-style",     insert:`border-style: solid;`, kind:"property", detail:"Stili" },
  { label:"border-top",       insert:`border-top: `,       kind:"property", detail:"Üst kenarlık" },
  { label:"border-width",     insert:`border-width: 1px;`, kind:"property", detail:"Genişliği" },
  { label:"bottom",           insert:`bottom: 0;`,         kind:"property", detail:"Alt mesafe" },
  { label:"box-shadow",       insert:`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);`, kind:"property", detail:"Kutu gölgesi" },
  { label:"box-sizing",       insert:`box-sizing: border-box;`, kind:"property", detail:"Kutu hesaplama" },
  { label:"break-after",      insert:`break-after: auto;`, kind:"property", detail:"Sonraki kırılma" },
  { label:"break-before",     insert:`break-before: auto;`, kind:"property", detail:"Önceki kırılma" },
  { label:"break-inside",     insert:`break-inside: avoid;`, kind:"property", detail:"İçeride kırılma" },
  { label:"caption-side",     insert:`caption-side: bottom;`, kind:"property", detail:"Tablo başlığı yönü" },
  { label:"caret-color",      insert:`caret-color: #6366f1;`, kind:"property", detail:"İmleç rengi" },
  { label:"clear",            insert:`clear: both;`,       kind:"property", detail:"Temizle" },
  { label:"clip",             insert:`clip: rect(0, 0, 0, 0);`, kind:"property", detail:"Kırpma" },
  { label:"clip-path",        insert:`clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);`, kind:"property", detail:"Kırpma yolu" },
  { label:"color",            insert:`color: `,            kind:"property", detail:"Metin rengi" },
  { label:"column-count",     insert:`column-count: 3;`,   kind:"property", detail:"Sütun sayısı" },
  { label:"column-fill",      insert:`column-fill: balance;`, kind:"property", detail:"Sütun dolgusu" },
  { label:"column-gap",       insert:`column-gap: 20px;`,  kind:"property", detail:"Sütun arası" },
  { label:"column-rule",      insert:`column-rule: 1px solid #ddd;`, kind:"property", detail:"Sütun çizgisi" },
  { label:"columns",          insert:`columns: 2 auto;`,   kind:"property", detail:"Sütunlar" },
  { label:"content",          insert:`content: '';`,       kind:"property", detail:"İçerik (::before/::after)" },
  { label:"counter-increment", insert:`counter-increment: section;`, kind:"property", detail:"Sayaç artır" },
  { label:"counter-reset",    insert:`counter-reset: section;`, kind:"property", detail:"Sayaç sıfırla" },
  { label:"cursor",           insert:`cursor: pointer;`,   kind:"property", detail:"İmleç tipi" },
  { label:"direction",        insert:`direction: ltr;`,    kind:"property", detail:"Diziliş yönü" },
  { label:"display",          insert:`display: `,          kind:"property", detail:"Görünüm tipi" },
  { label:"empty-cells",      insert:`empty-cells: hide;`, kind:"property", detail:"Boş hücreler" },
  { label:"filter",           insert:`filter: blur(4px);`, kind:"property", detail:"Filtre" },
  { label:"flex",             insert:`flex: 1 1 0%;`,      kind:"property", detail:"Sıralı esnek" },
  { label:"flex-basis",       insert:`flex-basis: auto;`,  kind:"property", detail:"Esnek temel" },
  { label:"flex-direction",   insert:`flex-direction: column;`, kind:"property", detail:"Esnek yön" },
  { label:"flex-flow",        insert:`flex-flow: row wrap;`, kind:"property", detail:"Esnek akış" },
  { label:"flex-grow",        insert:`flex-grow: 1;`,      kind:"property", detail:"Esnek büyüme" },
  { label:"flex-shrink",      insert:`flex-shrink: 1;`,    kind:"property", detail:"Esnek daralma" },
  { label:"flex-wrap",        insert:`flex-wrap: wrap;`,   kind:"property", detail:"Esnek sarma" },
  { label:"float",            insert:`float: left;`,       kind:"property", detail:"Kaydır" },
  { label:"font",             insert:`font: `,             kind:"property", detail:"Yazı tipi (toplu)" },
  { label:"font-family",      insert:`font-family: 'Inter', sans-serif;`, kind:"property", detail:"Yazı tipi ailesi" },
  { label:"font-feature-settings", insert:`font-feature-settings: 'cv11';`, kind:"property", detail:"Gelişmiş yazı ayarları" },
  { label:"font-kerning",     insert:`font-kerning: auto;`, kind:"property", detail:"Yazı kertiği" },
  { label:"font-size",        insert:`font-size: 16px;`,   kind:"property", detail:"Yazı boyutu" },
  { label:"font-size-adjust", insert:`font-size-adjust: 0.5;`, kind:"property", detail:"Yazı boyutu ayarı" },
  { label:"font-stretch",     insert:`font-stretch: normal;`, kind:"property", detail:"Yazı esnetme" },
  { label:"font-style",       insert:`font-style: italic;`, kind:"property", detail:"Yazı stili" },
  { label:"font-variant",     insert:`font-variant: small-caps;`, kind:"property", detail:"Yazı varyantı" },
  { label:"font-weight",      insert:`font-weight: 600;`,  kind:"property", detail:"Yazı ağırlığı" },
  { label:"gap",              insert:`gap: 16px;`,         kind:"property", detail:"Boşluk" },
  { label:"grid",             insert:`grid: `,             kind:"property", detail:"Grid" },
  { label:"grid-area",        insert:`grid-area: `,        kind:"property", detail:"Grid alanı" },
  { label:"grid-auto-columns", insert:`grid-auto-columns: `, kind:"property", detail:"Otomatik sütunlar" },
  { label:"grid-auto-flow",   insert:`grid-auto-flow: row;`, kind:"property", detail:"Otomatik akış" },
  { label:"grid-auto-rows",    insert:`grid-auto-rows: `,   kind:"property", detail:"Otomatik satırlar" },
  { label:"grid-column",      insert:`grid-column: span 2;`, kind:"property", detail:"Grid sütun" },
  { label:"grid-column-end",  insert:`grid-column-end: `,  kind:"property", detail:"Grid sütun bitiş" },
  { label:"grid-column-gap",  insert:`grid-column-gap: `,  kind:"property", detail:"Grid sütun arası" },
  { label:"grid-column-start", insert:`grid-column-start: `, kind:"property", detail:"Grid sütun başlangıç" },
  { label:"grid-gap",         insert:`grid-gap: `,         kind:"property", detail:"Grid arası" },
  { label:"grid-row",         insert:`grid-row: span 2;`,  kind:"property", detail:"Grid satır" },
  { label:"grid-row-end",     insert:`grid-row-end: `,     kind:"property", detail:"Grid satır bitiş" },
  { label:"grid-row-gap",     insert:`grid-row-gap: `,     kind:"property", detail:"Grid satır arası" },
  { label:"grid-row-start",   insert:`grid-row-start: `,   kind:"property", detail:"Grid satır başlangıç" },
  { label:"grid-template",    insert:`grid-template: `,    kind:"property", detail:"Grid şablon" },
  { label:"grid-template-areas", insert:`grid-template-areas: 'header header' 'main sidebar';`, kind:"property", detail:"Grid alan şablonu" },
  { label:"grid-template-columns", insert:`grid-template-columns: repeat(3, 1fr);`, kind:"property", detail:"Grid sütun şablonu" },
  { label:"grid-template-rows",    insert:`grid-template-rows: repeat(2, auto);`, kind:"property", detail:"Grid satır şablonu" },
  { label:"height",           insert:`height: 100%;`,      kind:"property", detail:"Yükseklik" },
  { label:"hyphens",          insert:`hyphens: auto;`,     kind:"property", detail:"Tireleme" },
  { label:"image-rendering",  insert:`image-rendering: pixelated;`, kind:"property", detail:"Resim işleme" },
  { label:"isolation",        insert:`isolation: isolate;`, kind:"property", detail:"Yalıtım" },
  { label:"justify-content",  insert:`justify-content: center;`, kind:"property", detail:"İçerik hizala (yatay)" },
  { label:"justify-items",    insert:`justify-items: center;`, kind:"property", detail:"Öğe hizala (yatay)" },
  { label:"justify-self",     insert:`justify-self: center;`, kind:"property", detail:"Öz-hizalama (yatay)" },
  { label:"left",             insert:`left: 0;`,           kind:"property", detail:"Sol mesafe" },
  { label:"letter-spacing",   insert:`letter-spacing: 0.025em;`, kind:"property", detail:"Harf arası" },
  { label:"line-height",      insert:`line-height: 1.5;`,  kind:"property", detail:"Satır yüksekliği" },
  { label:"list-style",       insert:`list-style: none;`,  kind:"property", detail:"Liste stili" },
  { label:"list-style-image", insert:`list-style-image: `, kind:"property", detail:"Liste resmi" },
  { label:"list-style-position", insert:`list-style-position: inside;`, kind:"property", detail:"Liste konumu" },
  { label:"list-style-type",  insert:`list-style-type: disc;`, kind:"property", detail:"Liste tipi" },
  { label:"margin",           insert:`margin: `,           kind:"property", detail:"Dış boşluk" },
  { label:"margin-bottom",    insert:`margin-bottom: `,    kind:"property", detail:"Alt dış boşluk" },
  { label:"margin-left",      insert:`margin-left: `,      kind:"property", detail:"Sol dış boşluk" },
  { label:"margin-right",     insert:`margin-right: `,     kind:"property", detail:"Sağ dış boşluk" },
  { label:"margin-top",       insert:`margin-top: `,       kind:"property", detail:"Üst dış boşluk" },
  { label:"mask",             insert:`mask: `,             kind:"property", detail:"Maske" },
  { label:"mask-image",       insert:`mask-image: `,       kind:"property", detail:"Maske resmi" },
  { label:"max-height",       insert:`max-height: 100vh;`, kind:"property", detail:"Maksimum yükseklik" },
  { label:"max-width",        insert:`max-width: 1200px;`, kind:"property", detail:"Maksimum genişlik" },
  { label:"min-height",       insert:`min-height: auto;`,  kind:"property", detail:"Minimum yükseklik" },
  { label:"min-width",        insert:`min-width: 0;`,      kind:"property", detail:"Minimum genişlik" },
  { label:"mix-blend-mode",   insert:`mix-blend-mode: screen;`, kind:"property", detail:"Karışım modu (içerik)" },
  { label:"object-fit",       insert:`object-fit: cover;`, kind:"property", detail:"Nesne sığdırma" },
  { label:"object-position",  insert:`object-position: center;`, kind:"property", detail:"Nesne konumu" },
  { label:"opacity",          insert:`opacity: 0.5;`,      kind:"property", detail:"Opaklık" },
  { label:"order",            insert:`order: 1;`,          kind:"property", detail:"Sıralama" },
  { label:"outline",          insert:`outline: 2px solid #6366f1;`, kind:"property", detail:"Dış kenarlık" },
  { label:"outline-offset",   insert:`outline-offset: 2px;`, kind:"property", detail:"Dış kenarlık mesafesi" },
  { label:"overflow",         insert:`overflow: hidden;`,  kind:"property", detail:"Taşma" },
  { label:"overflow-x",       insert:`overflow-x: auto;`,  kind:"property", detail:"Yatay taşma" },
  { label:"overflow-y",       insert:`overflow-y: scroll;`, kind:"property", detail:"Dikey taşma" },
  { label:"padding",          insert:`padding: 16px;`,     kind:"property", detail:"İç boşluk" },
  { label:"padding-bottom",   insert:`padding-bottom: `,   kind:"property", detail:"Alt iç boşluk" },
  { label:"padding-left",     insert:`padding-left: `,     kind:"property", detail:"Sol iç boşluk" },
  { label:"padding-right",    insert:`padding-right: `,    kind:"property", detail:"Sağ iç boşluk" },
  { label:"padding-top",      insert:`padding-top: `,      kind:"property", detail:"Üst iç boşluk" },
  { label:"perspective",      insert:`perspective: 1000px;`, kind:"property", detail:"Perspektif" },
  { label:"place-content",    insert:`place-content: center;`, kind:"property", detail:"İçerik yerleştir" },
  { label:"place-items",      insert:`place-items: center;`, kind:"property", detail:"Öğeleri yerleştir" },
  { label:"place-self",       insert:`place-self: center;`, kind:"property", detail:"Kendini yerleştir" },
  { label:"pointer-events",   insert:`pointer-events: none;`, kind:"property", detail:"Tıklama olayları" },
  { label:"position",         insert:`position: relative;`, kind:"property", detail:"Konumlanma tipi" },
  { label:"quotes",           insert:`quotes: '"' '"';`,  kind:"property", detail:"Tırnaklar" },
  { label:"resize",           insert:`resize: both;`,      kind:"property", detail:"Boyutlandırma" },
  { label:"right",            insert:`right: 0;`,          kind:"property", detail:"Sağ mesafe" },
  { label:"row-gap",          insert:`row-gap: 16px;`,     kind:"property", detail:"Satır arası" },
  { label:"scroll-behavior",  insert:`scroll-behavior: smooth;`, kind:"property", detail:"Kaydırma davranışı" },
  { label:"scroll-margin",    insert:`scroll-margin: 20px;`, kind:"property", detail:"Kaydırma dış boşluğu" },
  { label:"scroll-padding",   insert:`scroll-padding: 20px;`, kind:"property", detail:"Kaydırma iç boşluğu" },
  { label:"scroll-snap-align", insert:`scroll-snap-align: start;`, kind:"property", detail:"Kaydırma hizası" },
  { label:"scroll-snap-type",  insert:`scroll-snap-type: y mandatory;`, kind:"property", detail:"Kaydırma tipi" },
  { label:"table-layout",     insert:`table-layout: fixed;`, kind:"property", detail:"Tablo düzeni" },
  { label:"text-align",       insert:`text-align: center;`, kind:"property", detail:"Metin hizalama" },
  { label:"text-decoration",  insert:`text-decoration: underline;`, kind:"property", detail:"Metin süslemesi" },
  { label:"text-decoration-color", insert:`text-decoration-color: #6366f1;`, kind:"property", detail:"Metin süsleme rengi" },
  { label:"text-indent",      insert:`text-indent: 20px;`, kind:"property", detail:"Metin girintisi" },
  { label:"text-overflow",    insert:`text-overflow: ellipsis;`, kind:"property", detail:"Metin taşması" },
  { label:"text-shadow",      insert:`text-shadow: 2px 2px 4px rgba(0,0,0,0.2);`, kind:"property", detail:"Metin gölgesi" },
  { label:"text-transform",   insert:`text-transform: uppercase;`, kind:"property", detail:"Metin dönüştürme" },
  { label:"top",              insert:`top: 0;`,              kind:"property", detail:"Üst mesafe" },
  { label:"transform",        insert:`transform: scale(1.1);`, kind:"property", detail:"Dönüştürme" },
  { label:"transform-origin", insert:`transform-origin: center;`, kind:"property", detail:"Dönüşüm merkezi" },
  { label:"transform-style",  insert:`transform-style: preserve-3d;`, kind:"property", detail:"Dönüşüm stili" },
  { label:"transition",       insert:`transition: all 0.3s ease;`, kind:"property", detail:"Geçiş süresi" },
  { label:"transition-delay", insert:`transition-delay: 100ms;`, kind:"property", detail:"Geçiş gecikmesi" },
  { label:"transition-duration", insert:`transition-duration: 300ms;`, kind:"property", detail:"Geçiş süresi" },
  { label:"transition-property", insert:`transition-property: opacity;`, kind:"property", detail:"Geçiş özelliği" },
  { label:"transition-timing-function", insert:`transition-timing-function: linear;`, kind:"property", detail:"Geçiş hızı" },
  { label:"user-select",      insert:`user-select: none;`, kind:"property", detail:"Kullanıcı seçimi" },
  { label:"vertical-align",   insert:`vertical-align: middle;`, kind:"property", detail:"Dikey hizalama" },
  { label:"visibility",       insert:`visibility: hidden;`, kind:"property", detail:"Görünürlük" },
  { label:"white-space",      insert:`white-space: nowrap;`, kind:"property", detail:"Beyaz boşluk" },
  { label:"width",            insert:`width: 100%;`,       kind:"property", detail:"Genişlik" },
  { label:"will-change",      insert:`will-change: transform;`, kind:"property", detail:"Deşim bildirimi" },
  { label:"word-break",       insert:`word-break: break-all;`, kind:"property", detail:"Kelime bölme" },
  { label:"word-spacing",     insert:`word-spacing: 2px;`, kind:"property", detail:"Kelime arası" },
  { label:"word-wrap",        insert:`word-wrap: break-word;`, kind:"property", detail:"Kelime sığdırma" },
  { label:"writing-mode",     insert:`writing-mode: vertical-rl;`, kind:"property", detail:"Yazım modu" },
  { label:"z-index",          insert:`z-index: 50;`,       kind:"property", detail:"Katman sırası" },

  // ─── Values & Key Presets (Değerler ve Hazır Atamalar) ───
  { label:"display:flex",     insert:`display: flex;`,     kind:"value", detail:"Esnek kutu" },
  { label:"display:grid",     insert:`display: grid;`,     kind:"value", detail:"Izgara düzen" },
  { label:"display:block",    insert:`display: block;`,    kind:"value", detail:"Blok" },
  { label:"display:inline-block", insert:`display: inline-block;`, kind:"value", detail:"Satır-içi blok" },
  { label:"display:none",     insert:`display: none;`,     kind:"value", detail:"Gizle" },
  { label:"position:absolute", insert:`position: absolute;`, kind:"value", detail:"Mutlak konum" },
  { label:"position:relative", insert:`position: relative;`, kind:"value", detail:"Göreceli konum" },
  { label:"position:fixed",    insert:`position: fixed;`,    kind:"value", detail:"Sabit konum" },
  { label:"position:sticky",   insert:`position: sticky;`,   kind:"value", detail:"Yapışkan konum" },
  { label:"flex-direction:row", insert:`flex-direction: row;`, kind:"value", detail:"Yatay akış" },
  { label:"flex-direction:column", insert:`flex-direction: column;`, kind:"value", detail:"Dikey akış" },
  { label:"justify-content:center", insert:`justify-content: center;`, kind:"value", detail:"Merkezler" },
  { label:"justify-content:space-between", insert:`justify-content: space-between;`, kind:"value", detail:"Aralıklı yay" },
  { label:"align-items:center", insert:`align-items: center;`, kind:"value", detail:"Dikey merkez" },
  { label:"color:white",      insert:`color: #ffffff;`,    kind:"value", detail:"Beyaz" },
  { label:"color:black",      insert:`color: #000000;`,    kind:"value", detail:"Siyah" },
  { label:"color:transparent", insert:`color: transparent;`, kind:"value", detail:"Şeffaf" },
  { label:"background:transparent", insert:`background: transparent;`, kind:"value", detail:"Şeffaf arka plan" },
  { label:"cursor:pointer",   insert:`cursor: pointer;`,   kind:"value", detail:"İmleç: El" },
  { label:"overflow:hidden",  insert:`overflow: hidden;`,  kind:"value", detail:"Taşmayı gizle" },
  { label:"overflow:auto",    insert:`overflow: auto;`,    kind:"value", detail:"Otomatik kaydır" },
  { label:"white",            insert:`#ffffff`,            kind:"value", detail:"Sade Beyaz" },
  { label:"black",            insert:`#000000`,            kind:"value", detail:"Sade Siyah" },
  { label:"transparent",      insert:`transparent`,        kind:"value", detail:"Şeffaf" },
  { label:"currentcolor",     insert:`currentColor`,       kind:"value", detail:"Mevcut renk" },
];


// ─── JavaScript ────────────────────────────────────────────────────────────────
const JS_COMPLETIONS: Completion[] = [
  // Snippets
  { label:"cl",          insert:`console.log()`,              kind:"snippet", detail:"console.log" },
  { label:"log",         insert:`console.log()`,              kind:"snippet", detail:"console.log" },
  { label:"fn",          insert:`function name() {\n  \n}`,   kind:"snippet", detail:"Fonksiyon" },
  { label:"arrow",       insert:`const name = () => {\n  \n};`, kind:"snippet", detail:"Ok fonksiyonu" },
  { label:"class",       insert:`class Name {\n  constructor() {\n    \n  }\n\n  method() {\n    \n  }\n}`, kind:"snippet", detail:"Sınıf" },
  { label:"async",       insert:`async function name() {\n  try {\n    const result = await ;\n  } catch (err) {\n    console.error(err);\n  }\n}`, kind:"snippet", detail:"Async fonksiyon" },
  { label:"if",          insert:`if (condition) {\n  \n}`,    kind:"snippet", detail:"Koşul" },
  { label:"ife",         insert:`if (condition) {\n  \n} else {\n  \n}`, kind:"snippet", detail:"if/else" },
  { label:"for",         insert:`for (let i = 0; i < array.length; i++) {\n  \n}`, kind:"snippet", detail:"for döngüsü" },
  { label:"forof",       insert:`for (const item of array) {\n  \n}`, kind:"snippet", detail:"for...of" },
  { label:"forin",       insert:`for (const key in object) {\n  \n}`, kind:"snippet", detail:"for...in" },
  { label:"while",       insert:`while (condition) {\n  \n}`, kind:"snippet", detail:"while döngüsü" },
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
  { label:"const",        insert:`const `,         kind:"keyword", detail:"Sabit" },
  { label:"let",          insert:`let `,           kind:"keyword", detail:"Değişken" },
  { label:"var",          insert:`var `,           kind:"keyword", detail:"Değişken (eski)" },
  { label:"return",       insert:`return `,        kind:"keyword", detail:"Dön" },
  { label:"typeof",       insert:`typeof `,        kind:"keyword", detail:"Tür" },
  { label:"instanceof",   insert:`instanceof `,    kind:"keyword", detail:"Örnek mi?" },
  { label:"new",          insert:`new `,           kind:"keyword", detail:"Yeni nesne" },
  { label:"delete",       insert:`delete `,        kind:"keyword", detail:"Sil" },
  { label:"void",         insert:`void `,          kind:"keyword", detail:"Void" },
  { label:"throw",        insert:`throw new Error('')`, kind:"keyword", detail:"Hata fırlat" },
  { label:"await",        insert:`await `,         kind:"keyword", detail:"Bekle" },
  { label:"yield",        insert:`yield `,         kind:"keyword", detail:"Üret" },
  { label:"debugger",     insert:`debugger;`,      kind:"keyword", detail:"Hata ayıkla" },
  { label:"break",        insert:`break;`,         kind:"keyword", detail:"Çık" },
  { label:"continue",     insert:`continue;`,      kind:"keyword", detail:"Devam" },
  // Built-ins
  { label:"console",      insert:`console.`,       kind:"function", detail:"Konsol" },
  { label:"console.log",  insert:`console.log()`,  kind:"function", detail:"Konsola yaz" },
  { label:"console.error",insert:`console.error()`, kind:"function", detail:"Hata yaz" },
  { label:"console.warn", insert:`console.warn()`, kind:"function", detail:"Uyarı yaz" },
  { label:"console.table",insert:`console.table()`, kind:"function", detail:"Tablo yaz" },
  { label:"JSON.parse",   insert:`JSON.parse()`,   kind:"function", detail:"JSON parse" },
  { label:"JSON.stringify",insert:`JSON.stringify(, null, 2)`, kind:"function", detail:"JSON dönüştür" },
  { label:"Math.random",  insert:`Math.random()`,  kind:"function", detail:"Rastgele sayı" },
  { label:"Math.floor",   insert:`Math.floor()`,   kind:"function", detail:"Aşağı yuvarla" },
  { label:"Math.ceil",    insert:`Math.ceil()`,    kind:"function", detail:"Yukarı yuvarla" },
  { label:"Math.round",   insert:`Math.round()`,   kind:"function", detail:"Yuvarla" },
  { label:"Math.max",     insert:`Math.max()`,     kind:"function", detail:"Maksimum" },
  { label:"Math.min",     insert:`Math.min()`,     kind:"function", detail:"Minimum" },
  { label:"Math.abs",     insert:`Math.abs()`,     kind:"function", detail:"Mutlak değer" },
  { label:"Math.pow",     insert:`Math.pow(base, exp)`, kind:"function", detail:"Üs" },
  { label:"Math.sqrt",    insert:`Math.sqrt()`,    kind:"function", detail:"Karekök" },
  { label:"Math.PI",      insert:`Math.PI`,        kind:"function", detail:"Pi sayısı" },
  { label:"parseInt",     insert:`parseInt(, 10)`, kind:"function", detail:"Int parse" },
  { label:"parseFloat",   insert:`parseFloat()`,   kind:"function", detail:"Float parse" },
  { label:"isNaN",        insert:`isNaN()`,        kind:"function", detail:"NaN mı?" },
  { label:"isFinite",     insert:`isFinite()`,     kind:"function", detail:"Sonlu mu?" },
  { label:"String",       insert:`String()`,       kind:"function", detail:"String dönüştür" },
  { label:"Number",       insert:`Number()`,       kind:"function", detail:"Sayıya dönüştür" },
  { label:"Boolean",      insert:`Boolean()`,      kind:"function", detail:"Boolean dönüştür" },
  { label:"Array.from",   insert:`Array.from()`,   kind:"function", detail:"Array yap" },
  { label:"Array.isArray",insert:`Array.isArray()`, kind:"function", detail:"Array mı?" },
  { label:"Object.keys",  insert:`Object.keys()`,  kind:"function", detail:"Anahtarlar" },
  { label:"Object.values",insert:`Object.values()`, kind:"function", detail:"Değerler" },
  { label:"Object.entries",insert:`Object.entries()`, kind:"function", detail:"Girdiler" },
  { label:"Object.assign",insert:`Object.assign({}, )`, kind:"function", detail:"Birleştir" },
  { label:"localStorage", insert:`localStorage.`,  kind:"function", detail:"Yerel depo" },
  { label:"localStorage.getItem",  insert:`localStorage.getItem('')`, kind:"function", detail:"Oku" },
  { label:"localStorage.setItem",  insert:`localStorage.setItem('', )`, kind:"function", detail:"Yaz" },
  { label:"localStorage.removeItem",insert:`localStorage.removeItem('')`, kind:"function", detail:"Sil" },
  { label:"sessionStorage",insert:`sessionStorage.`, kind:"function", detail:"Oturum depo" },
  { label:"document",     insert:`document.`,      kind:"function", detail:"Doküman" },
  { label:"document.getElementById",   insert:`document.getElementById('')`, kind:"function", detail:"ID ile seç" },
  { label:"document.querySelector",    insert:`document.querySelector('')`,  kind:"function", detail:"CSS ile seç" },
  { label:"document.querySelectorAll", insert:`document.querySelectorAll('')`, kind:"function", detail:"Hepsi" },
  { label:"document.createElement",   insert:`document.createElement('')`, kind:"function", detail:"Element yarat" },
  { label:"document.createTextNode",  insert:`document.createTextNode('')`, kind:"function", detail:"Metin yarat" },
  { label:"window",       insert:`window.`,        kind:"function", detail:"Pencere" },
  { label:"window.location", insert:`window.location`, kind:"function", detail:"Konum" },
  { label:"window.history",  insert:`window.history`, kind:"function", detail:"Geçmiş" },
  { label:"Date.now",     insert:`Date.now()`,     kind:"function", detail:"Şimdiki zaman" },
  { label:"new Date",     insert:`new Date()`,     kind:"function", detail:"Tarih nesnesi" },
  { label:"setTimeout",   insert:`setTimeout(() => {\n  \n}, 1000)`, kind:"function", detail:"Gecikme" },
  { label:"setInterval",  insert:`setInterval(() => {\n  \n}, 1000)`, kind:"function", detail:"Aralık" },
  { label:"clearTimeout", insert:`clearTimeout(id)`, kind:"function", detail:"Gecikmeyi iptal" },
  { label:"clearInterval",insert:`clearInterval(id)`, kind:"function", detail:"Aralığı iptal" },
  { label:"requestAnimationFrame", insert:`requestAnimationFrame(callback)`, kind:"function", detail:"RAF" },
  { label:"alert",        insert:`alert('')`,      kind:"function", detail:"Uyarı" },
  { label:"confirm",      insert:`confirm('')`,    kind:"function", detail:"Onay" },
  { label:"prompt",       insert:`prompt('')`,     kind:"function", detail:"Girdi" },
];

// ─── Öncelik skoru ────────────────────────────────────────────────────────────
// Yüksek öncelikli etiketler/özellikler her zaman üste çıkar
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

  // Tam eşleşme (label === word) en üste
  const exact   = list.filter(c => c.label.toLowerCase() === lower);
  // Başlayan eşleşmeler, önceliğe göre sıralı
  const starts  = list
    .filter(c => c.label.toLowerCase().startsWith(lower) && c.label.toLowerCase() !== lower)
    .sort((a, b) => getPriority(normLang, a.label) - getPriority(normLang, b.label));
  // İçinde geçen eşleşmeler
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
  
  // 1. style="..." özelliğinin içinde miyiz?
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

  // 2. <style> etiketinin içinde miyiz?
  const lastStyleOpen = before.lastIndexOf("<style");
  const lastStyleClose = before.lastIndexOf("</style>");
  if (lastStyleOpen > lastStyleClose) return "css";

  // 3. <script> etiketinin içinde miyiz?
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
