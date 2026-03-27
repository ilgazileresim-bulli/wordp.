"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import LandingPage from "./components/LandingPage";
import { saveRecentDocument, type RecentDocument } from "./utils/recentDocuments";

const Editor = dynamic<{ initialContent: string; onBack: (content?: string) => void }>(() => import("./components/Editor"), { ssr: false });
const PdfEditor = dynamic<{ onBack: () => void; initialFile?: File }>(() => import("./components/PdfEditor"), { ssr: false });
const PptxEditor = dynamic<{ onBack: () => void; initialFile?: File }>(() => import("./components/PptxEditor"), { ssr: false });
const BackgroundRemover = dynamic<{ onBack: () => void }>(() => import("./components/BackgroundRemover"), { ssr: false });
const ImageCropper = dynamic<{ onBack: () => void }>(() => import("./components/ImageCropper"), { ssr: false });
const ImageEnhancer = dynamic<{ onBack: () => void }>(() => import("./components/ImageEnhancer"), { ssr: false });
const UniversalConverter = dynamic<{ onBack: () => void; onOpenPdfInEditor: (f: File) => void }>(() => import("./components/UniversalConverter"), { ssr: false });
const WordModifier = dynamic<{ onBack: () => void }>(() => import("./components/WordModifier"), { ssr: false });


