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
        // venuesMap: hall -> Map of regNo -> seatNo
        const venuesMap = {};
        
        for (let i = 1; i < parts.length; i++) {
            const section = parts[i];
            const hallMatch = section.match(/^(\w+)/);
            if (!hallMatch) continue;
            const hall = hallMatch[1].trim();
            
            if (!venuesMap[hall]) {
                venuesMap[hall] = new Map();
            }

            // Try to find seat-number + reg-number pairs.
            // Common PDF hall plan formats:
            //   "<SeatNo> <11-12 digit RegNo>" OR "<11-12 digit RegNo> <SeatNo>"
            // Strategy: find all numbers; a seat number is a short numeric (1–4 digits),
            // a register number is 11–12 digits. We scan token pairs.

            // Pattern: optional seat (1-4 digits), then reg (11-12 digits) - "1 12345678901"
            // OR reg then seat - "12345678901 1"
            const seatRegPattern = /\b(\d{1,4})\s+(\d{11,12})\b/g;
            const regSeatPattern = /\b(\d{11,12})\s+(\d{1,4})\b/g;

            let matched = false;
            let match;

            // Try seat-before-reg pattern first
            const seatRegMatches = [];
            while ((match = seatRegPattern.exec(section)) !== null) {
                seatRegMatches.push({ seatNo: match[1], regNo: match[2] });
                matched = true;
            }

            const regSeatMatches = [];
            while ((match = regSeatPattern.exec(section)) !== null) {
                regSeatMatches.push({ regNo: match[1], seatNo: match[2] });
                matched = true;
            }

            // Use whichever pattern found more results
            const pairs = seatRegMatches.length >= regSeatMatches.length
                ? seatRegMatches
                : regSeatMatches;

            if (pairs.length > 0) {
                pairs.forEach(({ regNo, seatNo }) => {
                    venuesMap[hall].set(regNo, seatNo);
                });
            } else {
                // Fallback: just extract register numbers without seat numbers
                const regNoRegex = /\b(\d{11,12})\b/g;
                while ((match = regNoRegex.exec(section)) !== null) {
                    venuesMap[hall].set(match[1], null);
                }
            }
        }
        
        const venues = Object.keys(venuesMap).map(hall => ({
            hall,
            date: globalDate,
            session: globalSession,
            // Array of { regNo, seatNo } objects
            students: Array.from(venuesMap[hall].entries()).map(([regNo, seatNo]) => ({
                regNo,
                seatNo
            }))
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
