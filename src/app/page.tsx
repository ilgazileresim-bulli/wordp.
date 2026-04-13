"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import LandingPage from "./components/LandingPage";
import { saveRecentDocument, type RecentDocument } from "./utils/recentDocuments";

const Editor = dynamic<{ initialContent?: string; onBack: (content?: string) => void; pendingImage?: string; onImageInserted?: () => void }>(() => import("./components/Editor"), { ssr: false });
const PdfEditor = dynamic<{ onBack: () => void; initialFile?: File }>(() => import("./components/PdfEditor"), { ssr: false });
const PptxEditor = dynamic<{ onBack: () => void; initialFile?: File }>(() => import("./components/PptxEditor"), { ssr: false });
const BackgroundRemover = dynamic<{ onBack: () => void }>(() => import("./components/BackgroundRemover"), { ssr: false });
const ImageCropper = dynamic<{ onBack: () => void }>(() => import("./components/ImageCropper"), { ssr: false });
const ImageEnhancer = dynamic<{ onBack: () => void }>(() => import("./components/ImageEnhancer"), { ssr: false });
const UniversalConverter = dynamic<{ onBack: () => void; onOpenPdfInEditor: (f: File) => void }>(() => import("./components/UniversalConverter"), { ssr: false });
const WordModifier = dynamic<{ onBack: () => void }>(() => import("./components/WordModifier"), { ssr: false });
const OcrTool = dynamic<{ onBack: () => void }>(() => import("./components/OcrTool"), { ssr: false });
const ExcelEditor = dynamic<{ onBack: () => void; initialFile?: File }>(() => import("./components/ExcelEditor"), { ssr: false });
const PdfMergeSplit = dynamic<{ onBack: () => void }>(() => import("./components/PdfMergeSplit"), { ssr: false });
const CvWizard = dynamic<{ onBack: () => void }>(() => import("./components/CvWizard"), { ssr: false });
const InvoiceWizard = dynamic<{ onBack: () => void }>(() => import("./components/InvoiceWizard"), { ssr: false });
const CanvaClone = dynamic<{ onBack: () => void }>(() => import("./components/CanvaClone"), { ssr: false });
const CodeEditor = dynamic<{ onBack: () => void; initialLang?: "html" | "css" | "js" }>(() => import("./components/CodeEditor"), { ssr: false });
const FolderCodeEditor = dynamic<{ onBack: () => void }>(() => import("./components/FolderCodeEditor"), { ssr: false });
const CpsTest = dynamic<{ onBack: () => void }>(() => import("./components/CpsTest"), { ssr: false });
const MediaStudio = dynamic<{ onBack: () => void; initialToolId: string }>(() => import("./components/MediaStudio"), { ssr: false });
const TextStudio = dynamic<{ onBack: () => void; initialToolId: string }>(() => import("./components/TextStudio"), { ssr: false });
const ImageStudio = dynamic<{ onBack: () => void; initialToolId: string }>(() => import("./components/ImageStudio"), { ssr: false });
const DevStudio = dynamic<{ onBack: () => void; initialToolId: string }>(() => import("./components/DevStudio"), { ssr: false });
const BusinessStudio = dynamic<{ onBack: () => void; initialToolId: string }>(() => import("./components/BusinessStudio"), { ssr: false });
const ChartStudio = dynamic<{ onBack: () => void; initialType?: string }>(() => import("./components/ChartStudio"), { ssr: false });
const PdfStudio = dynamic<{ onBack: () => void; initialTool?: string }>(() => import("./components/PdfStudio"), { ssr: false });

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
  const [view, setView] = useState<"landing" | "editor" | "pdf" | "pptx" | "bg-remover" | "image-cropper" | "image-enhancer" | "universal-converter" | "word-modifier" | "ocr" | "excel" | "pdf-merge-split" | "cv-wizard" | "invoice-wizard" | "canva-clone" | "code-editor" | "folder-code-editor" | "cps-test" | "media-studio" | "text-studio" | "image-studio" | "dev-studio" | "business-studio" | "chart-studio" | "pdf-studio">("landing");
  const [codeEditorLang, setCodeEditorLang] = useState<"html" | "css" | "js">("html");
  const [initialContent, setInitialContent] = useState<string>("");
  const [initialPdfFile, setInitialPdfFile] = useState<File | null>(null);
  const [initialPptxFile, setInitialPptxFile] = useState<File | null>(null);
  const [initialExcelFile, setInitialExcelFile] = useState<File | null>(null);
  const [pendingChartImage, setPendingChartImage] = useState<string | undefined>(undefined);
  const [activeMediaTool, setActiveMediaTool] = useState<string>("video-converter");
  const [activeTextTool, setActiveTextTool] = useState<string>("word-counter");
  const [activeImageTool, setActiveImageTool] = useState<string>("brightness-contrast");
  const [activeDevTool, setActiveDevTool] = useState<string>("json-formatter");
  const [activeBusinessTool, setActiveBusinessTool] = useState<string>("biz-compound");
  const [activePdfTool, setActivePdfTool] = useState<string>("pdf");
  const [initialChartType, setInitialChartType] = useState<string>("bar");
  const currentDocIdRef = useRef<string | undefined>(undefined);

  const handleEditorBack = useCallback((content?: string) => {
    if (content && content.startsWith("INSERT_CHART_IMAGE:")) {
      const dataUrl = content.replace("INSERT_CHART_IMAGE:", "");
      setPendingChartImage(dataUrl);
      setView("editor");
      return;
    }
    if (content && content.startsWith("OPEN_CHART_STUDIO:")) {
      const parts = content.split(":");
      // Format: OPEN_CHART_STUDIO:type:htmlContent
      const chartType = parts[1];
      const realContent = parts.slice(2).join(":");
      
      if (chartType) setInitialChartType(chartType);
      
      if (realContent) {
        const id = saveRecentDocument(realContent, currentDocIdRef.current);
        currentDocIdRef.current = id;
        setInitialContent(realContent);
      }
      setView("chart-studio");
      return;
    }
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
          if (mediaFiles.length === 0) { alert("Visual content not found."); return; }
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
          alert("Successfully converted!");
        } catch (err) {
          console.error("PPTX to PNG error:", err);
          alert("Conversion error.");
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
          alert("Successfully converted!");
        } catch (err) {
          console.error("DOCX to PPTX error:", err);
          alert("Conversion error.");
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
            alert("Successfully converted! Page layout preserved.");
          } catch (err) {
            console.error("PDF to PPTX error:", err);
            alert("Conversion error.");
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
              alert("Visual content not found.");
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
            alert("Successfully converted!");
          } catch (err) {
            console.error("PPTX to PDF error:", err);
            alert("Conversion error.");
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
          setInitialContent("<p>Please wait, Word document is being converted...</p>");

          try {
            const mammoth = await import("mammoth");
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;

            if (!html || html.trim() === "") {
              console.error("Mammoth returned empty HTML");
              throw new Error("Document is empty or could not be read.");
            }

            console.log("Mammoth HTML length:", html.length);

            setInitialContent("<p>PDF is being created, please wait...</p>");

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
            const htmlToImage = await import("html-to-image");

            const A4_HEIGHT_PX = 1123; // Approximate at 96 DPI
            const contentHeight = container.offsetHeight;
            const totalPages = Math.ceil(contentHeight / A4_HEIGHT_PX) || 1;

            const pdf = new jsPDF('p', 'mm', 'a4');

            const canvas = await htmlToImage.toCanvas(container, { pixelRatio: 2, backgroundColor: "#ffffff", width: 794 });
            const imgData = canvas.toDataURL('image/png', 1.0);
            
            const pdfWidth = 210;
            const pdfHeight = 297;
            const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;

            for (let i = 0; i < totalPages; i++) {
              if (i > 0) pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, -(i * pdfHeight), pdfWidth, imgHeightMm, undefined, 'FAST');
            }

            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], file.name.replace(".docx", ".pdf"), { type: "application/pdf" });

            document.body.removeChild(container);
            setInitialPdfFile(pdfFile);
            setView("pdf");

          } catch (err) {
            console.error("Conversion error:", err);
            setView("editor");
            setInitialContent("<p>An error occurred while converting the document.</p>");
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
          alert("A conversion error occurred.");
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
          const htmlToImage = await import("html-to-image");
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
            const canvas = await htmlToImage.toCanvas(container, { pixelRatio: 2, backgroundColor: "#ffffff", width: 794, height: A4_HEIGHT });
            canvas.toBlob(blob => { if (blob) saveAs(blob, baseName + ".png"); }, "image/png");
          } else {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            
            const fullCanvas = await htmlToImage.toCanvas(container, { pixelRatio: 2, backgroundColor: "#ffffff", width: 794 });
            
            for (let i = 0; i < totalPages; i++) {
              const pageCanvas = document.createElement("canvas");
              pageCanvas.width = 794 * 2;
              pageCanvas.height = A4_HEIGHT * 2;
              const ctx = pageCanvas.getContext("2d");
              if (ctx) {
                  ctx.drawImage(fullCanvas, 0, i * A4_HEIGHT * 2, 794 * 2, A4_HEIGHT * 2, 0, 0, 794 * 2, A4_HEIGHT * 2);
                  const blob: Blob = await new Promise(resolve => pageCanvas.toBlob(b => resolve(b!), "image/png"));
                  zip.file(`${baseName}_sayfa_${i + 1}.png`, blob);
              }
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, baseName + "_sayfalar.zip");
          }

          document.body.removeChild(container);
        } catch (err) {
          console.error("DOCX to PNG error:", err);
          alert("A conversion error occurred.");
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
          alert("A conversion error occurred.");
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
    } else if (id === "ocr-tool") {
      setView("ocr");
    } else if (id === "excel-editor") {
      setInitialExcelFile(null);
      setView("excel");
    } else if (id === "excel-open") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx,.xls,.csv";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setInitialExcelFile(file);
          setView("excel");
        }
      };
      input.click();
    } else if (id === "pdf-merge-split") {
      setView("pdf-merge-split");
    } else if (id === "pdf-merge" || id === "pdf-split") {
      setActivePdfTool(id);
      setView("pdf-studio");
    } else if (id === "cv-wizard") {
      setView("cv-wizard");
    } else if (id === "invoice-wizard") {
      setView("invoice-wizard");
    } else if (id === "canva-clone") {
      setView("canva-clone");
    } else if (id === "code-editor-html") {
      setCodeEditorLang("html");
      setView("code-editor");
    } else if (id === "code-editor-css") {
      setCodeEditorLang("css");
      setView("code-editor");
    } else if (id === "code-editor-js") {
      setCodeEditorLang("js");
      setView("code-editor");
    } else if (id === "code-editor") {
      setCodeEditorLang("html");
      setView("code-editor");
    } else if (id === "folder-code-editor") {
      setView("folder-code-editor");
    } else if (id === "cps-test") {
      setView("cps-test");
    } else if (["video-converter", "audio-converter", "video-to-mp3", "video-compressor", "trim-video", "trim-audio", "video-to-gif", "gif-to-video", "merge-videos", "merge-audio", "video-thumbnail", "mute-video", "mp3-to-wav", "wav-to-mp3", "m4a-to-mp3", "flac-to-mp3", "ogg-to-mp3", "aac-to-mp3", "mov-to-mp4", "avi-to-mp4", "webm-to-mp4", "mkv-to-mp4", "image-compressor", "image-resizer", "image-converter", "heic-to-jpg", "heic-to-png", "heic-to-webp", "heic-to-gif", "heif-to-jpg", "png-to-jpg", "jpg-to-png", "webp-to-png", "webp-to-jpg", "png-to-webp", "jpg-to-webp", "svg-to-png", "gif-to-png", "bmp-to-jpg", "tiff-to-jpg", "tiff-to-png", "jpg-to-bmp", "png-to-bmp", "avif-to-jpg", "avif-to-png", "ico-to-png", "gif-to-jpg"].includes(id)) {
      setActiveMediaTool(id);
      setView("media-studio");
    } else if (["word-counter", "case-converter", "lorem-ipsum", "text-diff", "fancy-text", "text-cleaner", "invisible-text", "slug-generator", "binary-converter", "reverse-text", "remove-duplicates", "text-repeater", "zalgo-text", "sort-lines", "character-counter", "random-string", "text-to-speech"].includes(id)) {
      setActiveTextTool(id);
      setView("text-studio");
    } else if (["brightness-contrast", "hue-saturation", "exposure", "color-balance", "levels", "curves", "vibrance", "white-balance", "channel-mixer", "selective-color", "sharpen", "vignette", "dust-noise", "duotone", "3d-lut", "posterize", "threshold", "invert-colors", "sepia-vintage", "shadow-highlight", "clarity-texture", "dehaze", "color-grading", "chromatic-aberration", "rotate-flip", "perspective", "tilt-shift", "mirror-effect", "distortion", "photo-filters", "text-overlay", "border-frame", "collage-maker", "meme-generator", "batch-edit", "replace-color", "histogram", "exif-editor", "social-media-resizer", "sketch-effect", "gradient-map", "split-toning", "liquify", "photo-mosaic", "overlay-blend", "compare-images", "color-picker", "color-palette", "screenshot-beautifier"].includes(id)) {
      setActiveImageTool(id);
      setView("image-studio");
    } else if (["json-formatter", "json-graph", "base64", "hash-generator", "uuid-generator", "regex-tester", "markdown-editor", "code-formatter", "json-to-csv", "meta-tag-generator", "og-preview", "cron-expression", "color-contrast", "json-schema", "jwt-decoder", "html-entities", "url-encoder"].includes(id)) {
      setActiveDevTool(id);
      setView("dev-studio");
    } else if (["pdf", "pdf-compress", "pdf-merge", "pdf-split", "pdf-to-word", "pdf-to-image", "image-to-pdf", "pdf-rotate", "pdf-flatten", "pdf-unlock", "pdf-to-text", "pdf-add-page-numbers", "html-to-pdf", "excel-to-pdf", "pdf-to-excel", "pdf-watermark", "pdf-redact", "pdf-resize", "pdf-sign", "pdf-ocr", "pdf-crop", "pdf-extract-pages", "pdf-delete-pages", "pdf-to-pdf-a", "pdf-repair", "pdf-compare", "word-to-pdf", "ppt-to-pdf", "pdf-edit-metadata", "pdf-to-html", "pdf-to-ppt", "pdf-fill-form", "pdf-grayscale", "pdf-extract-images", "pdf-header-footer", "pdf-bates", "pdf-layout", "pdf-to-markdown", "pdf-to-csv", "pdf-stamp"].includes(id)) {
      setActivePdfTool(id);
      setView("pdf-studio");
    } else if (["biz-compound", "biz-loan", "biz-tip", "biz-percentage", "biz-discount", "biz-margin", "biz-roi", "biz-salary", "biz-savings", "biz-inflation", "biz-mortgage", "biz-currency", "biz-paycheck", "biz-emi", "biz-sip", "biz-debt", "biz-budget", "biz-networth", "biz-retirement", "biz-investment", "biz-vat", "biz-creditcard", "biz-auto", "biz-crypto", "biz-breakeven", "biz-cpm", "biz-cagr", "biz-tvm", "biz-rentvsbuy"].includes(id)) {
      setActiveBusinessTool(id);
      setView("business-studio");
    } else if (id.startsWith("chart-")) {
      setView("chart-studio");
    } else {

      setInitialContent(content);
      setView("editor");
    }
  };

  return (
    <main className="h-full overflow-hidden flex flex-col relative text-zinc-900 dark:text-zinc-100">
      {view === "landing" ? (
        <LandingPage onSelectTemplate={handleSelectTemplate} onOpenRecentDocument={handleOpenRecentDocument} />
      ) : view === "editor" ? (
        <Editor 
          initialContent={initialContent} 
          onBack={handleEditorBack} 
          pendingImage={pendingChartImage}
          onImageInserted={() => setPendingChartImage(undefined)}
        />
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
      ) : view === "ocr" ? (
        <OcrTool onBack={() => setView("landing")} />
      ) : view === "excel" ? (
        <ExcelEditor onBack={() => setView("landing")} initialFile={initialExcelFile || undefined} />
      ) : view === "pdf-merge-split" ? (
        <PdfMergeSplit onBack={() => setView("landing")} />
      ) : view === "cv-wizard" ? (
        <CvWizard onBack={() => setView("landing")} />
      ) : view === "invoice-wizard" ? (
        <InvoiceWizard onBack={() => setView("landing")} />
      ) : view === "canva-clone" ? (
        <CanvaClone onBack={() => setView("landing")} />
      ) : view === "code-editor" ? (
        <CodeEditor onBack={() => setView("landing")} initialLang={codeEditorLang} />
      ) : view === "folder-code-editor" ? (
        <FolderCodeEditor onBack={() => setView("landing")} />
      ) : view === "cps-test" ? (
        <CpsTest onBack={() => setView("landing")} />
      ) : view === "media-studio" ? (
        <MediaStudio onBack={() => setView("landing")} initialToolId={activeMediaTool} />
      ) : view === "text-studio" ? (
        <TextStudio onBack={() => setView("landing")} initialToolId={activeTextTool} />
      ) : view === "image-studio" ? (
        <ImageStudio onBack={() => setView("landing")} initialToolId={activeImageTool} />
      ) : view === "dev-studio" ? (
        <DevStudio onBack={() => setView("landing")} initialToolId={activeDevTool} />
      ) : view === "business-studio" ? (
        <BusinessStudio onBack={() => setView("landing")} initialToolId={activeBusinessTool} />
      ) : view === "chart-studio" ? (
        <ChartStudio onBack={handleEditorBack} initialType={initialChartType} />
      ) : view === "pdf-studio" ? (
        <PdfStudio onBack={() => setView("landing")} initialTool={activePdfTool} />
      ) : (
        <PdfEditor onBack={() => setView("landing")} initialFile={initialPdfFile || undefined} />
      )}
    </main>
  );
}
