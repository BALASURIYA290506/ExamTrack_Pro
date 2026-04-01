import * as pdfjsLib from 'pdfjs-dist';
// Use Vite to resolve and package the local worker file instead of relying on a CDN that might 404
import pdfWorkerURL from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerURL;

export const parseVenuePDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const totalPages = pdf.numPages;

        let fullText = "";

        // We will scan all pages
        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += " " + textContent.items.map(item => item.str).join(" ");
        }

        let globalDate = null;
        let globalSession = null;
        
        const dateMatch = fullText.match(/Date\s*:\s*(\d{4}-\d{2}-\d{2})/i);
        if (dateMatch) {
            const [y, m, d] = dateMatch[1].split('-');
            globalDate = `${d}.${m}.${y}`;
        }
        
        const sessionMatch = fullText.match(/Session\s*:\s*([A-Za-z]+)/i);
        if (sessionMatch) {
            globalSession = sessionMatch[1].trim().toUpperCase();
        }

        const parts = fullText.split(/Hall\s*:\s*/i);
        const venuesMap = {};
        
        for (let i = 1; i < parts.length; i++) {
            const section = parts[i];
            const hallMatch = section.match(/^(\w+)/);
            if (!hallMatch) continue;
            const hall = hallMatch[1].trim();
            
            const regNoRegex = /\b(\d{11,12})\b/g;
            let match;
            if (!venuesMap[hall]) {
                venuesMap[hall] = new Set();
            }
            while ((match = regNoRegex.exec(section)) !== null) {
                venuesMap[hall].add(match[1]);
            }
        }
        
        const venues = Object.keys(venuesMap).map(hall => ({
            hall,
            date: globalDate,
            session: globalSession,
            registerNumbers: [...venuesMap[hall]]
        }));
        
        resolve(venues);
      } catch (err) {
        console.error("PDF Parsing Error:", err);
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
};
