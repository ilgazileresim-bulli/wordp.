import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, FileSpreadsheet, Download, Cloud, Loader2, Pencil } from "lucide-react";
import * as XLSX from "xlsx";

interface ExcelEditorProps {
  onBack: () => void;
  initialFile?: File;
}

const MemoizedCell = React.memo(({ value, onChange, rowIdx, colIdx }: { value: string, onChange: (r: number, c: number, v: string) => void, rowIdx: number, colIdx: number }) => {
  const [localVal, setLocalVal] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  return (
    <input
      type="text"
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        setIsFocused(false);
        if (e.target.value !== value) {
          onChange(rowIdx, colIdx, e.target.value);
        }
      }}
      className={`w-full h-full px-3 py-2 text-sm bg-transparent outline-none transition-all duration-200 text-zinc-800 dark:text-zinc-200 ${isFocused ? 'ring-2 ring-emerald-500 inset-0 !bg-emerald-50/50 dark:!bg-emerald-900/20 z-10 relative' : 'border-2 border-transparent'}`}
    />
  );
});

export default function ExcelEditor({ onBack, initialFile }: ExcelEditorProps) {
  // A simple 2D array for the grid data
  const [data, setData] = useState<string[][]>(Array(20).fill("").map(() => Array(10).fill("")));
  const [cols, setCols] = useState<string[]>(Array(10).fill("").map((_, i) => XLSX.utils.encode_col(i)));
  const [isCloudSaved, setIsCloudSaved] = useState(false);
  const [fileName, setFileName] = useState("Calisma-Kitabi.xlsx");

  useEffect(() => {
    if (initialFile) {
      setFileName(initialFile.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result;
        if (buffer) {
          const pb = new Uint8Array(buffer as ArrayBuffer);
          const workbook = XLSX.read(pb, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length > 0) {
            // Ensure at least 20 rows and 10 cols for a proper grid view
            const maxCols = Math.max(10, ...jsonData.map(row => row.length));
            const maxRows = Math.max(20, jsonData.length);
            
            const normalizedData = Array(maxRows).fill("").map((_, rowIndex) => {
              const row = jsonData[rowIndex] || [];
              return Array(maxCols).fill("").map((_, colIndex) => String(row[colIndex] || ""));
            });
            
            setData(normalizedData);
            // Put first row values as column names if available, else standard A, B, C...
            setCols(Array(maxCols).fill("").map((_, i) => jsonData[0] && jsonData[0][i] ? String(jsonData[0][i]) : XLSX.utils.encode_col(i)));
          }
        }
      };
      reader.readAsArrayBuffer(initialFile);
    }
  }, [initialFile]);

  const updateCell = useCallback((ri: number, ci: number, val: string) => {
    setData(prev => {
      const newData = [...prev];
      newData[ri] = [...newData[ri]];
      newData[ri][ci] = val;
      return newData;
    });
  }, []);

  const updateColName = (ci: number, val: string) => {
    const newCols = [...cols];
    newCols[ci] = val;
    setCols(newCols);
  };

  const addRow = () => {
    setData([...data, Array(cols.length).fill("")]);
  };

  const addCol = () => {
    const newData = data.map(row => [...row, ""]);
    setData(newData);
    setCols([...cols, XLSX.utils.encode_col(cols.length)]);
  };

  const downloadFile = () => {
    // Generate data to save including headers
    const dataToSave = [cols, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(dataToSave);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    // Generate buffer
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const mockSaveToCloud = () => {
    setIsCloudSaved(true);
    setTimeout(() => {
      alert("Excel dosyası başarıyla Bulut'a kaydedildi!");
      setIsCloudSaved(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-none p-4 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-slate-800/50 z-20 w-full shadow-sm">
        <div className="flex items-center gap-4 hover:overflow-visible">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex-shrink-0 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white flex-shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 group relative">
                <input 
                  type="text" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="px-2 py-1 text-base md:text-lg font-bold bg-transparent border-b-2 border-transparent hover:border-emerald-200 focus:border-emerald-500 transition-colors focus:outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 w-44 md:w-64"
                  placeholder="Çalışma Kitabı Adı"
                />
                <Pencil size={14} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 pointer-events-none" />
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 px-2 flex items-center gap-1">
                {isCloudSaved ? <span className="text-emerald-500 font-medium">Buluta Kaydedildi</span> : "Düzenleniyor..."}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-sm border border-zinc-100 dark:border-slate-800 overflow-x-auto hide-scrollbar">
          <button 
            onClick={addRow}
            className="px-2 md:px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm font-semibold transition-colors"
          >
            <Plus size={16} className="flex-shrink-0" /> <span className="hidden md:inline">Satır Ekle</span>
          </button>
          <button 
            onClick={addCol}
            className="px-2 md:px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm font-semibold transition-colors"
          >
            <Plus size={16} className="flex-shrink-0" /> <span className="hidden md:inline">Sütun Ekle</span>
          </button>
          
          <div className="w-px h-6 bg-zinc-200 dark:bg-slate-800 mx-1 hidden md:block"></div>
          
          <button
            onClick={mockSaveToCloud}
            disabled={isCloudSaved}
            className="px-3 md:px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm"
          >
            {isCloudSaved ? <Loader2 size={16} className="animate-spin flex-shrink-0" /> : <Cloud size={16} className="flex-shrink-0" />}
            <span className="hidden md:inline">Buluta Kaydet</span>
          </button>
          <button
            onClick={downloadFile}
            className="px-3 md:px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 whitespace-nowrap"
          >
            <Download size={16} className="flex-shrink-0" />
            Dışa Aktar
          </button>
        </div>
      </header>

      {/* Spreadsheet Main Grid */}
      <main className="flex-1 overflow-auto p-2 md:p-6 pb-6">
        <div className="bg-white dark:bg-[#0d0d1e] rounded-xl md:rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 overflow-hidden hide-scrollbar max-w-full">
          <div className="overflow-auto max-h-[calc(100vh-140px)] relative">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-10 md:w-12 min-w-[40px] md:min-w-[48px] sticky top-0 left-0 z-30 bg-slate-100 dark:bg-slate-800 border-b border-r border-slate-300/50 dark:border-slate-700 backdrop-blur-sm">
                    {/* Corner piece */}
                  </th>
                  {cols.map((col, i) => (
                    <th key={i} className="min-w-[100px] md:min-w-[120px] sticky top-0 z-20 bg-slate-50 dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-800/80 py-2.5 px-2 text-center transition-colors group">
                      <input 
                        type="text" 
                        value={col}
                        onChange={(e) => updateColName(i, e.target.value)}
                        className="w-full bg-transparent text-center font-bold text-slate-600 dark:text-slate-300 text-xs md:text-sm focus:outline-none focus:text-emerald-600 dark:focus:text-emerald-400 group-hover:bg-slate-200/50 dark:group-hover:bg-slate-800 rounded px-1 transition-colors"
                        title="Sütun Adını Değiştir"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#080814]">
                {data.map((row, ri) => (
                  <tr key={ri} className="group hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 transition-colors">
                    <td className="w-10 md:w-12 sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-800/80 text-center text-xs font-bold text-slate-400 dark:text-slate-500 py-1 select-none group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {ri + 1}
                    </td>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border-b border-r border-slate-100 dark:border-slate-800/50 p-0 relative">
                        <MemoizedCell 
                          value={cell} 
                          onChange={updateCell} 
                          rowIdx={ri} 
                          colIdx={ci} 
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
