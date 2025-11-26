// Component for exporting a recipient's gift list as PDF
'use client';

interface ExportPDFButtonProps {
  recipientId: string;
  recipientName: string;
  compact?: boolean;
}

export function ExportPDFButton({ recipientId, recipientName, compact = false }: ExportPDFButtonProps) {
  function handleExport() {
    // Open PDF export in new window/tab
    const url = `/api/recipients/${recipientId}/export-pdf`;
    window.open(url, '_blank');
  }

  if (compact) {
    return (
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
        title="Export as PDF"
      >
        <span>📄</span>
        <span>PDF</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
    >
      <span>📄</span>
      <span>Export PDF</span>
    </button>
  );
}
