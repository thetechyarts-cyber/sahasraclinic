'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface MedicineEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionData {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  medicines: MedicineEntry[];
  notes: string;
}

export function PrescriptionPdf({ data }: { data: PrescriptionData }) {
  const printRef = useRef<HTMLDivElement>(null);

  const downloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    // Save original styles
    const originalDisplay = element.style.display;
    
    // Make visible for html2canvas
    element.style.display = 'block';
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Prescription_${data.patientName.replace(/\s+/g, '_')}_${data.date}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
      alert('Failed to generate PDF');
    } finally {
      // Hide again
      element.style.display = originalDisplay;
    }
  };

  return (
    <>
      <button 
        onClick={downloadPdf}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400">
        Download PDF
      </button>

      {/* Hidden printable area */}
      <div className="absolute left-[-9999px] top-0 w-[800px] bg-white p-12 text-black" ref={printRef} style={{ display: 'none' }}>
        <div className="border-b-2 border-emerald-600 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-emerald-600">Health Clinic</h1>
            <p className="text-gray-500 mt-1">123 Health Ave, Medical District</p>
            <p className="text-gray-500">Phone: +91 98765 43210</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">Dr. {data.doctorName}</h2>
            <p className="text-gray-500 mt-1">MBBS, MD</p>
          </div>
        </div>

        <div className="flex justify-between text-sm mb-12">
          <div>
            <span className="font-bold text-gray-700">Patient Name:</span> {data.patientName}
          </div>
          <div>
            <span className="font-bold text-gray-700">Date:</span> {new Date(data.date).toLocaleDateString()}
          </div>
        </div>

        <div className="text-4xl font-serif text-gray-800 mb-6 flex items-center">
          <span className="text-emerald-600 mr-2 text-5xl">℞</span>
        </div>

        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 text-gray-600 font-semibold w-1/3">Medicine</th>
                <th className="py-3 text-gray-600 font-semibold">Dosage</th>
                <th className="py-3 text-gray-600 font-semibold">Frequency</th>
                <th className="py-3 text-gray-600 font-semibold">Duration</th>
                <th className="py-3 text-gray-600 font-semibold w-1/4">Instructions</th>
              </tr>
            </thead>
            <tbody>
              {data.medicines.map((med, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-4 font-bold text-gray-800">{med.name}</td>
                  <td className="py-4 text-gray-600">{med.dosage}</td>
                  <td className="py-4 text-gray-600">{med.frequency}</td>
                  <td className="py-4 text-gray-600">{med.duration}</td>
                  <td className="py-4 text-gray-600 italic text-sm">{med.instructions || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.notes && (
          <div className="mb-12">
            <h3 className="font-bold text-gray-700 mb-2">Advice / Notes:</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{data.notes}</p>
          </div>
        )}

        <div className="mt-24 text-right">
          <p className="text-gray-400 mb-2">Signature</p>
          <div className="border-b-2 border-gray-800 w-48 inline-block"></div>
          <p className="mt-2 font-bold text-gray-800">Dr. {data.doctorName}</p>
        </div>
      </div>
    </>
  );
}
