import React, { useState, useRef } from 'react';
import { X, Download, Printer, Award, CheckCircle2, Sparkles, School, User, Lock, Loader2, Check } from 'lucide-react';
import { edesignShieldColor, edesignShieldWhite } from '../../data/brandingIcons';

/**
 * Standard minimal PDF generator (PDF-1.4 specifications)
 * Wraps a high-resolution JPEG buffer into an A4 landscape PDF document
 */
function createPdfFromJpeg(jpegBuffer, width, height) {
  const pageWidth = 841.89; // A4 landscape points (297mm)
  const pageHeight = 595.28; // A4 landscape points (210mm)
  
  const stream1 = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im1 Do\nQ\n`;
  
  let offsets = [];
  let pdf = '%PDF-1.4\n';
  
  function addObj(content) {
    const currentLen = typeof Buffer !== 'undefined' 
      ? Buffer.byteLength(pdf, 'latin1') 
      : new TextEncoder().encode(pdf).length;
    offsets.push(currentLen);
    pdf += `${offsets.length} 0 obj\n${content}\nendobj\n`;
  }
  
  addObj('<< /Type /Catalog /Pages 2 0 R >>');
  addObj('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>`);
  addObj(`<< /Length ${stream1.length} >>\nstream\n${stream1}endstream`);
  
  // Object 5: Image XObject
  const byteLen = typeof Buffer !== 'undefined' 
    ? Buffer.byteLength(pdf, 'latin1') 
    : new TextEncoder().encode(pdf).length;
  offsets.push(byteLen);
  
  const header = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBuffer.length} >>\nstream\n`;
  const footer = `\nendstream\nendobj\n`;
  
  const headerLen = typeof Buffer !== 'undefined' ? Buffer.byteLength(header, 'latin1') : new TextEncoder().encode(header).length;
  const footerLen = typeof Buffer !== 'undefined' ? Buffer.byteLength(footer, 'latin1') : new TextEncoder().encode(footer).length;
  const startXref = byteLen + headerLen + jpegBuffer.length + footerLen;
  
  let xref = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  
  const trailer = `trailer\n<< /Root 1 0 R /Size ${offsets.length + 1} >>\nstartxref\n${startXref}\n%%EOF`;
  
  const enc = new TextEncoder();
  const headerBytes = enc.encode(pdf + header);
  const footerBytes = enc.encode(footer + xref + trailer);
  
  const finalPdf = new Uint8Array(headerBytes.length + jpegBuffer.length + footerBytes.length);
  finalPdf.set(headerBytes, 0);
  finalPdf.set(jpegBuffer, headerBytes.length);
  finalPdf.set(footerBytes, headerBytes.length + jpegBuffer.length);
  
  return finalPdf;
}

export default function CertificateModal({ 
  onClose, 
  finalScore = 100, 
  studentProfile,
  initialStudentName,
  theme = 'dark'
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Registered student name is fixed and mandatory
  const studentName = (studentProfile?.name || initialStudentName || "محمود عز الدين").trim();
  const studentSchool = (studentProfile?.school || "مدرسة المنال الابتدائية").trim();
  const studentAvatar = studentProfile?.avatar || "🚀";
  
  // Deterministic certificate serial number
  const hash = Math.abs(studentName.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0));
  const certificateSerial = `ED-MATH5-2027-${hash.toString(16).toUpperCase().padStart(6, '0')}`;
  const issueDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  // Native print handler
  const handlePrint = () => {
    window.print();
  };

  // High-Resolution Canvas-to-PDF Generator
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setDownloadSuccess(false);

      // Create high-resolution 300 DPI A4 Landscape canvas (2000 x 1414 px)
      const width = 2000;
      const height = 1414;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Background gradient (Royal navy/dark slate luxury)
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#070b14');
      bgGradient.addColorStop(0.3, '#0d1527');
      bgGradient.addColorStop(0.7, '#0f1c36');
      bgGradient.addColorStop(1, '#070b14');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Faint Watermark Pattern
      ctx.save();
      ctx.globalAlpha = 0.03;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 240px Cairo, Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('eDesign', width / 2, height / 2 - 20);
      ctx.restore();

      // 3. Ornate Double Gold & Cyan Borders
      // Outer Gold border
      ctx.strokeStyle = '#E5A91B';
      ctx.lineWidth = 10;
      ctx.strokeRect(50, 50, width - 100, height - 100);

      // Inner thin gold border
      ctx.strokeStyle = 'rgba(229, 169, 27, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(70, 70, width - 140, height - 140);

      // Cyan accent border
      ctx.strokeStyle = '#39A9D0';
      ctx.lineWidth = 4;
      ctx.strokeRect(85, 85, width - 170, height - 170);

      // Corner Ornaments
      const drawCorner = (x, y, flipX, flipY) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(flipX, flipY);
        ctx.strokeStyle = '#E5A91B';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 45);
        ctx.lineTo(0, 0);
        ctx.lineTo(45, 0);
        ctx.stroke();

        ctx.strokeStyle = '#39A9D0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(10, 35);
        ctx.lineTo(10, 10);
        ctx.lineTo(35, 10);
        ctx.stroke();

        ctx.fillStyle = '#E5A91B';
        ctx.beginPath();
        ctx.arc(15, 15, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawCorner(95, 95, 1, 1);
      drawCorner(width - 95, 95, -1, 1);
      drawCorner(95, height - 95, 1, -1);
      drawCorner(width - 95, height - 95, -1, -1);

      // 4. Header Section
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';

      // Top accreditation line
      ctx.font = 'bold 24px Cairo, Segoe UI, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('جمهورية مصر العربية • وزارة التربية والتعليم والتعليم الفني • منهج الوزارة 2027', width / 2, 140);

      // Platform badge text
      ctx.font = '900 30px Cairo, Segoe UI, sans-serif';
      ctx.fillStyle = '#39A9D0';
      ctx.fillText('منصة eDesign MathVerse 5 التعليمية المعتمدة', width / 2, 190);

      // 5. Main Certificate Title
      ctx.font = 'bold 32px Cairo, Segoe UI, sans-serif';
      ctx.fillStyle = '#E5A91B';
      ctx.fillText('شهادة تفوق وإتقان رياضي معتمدة', width / 2, 280);

      // Giant Award Header
      ctx.font = '900 68px Cairo, Segoe UI, sans-serif';
      const titleGrad = ctx.createLinearGradient(width / 2 - 300, 0, width / 2 + 300, 0);
      titleGrad.addColorStop(0, '#F6D365');
      titleGrad.addColorStop(0.5, '#E5A91B');
      titleGrad.addColorStop(1, '#FDA085');
      ctx.fillStyle = titleGrad;
      ctx.fillText('وسام العبقري في الرياضيات 🎖️', width / 2, 365);

      // 6. Presentation Line
      ctx.font = 'bold 28px Cairo, Segoe UI, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('تمنح وكالة eDesign بكل فخر واعتزاز هذا الوسام للبطل / الطالب المتميز:', width / 2, 470);

      // 7. Student Name (Big, prominent gold typography)
      ctx.font = '900 76px Cairo, Segoe UI, sans-serif';
      ctx.fillStyle = '#E5A91B';
      ctx.shadowColor = 'rgba(57, 169, 208, 0.4)';
      ctx.shadowBlur = 20;
      ctx.fillText(studentName, width / 2, 570);
      ctx.shadowBlur = 0; // reset

      // Wavy underline for student name
      ctx.strokeStyle = '#39A9D0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const waveWidth = 460;
      const startX = width / 2 - waveWidth / 2;
      for (let x = 0; x <= waveWidth; x += 10) {
        const y = 600 + Math.sin(x * 0.08) * 4;
        if (x === 0) ctx.moveTo(startX + x, y);
        else ctx.lineTo(startX + x, y);
      }
      ctx.stroke();

      // 8. School Info
      ctx.font = 'bold 30px Cairo, Segoe UI, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`المقيد بمدرسة: ${studentSchool} • الصف الخامس الابتدائي`, width / 2, 665);

      // 9. Commendation Paragraph
      ctx.font = '500 27px Cairo, Segoe UI, sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('تقديراً لاجتيازه بنجاح وتفوق استثنائي كافة وحدات ومحطات منهج الرياضيات للصف الخامس الابتدائي (الفصل الدراسي الأول)', width / 2, 755);
      ctx.fillText('والمبني بالكامل وفقاً لمنهج الوزارة 2027، وإتمامه اختبارات المراحل والاختبار الشامل النهائي بنسبة إتقان بلغت:', width / 2, 805);

      // 10. Score Pill Badge
      const pillW = 560;
      const pillH = 85;
      const pillX = width / 2 - pillW / 2;
      const pillY = 880;

      // Pill Background
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 42);
      ctx.fill();
      ctx.stroke();

      // Pill Text
      ctx.font = '900 40px Cairo, Segoe UI, sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`${finalScore}% ممتاز مع مرتبة الشرف 🏆`, width / 2, pillY + 58);

      // 11. Official Golden Verified Stamp (Left side)
      const sealX = 300;
      const sealY = 1100;
      
      // Outer scalloped/dashed circle
      ctx.strokeStyle = '#E5A91B';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(sealX, sealY, 75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Inner solid circle
      ctx.strokeStyle = '#39A9D0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 65, 0, Math.PI * 2);
      ctx.stroke();

      // Seal text
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#E5A91B';
      ctx.fillText('eDesign Agency', sealX, sealY - 22);
      ctx.font = '900 18px sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.fillText('★ VERIFIED ★', sealX, sealY + 6);
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#E5A91B';
      ctx.fillText('OFFICIAL 2027', sealX, sealY + 30);

      // 12. Signatures (Right & Center)
      // Right: Academic Supervisor
      const sig1X = width - 350;
      const sigY = 1100;
      ctx.font = 'bold 22px Cairo, Segoe UI, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('المشرف العام لمنهج الرياضيات', sig1X, sigY - 25);
      ctx.font = '900 26px Cairo, Segoe UI, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('أستاذ الرياضيات Silma AI 🎙️', sig1X, sigY + 15);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sig1X - 140, sigY + 35);
      ctx.lineTo(sig1X + 140, sigY + 35);
      ctx.stroke();

      // Center: Platform Serial & Security
      ctx.font = 'bold 20px Cairo, Segoe UI, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`الرقم التسلسلي المعتمد: ${certificateSerial}`, width / 2, 1160);
      ctx.fillText(`تاريخ الاعتماد: ${issueDate} • اعتماد رقمي غير قابل للتزوير`, width / 2, 1195);

      // 13. Convert canvas to JPEG buffer and build PDF
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Canvas blob generation failed');
        }

        const arrayBuffer = await blob.arrayBuffer();
        const jpegBytes = new Uint8Array(arrayBuffer);
        const pdfBytes = createPdfFromJpeg(jpegBytes, width, height);

        // Trigger browser download
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const downloadUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `شهادة_تفوق_الرياضيات_${studentName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        setIsGeneratingPdf(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      }, 'image/jpeg', 0.95);

    } catch (err) {
      console.error('Error generating PDF:', err);
      setIsGeneratingPdf(false);
      // Fallback to window.print if canvas fails
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
      <div 
        className="max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-3xl p-4 sm:p-6 md:p-7 shadow-2xl relative space-y-4 sm:space-y-5 text-right transition-colors my-auto"
        dir="rtl"
      >
        
        {/* Top Control Bar: Title + Prominent Action Buttons + High Visibility Close Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          
          {/* Header Title with Official Medal */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-[#E5A91B] flex items-center justify-center shrink-0 shadow-glow-gold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>شهادة إتقان المنهج المعتمدة</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  موثقة 2027 📜
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                الصف الخامس الابتدائي • الفصل الدراسي الأول • منهج الوزارة 2027
              </p>
            </div>
          </div>

          {/* Action Buttons & Visible Close Button */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Download PDF Button (Main Action) */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#39A9D0] to-cyan-500 hover:from-cyan-400 hover:to-[#39A9D0] text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-glow-primary active:scale-95 transition disabled:opacity-60"
              title="تنزيل الشهادة بصيغة PDF عالية الدقة جاهزة للطباعة"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التجهيز...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3] text-slate-950" />
                  <span>تم التنزيل بنجاح! 🎉</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>تنزيل الشهادة (PDF)</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="طباعة ورقية فورية للشهادة"
            >
              <Printer className="w-4 h-4 text-[#E5A91B]" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            {/* Close Button - Highly visible, prominent styling */}
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-white/20 shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
              title="إغلاق نافذة الشهادة"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

          </div>
        </div>

        {/* Security & Student Accreditation Pill (Non-editable) */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">{studentAvatar}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              اسم الطالب المعتمد رسمياً: <strong className="text-[#E5A91B] font-black text-sm">{studentName}</strong>
            </span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-600 dark:text-slate-400">
              {studentSchool}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-full">
            <Lock className="w-3 h-3 text-[#E5A91B]" />
            <span>الاسم معتمد ومقفل رسمياً في الشهادة</span>
          </div>
        </div>

        {/* The Certificate Canvas Design (Printable Area on Screen) */}
        <div className="overflow-x-auto no-scrollbar py-1">
          <div 
            id="certificate-print-area"
            className="min-w-[680px] sm:min-w-0 w-full relative p-6 sm:p-10 md:p-12 rounded-3xl bg-gradient-to-br from-[#070b14] via-[#0d1527] to-[#070b14] border-4 border-[#E5A91B] text-center space-y-4 sm:space-y-6 shadow-2xl overflow-hidden"
          >
            {/* Background watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
              <span className="text-[100px] sm:text-[140px] font-black font-math text-white">eDesign</span>
            </div>

            {/* Inner Gold & Cyan Accent Borders */}
            <div className="absolute inset-2 sm:inset-3 border border-amber-500/30 rounded-[22px] pointer-events-none"></div>
            <div className="absolute inset-3.5 sm:inset-5 border-2 border-[#39A9D0]/40 rounded-2xl pointer-events-none"></div>

            {/* Top Brand & Emblem Lockup */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4 relative z-10" dir="ltr">
              <div className="flex items-center gap-2.5">
                <img 
                  src={edesignShieldColor} 
                  alt="eDesign Shield Logo" 
                  className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
                />
                <span className="text-white font-black text-xs sm:text-sm font-math tracking-wide">
                  e<span className="text-[#39A9D0]">Design</span> Agency
                </span>
              </div>

              <div className="flex items-center gap-2 text-right" dir="rtl">
                <span className="text-[10px] sm:text-xs font-bold text-[#E5A91B] bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                  منصة MathVerse 5 التعليمية المعتمدة
                </span>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="space-y-1 relative z-10">
              <span className="text-[11px] sm:text-xs font-black text-[#39A9D0] tracking-widest uppercase block">
                شهادة تفوق وإتقان رياضي معتمدة
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#E5A91B] to-amber-400 tracking-wide drop-shadow-md">
                وسام العبقري في الرياضيات 🎖️
              </h2>
            </div>

            {/* Recipient Details */}
            <div className="py-1 sm:py-2 space-y-1.5 sm:space-y-2 relative z-10">
              <p className="text-xs sm:text-sm text-slate-300">
                تمنح وكالة eDesign بكل فخر واعتزاز هذا الوسام للبطل / الطالب المتميز:
              </p>
              
              {/* Mandatory Registered Student Name (High Prominence) */}
              <div className="text-2xl sm:text-4xl md:text-5xl font-black text-[#E5A91B] tracking-wide py-1 drop-shadow-lg underline decoration-[#39A9D0] decoration-wavy underline-offset-8">
                {studentName}
              </div>

              <p className="text-xs sm:text-sm font-bold text-[#39A9D0] pt-1">
                المقيد بمدرسة: {studentSchool} • الصف الخامس الابتدائي
              </p>
            </div>

            {/* Accreditation statement */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed relative z-10">
              تقديراً لاجتيازه بنجاح وتفوق باهر كافة وحدات ومحطات منهج الرياضيات للصف الخامس الابتدائي (الفصل الدراسي الأول) والمبني بالكامل وفقاً لـ <strong className="text-white">منهج الوزارة 2027</strong>، وإتمامه اختبارات المراحل والاختبار الشامل النهائي بنسبة إتقان بلغت:
            </p>

            {/* Score Badge & Verified Seal */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 py-2 relative z-10 flex-wrap">
              
              {/* Score Badge */}
              <div className="px-6 py-2.5 sm:py-3 rounded-2xl bg-slate-950/90 border-2 border-emerald-500/50 text-emerald-400 font-math font-black text-xl sm:text-3xl shadow-glow-primary flex items-center gap-2">
                <span>{finalScore}%</span>
                <span className="text-xs sm:text-sm font-sans font-bold text-emerald-300">ممتاز مع مرتبة الشرف 🏆</span>
              </div>

              {/* Official Verified Gold Seal */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-[#E5A91B] flex flex-col items-center justify-center text-[8px] sm:text-[10px] font-bold text-[#E5A91B] uppercase tracking-tighter shadow-glow-gold bg-amber-500/10">
                <span className="font-extrabold text-[9px] sm:text-[11px]">eDesign</span>
                <span className="text-[7px] sm:text-[9px] text-emerald-400 font-black">★ VERIFIED ★</span>
                <span className="text-[8px] sm:text-[10px]">2027</span>
              </div>

            </div>

            {/* Footer Signatures and Verification Meta */}
            <div className="pt-4 sm:pt-6 border-t border-white/10 flex flex-wrap justify-between items-center text-[10px] sm:text-xs text-slate-400 gap-2 relative z-10">
              <div className="text-right">
                <span className="block font-bold text-slate-300">أستاذ الرياضيات Silma AI 🎙️</span>
                <span className="text-[9px] text-slate-500">المشرف العام لمنهج الرياضيات</span>
              </div>

              <div className="text-center">
                <span className="block font-mono text-[10px] text-cyan-400">{certificateSerial}</span>
                <span className="text-[9px] text-slate-500">رقم الاعتماد الرقمي الموثق</span>
              </div>

              <div className="text-left">
                <span className="block font-bold text-slate-300">وكالة eDesign للتعليم التفاعلي</span>
                <span className="text-[9px] text-slate-500">تاريخ الإصدار: {issueDate}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer: Quick actions on mobile */}
        <div className="flex sm:hidden items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>إغلاق النافذة</span>
          </button>
        </div>

      </div>
    </div>
  );
}
