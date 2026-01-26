/**
 * PDF Export Utility
 * Handles PDF generation for prep notes with proper Next.js compatibility
 */

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export async function exportPrepNoteToPDF(prepNote: any) {
  if (typeof window === 'undefined') {
    throw new Error('PDF export can only be run in the browser');
  }

  try {
    // Dynamic import for html2pdf.js
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    // Create a temporary container with all content
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = '0';
    exportContainer.style.width = '800px'; // Fixed width for rendering
    exportContainer.style.padding = '20px';
    exportContainer.style.backgroundColor = 'white';
    exportContainer.style.color = 'black';

    // Build complete HTML content for export
    const contentHtml = `
      <div style="font-family: Arial, sans-serif; color: black;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: black;">${escapeHtml(prepNote.meeting_title)}</h1>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid black; padding-bottom: 5px; color: black;">Meeting Details</h2>
          <p style="color: black;"><strong>Title:</strong> ${escapeHtml(prepNote.meeting_title)}</p>
          ${prepNote.meeting_time ? `<p style="color: black;"><strong>Scheduled:</strong> ${escapeHtml(new Date(prepNote.meeting_time).toLocaleString())}</p>` : ''}
          ${prepNote.generated_at ? `<p style="color: black;"><strong>Research Generated:</strong> ${escapeHtml(new Date(prepNote.generated_at).toLocaleString())}</p>` : ''}
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid black; padding-bottom: 5px; color: black;">Summary</h2>
          <p style="line-height: 1.6; color: black;">${escapeHtml(prepNote.summary)}</p>
        </div>

        ${prepNote.suggested_talking_points.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid black; padding-bottom: 5px; color: black;">General Discussion Points</h2>
          <ol style="line-height: 1.8; color: black;">
            ${prepNote.suggested_talking_points.map((point: string) => `<li style="margin-bottom: 8px; color: black;">${escapeHtml(point)}</li>`).join('')}
          </ol>
        </div>
        ` : ''}

        ${prepNote.attendees.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid black; padding-bottom: 5px; color: black;">People Research</h2>
          ${prepNote.attendees.map((att: any) => `
            <div style="margin-bottom: 25px; padding: 15px; border: 1px solid black; border-radius: 8px; background-color: white;">
              <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: black;">${escapeHtml(att.name)}</h3>
              ${att.current_role ? `<p style="margin-bottom: 5px; color: black;"><strong>${escapeHtml(att.current_role)}</strong>${att.company ? ` at ${escapeHtml(att.company)}` : ''}</p>` : ''}
              ${att.tenure ? `<p style="margin-bottom: 10px; color: black;">${escapeHtml(att.tenure)}</p>` : ''}
              ${att.linkedin_url ? `<p style="margin-bottom: 10px; color: black;"><a href="${escapeHtml(att.linkedin_url)}" style="color: blue;">LinkedIn Profile</a></p>` : ''}
              ${att.background ? `
                <div style="margin-top: 10px;">
                  <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 5px; color: black;">Background</h4>
                  <p style="line-height: 1.6; color: black;">${escapeHtml(att.background)}</p>
                </div>
              ` : ''}
              ${att.talking_points && att.talking_points.length > 0 ? `
                <div style="margin-top: 10px;">
                  <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 5px; color: black;">Talking Points (${att.talking_points.length})</h4>
                  <ol style="line-height: 1.6; color: black;">
                    ${att.talking_points.map((point: string) => `<li style="margin-bottom: 5px; color: black;">${escapeHtml(point)}</li>`).join('')}
                  </ol>
                </div>
              ` : ''}
              ${att.recent_activity ? `
                <div style="margin-top: 10px;">
                  <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 5px; color: black;">Recent Activity</h4>
                  <p style="line-height: 1.6; color: black;">${escapeHtml(att.recent_activity)}</p>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${prepNote.companies.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid black; padding-bottom: 5px; color: black;">Company Intelligence</h2>
          ${prepNote.companies.map((company: any) => {
            const associatedAttendees = prepNote.attendees.filter((att: any) => att.company === company.name);
            return `
            <div style="margin-bottom: 25px; padding: 15px; border: 1px solid black; border-radius: 8px; background-color: white;">
              <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: black;">${escapeHtml(company.name)}</h3>
              <p style="margin-bottom: 10px; color: black;">${escapeHtml(company.domain)}</p>
              ${company.industry || company.size || company.funding ? `
                <div style="margin-bottom: 10px;">
                  <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 5px; color: black;">Quick Facts</h4>
                  ${company.industry ? `<p style="color: black;"><strong>Industry:</strong> ${escapeHtml(company.industry)}</p>` : ''}
                  ${company.size ? `<p style="color: black;"><strong>Size:</strong> ${escapeHtml(company.size)}</p>` : ''}
                  ${company.funding ? `<p style="color: black;"><strong>Funding:</strong> ${escapeHtml(company.funding)}</p>` : ''}
                </div>
              ` : ''}
              ${company.overview ? `
                <div style="margin-top: 10px;">
                  <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 5px; color: black;">Overview</h4>
                  <p style="line-height: 1.6; color: black;">${escapeHtml(company.overview)}</p>
                </div>
              ` : ''}
              ${company.products && company.products.length > 0 ? `
                <div style="margin-top: 10px;">
                  <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 5px; color: black;">Products (${company.products.length})</h4>
                  <ul style="line-height: 1.6; color: black;">
                    ${company.products.map((product: string) => `<li style="margin-bottom: 5px; color: black;">${escapeHtml(product)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${company.recent_news && company.recent_news.length > 0 ? `
                <div style="margin-top: 10px;">
                  <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 5px; color: black;">Recent News (${company.recent_news.length})</h4>
                  <ul style="line-height: 1.6; color: black;">
                    ${company.recent_news.map((news: string) => `<li style="margin-bottom: 5px; color: black;">${escapeHtml(news)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${associatedAttendees.length > 0 ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid black;">
                  <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 5px; color: black;">Attendees from this company (${associatedAttendees.length})</h4>
                  <ul style="color: black;">
                    ${associatedAttendees.map((att: any) => `<li style="color: black;">${escapeHtml(att.name)}${att.current_role ? ` (${escapeHtml(att.current_role)})` : ''}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
            `;
          }).join('')}
        </div>
        ` : ''}
      </div>
    `;

    exportContainer.innerHTML = contentHtml;
    document.body.appendChild(exportContainer);

    const opt = {
      margin: 10,
      filename: `${prepNote.meeting_title || 'prep-notes'}-${
        new Date().toISOString().split('T')[0]
      }.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    };

    await html2pdf().from(exportContainer).set(opt).save();

    // Clean up
    document.body.removeChild(exportContainer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
