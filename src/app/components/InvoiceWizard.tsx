import React, { useState, useRef } from "react";
import { ArrowLeft, FileText, Download, Plus, Trash2, CheckCircle2 } from "lucide-react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

interface InvoiceWizardProps {
  onBack: () => void;
}

export default function InvoiceWizard({ onBack }: InvoiceWizardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    invoiceNumber: "INV-001",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0], // +14 days
    companyName: "Macrotar Software Inc.",
    companyEmail: "info@macrotar.com",
    companyPhone: "+1 555 123 4567",
    clientName: "Client Full Name",
    clientAddress: "Client Address Info \nNew York, USA",
    taxRate: 20, // Tax %
    notes: "Thank you for choosing us. Please make the payment within 14 days to the following account: US00 0000 ...",
    items: [
      { desc: "Software Development Consulting", qty: 10, price: 500 }
    ]
  });

  const updateField = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { desc: "New Item", qty: 1, price: 100 }]
    });
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Calculations
  const subtotal = formData.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const taxAmount = subtotal * (formData.taxRate / 100);
  const total = subtotal + taxAmount;

  const generatePDF = async () => {
    if (!previewRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await htmlToImage.toCanvas(previewRef.current, { pixelRatio: 2, style: { transform: "none", transformOrigin: "top left" } });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${formData.invoiceNumber}.pdf`);
    } catch (err) {
      console.error(err);
      alert("An error occurred while generating the PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Left Sidebar - Form */}
      <div className="w-full lg:w-[450px] bg-white dark:bg-slate-800 border-r border-zinc-200 dark:border-slate-700 flex flex-col h-full z-10 shadow-lg">
        <header className="p-4 border-b border-zinc-200 dark:border-slate-700 flex items-center gap-3 bg-zinc-50/50 dark:bg-slate-900/50">
          <button onClick={onBack} className="p-2 hover:bg-zinc-200 dark:hover:bg-slate-700 rounded-lg text-zinc-600 dark:text-zinc-400">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="text-indigo-500" size={20} />
            <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Invoice Wizard</h1>
          </div>
        </header>

        <div className="flex flex-1 overflow-y-auto p-6 flex-col gap-8 custom-scrollbar relative">
          
          <section>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">Setup &amp; Company</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Invoice No</label>
                <input type="text" value={formData.invoiceNumber} onChange={e => updateField("invoiceNumber", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Date</label>
                    <input type="date" value={formData.date} onChange={e => updateField("date", e.target.value)} className="w-full px-2 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs" />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Due Date</label>
                    <input type="date" value={formData.dueDate} onChange={e => updateField("dueDate", e.target.value)} className="w-full px-2 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs" />
                 </div>
              </div>
            </div>
            <div className="space-y-3">
              <input type="text" value={formData.companyName} onChange={e => updateField("companyName", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold" placeholder="Your Company" />
              <input type="text" value={formData.companyEmail} onChange={e => updateField("companyEmail", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" placeholder="Email" />
              <input type="text" value={formData.companyPhone} onChange={e => updateField("companyPhone", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" placeholder="Phone" />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">Client Information</h2>
            <div className="space-y-3">
              <input type="text" value={formData.clientName} onChange={e => updateField("clientName", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold" placeholder="Client Name/Title" />
              <textarea rows={2} value={formData.clientAddress} onChange={e => updateField("clientAddress", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm resize-none" placeholder="Client Address" />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 border-b border-indigo-100 pb-2">
               <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Services / Products</h2>
               <div className="flex items-center gap-2">
                 <label className="text-xs font-bold text-zinc-500">Tax %</label>
                 <input type="number" min="0" max="100" value={formData.taxRate} onChange={e => updateField("taxRate", Number(e.target.value))} className="w-16 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold" />
               </div>
            </div>
            <div className="space-y-4">
              {formData.items.map((item, i) => (
                <div key={i} className="p-3 border border-zinc-200 rounded-xl bg-zinc-50 flex flex-col gap-2">
                   <div className="flex justify-between gap-2">
                      <input type="text" value={item.desc} onChange={e => updateItem(i, "desc", e.target.value)} className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold" placeholder="Description" />
                      <button onClick={() => removeItem(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50" disabled={formData.items.length === 1}><Trash2 size={16}/></button>
                   </div>
                   <div className="flex gap-2">
                      <div className="flex-1">
                         <label className="block text-[10px] font-bold text-zinc-400 mb-1">QUANTITY (Hours/Units)</label>
                         <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, "qty", Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm" />
                      </div>
                      <div className="flex-1">
                         <label className="block text-[10px] font-bold text-zinc-400 mb-1">UNIT PRICE ($)</label>
                         <input type="number" min="0" value={item.price} onChange={e => updateItem(i, "price", Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm" />
                      </div>
                   </div>
                </div>
              ))}
              <button onClick={addItem} className="text-sm font-bold text-indigo-600 w-full p-2 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-1">
                 <Plus size={16}/> Add Item
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-2">Notes</h2>
            <textarea rows={3} value={formData.notes} onChange={e => updateField("notes", e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm resize-none" placeholder="Bank account details, thank you message, etc." />
          </section>

        </div>

        <div className="p-4 border-t border-zinc-200 bg-zinc-50/80">
          <div className="flex justify-between items-center mb-4 text-sm font-bold text-zinc-800 dark:text-zinc-100 px-2">
             <span>Grand Total:</span>
             <span className="text-lg text-indigo-600 dark:text-indigo-400">{total.toLocaleString("en-US", { minimumFractionDigits: 2, style: 'currency', currency: 'USD' })}</span>
          </div>
          <button onClick={generatePDF} disabled={isGenerating} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            <Download size={18} />
            {isGenerating ? "Preparing..." : "Download Invoice (PDF)"}
          </button>
        </div>
      </div>

      {/* Right Side - A4 Preview */}
      <div className="flex-1 bg-zinc-100 dark:bg-[#0a0a1a] p-8 overflow-y-auto flex items-start justify-center">
        
        {/* A4 Paper */}
        <div 
          ref={previewRef}
          className="bg-white text-black shadow-2xl relative" 
          style={{ width: "210mm", minHeight: "297mm", padding: "20mm", boxSizing: "border-box" }}
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-zinc-800 pb-8 mb-8">
            <div>
              <h1 className="text-5xl font-black uppercase text-indigo-600 tracking-tighter mb-2">INVOICE</h1>
              <p className="text-lg font-bold text-zinc-800 mb-1">{formData.companyName}</p>
              <div className="text-sm text-zinc-600 space-y-0.5">
                <p>{formData.companyEmail}</p>
                <p>{formData.companyPhone}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-zinc-100 p-4 rounded-xl border border-zinc-200 inline-block text-left min-w-[200px]">
                <div className="mb-2">
                   <p className="text-[10px] font-bold text-zinc-400 uppercase">Invoice No</p>
                   <p className="font-bold text-zinc-800">{formData.invoiceNumber}</p>
                </div>
                <div className="mb-2">
                   <p className="text-[10px] font-bold text-zinc-400 uppercase">Invoice Date</p>
                   <p className="font-bold text-zinc-800">{new Date(formData.date).toLocaleDateString("en-US")}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-zinc-400 uppercase">Due Date</p>
                   <p className="font-bold text-zinc-800">{new Date(formData.dueDate).toLocaleDateString("en-US")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-zinc-200 pb-1 w-fit">Dear</h3>
            <p className="font-black text-xl text-zinc-800 mb-1">{formData.clientName}</p>
            <p className="text-zinc-600 whitespace-pre-wrap leading-relaxed text-sm">{formData.clientAddress}</p>
          </div>

          {/* Table */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="bg-indigo-50 border-y-2 border-indigo-200">
                 <th className="py-3 px-4 text-left font-bold text-xs uppercase text-indigo-800 tracking-wider">Description</th>
                 <th className="py-3 px-4 text-right font-bold text-xs uppercase text-indigo-800 tracking-wider w-24">Quantity</th>
                 <th className="py-3 px-4 text-right font-bold text-xs uppercase text-indigo-800 tracking-wider w-32">Unit Price</th>
                 <th className="py-3 px-4 text-right font-bold text-xs uppercase text-indigo-800 tracking-wider w-32">Total</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, i) => (
                <tr key={i} className="border-b border-zinc-100">
                   <td className="py-4 px-4 font-semibold text-zinc-800">{item.desc}</td>
                   <td className="py-4 px-4 text-right text-zinc-600">{item.qty}</td>
                   <td className="py-4 px-4 text-right text-zinc-600">{item.price.toLocaleString("en-US", { minimumFractionDigits: 2, style: 'currency', currency: 'USD' })}</td>
                   <td className="py-4 px-4 text-right font-bold text-zinc-800">{(item.qty * item.price).toLocaleString("en-US", { minimumFractionDigits: 2, style: 'currency', currency: 'USD' })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-16">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} $</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Tax (%{formData.taxRate})</span>
                <span>{taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} $</span>
              </div>
              <div className="flex justify-between border-t-2 border-zinc-800 pt-3 text-xl font-black text-indigo-600">
                <span>Grand Total</span>
                <span>{total.toLocaleString("en-US", { minimumFractionDigits: 2 })} $</span>
              </div>
            </div>
          </div>

          {/* Footer / Notes */}
          {formData.notes && (
            <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] border-t-2 border-zinc-100 pt-6">
               <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Notes</h4>
               <p className="text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">{formData.notes}</p>
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}
