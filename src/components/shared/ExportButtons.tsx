'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { Gift, Recipient } from '@/Types/database.types'
import { exportToCSV, exportToPDF, exportRecipientsToCSV } from '@/lib/utils/export'
import { toast } from 'sonner'

interface ExportButtonsProps {
  data: Gift[] | Recipient[]
  type: 'gifts' | 'recipients'
}

export function ExportButtons({ data, type }: ExportButtonsProps) {
  const handleExportCSV = () => {
    try {
      if (type === 'gifts') {
        exportToCSV(data as Gift[], `gifts_${new Date().toISOString().split('T')[0]}.csv`)
      } else {
        exportRecipientsToCSV(data as Recipient[], `recipients_${new Date().toISOString().split('T')[0]}.csv`)
      }
      toast.success('CSV exported successfully!')
    } catch (error) {
      toast.error('Failed to export CSV')
      console.error(error)
    }
  }

  const handleExportPDF = () => {
    try {
      if (type === 'gifts') {
        exportToPDF(data as Gift[], 'My Gift List')
        toast.success('PDF generated successfully!')
      } else {
        toast.info('PDF export for recipients coming soon!')
      }
    } catch (error) {
      toast.error('Failed to export PDF')
      console.error(error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to CSV
        </DropdownMenuItem>
        {type === 'gifts' && (
          <DropdownMenuItem onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export to PDF
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
