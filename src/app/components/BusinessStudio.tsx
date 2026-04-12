"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Trash2, LineChart, CheckCircle } from 'lucide-react';

const BIZ_TOOLS: Record<string, { title: string; desc: string }> = {
  'biz-compound': { title: "Bileşik Faiz", desc: "Aylık katkılarla bileşik getiriyi hesaplayın." },
  'biz-loan': { title: "Kredi Hesaplayıcı", desc: "Aylık ödeme ve toplam faizi görün." },
  'biz-tip': { title: "Bahşiş Hesaplayıcı", desc: "Hesabı ve bahşişi kişi başı bölün." },
  'biz-percentage': { title: "Yüzde Hesaplama", desc: "X'in yüzde Y'si kaçtır?" },
  'biz-discount': { title: "İndirim Hesaplama", desc: "İndirim sonrası nihai fiyatı görün." },
  'biz-margin': { title: "Kar Marjı", desc: "Maliyet üzerinden satış kar marjı." },
  'biz-roi': { title: "ROI Hesaplayıcı", desc: "Yatırım Getirisi hesaplaması." },
  'biz-salary': { title: "Maaş Hesaplayıcı", desc: "Brüt, net ve saatlik kazanç oranları." },
  'biz-savings': { title: "Tasarruf Hedefi", desc: "Hedefinize ulaşmak için ne kadar ayırmalısınız?" },
  'biz-inflation': { title: "Enflasyon", desc: "Paranızın zaman içindeki alım gücü." },
  'biz-mortgage': { title: "İpotek", desc: "Ev kredisi ödemelerini planlayın." },
  'biz-currency': { title: "Para Birimi", desc: "Anlık döviz kurları ve çevirici." },
  'biz-paycheck': { title: "Maaş Çeki", desc: "Vergi sonrası net ödeme tutarı." },
  'biz-emi': { title: "EMI Hesaplayıcı", desc: "Eşit Aylık Taksit." },
  'biz-sip': { title: "SIP", desc: "Sistematik Yatırım tahmini." },
  'biz-debt': { title: "Borç Ödeme", desc: "Borç kapatma çizelgesi." },
  'biz-budget': { title: "Bütçe", desc: "Gelir gider oranları." },
  'biz-networth': { title: "Net Değer", desc: "Varlıklar - Yükümlülükler." },
  'biz-retirement': { title: "Emeklilik", desc: "Erken emeklilik planı." },
  'biz-investment': { title: "Yatırım", desc: "Gelecek planlaması." },
  'biz-vat': { title: "KDV Hesaplayıcı", desc: "KDV Dahil / Hariç." },
  'biz-creditcard': { title: "Kredi Kartı", desc: "Kart ödeme planı." },
  'biz-auto': { title: "Otomobil Kredisi", desc: "Araç kredisi taksitleri." },
  'biz-crypto': { title: "Kripto Kar", desc: "İşlem bazlı kripto kazancı." },
  'biz-breakeven': { title: "Başabaş", desc: "Zarardan kara geçiş noktası." },
  'biz-cpm': { title: "CPM", desc: "Bin Gösterim Başına Maliyet." },
  'biz-cagr': { title: "CAGR", desc: "Bileşik Yıllık Büyüme Oranı." },
  'biz-tvm': { title: "TVM", desc: "Paranın Zaman Değeri." },
  'biz-rentvsbuy': { title: "Kiralama vs Satın Alma", desc: "Ev almak mı, kiralamak mı?" }
};

