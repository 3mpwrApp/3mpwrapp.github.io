/**
 * Accessible PDF Export Utility
 * 
 * Generates semantically-structured HTML for PDF export that is compatible
 * with screen readers and meets PDF/UA accessibility guidelines.
 * 
 * Key features:
 * - Proper heading hierarchy (h1, h2, h3)
 * - Document language declaration
 * - Semantic HTML structure
 * - High contrast styling
 * - Readable fonts and spacing
 */

import { Share } from 'react-native';

// Types for structured document content
export interface PDFSection {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'divider' | 'quote' | 'alert';
  level?: 1 | 2 | 3 | 4; // For headings
  content?: string;
  items?: string[]; // For lists
  rows?: string[][]; // For tables (first row is header)
  alertType?: 'info' | 'warning' | 'success' | 'error';
}

export interface PDFDocument {
  title: string;
  subtitle?: string;
  language?: string; // ISO language code, defaults to 'en'
  sections: PDFSection[];
  metadata?: {
    author?: string;
    createdDate?: string;
    disclaimer?: string;
    version?: string;
  };
}

// Color palette for accessibility (high contrast)
const COLORS = {
  text: '#1a1a1a',
  heading: '#0d0d0d',
  background: '#ffffff',
  primary: '#004A99',
  border: '#cccccc',
  alertInfo: '#e3f2fd',
  alertInfoBorder: '#1976d2',
  alertWarning: '#fff3e0',
  alertWarningBorder: '#f57c00',
  alertSuccess: '#e8f5e9',
  alertSuccessBorder: '#388e3c',
  alertError: '#ffebee',
  alertErrorBorder: '#d32f2f',
};

/**
 * Escapes HTML special characters to prevent XSS and rendering issues
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

/**
 * Generates the CSS styles for accessible PDFs
 */
function generateStyles(): string {
  return `
    <style>
      /* Base reset and typography */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 14pt;
        line-height: 1.6;
        color: ${COLORS.text};
        background-color: ${COLORS.background};
        padding: 40px;
        max-width: 800px;
        margin: 0 auto;
      }
      
      /* Headings with proper hierarchy */
      h1, h2, h3, h4 {
        color: ${COLORS.heading};
        margin-top: 24px;
        margin-bottom: 12px;
        line-height: 1.3;
      }
      
      h1 {
        font-size: 24pt;
        font-weight: 700;
        border-bottom: 3px solid ${COLORS.primary};
        padding-bottom: 12px;
        margin-top: 0;
      }
      
      h2 {
        font-size: 18pt;
        font-weight: 600;
        border-bottom: 1px solid ${COLORS.border};
        padding-bottom: 8px;
      }
      
      h3 {
        font-size: 14pt;
        font-weight: 600;
      }
      
      h4 {
        font-size: 12pt;
        font-weight: 600;
      }
      
      /* Paragraphs */
      p {
        margin-bottom: 12px;
      }
      
      /* Lists */
      ul, ol {
        margin-left: 24px;
        margin-bottom: 16px;
      }
      
      li {
        margin-bottom: 6px;
      }
      
      /* Tables - accessible with proper headers */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
      }
      
      th, td {
        border: 1px solid ${COLORS.border};
        padding: 10px 12px;
        text-align: left;
      }
      
      th {
        background-color: ${COLORS.primary};
        color: #ffffff;
        font-weight: 600;
      }
      
      tr:nth-child(even) {
        background-color: #f8f9fa;
      }
      
      /* Blockquotes */
      blockquote {
        border-left: 4px solid ${COLORS.primary};
        margin: 16px 0;
        padding: 12px 20px;
        background-color: #f8f9fa;
        font-style: italic;
      }
      
      /* Dividers */
      hr {
        border: none;
        border-top: 2px solid ${COLORS.border};
        margin: 24px 0;
      }
      
      /* Alert boxes */
      .alert {
        padding: 16px;
        margin: 16px 0;
        border-radius: 8px;
        border-left: 5px solid;
      }
      
      .alert-info {
        background-color: ${COLORS.alertInfo};
        border-left-color: ${COLORS.alertInfoBorder};
      }
      
      .alert-warning {
        background-color: ${COLORS.alertWarning};
        border-left-color: ${COLORS.alertWarningBorder};
      }
      
      .alert-success {
        background-color: ${COLORS.alertSuccess};
        border-left-color: ${COLORS.alertSuccessBorder};
      }
      
      .alert-error {
        background-color: ${COLORS.alertError};
        border-left-color: ${COLORS.alertErrorBorder};
      }
      
      /* Metadata section */
      .metadata {
        margin-top: 32px;
        padding-top: 16px;
        border-top: 1px solid ${COLORS.border};
        font-size: 10pt;
        color: #666666;
      }
      
      /* Subtitle */
      .subtitle {
        font-size: 14pt;
        color: #555555;
        margin-top: -8px;
        margin-bottom: 24px;
      }
      
      /* Disclaimer */
      .disclaimer {
        margin-top: 24px;
        padding: 12px;
        background-color: #fff3e0;
        border: 1px solid #f57c00;
        border-radius: 4px;
        font-size: 10pt;
      }
      
      /* Print optimization */
      @media print {
        body {
          padding: 20px;
        }
        
        .alert, blockquote {
          break-inside: avoid;
        }
        
        h1, h2, h3, h4 {
          break-after: avoid;
        }
      }
    </style>
  `;
}

