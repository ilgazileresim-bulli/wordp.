import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Save, Plus, FileSpreadsheet, Download, Cloud, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface ExcelEditorProps {
  onBack: () => void;
  initialFile?: File;
}

const MemoizedCell = React.memo(({ value, onChange, rowIdx, colIdx }: { value: string, onChange: (r: number, c: number, v: string) => void, rowIdx: number, colIdx: number }) => {
  const [localVal, setLocalVal] = useState(value);
  
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  return (
    <input
      type="text"
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={(e) => {
        if (e.target.value !== value) {
          onChange(rowIdx, colIdx, e.target.value);
        }
      }}
      className="w-full h-full px-2 py-1.5 text-sm bg-transparent border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 outline-none text-zinc-800 dark:text-zinc-200"
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
            setCols(Array(maxCols).fill("").map((_, i) => XLSX.utils.encode_col(i)));
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

  const addRow = () => {
    setData([...data, Array(cols.length).fill("")]);
  };

  const addCol = () => {
    const newData = data.map(row => [...row, ""]);
    setData(newData);
    setCols([...cols, XLSX.utils.encode_col(cols.length)]);
  };

  const downloadFile = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
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
      alert("Excel dosyası Bulut'a kaydedildi!");
      setIsCloudSaved(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0a0a1a] overflow-hidden">
      {/* Header */}
      <header className="flex-none p-3 px-4 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-slate-800 z-10 w-full overflow-x-auto">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400">
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet size={18} />
            </div>
            <input 
              type="text" 
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="px-2 py-1 text-base font-semibold bg-transparent border-b border-transparent focus:border-zinc-300 dark:focus:border-slate-600 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              placeholder="Dosya Adı"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={addRow}
            className="p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 text-sm font-medium"
          >
            <Plus size={16} /> Satır
          </button>
          <button 
            onClick={addCol}
            className="p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 text-sm font-medium"
          >
            <Plus size={16} /> Sütun
          </button>
          <div className="w-px h-6 bg-zinc-200 dark:bg-slate-700 mx-2"></div>
          
          <button
            onClick={mockSaveToCloud}
            disabled={isCloudSaved}
            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1.5 text-sm"
          >
            {isCloudSaved ? <Loader2 size={16} className="animate-spin" /> : <Cloud size={16} />}
            Buluta Kaydet
          </button>
          <button
            onClick={downloadFile}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center gap-1.5 text-sm shadow-sm transition-colors"
          >
            <Download size={16} />
            İndir (XLSX)
          </button>
        </div>
      </header>

      {/* Spreadsheet Main Grid */}
      <main className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse bg-white dark:bg-[#0d0d24]">
            <thead>
              <tr>
                <th className="w-10 min-w-[40px] sticky top-0 left-0 z-20 bg-zinc-200 dark:bg-slate-800 border border-zinc-300 dark:border-slate-700"></th>
                {cols.map((col, i) => (
                  <th key={i} className="min-w-[100px] sticky top-0 z-10 bg-zinc-100 dark:bg-slate-800 border border-zinc-300 dark:border-slate-700 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, ri) => (
                <tr key={ri} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="w-10 sticky left-0 z-10 bg-zinc-100 dark:bg-slate-800 border border-zinc-300 dark:border-slate-700 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 py-1 select-none">
                    {ri + 1}
                  </td>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-zinc-200 dark:border-slate-700 p-0 relative">
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
      </main>
    </div>
  );
}