export default function BusinessStudio({ onBack, initialToolId }: { onBack: () => void; initialToolId: string }) {
  const tool = BIZ_TOOLS[initialToolId] || BIZ_TOOLS['biz-compound'];
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [val3, setVal3] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    try {
      const v1 = parseFloat(val1);
      const v2 = parseFloat(val2);
      const v3 = parseFloat(val3);

      if (initialToolId === 'biz-percentage') {
         if (val1 && val2) setOutput(`${v1}'in %${v2}'si = ${(v1 * v2 / 100).toFixed(2)}\\n${v1}, ${v2}'nin yüzdesi = %${((v1 / v2) * 100).toFixed(2)}\\nDeğişim: %${(((v2 - v1)/v1)*100).toFixed(2)}`);
         else setOutput("");
      } else if (initialToolId === 'biz-discount') {
         if (val1 && val2) setOutput(`Orijinal: ${v1}\\nİndirim: %${v2}\\nTasarruf: ${(v1 * (v2/100)).toFixed(2)}\\n\\nYeni Fiyat: ${(v1 - (v1 * (v2/100))).toFixed(2)}`);
         else setOutput("");
      } else if (initialToolId === 'biz-vat') {
         if (val1 && val2) setOutput(`KDV Dahil Edilirse: ${(v1 * (1 + v2/100)).toFixed(2)}\\nKDV Çıkarılırsa: ${(v1 / (1 + v2/100)).toFixed(2)}\\n(Uygulanan Oran: %${v2})`);
         else setOutput("");
      } else if (initialToolId === 'biz-margin') {
         if (val1 && val2) setOutput(`Maliyet: ${v1}\\nSatış: ${v2}\\n\\nBrüt Kar: ${(v2 - v1).toFixed(2)}\\nKar Marjı: %${(((v2 - v1) / v2) * 100).toFixed(2)}\\nMarkup: %${(((v2 - v1) / v1) * 100).toFixed(2)}`);
         else setOutput("");
      } else if (initialToolId === 'biz-roi') {
         if (val1 && val2) setOutput(`Geçerli Değer: ${v1}\\nYatırım Maliyeti: ${v2}\\n\\nNet Kar: ${(v1 - v2).toFixed(2)}\\nROI (Getiri Oranı): %${(((v1 - v2) / v2) * 100).toFixed(2)}`);
         else setOutput("");
      } else if (initialToolId === 'biz-compound') {
         if (val1 && val2 && val3) {
            const P = v1;
            const r = v2 / 100;
            const t = v3;
            const A = P * Math.pow(1 + (r / 12), 12 * t);
            setOutput(`Ana Para: ${P}\\nYıllık Faiz: %${v2}\\nSüre: ${t} Yıl\\n\\nToplam Değer: ${A.toFixed(2)}\\nKazanılan Saf Faiz: ${(A - P).toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-loan') {
         if (val1 && val2 && val3) {
            const P = v1;
            const r = (v2 / 100) / 12;
            const n = v3; // Ay sayısı
            if (r === 0) setOutput(`Aylık Ödeme: ${(P/n).toFixed(2)}\\nToplam: ${P}`);
            else {
               const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
               setOutput(`Aylık Ödeme (Taksit): ${M.toFixed(2)}\\nToplam Geri Ödeme: ${(M * n).toFixed(2)}\\nToplam Ödenen Faiz: ${(M * n - P).toFixed(2)}`);
            }
         } else setOutput("");
      } else if (initialToolId === 'biz-tip') {
         if (val1 && val2 && val3) {
            const tip = v1 * (v2 / 100);
            const total = v1 + tip;
            setOutput(`Hesap Tutarı: ${v1}\\nToplam Bahşiş: ${tip.toFixed(2)}\\nYekün Hesap: ${total.toFixed(2)}\\n\\nKişi Başı Düşen: ${(total / v3).toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-salary') {
         if (val1) {
            const y = v1;
            const a = y / 12;
            const h = y / (52 * 40);
            setOutput(`Yıllık Brüt: ${y.toFixed(2)}\\nAylık Brüt: ${a.toFixed(2)}\\nSaatlik (40 Saat/Hft): ${h.toFixed(2)}\\n\\n(Tahmini %20 Net Vergi Kesintisi Sonrası)\\nAylık Net: ${(a * 0.8).toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-savings') {
         if (val1 && val2 && val3) {
            const goal = v1;
            const current = v2;
            const monthly = v3;
            if (goal <= current) setOutput("Hedefinize zaten ulaştınız!");
            else {
               const months = (goal - current) / monthly;
               setOutput(`Kalan Miktar: ${(goal - current).toFixed(2)}\\nHedefe Ulaşma Süresi: ${Math.ceil(months)} Ay (${(months/12).toFixed(1)} Yıl)`);
            }
         } else setOutput("");
      } else if (initialToolId === 'biz-inflation') {
         if (val1 && val2 && val3) {
            const fv = v1 * Math.pow(1 + (v2/100), v3);
            setOutput(`Bugünkü Para: ${v1}\\n${v3} Yıl Sonraki Gerekli Para: ${fv.toFixed(2)}\\n(Alım gücünü korumak için ${v2}% enflasyonla)`);
         } else setOutput("");
      } else if (initialToolId === 'biz-mortgage' || initialToolId === 'biz-auto') {
         if (val1 && val2 && val3) {
            const P = v1 - v2;
            const r = (initialToolId === 'biz-auto' ? (v3 === 0 ? 0.05 : 0.05) : 0.05) / 12; // defaulting to 5% if unspecified
            const rate = 0.05; // simplified
            const r_monthly = rate / 12;
            const n = v3;
            const M = P * (r_monthly * Math.pow(1 + r_monthly, n)) / (Math.pow(1 + r_monthly, n) - 1);
            setOutput(`Net Kredi Tutarı: ${P.toFixed(2)}\\nAylık Taksit (Ort %5 Faizle): ${M.toFixed(2)}\\nToplam Ödeme: ${(M * n).toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-currency') {
         if (val1 && val2) setOutput(`Dönüştürülen Miktar: ${(v1 * v2).toFixed(2)}\\n(Kur oranı ${v2} üzerinden varsayıldı)`);
         else setOutput("");
      } else if (initialToolId === 'biz-paycheck') {
         if (val1 && val2) setOutput(`Brüt Maaş: ${v1}\\nVergi Kesintisi: %${v2} (${(v1 * (v2/100)).toFixed(2)})\\n\\nNET ÖDEME: ${(v1 - (v1 * (v2/100))).toFixed(2)}`);
         else setOutput("");
      } else if (initialToolId === 'biz-emi') {
         if (val1 && val2 && val3) {
            const r = (v2 / 100) / 12;
            const n = v3;
            if (r === 0) setOutput(`Aylık EMI: ${(v1/n).toFixed(2)}`);
            else {
               const emit = v1 * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1);
               setOutput(`Aylık EMI: ${emit.toFixed(2)}\\nToplam Faiz: ${(emit*n - v1).toFixed(2)}\\nToplam Ödeme: ${(emit*n).toFixed(2)}`);
            }
         } else setOutput("");
      } else if (initialToolId === 'biz-sip') {
         if (val1 && val2 && val3) {
            const i = (v2/100) / 12;
            const n = v3 * 12;
            const FV = v1 * ((Math.pow(1+i, n) - 1)/i) * (1+i);
            setOutput(`Toplam Yatırım: ${(v1 * n).toFixed(2)}\\nBeklenen Kazanç: ${(FV - (v1*n)).toFixed(2)}\\n\\nTOPLAM DEĞER (Vade Sonu): ${FV.toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-debt') {
         if (val1 && val2) setOutput(`Toplam Borç: ${v1}\\nAylık Ödeme: ${v2}\\n\\nBorcun Bitme Süresi: ${Math.ceil(v1/v2)} Ay (${(v1/v2/12).toFixed(1)} Yıl)`);
         else setOutput("");
      } else if (initialToolId === 'biz-budget') {
         if (val1 && val2) {
             const rem = v1 - v2;
             setOutput(`Gelir: ${v1}\\nGider: ${v2}\\n\\nDurum: ${rem >= 0 ? 'Pozitif (Tasarruf)' : 'Negatif (Açık)'}\\nNet: ${rem.toFixed(2)}\\nÖnerilen Kural (50/30/20):\\n- İhtiyaç Vadesi: ${(v1*0.5).toFixed(2)}\\n- İstekler: ${(v1*0.3).toFixed(2)}\\n- Birikim: ${(v1*0.2).toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-networth') {
         if (val1 && val2) setOutput(`Toplam Varlıklar (Ev, Araç, Nakit): ${v1}\\nToplam Yükümlülük (Kredi, Borç): ${v2}\\n\\nNET SERVET: ${(v1 - v2).toFixed(2)}`);
         else setOutput("");
      } else if (initialToolId === 'biz-retirement') {
         if (val1 && val2 && val3) {
            const yearsLeft = v2 - v1;
            const req = v3 / (yearsLeft * 12);
            setOutput(`Emekliliğe Kalan Süre: ${yearsLeft} Yıl\\nHedef Birikim: ${v3}\\n\\nHedefe Ulaşmak İçin Tavsiye Edilen Aylık Tasarruf (Faizsiz): ${req.toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-investment') {
          if (val1 && val2 && val3) {
            const r = v3/100/12;
            const n = 12 * 10; // default 10 years
            const principalArr = v1 * Math.pow(1+r, n);
            const monthlyArr = v2 * ((Math.pow(1+r, n) - 1)/r) * (1+r);
            setOutput(`10 Yıl Sonraki Toplam Yatırım Değeriniz: ${(principalArr + monthlyArr).toFixed(2)}\\n(Mevcudun Büyümesi: ${principalArr.toFixed(2)} | Düzenli Katkı: ${monthlyArr.toFixed(2)})`);
          } else setOutput("");
      } else if (initialToolId === 'biz-creditcard') {
         if (val1 && val2 && val3) {
             const r = v2/100/12;
             if (v3 <= v1 * r) setOutput("Uyarı: Aylık ödemeniz sadece aylık faizin altındadır, borcunuz asla bitmez!");
             else {
                const months = -(Math.log(1 - (v1 * r) / v3) / Math.log(1 + r));
                setOutput(`Borcun Kapanma Süresi: ${Math.ceil(months)} Ay\\nToplam Ödenecek Faiz: ${((v3 * Math.ceil(months)) - v1).toFixed(2)}`);
             }
         } else setOutput("");
      } else if (initialToolId === 'biz-crypto') {
         if (val1 && val2 && val3) {
            const cost = v1 * v3;
            const revenue = v2 * v3;
            const profit = revenue - cost;
            setOutput(`Alış Maliyeti: ${cost.toFixed(2)}\\nSatış Getirisi: ${revenue.toFixed(2)}\\n\\nNet ${profit >= 0 ? 'Kar' : 'Zarar'}: ${profit.toFixed(2)}\\nMarj: %${(((v2-v1)/v1)*100).toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-breakeven') {
         if (val1 && val2 && val3) {
            const bep = v1 / (v2 - v3);
            setOutput(`Sabit Giderler: ${v1}\\nBirim Başına Net Kar Marjı: ${(v2-v3).toFixed(2)}\\n\\nBaşabaş Noktası (Break-Even): Satılması Gereken ${Math.ceil(bep)} Adet Birim`);
         } else setOutput("");
      } else if (initialToolId === 'biz-cpm') {
         if (val1 && val2) setOutput(`Toplam Reklam Maliyeti: ${v1}\\nToplam Gösterim: ${v2}\\n\\nCPM (Bin Gösterim Maliyeti): ${((v1/v2)*1000).toFixed(2)}`);
         else setOutput("");
      } else if (initialToolId === 'biz-cagr') {
         if (val1 && val2 && val3) {
            const cagr = (Math.pow(v2/v1, 1/v3) - 1) * 100;
            setOutput(`Başlangıç Başkent: ${v1}\\nBitiş Sermayesi: ${v2}\\nYıl: ${v3}\\n\\nBileşik Yıllık Büyüme Oranı (CAGR): %${cagr.toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-tvm') {
         if (val1 && val2 && val3) {
            const fv = v1 * Math.pow(1 + (v2/100), v3);
            setOutput(`Bugünkü Değer (PV): ${v1}\\nPeriyot: ${v3}\\nFaiz Oranı: %${v2}\\n\\nGelecekteki Değer (FV): ${fv.toFixed(2)}`);
         } else setOutput("");
      } else if (initialToolId === 'biz-rentvsbuy') {
         if (val1 && val2) setOutput(`Aylık Kira: ${v1}\\nKira Yıllık Gideri: ${v1*12}\\n\\nEv Fiyatı: ${v2}\\nPeşinat (%20): ${(v2*0.2).toFixed(2)}\\nEv almak için Kredi Taksidi Ortalama (Aylık): ${(((v2*0.8)*0.05/12) + (v2*0.8/120)).toFixed(2)}\\n\\nTahmin: Genellikle 5+ yıl yaşayacaksanız Satın Alma (Buy) avantajlıdır.`);
         else setOutput("");
      } else {
         setOutput(`Sistem bu işlemi hesaplamaya hazır! Lütfen verileri giriniz.\\n(${tool.desc})\\n\\nGelecek yamada tamamen interaktif bir yapıya kavuşacak.`);
      }
    } catch (e: any) {
      setOutput(`Hata: Girdi formatı sayısal olmalıdır.`);
    }
  }, [val1, val2, val3, initialToolId]);

  const getLabels = () => {
     switch (initialToolId) {
        case 'biz-compound': return ['Başlangıç Sermayesi', 'Yıllık Faiz Oranı (%)', 'Süre (Yıl)'];
        case 'biz-loan': return ['Kredi Ana Para Tutarı', 'Yıllık Faiz Oranı (%)', 'Taksit Sayısı (Ay)'];
        case 'biz-tip': return ['Adisyon Tutarı', 'Bahşiş Oranı (%)', 'Kişi Sayısı'];
        case 'biz-percentage': return ['Sayı (Ana Miktar)', 'Yüzde Oranı (%)', null];
        case 'biz-discount': return ['Orijinal Fiyat', 'İndirim Oranı (%)', null];
        case 'biz-margin': return ['Maliyet (Alış Fiyatı)', 'Satış Fiyatı', null];
        case 'biz-roi': return ['Cari/Nihai Değer', 'İlk Yatırım Maliyeti', null];
        case 'biz-salary': return ['Yıllık Brüt Maaş', null, null];
        case 'biz-savings': return ['Hedeflenen Tasarruf Tutarı', 'Mevcut Birikim', 'Aylık Katkı Payı'];
        case 'biz-inflation': return ['Mevcut Tutar', 'Yıllık Enflasyon Oranı (%)', 'Geçirilecek Yıl'];
        case 'biz-mortgage': return ['Ev Fiyatı', 'Peşinat', 'Kredi Vadesi (Ay)'];
        case 'biz-currency': return ['Dönüştürülecek Tutar', 'Döviz Kuru (Örn: 32.5)', null];
        case 'biz-paycheck': return ['Brüt Maaş Tutarı', 'Vergi ve Kesinti Oranı (%)', null];
        case 'biz-emi': return ['Kredi Miktarı', 'Yıllık Faiz Oranı (%)', 'Vade (Ay)'];
        case 'biz-sip': return ['Aylık Düzenli Yatırım (SIP)', 'Beklenen Yıllık Getiri (%)', 'Yatırım Süresi (Yıl)'];
        case 'biz-debt': return ['Toplam Borç Tutarı', 'Ödeyebileceğiniz Aylık Tutar', null];
        case 'biz-budget': return ['Aylık Toplam Gelir', 'Aylık Toplam Gider', null];
        case 'biz-networth': return ['Toplam Varlıklar (Var)', 'Toplam Yükümlülük (Borç)', null];
        case 'biz-retirement': return ['Mevcut Yaşınız', 'Emeklilik Yaşı', 'Hedeflenen Servet'];
        case 'biz-investment': return ['Başlangıç Yatırımı', 'Aylık Eklenen Tutar', 'Yabancı Getiri Oranı (%)'];
        case 'biz-vat': return ['Net veya Brüt Tutar', 'KDV Oranı (%)', null];
        case 'biz-creditcard': return ['Kredi Kartı Mevcut Borcu', 'Aylık Akdi Faiz (%)', 'Ödemeyi Planladığınız Tutar'];
        case 'biz-auto': return ['Araç Fiyatı', 'Peşinat Tutarı', 'Kredi Vadesi (Ay)'];
        case 'biz-crypto': return ['Kripto Alış Fiyatı', 'Kripto Satış Fiyatı', 'Satın Alınan Miktar'];
        case 'biz-breakeven': return ['Aylık Sabit Giderler', 'Ürün Satış Fiyatı', 'Ürün Başına Maliyet'];
        case 'biz-cpm': return ['Toplam Reklam Harcaması', 'Toplam Gösterim Sayısı', null];
        case 'biz-cagr': return ['Başlangıç Değeri (İlk Yıl)', 'Bitiş Değeri (Son Yıl)', 'Geçen Süre (Yıl)'];
        case 'biz-tvm': return ['Bugünkü Değer (PV)', 'Faiz Oranı (R)', 'Dönem Sayısı (N)'];
        case 'biz-rentvsbuy': return ['Aylık Ortalama Kira', 'Satın Alınacak Evin Fiyatı', null];
        default: return ['Değer 1', 'Değer 2', 'Değer 3'];
     }
  };

  const labels = getLabels();

  return (
    <div className="min-h-screen bg-[#020202] text-slate-200 font-sans flex flex-col">
      <header className="h-16 border-b border-white/5 bg-black/80 backdrop-blur-xl flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white">
            <LineChart size={16} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">{tool.title}</h1>
            <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">{tool.desc}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-start mt-10">
        <div className="bg-[#0a0a0c] rounded-3xl p-8 border border-blue-500/10 shadow-2xl shadow-blue-500/5">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-sm uppercase font-black text-slate-400 tracking-wider">Veri Girişi</h2>
             <button onClick={() => { setVal1(""); setVal2(""); setVal3(""); }} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                <Trash2 size={16} />
             </button>
          </div>

          <div className="flex flex-col gap-6">
             <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-blue-400 ml-1">{labels[0]}</label>
                <input type="number" 
                  className="bg-black/60 border border-white/5 rounded-xl p-4 text-white font-mono outline-none focus:border-blue-500/50 transition-all focus:bg-blue-500/5 text-lg"
                  placeholder="0.00" value={val1} onChange={e => setVal1(e.target.value)} />
             </div>
             {labels[1] && (
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-blue-400 ml-1">{labels[1]}</label>
                  <input type="number" 
                    className="bg-black/60 border border-white/5 rounded-xl p-4 text-white font-mono outline-none focus:border-blue-500/50 transition-all focus:bg-blue-500/5 text-lg"
                    placeholder="0.00" value={val2} onChange={e => setVal2(e.target.value)} />
               </div>
             )}
             {labels[2] && (
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-blue-400 ml-1">{labels[2]}</label>
                  <input type="number" 
                    className="bg-black/60 border border-white/5 rounded-xl p-4 text-white font-mono outline-none focus:border-blue-500/50 transition-all focus:bg-blue-500/5 text-lg"
                    placeholder="0.00" value={val3} onChange={e => setVal3(e.target.value)} />
               </div>
             )}
          </div>
        </div>

        <div className="bg-[#0a0a0c] rounded-3xl p-8 border border-blue-500/10 shadow-2xl flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-sm uppercase font-black text-slate-400 tracking-wider">Hesaplama Sonucu</h2>
             <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-bold transition-all">
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />} {copied ? 'Kopyalandı' : 'Kopyala'}
             </button>
          </div>
          <div className="flex-1 w-full bg-blue-950/10 border border-blue-500/20 rounded-2xl p-6 text-blue-300 font-mono text-lg overflow-auto whitespace-pre-wrap leading-relaxed flex items-center justify-center text-center">
            {output ? (
              <div className="w-full text-left font-bold text-2xl tracking-wide">{output}</div>
            ) : (
              <span className="text-slate-600 italic text-base">Sonuç parametrelere göre anında şekillenecek...</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
