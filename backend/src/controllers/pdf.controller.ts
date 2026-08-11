import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

// ─── Colour palette ───────────────────────────────────────────────────────────
const PRIMARY   = '#4f46e5'; // indigo
const DARK      = '#111827'; // near-black text
const MUTED     = '#6b7280'; // grey text
const BORDER    = '#e5e7eb'; // light grey lines
const SUCCESS   = '#059669'; // confirmed green
const WARNING   = '#d97706'; // draft amber
const DANGER    = '#dc2626'; // cancelled red

function statusColor(status: string): string {
  if (status === 'Confirmed') return SUCCESS;
  if (status === 'Cancelled') return DANGER;
  return WARNING;
}

// ─── Helper: draw a simple horizontal rule ───────────────────────────────────
function hRule(doc: PDFKit.PDFDocument, y: number, margin = 50): void {
  doc.moveTo(margin, y).lineTo(doc.page.width - margin, y).strokeColor(BORDER).lineWidth(0.5).stroke();
}

// ─── PDF Challan Download ─────────────────────────────────────────────────────
export const downloadChallanPdf = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challanId = req.params.id;

    // ── Fetch challan + customer + creator ──
    const { rows: challanRows } = await query(
      `SELECT c.*, cust.customer_name, cust.mobile_number AS customer_mobile,
              cust.business_name, cust.gst_number,
              u.name AS created_by_name
       FROM challans c
       JOIN customers cust ON c.customer_id = cust.id
       LEFT JOIN users u    ON c.created_by  = u.id
       WHERE c.id = $1`,
      [challanId]
    );

    if (challanRows.length === 0) {
      res.status(404).json({ error: 'Challan not found' });
      return;
    }

    const challan = challanRows[0];

    // ── Fetch line items ──
    const { rows: items } = await query(
      `SELECT * FROM challan_items WHERE challan_id = $1 ORDER BY id`,
      [challanId]
    );

    // ── Calculate totals ──
    const grandTotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.unit_price_snapshot) * Number(item.quantity),
      0
    );

    // ── Stream PDF ──
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="challan-${challan.challan_number}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    const pageW = doc.page.width;
    const contentW = pageW - 100; // 50 margin each side
    const LEFT = 50;

    // ═══════════════════════════════════════════════════════
    // HEADER BAND
    // ═══════════════════════════════════════════════════════
    doc
      .rect(0, 0, pageW, 90)
      .fill(PRIMARY);

    doc
      .fillColor('white')
      .font('Helvetica-Bold')
      .fontSize(18)
      .text('Mini ERP + CRM Operations Portal', LEFT, 22, { width: contentW });

    doc
      .fillColor('rgba(255,255,255,0.75)')
      .font('Helvetica')
      .fontSize(10)
      .text('Internal Operations Document — Confidential', LEFT, 50, { width: contentW });

    // ═══════════════════════════════════════════════════════
    // CHALLAN TITLE + META (right-aligned)
    // ═══════════════════════════════════════════════════════
    doc.moveDown();
    const topY = 110;

    // Left: "SALES CHALLAN" label
    doc
      .fillColor(DARK)
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('SALES CHALLAN', LEFT, topY);

    // Right block: number / date / status
    const metaX = pageW - 220;
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(MUTED)
      .text('Challan Number', metaX, topY, { width: 170, align: 'right' });
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(DARK)
      .text(challan.challan_number, metaX, topY + 13, { width: 170, align: 'right' });

    const dateStr = new Date(challan.created_at).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(MUTED)
      .text('Date', metaX, topY + 35, { width: 170, align: 'right' });
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(DARK)
      .text(dateStr, metaX, topY + 48, { width: 170, align: 'right' });

    // Status badge (coloured box)
    const statusCol = statusColor(challan.status);
    const statusW = 80;
    const statusX = pageW - LEFT - statusW;
    doc
      .roundedRect(statusX, topY + 70, statusW, 20, 4)
      .fill(statusCol);
    doc
      .fillColor('white')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(challan.status.toUpperCase(), statusX, topY + 76, { width: statusW, align: 'center' });

    hRule(doc, 150);

    // ═══════════════════════════════════════════════════════
    // CUSTOMER DETAILS
    // ═══════════════════════════════════════════════════════
    const custY = 165;
    doc
      .fillColor(MUTED)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('BILL TO', LEFT, custY);

    doc
      .fillColor(DARK)
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(challan.customer_name, LEFT, custY + 14);

    let custDetailY = custY + 34;
    const custLine = (label: string, value: string | null | undefined) => {
      if (!value) return;
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(MUTED)
        .text(`${label}:`, LEFT, custDetailY, { continued: true })
        .fillColor(DARK)
        .text(` ${value}`, { lineBreak: false });
      custDetailY += 15;
    };

    custLine('Business', challan.business_name);
    custLine('Mobile',   challan.customer_mobile);
    custLine('GST',      challan.gst_number);

    hRule(doc, custDetailY + 10);

    // ═══════════════════════════════════════════════════════
    // PRODUCT TABLE
    // ═══════════════════════════════════════════════════════
    const tableStartY = custDetailY + 25;

    // Column widths
    const col = {
      name:  { x: LEFT,       w: 190 },
      sku:   { x: LEFT + 195, w: 90  },
      qty:   { x: LEFT + 290, w: 55  },
      price: { x: LEFT + 350, w: 70  },
      total: { x: LEFT + 425, w: 70  },
    };

    // Table header background
    doc.rect(LEFT, tableStartY, contentW, 22).fill('#f3f4f6');

    const headerLabelY = tableStartY + 7;
    const headerStyle = () =>
      doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED);

    headerStyle().text('PRODUCT NAME',  col.name.x + 4,  headerLabelY, { width: col.name.w  });
    headerStyle().text('SKU',           col.sku.x,        headerLabelY, { width: col.sku.w   });
    headerStyle().text('QTY',           col.qty.x,        headerLabelY, { width: col.qty.w, align: 'right' });
    headerStyle().text('UNIT PRICE',    col.price.x,      headerLabelY, { width: col.price.w, align: 'right' });
    headerStyle().text('TOTAL',         col.total.x,      headerLabelY, { width: col.total.w, align: 'right' });

    // Rows
    let rowY = tableStartY + 22;
    items.forEach((item: any, idx: number) => {
      const rowTotal = Number(item.unit_price_snapshot) * Number(item.quantity);
      const bg = idx % 2 === 0 ? 'white' : '#fafafa';

      doc.rect(LEFT, rowY, contentW, 22).fill(bg);

      const rowTextY = rowY + 7;
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(DARK)
        .text(item.product_name_snapshot, col.name.x + 4, rowTextY, { width: col.name.w - 8, ellipsis: true });

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(MUTED)
        .text(item.sku_snapshot, col.sku.x, rowTextY, { width: col.sku.w });

      doc
        .fillColor(DARK)
        .text(String(item.quantity), col.qty.x, rowTextY, { width: col.qty.w, align: 'right' });

      doc
        .text(`Rs. ${Number(item.unit_price_snapshot).toFixed(2)}`, col.price.x, rowTextY, { width: col.price.w, align: 'right' });

      doc
        .font('Helvetica-Bold')
        .text(`Rs. ${rowTotal.toFixed(2)}`, col.total.x, rowTextY, { width: col.total.w, align: 'right' });

      rowY += 22;
    });

    // Bottom border of table
    doc.rect(LEFT, rowY, contentW, 0.5).fill(BORDER);

    // ═══════════════════════════════════════════════════════
    // TOTALS BLOCK
    // ═══════════════════════════════════════════════════════
    const totalsY = rowY + 12;

    // Total Quantity
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(MUTED)
      .text('Total Quantity:', LEFT + 250, totalsY, { width: 160, align: 'right' })
      .font('Helvetica-Bold')
      .fillColor(DARK)
      .text(String(challan.total_quantity), col.total.x, totalsY, { width: col.total.w, align: 'right' });

    // Grand Total
    const gtY = totalsY + 20;
    doc
      .rect(LEFT + 240, gtY - 4, contentW - 240, 28)
      .fill('#eef2ff');

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(PRIMARY)
      .text('GRAND TOTAL', LEFT + 244, gtY + 3, { width: 160, align: 'right' })
      .text(`Rs. ${grandTotal.toFixed(2)}`, col.total.x, gtY + 3, { width: col.total.w, align: 'right' });

    // ═══════════════════════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════════════════════
    const footerY = gtY + 60;
    hRule(doc, footerY);

    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(MUTED)
      .text(`Created by: ${challan.created_by_name || 'System'}`, LEFT, footerY + 10)
      .text(
        `Generated on: ${new Date().toLocaleString('en-IN')}`,
        LEFT,
        footerY + 24
      );

    doc
      .fontSize(8)
      .text('This is a computer-generated document.', LEFT, footerY + 10, {
        width: contentW,
        align: 'right',
      });

    doc.end();
  } catch (err: any) {
    console.error('PDF generation error:', err.message);
    // Only send error if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
};
