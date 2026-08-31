import fitz
import os

doc = fitz.open()
page = doc.new_page()

metadata = {
    "title": "HDFC Bank Statement - Priya Sharma",
    "author": "HDFC Bank NetBanking Core",
    "subject": "Current Account Statement 2025-2026",
    "creator": "HDFC Statement Engine v4.2",
    "producer": "Adobe Document Publisher Core 2024",
    "creationDate": "D:20260401120000",
    "modDate": "D:20260401120000"
}
doc.set_metadata(metadata)

page.insert_text((50, 50), "HDFC BANK LIMITED - STATEMENT OF ACCOUNT", fontsize=16, fontname="helv")
page.insert_text((50, 80), "Account Holder: Priya Sharma | Business: Priya Textiles Surat", fontsize=11, fontname="helv")
page.insert_text((50, 100), "Account No: 50100492817291 | Period: 01-Apr-2025 to 31-Mar-2026", fontsize=10, fontname="helv")

page.insert_text((50, 140), "Date         Description                     Debit (INR)    Credit (INR)      Balance (INR)", fontsize=9, fontname="helv")
page.draw_line(fitz.Point(50, 145), fitz.Point(550, 145))

txs = [
    ("10/04/2025", "UPI/CR/512984128/RetailPay", "-", "2,75,000.00", "2,60,000.00"),
    ("15/05/2025", "UPI/CR/512984129/FabricSales", "-", "2,80,000.00", "3,00,000.00"),
    ("20/06/2025", "ACH/DR/VardhmanTex/INV882", "2,50,000.00", "-", "3,40,000.00"),
    ("18/07/2025", "UPI/CR/512984130/SuratShowroom", "-", "2,70,000.00", "3,80,000.00"),
    ("14/09/2025", "NEFT/DR/ArvindMills/INV401", "2,70,000.00", "-", "4,50,000.00"),
    ("22/11/2025", "UPI/CR/512984131/FestiveSales", "-", "2,95,000.00", "5,25,000.00"),
    ("15/01/2026", "UPI/CR/512984132/WholesaleBatch", "-", "2,65,000.00", "5,90,000.00"),
    ("28/03/2026", "UPI/CR/512984133/SpringCollection", "-", "2,80,000.00", "6,60,000.00")
]

y = 165
for dt, desc, dr, cr, bal in txs:
    page.insert_text((50, y), dt, fontsize=9, fontname="helv")
    page.insert_text((120, y), desc, fontsize=9, fontname="helv")
    page.insert_text((300, y), dr, fontsize=9, fontname="helv")
    page.insert_text((380, y), cr, fontsize=9, fontname="helv")
    page.insert_text((470, y), bal, fontsize=9, fontname="helv")
    y += 25

page.draw_line(fitz.Point(50, y), fitz.Point(550, y))
y += 20
page.insert_text((50, y), "SUMMARY: Total Credits: INR 34,20,000.00 | Total Debits: INR 29,80,000.00 | Avg Balance: INR 2,85,000.00 | Bounces: 0", fontsize=10, fontname="helv")

doc.save("data/mock_statement_clean.pdf")
doc.close()
print("mock_statement_clean.pdf generated.")