// ─── Image helper utilities ───────────────────────────────────────────────────
function loadImageDataUrl(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => resolve({ dataUrl, width: img.width, height: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return loadImageDataUrl(file).then(({ width, height }) => ({ width, height }));
}
// ──────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [view, setView] = useState<"landing" | "editor" | "pdf" | "pptx" | "bg-remover" | "image-cropper" | "image-enhancer" | "universal-converter" | "word-modifier">("landing");
  const [initialContent, setInitialContent] = useState<string>("");
  const [initialPdfFile, setInitialPdfFile] = useState<File | null>(null);
  const [initialPptxFile, setInitialPptxFile] = useState<File | null>(null);
  const currentDocIdRef = useRef<string | undefined>(undefined);

  const handleEditorBack = useCallback((content?: string) => {
    if (content) {
      const id = saveRecentDocument(content, currentDocIdRef.current);
      currentDocIdRef.current = id;
    }
    currentDocIdRef.current = undefined;
    setView("landing");
  }, []);

  const handleOpenRecentDocument = useCallback((doc: RecentDocument) => {
    currentDocIdRef.current = doc.id;
    setInitialContent(doc.content);
    setView("editor");
  }, []);

  const handleSelectTemplate = (id: string, content: string) => {
    if (id === "pptx-editor") {
      setInitialPptxFile(null);
      setView("pptx");
    } else if (id === "pptx-open") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pptx";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setInitialPptxFile(file);
          setView("pptx");
        }
      };
      input.click();
    } else if (id === "pptx-to-png") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pptx";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        try {
          const JSZip = (await import("jszip")).default;
          const { saveAs } = await import("file-saver");
          const zip = new JSZip();
          const content2 = await zip.loadAsync(file);
          const mediaFiles = Object.keys(content2.files).filter(p =>
            p.startsWith("ppt/media/") && (p.endsWith(".png") || p.endsWith(".jpg") || p.endsWith(".jpeg"))
          );
          if (mediaFiles.length === 0) { alert("Görsel içerik bulunamadı."); return; }
          if (mediaFiles.length === 1) {
            const imgData = await content2.files[mediaFiles[0]].async("blob");
            saveAs(imgData, file.name.replace(/\.[^/.]+$/, "") + ".png");
          } else {
            const outZip = new JSZip();
            for (let i = 0; i < mediaFiles.length; i++) {
              const blob = await content2.files[mediaFiles[i]].async("blob");
              const ext = mediaFiles[i].split(".").pop();
              outZip.file(`slayt_${i + 1}.${ext}`, blob);
            }
            const zipBlob = await outZip.generateAsync({ type: "blob" });
            saveAs(zipBlob, file.name.replace(/\.[^/.]+$/, "") + "_gorseller.zip");
          }
          alert("Başarıyla dönüştürüldü!");
        } catch (err) {
          console.error("PPTX to PNG error:", err);
          alert("Dönüştürme hatası.");
        }
      };
      input.click();
    } else if (id === "docx-to-pptx") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".docx";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        try {
          const mammoth = await import("mammoth");
          const PptxGenJS = (await import("pptxgenjs")).default;
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const html = result.value;
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;
          const paragraphs = Array.from(tempDiv.querySelectorAll("h1,h2,h3,p,li")).map(el => el.textContent || "").filter(t => t.trim());
          const pptx = new PptxGenJS();
          pptx.defineLayout({ name: "CUSTOM", width: 10, height: 5.625 });
          pptx.layout = "CUSTOM";
          // Title slide
          const titleSlide = pptx.addSlide();
          titleSlide.addText(paragraphs[0] || file.name, { x: 1, y: 1.5, w: 8, h: 2, fontSize: 36, bold: true, color: "1e293b", align: "center" });
          // Content slides (5 paragraphs per slide)
          for (let i = 1; i < paragraphs.length; i += 5) {
            const slide = pptx.addSlide();
            const chunk = paragraphs.slice(i, i + 5).join("\n\n");
            slide.addText(chunk, { x: 0.5, y: 0.5, w: 9, h: 4.5, fontSize: 16, color: "334155", valign: "top" });
          }
          await pptx.writeFile({ fileName: file.name.replace(/\.[^/.]+$/, "") + ".pptx" });
          alert("Başarıyla dönüştürüldü!");
        } catch (err) {
          console.error("DOCX to PPTX error:", err);
          alert("Dönüştürme hatası.");
        }
      };
      input.click();
    } else if (id === "pdf") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setInitialPdfFile(file);
          setView("pdf");
        }
      };
      input.click();
    } else if (id === "pdf-to-pptx") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          // Trigger the conversion logic (best to handle this in a dedicated way or just tell them to use the editor)
          // For UX, let's open the PDF editor with this file if it's PDF -> PPTX or just handle it here.
          // Since we want it to be a "tool", let's implement the conversion here too.
          try {
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";
            const PptxGenJS = (await import("pptxgenjs")).default;

            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            const pptx = new PptxGenJS();

            const firstPage = await pdf.getPage(1);
            const firstViewport = firstPage.getViewport({ scale: 1.0 });
            const widthInches = firstViewport.width / 72;
            const heightInches = firstViewport.height / 72;

            pptx.defineLayout({ name: 'CUSTOM_PDF', width: widthInches, height: heightInches });
            pptx.layout = 'CUSTOM_PDF';

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const renderViewport = page.getViewport({ scale: 2.0 });
              const canvas = document.createElement("canvas");
              const context = canvas.getContext("2d");
              canvas.width = renderViewport.width;
              canvas.height = renderViewport.height;
              if (context) {
                await (page as any).render({ canvasContext: context, viewport: renderViewport }).promise;
                const imgData = canvas.toDataURL("image/png");
                const slide = pptx.addSlide();
                slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
              }
            }
            const outName = file.name.replace(/\.[^/.]+$/, "") + ".pptx";
            await pptx.writeFile({ fileName: outName });
            alert("Başarıyla dönüştürüldü! Sayfa düzeni korundu.");
          } catch (err) {
            console.error("PDF to PPTX error:", err);
            alert("Dönüştürme hatası.");
          }
        }
      };
      input.click();
    } else if (id === "pptx-to-pdf") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pptx";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const JSZip = (await import("jszip")).default;
            const jsPDF = (await import("jspdf")).default;
            const zip = new JSZip();
            const content = await zip.loadAsync(file);
            const mediaFiles = Object.keys(content.files).filter(path =>
              path.startsWith("ppt/media/") &&
              (path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".jpeg"))
            );
            if (mediaFiles.length === 0) {
              alert("Görsel içerik bulunamadı.");
              return;
            }
            const pdf = new jsPDF({ unit: 'px', compress: true });
            for (let i = 0; i < mediaFiles.length; i++) {
              const imgData = await content.files[mediaFiles[i]].async("base64");
              const format = mediaFiles[i].endsWith(".png") ? "PNG" : "JPEG";

              const img = new Image();
              img.src = `data:image/${format.toLowerCase()};base64,${imgData}`;
              await new Promise((resolve) => { img.onload = resolve; });

              const imgWidth = img.width;
              const imgHeight = img.height;

              if (i > 0) pdf.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? 'l' : 'p');
              else {
                (pdf as any).internal.pageSize.width = imgWidth;
                (pdf as any).internal.pageSize.height = imgHeight;
              }

              pdf.addImage(`data:image/${format.toLowerCase()};base64,${imgData}`, format, 0, 0, imgWidth, imgHeight);
            }
            pdf.save(file.name.replace(/\.[^/.]+$/, "") + ".pdf");
            alert("Başarıyla dönüştürüldü!");
          } catch (err) {
            console.error("PPTX to PDF error:", err);
            alert("Dönüştürme hatası.");
          }
        }
      };
      input.click();
    } else if (id === "pdf-to-word") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setView("editor");
          setInitialContent(`PDF_IMPORT:${file.name}`);
          (window as any).__pdfImportFile = file;
        }
      };
      input.click();
    } else if (id === "word-to-pdf") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".docx";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setView("editor");
          setInitialContent("<p>Lütfen bekleyin, Word belgesi dönüştürülüyor...</p>");

          try {
            const mammoth = await import("mammoth");
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;

            if (!html || html.trim() === "") {
              console.error("Mammoth returned empty HTML");
              throw new Error("Belge boş veya okunamadı.");
            }

            console.log("Mammoth HTML length:", html.length);

            setInitialContent("<p>PDF oluşturuluyor, lütfen bekleyin...</p>");

            // Gizli bir element oluşturup içeriği içine koyalım
            const container = document.createElement("div");
            container.style.position = "fixed";
            container.style.left = "0";
            container.style.top = "-10000px"; // Far off screen instead of low opacity
            container.style.width = "210mm";
            container.style.minHeight = "297mm";
            container.style.backgroundColor = "white";
            container.style.padding = "2.54cm";
            container.style.boxSizing = "border-box";
            container.style.zIndex = "-10000";
            container.style.opacity = "1"; // Must be 1 for html2canvas to capture clearly
            container.style.visibility = "visible";
            container.className = "prose max-w-none pdf-conversion-container";
            container.innerHTML = html;

            // Re-apply standard Word styles
            container.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
            container.style.lineHeight = "1.5";
            container.style.color = "black";

            // Ensure all images are loaded
            const images = container.getElementsByTagName('img');
            await Promise.all(Array.from(images).map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
            }));

            document.body.appendChild(container);

            // Wait for DOM
            await new Promise(resolve => setTimeout(resolve, 800));

            const jsPDFModule = await import("jspdf");
            const jsPDF = jsPDFModule.default;
            const html2canvas = (await import("html2canvas")).default;

            const A4_HEIGHT_PX = 1123; // Approximate at 96 DPI
            const contentHeight = container.offsetHeight;
            const totalPages = Math.ceil(contentHeight / A4_HEIGHT_PX) || 1;

            const pdf = new jsPDF('p', 'mm', 'a4');

            for (let i = 0; i < totalPages; i++) {
              if (i > 0) pdf.addPage();

              const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                width: 794,
                height: A4_HEIGHT_PX,
                y: i * A4_HEIGHT_PX,
                windowWidth: 794,
                backgroundColor: "#ffffff"
              });

              const imgData = canvas.toDataURL('image/png', 1.0);
              pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
            }

            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], file.name.replace(".docx", ".pdf"), { type: "application/pdf" });

            document.body.removeChild(container);
            setInitialPdfFile(pdfFile);
            setView("pdf");

          } catch (err) {
            console.error("Conversion error:", err);
            setView("editor");
            setInitialContent("<p>Belge dönüştürülürken bir hata oluştu.</p>");
          }
        }
      };
      input.click();
    } else if (id === "png-to-pdf") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg,image/jpg,image/webp";
      input.multiple = true;
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length === 0) return;
        try {
          const jsPDF = (await import("jspdf")).default;
          const firstImg = await loadImageDimensions(files[0]);
          const pdf = new jsPDF({
            orientation: firstImg.width > firstImg.height ? "landscape" : "portrait",
            unit: "px",
            format: [firstImg.width, firstImg.height],
          });

          for (let i = 0; i < files.length; i++) {
            const { dataUrl, width, height } = await loadImageDataUrl(files[i]);
            if (i > 0) pdf.addPage([width, height], width > height ? "landscape" : "portrait");
            pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
          }

          const outName = files[0].name.replace(/\.[^/.]+$/, "") + (files.length > 1 ? "_combined" : "") + ".pdf";
          pdf.save(outName);
        } catch (err) {
          console.error("PNG to PDF error:", err);
          alert("Dönüştürme hatası oluştu.");
        }
      };
      input.click();
    } else if (id === "png-to-docx") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg,image/jpg,image/webp";
      input.multiple = true;
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length === 0) return;
        try {
          const { Document, Packer, Paragraph, ImageRun } = await import("docx");
          const { saveAs } = await import("file-saver");
          
          const paragraphs = [];
          for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const img = new Image();
            img.src = URL.createObjectURL(file);
            await new Promise((resolve) => { img.onload = resolve; });
            const maxWidth = 600;
            const scale = img.width > maxWidth ? maxWidth / img.width : 1;
            const w = Math.round(img.width * scale);
            const h = Math.round(img.height * scale);
            
            paragraphs.push(
               new Paragraph({
                 children: [
                   new ImageRun({
                     data: arrayBuffer,
                     transformation: { width: w, height: h },
                     type: file.type === "image/png" ? "png" : "jpg"
                   })
                 ]
               })
            );
          }
          
          const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
          const blob = await Packer.toBlob(doc);
          const outName = files[0].name.replace(/\.[^/.]+$/, "") + (files.length > 1 ? "_combined" : "") + ".docx";
          saveAs(blob, outName);
        } catch (err) {
          console.error("PNG to DOCX error:", err);
          alert("Dönüştürme hatası oluştu.");
        }
      };
      input.click();

    } else if (id === "docx-to-png") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".docx";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        try {
          const mammoth = await import("mammoth");
          const html2canvas = (await import("html2canvas")).default;
          const { saveAs } = await import("file-saver");

          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const html = result.value;

          const container = document.createElement("div");
          container.style.cssText = "position:fixed;left:0;top:-20000px;width:794px;background:white;padding:40px;box-sizing:border-box;font-family:sans-serif;line-height:1.5;color:black;";
          container.innerHTML = html;
          document.body.appendChild(container);

          const images = container.getElementsByTagName("img");
          await Promise.all(Array.from(images).map(img =>
            img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
          ));
          await new Promise(r => setTimeout(r, 600));

          const A4_HEIGHT = 1123;
          const totalPages = Math.ceil(container.offsetHeight / A4_HEIGHT) || 1;
          const baseName = file.name.replace(/\.[^/.]+$/, "");

          if (totalPages === 1) {
            const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 794, height: A4_HEIGHT });
            canvas.toBlob(blob => { if (blob) saveAs(blob, baseName + ".png"); }, "image/png");
          } else {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            for (let i = 0; i < totalPages; i++) {
              const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 794, height: A4_HEIGHT, y: i * A4_HEIGHT });
              const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), "image/png"));
              zip.file(`${baseName}_sayfa_${i + 1}.png`, blob);
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, baseName + "_sayfalar.zip");
          }

          document.body.removeChild(container);
        } catch (err) {
          console.error("DOCX to PNG error:", err);
          alert("Dönüştürme hatası oluştu.");
        }
      };
      input.click();
    } else if (id === "pdf-to-png") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        try {
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";
          const { saveAs } = await import("file-saver");

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const baseName = file.name.replace(/\.[^/.]+$/, "");

          if (pdf.numPages === 1) {
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await (page as any).render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
            canvas.toBlob(blob => { if (blob) saveAs(blob, baseName + ".png"); }, "image/png");
          } else {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 2.0 });
              const canvas = document.createElement("canvas");
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await (page as any).render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
              const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), "image/png"));
              zip.file(`${baseName}_sayfa_${i}.png`, blob);
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, baseName + "_sayfalar.zip");
          }
        } catch (err) {
          console.error("PDF to PNG error:", err);
          alert("Dönüştürme hatası oluştu.");
        }
      };
      input.click();
    } else if (id === "bg-remover") {
      setView("bg-remover");
    } else if (id === "image-cropper") {
      setView("image-cropper");
    } else if (id === "image-enhancer") {
      setView("image-enhancer");
    } else if (id === "universal-converter") {
      setView("universal-converter");
    } else if (id === "word-modifier") {
      setView("word-modifier");
    } else {

      setInitialContent(content);
      setView("editor");
    }
  };

  return (
    <main>
      {view === "landing" ? (
        <LandingPage onSelectTemplate={handleSelectTemplate} onOpenRecentDocument={handleOpenRecentDocument} />
      ) : view === "editor" ? (
        <Editor initialContent={initialContent} onBack={handleEditorBack} />
      ) : view === "pptx" ? (
        <PptxEditor onBack={() => setView("landing")} initialFile={initialPptxFile || undefined} />
      ) : view === "bg-remover" ? (
        <BackgroundRemover onBack={() => setView("landing")} />
      ) : view === "image-cropper" ? (
        <ImageCropper onBack={() => setView("landing")} />
      ) : view === "image-enhancer" ? (
        <ImageEnhancer onBack={() => setView("landing")} />
      ) : view === "universal-converter" ? (
        <UniversalConverter 
          onBack={() => setView("landing")} 
          onOpenPdfInEditor={(file) => {
            setView("editor");
            setInitialContent(`PDF_IMPORT:${file.name}`);
            (window as any).__pdfImportFile = file;
          }} 
        />
      ) : view === "word-modifier" ? (
        <WordModifier onBack={() => setView("landing")} />
      ) : (
        <PdfEditor onBack={() => setView("landing")} initialFile={initialPdfFile || undefined} />
      )}
    </main>
  );
}
