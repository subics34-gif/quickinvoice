import { jsPDF } from 'jspdf'
import type { Business, Document } from './db'

export function makePdf(doc: Document, biz: Business) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const left = 14
  const right = pageWidth - 14
  const money = (value: number) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: biz.currency || 'INR',
        maximumFractionDigits: 2
      }).format(Number(value) || 0)
    } catch {
      return `₹${(Number(value) || 0).toFixed(2)}`
    }
  }

  let y = 18
  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 18) {
      pdf.addPage()
      y = 20
    }
  }
  const writeWrapped = (text: string, x: number, width: number, lineHeight = 5) => {
    const lines = pdf.splitTextToSize(text, width) as string[]
    ensureSpace(lines.length * lineHeight)
    pdf.text(lines, x, y)
    y += lines.length * lineHeight
  }

  pdf.setTextColor(23, 43, 77)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(21)
  writeWrapped(biz.name || 'Your Business', left, 95, 7)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(85, 85, 85)
  if (biz.owner) writeWrapped(biz.owner, left, 95, 4.5)
  if (biz.address) writeWrapped(biz.address, left, 95, 4.5)
  const contact = [biz.phone, biz.email, biz.gst ? `GST: ${biz.gst}` : ''].filter(Boolean).join('  |  ')
  if (contact) writeWrapped(contact, left, 95, 4.5)

  pdf.setTextColor(23, 43, 77)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text(doc.kind === 'invoice' ? 'INVOICE' : 'QUOTATION', right, 18, { align: 'right' })
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(70, 70, 70)
  pdf.text(`No: ${doc.number}`, right, 26, { align: 'right' })
  pdf.text(`Date: ${doc.date}`, right, 32, { align: 'right' })
  pdf.text(`${doc.kind === 'invoice' ? 'Due' : 'Valid until'}: ${doc.kind === 'invoice' ? doc.dueDate : doc.validUntil}`, right, 38, { align: 'right' })

  y = Math.max(y + 5, 52)
  pdf.setDrawColor(220, 224, 230)
  pdf.line(left, y, right, y)
  y += 9

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(23, 43, 77)
  pdf.text('BILL TO', left, y)
  y += 6
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(60, 60, 60)
  pdf.setFontSize(9)
  writeWrapped(doc.customer.name || 'Customer', left, 100, 5)
  if (doc.customer.phone) writeWrapped(doc.customer.phone, left, 100, 5)
  if (doc.customer.email) writeWrapped(doc.customer.email, left, 100, 5)
  if (doc.customer.address) writeWrapped(doc.customer.address, left, 100, 5)
  y += 5
  ensureSpace(18)

  pdf.setFillColor(23, 43, 77)
  pdf.rect(left, y, pageWidth - 28, 9, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(255, 255, 255)
  pdf.text('Description', left + 4, y + 6)
  pdf.text('Qty', 126, y + 6, { align: 'right' })
  pdf.text('Rate', 158, y + 6, { align: 'right' })
  pdf.text('Amount', right - 4, y + 6, { align: 'right' })
  y += 15

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(50, 50, 50)
  for (const item of doc.items) {
    const lines = pdf.splitTextToSize(item.description || 'Item', 94) as string[]
    const rowHeight = Math.max(8, lines.length * 5)
    ensureSpace(rowHeight + 3)
    pdf.text(lines, left + 4, y)
    pdf.text(String(item.quantity), 126, y, { align: 'right' })
    pdf.text(money(item.price), 158, y, { align: 'right' })
    pdf.text(money(item.quantity * item.price), right - 4, y, { align: 'right' })
    y += rowHeight + 3
  }

  const subtotal = doc.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const taxable = Math.max(0, subtotal - doc.discount)
  const tax = taxable * doc.gst / 100
  y += 4
  ensureSpace(45)
  pdf.setDrawColor(220, 224, 230)
  pdf.line(112, y, right, y)
  y += 8

  const totalRow = (label: string, value: string, bold = false) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal')
    pdf.setFontSize(bold ? 11 : 9)
    pdf.setTextColor(45, 45, 45)
    pdf.text(label, 145, y, { align: 'right' })
    pdf.text(value, right - 4, y, { align: 'right' })
    y += 7
  }
  totalRow('Subtotal', money(subtotal))
  if (doc.discount) totalRow('Discount', `- ${money(doc.discount)}`)
  if (doc.gst) totalRow(`GST (${doc.gst}%)`, money(tax))
  totalRow('TOTAL', money(doc.total), true)
  if (doc.kind === 'invoice') {
    totalRow('Paid', money(doc.paid))
    totalRow('Balance due', money(Math.max(0, doc.total - doc.paid)), true)
  }

  if (doc.notes) {
    y += 5
    ensureSpace(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(23, 43, 77)
    pdf.text('Notes', left, y)
    y += 5
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)
    writeWrapped(doc.notes, left, pageWidth - 28, 4.5)
  }
  if (doc.terms) {
    y += 4
    ensureSpace(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(23, 43, 77)
    pdf.text('Terms & Conditions', left, y)
    y += 5
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)
    writeWrapped(doc.terms, left, pageWidth - 28, 4.5)
  }

  pdf.save(`${doc.number || 'QuickInvoice'}.pdf`)
  return pdf
}
