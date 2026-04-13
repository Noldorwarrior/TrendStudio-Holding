import zipfile, os, xml.etree.ElementTree as ET, json, tempfile

XLSX = '/home/user/TrendStudio-Holding/Investor_Package/investor_model_v1.0_Public.xlsx'
findings = []

with zipfile.ZipFile(XLSX, 'r') as z:
    names = z.namelist()
    print(f"Total files in ZIP: {len(names)}")
    for n in sorted(names):
        print(f"  {n} ({z.getinfo(n).file_size} bytes)")

    # 1. Check Content_Types
    ct = ET.fromstring(z.read('[Content_Types].xml'))
    parts_declared = set()
    for child in ct:
        pn = child.get('PartName', '')
        if pn:
            parts_declared.add(pn.lstrip('/'))
    missing_parts = [p for p in parts_declared if p not in names]
    if missing_parts:
        findings.append(f"CRITICAL: Content_Types references missing parts: {missing_parts}")
    print(f"\nContent_Types: {len(parts_declared)} parts declared, {len(missing_parts)} missing")

    # 2. Check rels
    for relf in [f for f in names if f.endswith('.rels')]:
        rel_xml = ET.fromstring(z.read(relf))
        rel_dir = os.path.dirname(relf)
        for r in rel_xml:
            target = r.get('Target', '')
            if target.startswith('http'): continue
            # Resolve relative path
            full = os.path.normpath(os.path.join(rel_dir, target)).replace('\\','/')
            if full.startswith('_rels/'):
                full = full.replace('_rels/','',1)
            if full not in names and target not in names:
                findings.append(f"HIGH: Orphan rel in {relf}: Target='{target}' not found")

    # 3. Check workbook for sheets
    wb_xml = z.read('xl/workbook.xml')
    wb = ET.fromstring(wb_xml)
    ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    sheets = wb.findall('.//main:sheet', ns)
    print(f"\nWorkbook sheets: {len(sheets)}")
    for s in sheets:
        name = s.get('name')
        state = s.get('state', 'visible')
        print(f"  {name} (state={state})")
        if state in ('hidden', 'veryHidden'):
            findings.append(f"MEDIUM: Hidden sheet found: {name} (state={state})")

    # 4. Check calcChain
    if 'xl/calcChain.xml' in names:
        cc = ET.fromstring(z.read('xl/calcChain.xml'))
        cc_entries = list(cc)
        print(f"\ncalcChain.xml: {len(cc_entries)} entries")
        sheet_ids = set()
        for e in cc_entries:
            si = e.get('i')
            if si: sheet_ids.add(si)
        print(f"  Referenced sheet IDs: {sorted(sheet_ids)}")
    else:
        print("\nNo calcChain.xml found")
        findings.append("LOW: No calcChain.xml — formulas may not recalculate correctly")

    # 5. Check sharedStrings for sensitive content
    if 'xl/sharedStrings.xml' in names:
        ss = ET.fromstring(z.read('xl/sharedStrings.xml'))
        ns2 = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        strings = [t.text for t in ss.findall('.//s:t', ns2) if t.text]
        print(f"\nSharedStrings: {len(strings)} entries")
        sensitive_kw = ['internal', 'Internal', 'password', 'secret', 'key', 'token',
                        'W5', 'W₅', '24.75', '13.95', '@', 'C:\\', '/Users/']
        for kw in sensitive_kw:
            matches = [s for s in strings if kw in str(s)]
            if matches:
                findings.append(f"{'CRITICAL' if kw in ['Internal','password','secret','24.75','13.95'] else 'MEDIUM'}: SharedStrings contains '{kw}': {matches[:3]}")

    # 6. Check docProps
    for dp in ['docProps/core.xml', 'docProps/app.xml']:
        if dp in names:
            print(f"\n{dp}:")
            content = z.read(dp).decode('utf-8')
            print(content[:2000])
            if 'internal' in content.lower() or 'Internal' in content:
                findings.append(f"HIGH: {dp} contains 'Internal' reference")

print("\n" + "="*60)
print("FINDINGS SUMMARY")
print("="*60)
for i, f in enumerate(findings, 1):
    print(f"  {i}. {f}")
if not findings:
    print("  No issues found")
