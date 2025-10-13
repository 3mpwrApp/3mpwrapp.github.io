# 3mpwrApp User Guide - Downloads

This directory contains downloadable versions of the 3mpwrApp User Guide.

## Available Files

### Complete User Guide (Full Version)

**3mpwrapp-user-guide-full.md** (15,000 words, ~75 pages)
- Markdown source file
- Contains complete documentation of all features
- Phase 2 features fully documented
- All Canadian jurisdictions covered
- Suitable for conversion to PDF, EPUB, or other formats

**3mpwrapp-user-guide-full.html**
- HTML companion page
- Links to all versions
- Table of contents
- Quick navigation
- Accessible web format

**3mpwrapp-user-guide-full.pdf** (To be generated)
- Print-optimized PDF version
- Tagged for accessibility
- Proper heading structure
- Bookmarks for navigation
- Approximately 75 pages

## Generating the PDF

To generate the PDF from the markdown file, you can use tools like:

### Option 1: Pandoc (Recommended)
```bash
pandoc 3mpwrapp-user-guide-full.md -o 3mpwrapp-user-guide-full.pdf \
  --pdf-engine=xelatex \
  --toc \
  --toc-depth=3 \
  --metadata title="3mpwrApp Complete User Guide" \
  --metadata author="3mpwrApp Team" \
  --metadata date="2025-10-13" \
  -V geometry:margin=1in \
  -V fontsize=11pt \
  -V papersize=letter
```

### Option 2: Markdown to PDF (VS Code Extension)
1. Install "Markdown PDF" extension in VS Code
2. Open `3mpwrapp-user-guide-full.md`
3. Right-click → Markdown PDF: Export (pdf)

### Option 3: Online Converters
- https://www.markdowntopdf.com/
- https://md2pdf.netlify.app/
- https://cloudconvert.com/md-to-pdf

## Alternative Formats

**Large Print Versions:**
To generate large print (16pt or 20pt):
```bash
pandoc 3mpwrapp-user-guide-full.md -o 3mpwrapp-user-guide-large-print.pdf \
  --pdf-engine=xelatex \
  --toc \
  -V fontsize=16pt \
  -V geometry:margin=1.5in
```

**High Contrast Version:**
Edit the markdown to use high-contrast formatting, then convert to PDF.

**Plain Text Version:**
```bash
pandoc 3mpwrapp-user-guide-full.md -o 3mpwrapp-user-guide.txt \
  --wrap=none \
  --strip-comments
```

## Accessibility

All versions are designed to meet WCAG 2.1 AAA standards:
- Proper heading structure
- Descriptive link text
- Alternative text for images (when added)
- Logical reading order
- High contrast compatible
- Screen reader friendly

When generating PDFs, ensure:
- Document is tagged for accessibility
- Reading order is correct
- Headings are properly structured
- Links are functional
- Bookmarks are included

## Version Information

**Current Version:** 2.1 (Phase 2)  
**Last Updated:** October 13, 2025  
**Next Update:** Continuous based on community feedback

## License

**Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**

You are free to share and adapt this guide with attribution.

## Contact

Questions about the user guide?
- **Email:** support@3mpwrapp.ca
- **Accessibility issues:** accessibility@3mpwrapp.ca
- **Website:** https://3mpwrapp.github.io

---

**Note to Developers:** Remember to update the PDF file whenever the markdown source is updated.
