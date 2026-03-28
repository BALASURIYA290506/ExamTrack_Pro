import json
import openpyxl

# Step 1: Read subject code -> subject name mapping from Excel
wb = openpyxl.load_workbook(
    r'D:\DEV\ExamTrack_Pro\Practical Schedule-2025-26 - Term-1(Even & Even Junior).xlsx',
    read_only=True, data_only=True
)
ws = wb['Practical']

subject_code_map = {}  # Subject Name -> Subject Code
headers = None
code_idx = name_idx = None

for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i == 0:
        headers = [str(c).strip() if c is not None else '' for c in row]
        code_idx = headers.index('Subject Code')
        name_idx = headers.index('Subject Name')
        continue
    
    code = row[code_idx] if row[code_idx] is not None else None
    name = row[name_idx] if row[name_idx] is not None else None
    
    if code and name:
        subject_code_map[str(name).strip()] = str(code).strip()

print(f"Loaded {len(subject_code_map)} unique subject code mappings from Excel")

# Step 2: Load the students_practical.json
json_path = r'D:\DEV\ExamTrack_Pro\src\data\students_practical.json'
with open(json_path, 'r', encoding='utf-8') as f:
    students = json.load(f)

print(f"Loaded {len(students)} student practical records")

# Step 3: Add Subject Code to each record
not_found = set()
updated_count = 0

for entry in students:
    subject_name = entry.get('Subject Name', '').strip()
    if subject_name in subject_code_map:
        entry['Subject Code'] = subject_code_map[subject_name]
        updated_count += 1
    else:
        not_found.add(subject_name)

print(f"\nUpdated: {updated_count} records")
if not_found:
    print(f"\nSubject names NOT FOUND in Excel ({len(not_found)}):")
    for name in sorted(not_found):
        print(f"  - {name}")

# Step 4: Save back to JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(students, f, indent=2, ensure_ascii=False)

print(f"\nSaved updated JSON to {json_path}")

# Verify first few records
print("\n=== Sample updated records ===")
for entry in students[:3]:
    print(f"  {entry['Student Name']} | {entry['Subject Name']} | Code: {entry.get('Subject Code', 'MISSING')}")
