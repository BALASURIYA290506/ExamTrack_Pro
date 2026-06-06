import json
import openpyxl

XLSX_PATH = r'D:\DEV\Projects\ExamTrack_Pro\End Semester Theory & Practical Schedule(2025-26 EVEN & EVEN JUNIOR - Term2) - To be shared with the students.xlsx'
PRACTICAL_JSON = r'D:\DEV\Projects\ExamTrack_Pro\src\data\students_practical.json'
THEORY_JSON = r'D:\DEV\Projects\ExamTrack_Pro\src\data\students_theory.json'

def process_sheet(ws, is_practical):
    records = []
    headers = None
    skipped = 0

    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            headers = [str(c).strip() if c is not None else '' for c in row]
            continue
        
        # Skip fully empty rows
        if all(cell is None for cell in row):
            skipped += 1
            continue
            
        # create a dict of row data
        row_data = dict(zip(headers, row))
        
        reg_no = row_data.get('Register Number')
        name = row_data.get('Name')
        date = row_data.get('Date')
        slot = row_data.get('FN/AN')
        code = row_data.get('Subject Code')
        subject = row_data.get('Subject Name')
        
        if is_practical:
            location = row_data.get('Location')
        else:
            location = ""
            
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
            "Category":        "Practical" if is_practical else "Theory",
            "Subject Name":    str(subject).strip() if subject else "",
            "Room / Hall":     str(int(location)) if isinstance(location, (int, float)) else (str(location).strip() if location else ""),
            "Subject Code":    str(code).strip() if code else "",
        }
        records.append(record)
        
    return records, skipped

def main():
    print("Loading workbook...")
    wb = openpyxl.load_workbook(XLSX_PATH, read_only=True, data_only=True)
    
    print("Processing Practical sheet...")
    practical_ws = wb['Practical']
    practical_records, p_skipped = process_sheet(practical_ws, is_practical=True)
    print(f"Processed {len(practical_records)} practical records (skipped {p_skipped})")
    
    with open(PRACTICAL_JSON, 'w', encoding='utf-8') as f:
        json.dump(practical_records, f, indent=2, ensure_ascii=False)
    print(f"Saved Practical JSON to {PRACTICAL_JSON}")
    
    print("Processing Theory sheet...")
    theory_ws = wb['Theory']
    theory_records, t_skipped = process_sheet(theory_ws, is_practical=False)
    print(f"Processed {len(theory_records)} theory records (skipped {t_skipped})")
    
    with open(THEORY_JSON, 'w', encoding='utf-8') as f:
        json.dump(theory_records, f, indent=2, ensure_ascii=False)
    print(f"Saved Theory JSON to {THEORY_JSON}")

if __name__ == "__main__":
    main()
