"""
Convert the updated practical schedule XLSX to students_practical.json

Source: Practical Schedule-2025-26 - Term-1(Even & Even Junior) for faculties - Updated.xlsx
Target: src/data/students_practical.json

Column mapping:
  Reg No        -> Register Number
  Name          -> Student Name
  Date          -> Date
  Session       -> Slot
  Subject Code  -> Subject Code
  Subject Name  -> Subject Name
  Location      -> Room / Hall
  Category      -> "Practical" (hardcoded)
"""

import json
import openpyxl

XLSX_PATH = r'D:\DEV\ExamTrack_Pro\Practical Schedule-2025-26 - Term-1(Even & Even Junior) for faculties - Updated.xlsx'
JSON_PATH = r'D:\DEV\ExamTrack_Pro\src\data\students_practical.json'
SHEET_NAME = 'Student List'

def main():
    wb = openpyxl.load_workbook(XLSX_PATH, read_only=True, data_only=True)
    ws = wb[SHEET_NAME]

    records = []
    headers = None
    skipped = 0

    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            headers = [str(c).strip() if c is not None else '' for c in row]
            
            required = ['Reg No', 'Name', 'Date', 'Session', 'Subject Code', 'Subject Name', 'Location']
            for col in required:
                if col not in headers:
                    raise ValueError(f"Missing required column: '{col}'. Headers found: {headers}")
            
            reg_idx   = headers.index('Reg No')
            name_idx  = headers.index('Name')
            date_idx  = headers.index('Date')
            slot_idx  = headers.index('Session')
            code_idx  = headers.index('Subject Code')
            subj_idx  = headers.index('Subject Name')
            loc_idx   = headers.index('Location')
            continue
        
        # Skip fully empty rows
        if all(cell is None for cell in row):
            skipped += 1
            continue
        
        reg_no   = row[reg_idx]
        name     = row[name_idx]
        date     = row[date_idx]
        slot     = row[slot_idx]
        code     = row[code_idx]
        subject  = row[subj_idx]
        location = row[loc_idx]
        
        # Skip if essential fields are missing
        if not reg_no or not name or not date or not subject:
            skipped += 1
            continue
        
        reg_str = str(int(reg_no)) if isinstance(reg_no, float) else str(reg_no).strip()
        
        record = {
            "Student Name":    str(name).strip(),
            "Register Number": reg_str,
            "Date":            str(date).strip() if date else "",
            "Slot":            str(slot).strip() if slot else "",
            "Category":        "Practical",
            "Subject Name":    str(subject).strip() if subject else "",
            "Room / Hall":     str(int(location)) if isinstance(location, (int, float)) else (str(location).strip() if location else ""),
            "Subject Code":    str(code).strip() if code else "",
        }
        records.append(record)

    print(f"Processed {len(records)} records (skipped {skipped} empty/invalid rows)")

    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    print(f"Saved to {JSON_PATH}")

if __name__ == "__main__":
    main()