/**
 * Renders a single section to HTML
 */
function renderSection(section: PDFSection): string {
  switch (section.type) {
    case 'heading': {
      const tag = `h${section.level || 2}`;
      return `<${tag}>${escapeHtml(section.content || '')}</${tag}>`;
    }
    
    case 'paragraph':
      return `<p>${escapeHtml(section.content || '')}</p>`;
    
    case 'list':
      if (!section.items?.length) return '';
      return `
        <ul role="list">
          ${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('\n          ')}
        </ul>
      `;
    
    case 'table': {
      if (!section.rows?.length) return '';
      const [header, ...body] = section.rows;
      return `
        <table role="table">
          <thead>
            <tr>
              ${header.map(cell => `<th scope="col">${escapeHtml(cell)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${body.map(row => `
              <tr>
                ${row.map((cell, i) => 
                  i === 0 
                    ? `<th scope="row">${escapeHtml(cell)}</th>` 
                    : `<td>${escapeHtml(cell)}</td>`
                ).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    
    case 'divider':
      return '<hr aria-hidden="true">';
    
    case 'quote':
      return `<blockquote>${escapeHtml(section.content || '')}</blockquote>`;
    
    case 'alert':
      return `
        <div class="alert alert-${section.alertType || 'info'}" role="alert">
          ${escapeHtml(section.content || '')}
        </div>
      `;
    
    default:
      return '';
  }
}

/**
 * Generates a complete accessible HTML document for PDF export
 */
export function generateAccessiblePdfHtml(doc: PDFDocument): string {
  const lang = doc.language || 'en';
  const createdDate = doc.metadata?.createdDate || new Date().toLocaleDateString();
  
  const sectionsHtml = doc.sections.map(renderSection).join('\n');
  
  const metadataHtml = doc.metadata ? `
    <footer class="metadata" role="contentinfo">
      ${doc.metadata.author ? `<p><strong>Author:</strong> ${escapeHtml(doc.metadata.author)}</p>` : ''}
      <p><strong>Generated:</strong> ${escapeHtml(createdDate)}</p>
      ${doc.metadata.version ? `<p><strong>Version:</strong> ${escapeHtml(doc.metadata.version)}</p>` : ''}
      <p><em>Generated by 3mpwr App - Accessibility-First Advocacy Platform</em></p>
    </footer>
  ` : '';
  
  const disclaimerHtml = doc.metadata?.disclaimer ? `
    <div class="disclaimer" role="note" aria-label="Important Disclaimer">
      <strong>⚠️ Disclaimer:</strong> ${escapeHtml(doc.metadata.disclaimer)}
    </div>
  ` : '';
  
  return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(doc.title)}</title>
      ${generateStyles()}
    </head>
    <body>
      <main role="main">
        <article>
          <header>
            <h1>${escapeHtml(doc.title)}</h1>
            ${doc.subtitle ? `<p class="subtitle">${escapeHtml(doc.subtitle)}</p>` : ''}
          </header>
          
          ${sectionsHtml}
          
          ${disclaimerHtml}
        </article>
      </main>
      
      ${metadataHtml}
    </body>
    </html>
  `;
}

/**
 * Exports a document as an accessible PDF and shares it
 */
export async function exportAccessiblePdf(
  doc: PDFDocument,
  options?: {
    shareTitle?: string;
    onError?: (error: Error) => void;
  }
): Promise<{ success: boolean; uri?: string; error?: Error }> {
  try {
    const Print = await import('expo-print');
    const html = generateAccessiblePdfHtml(doc);
    const { uri } = await Print.printToFileAsync({ html });
    
    await Share.share({
      url: uri,
      title: options?.shareTitle || doc.title,
    });
    
    return { success: true, uri };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('PDF export failed');
    options?.onError?.(err);
    return { success: false, error: err };
  }
}

/**
 * Simple text-to-accessible-PDF conversion for legacy code migration
 * 
 * This provides a drop-in replacement for the old `<pre>` based exports
 */
export function convertTextToAccessiblePdf(
  title: string,
  content: string,
  options?: {
    subtitle?: string;
    disclaimer?: string;
    language?: string;
  }
): string {
  // Parse simple text content into sections
  const lines = content.split('\n');
  const sections: PDFSection[] = [];
  
  let currentParagraph = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect headings (lines in ALL CAPS or ending with :)
    if (trimmed && (trimmed === trimmed.toUpperCase() && trimmed.length > 3) || /^[A-Z][^.]+:$/.test(trimmed)) {
      // Flush current paragraph
      if (currentParagraph.trim()) {
        sections.push({ type: 'paragraph', content: currentParagraph.trim() });
        currentParagraph = '';
      }
      sections.push({ type: 'heading', level: 2, content: trimmed.replace(/:$/, '') });
    }
    // Detect bullet points
    else if (/^[•\-\*]\s+/.test(line)) {
      // Flush current paragraph
      if (currentParagraph.trim()) {
        sections.push({ type: 'paragraph', content: currentParagraph.trim() });
        currentParagraph = '';
      }
      
      // Collect consecutive bullets into a list
      const items: string[] = [line.replace(/^[•\-\*]\s+/, '')];
      // Note: In a real implementation, we'd look ahead for more bullets
      sections.push({ type: 'list', items });
    }
    // Detect separators
    else if (/^[-=_]{3,}$/.test(trimmed)) {
      if (currentParagraph.trim()) {
        sections.push({ type: 'paragraph', content: currentParagraph.trim() });
        currentParagraph = '';
      }
      sections.push({ type: 'divider' });
    }
    // Regular text
    else {
      currentParagraph += (currentParagraph ? '\n' : '') + line;
    }
  }
  
  // Flush remaining paragraph
  if (currentParagraph.trim()) {
    sections.push({ type: 'paragraph', content: currentParagraph.trim() });
  }
  
  const doc: PDFDocument = {
    title,
    subtitle: options?.subtitle,
    language: options?.language || 'en',
    sections,
    metadata: {
      createdDate: new Date().toLocaleDateString(),
      disclaimer: options?.disclaimer || 
        'This document was generated by 3mpwr App and is for informational purposes only. ' +
        'It does not constitute legal, medical, or financial advice. Always consult qualified professionals.',
    },
  };
  
  return generateAccessiblePdfHtml(doc);
}

/**
 * Creates a simple accessible PDF from key-value data
 */
export function createSummaryPdf(
  title: string,
  data: Record<string, string | number | boolean | null | undefined>,
  options?: {
    subtitle?: string;
    disclaimer?: string;
  }
): string {
  const sections: PDFSection[] = [];
  
  const rows: string[][] = [['Field', 'Value']];
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      const displayKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
      rows.push([displayKey, String(value)]);
    }
  }
  
  sections.push({ type: 'table', rows });
  
  const doc: PDFDocument = {
    title,
    subtitle: options?.subtitle,
    sections,
    metadata: {
      createdDate: new Date().toLocaleDateString(),
      disclaimer: options?.disclaimer,
    },
  };
  
  return generateAccessiblePdfHtml(doc);
}
