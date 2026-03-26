const fs = require('fs');
let text = fs.readFileSync('src/app/components/PptxEditor.tsx', 'utf8');

// 1. Add showToast function and state
if (!text.includes('const [toastMessage, setToastMessage]')) {
    text = text.replace(
        'const [isFullscreen, setIsFullscreen] = useState(false);',
        'const [isFullscreen, setIsFullscreen] = useState(false);\n    const [toastMessage, setToastMessage] = useState<string | null>(null);\n\n    const showToast = useCallback((msg: string) => {\n        setToastMessage(msg);\n        setTimeout(() => setToastMessage(null), 3000);\n    }, []);'
    );
}

// 2. Add Toast rendering UI
if (!text.includes('id="pptx-toast"')) {
    text = text.replace(
        '{/* Hidden inputs */}',
        '{/* Toast UI */}\n            {toastMessage && (\n                <div id="pptx-toast" className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#333] text-white px-4 py-2 rounded shadow-lg z-[9999] text-[13px] flex items-center gap-2">\n                    <span className="text-[#ffab00]">⚠️</span> {toastMessage}\n                </div>\n            )}\n\n            {/* Hidden inputs */}'
    );
}

// 3. RBtn component update
text = text.replace(
    'const RBtn = ({ icon: Icon, label, onClick, active, size = 16 }: { icon: any; label: string; onClick?: () => void; active?: boolean; size?: number }) => (\n        <button onClick={onClick} title={label} className={cn("p-1 rounded hover:bg-[#c8dcf0] transition-colors", active && "bg-[#b8cce4]")}>',
    'const RBtn = ({ icon: Icon, label, onClick, active, size = 16 }: { icon: any; label: string; onClick?: () => void; active?: boolean; size?: number }) => (\n        <button onClick={onClick || (() => showToast(label + " özelliği henüz yapım aşamasındadır."))} title={label} className={cn("p-1 rounded hover:bg-[#c8dcf0] transition-colors", active && "bg-[#b8cce4]")}>'
);

// 4. BigBtn component update
text = text.replace(
    'onClick?: () => void; sub?: boolean }) => (\n        <button onClick={onClick} className="flex flex-col items-center px-2 py-0.5 rounded hover:bg-[#c8dcf0] transition-colors min-w-[50px]">\n            <Icon size={22}',
    'onClick?: () => void; sub?: boolean }) => (\n        <button onClick={onClick || (() => showToast(label.replace(/\\n/g, " ") + " özelliği henüz yapım aşamasındadır."))} className="flex flex-col items-center px-2 py-0.5 rounded hover:bg-[#c8dcf0] transition-colors min-w-[50px]">\n            <Icon size={22}'
);

// 5. Replace simple generic buttons without onClick
// We match <button className="... but not onClick
text = text.replace(/<button className="flex items-center gap-1/g, '<button onClick={() => showToast("Bu özellik henüz yapım aşamasındadır.")} className="flex items-center gap-1');

// 6. Fix specific ones that we just broke if they already had onClick
// Wait, replacing all of them will cause <button onClick={() => ...} onClick={...} if they already had it.
// Let's use a safer regex. We'll find all buttons manually or use a smarter regex:
const buttonRegex = /<button(?![^>]*onClick)([^>]*)>/g;
let c = 0;
text = text.replace(buttonRegex, (match, p1) => {
    // skip buttons that are just for layout or scroll arrows, etc.
    if (p1.includes('w-[14px]') || p1.includes('w-[20px]')) return match; // Font size arrows or scroll arrows
    c++;
    return `<button onClick={() => showToast("Bu özellik henüz yapım aşamasındadır.")}${p1}>`;
});
console.log('Replaced ' + c + ' generic buttons');

// 7. Finally, add our native APIs to some buttons:
// "Yakınlaştır" (zoom) -> setZoom
text = text.replace(/<BigBtn icon=\{Search\} label="Yakınlaştır" \/>/, '<BigBtn icon={Search} label="Yakınlaştır" onClick={() => setZoom(Math.min(200, zoom + 20))} />');
text = text.replace(/<BigBtn icon=\{Maximize\} label=\{"Pencereye\\nSığdır"\} \/>/, '<BigBtn icon={Maximize} label={"Pencereye\\nSığdır"} onClick={() => setZoom(100)} />');
text = text.replace(/<BigBtn icon=\{Search\} label="Ara" \/>/, '<BigBtn icon={Search} label="Ara" onClick={() => window.find()} />');
text = text.replace(/<button onClick=\{\(\) => showToast\("Bu özellik henüz yapım aşamasındadır\."\)\} className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-\[#c8dcf0\] text-\[10px\] text-\[#444\]"><Search size=\{12\} \/> Bul<\/button>/, '<button onClick={() => window.find()} className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#c8dcf0] text-[10px] text-[#444]"><Search size={12} /> Bul</button>');

text = text.replace(/<BigBtn icon=\{HelpCircle\} label="Yardım" \/>/, '<BigBtn icon={HelpCircle} label="Yardım" onClick={() => window.open("https://support.microsoft.com/tr-tr/powerpoint", "_blank")} />');
text = text.replace(/\{ label: "Yazdır" \},/g, '{ label: "Yazdır", action: () => window.print() },');
text = text.replace(/<button onClick=\{\(\) => showToast\([^)]+\)\} className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-\[#c8dcf0\] text-\[9px\] text-\[#444\]"><Monitor size=\{10\} \/> Yeni Pencere<\/button>/, '<button onClick={() => window.open(window.location.href, "_blank")} className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#c8dcf0] text-[9px] text-[#444]"><Monitor size={10} /> Yeni Pencere</button>');

fs.writeFileSync('src/app/components/PptxEditor.tsx', text);
console.log('Done!');
