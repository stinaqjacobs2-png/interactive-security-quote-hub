from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "quotation-template-pdfs"
LOGO = ROOT / "interactive-security-logo.jpg"

INK = colors.HexColor("#17212b")
MUTED = colors.HexColor("#5d6a78")
LINE = colors.HexColor("#17212b")
PANEL = colors.HexColor("#f3f7f8")
YELLOW = colors.HexColor("#fff2a8")
RED = colors.HexColor("#ed1c24")


def money(value):
    return f"R {value:,.2f}".replace(",", " ")


def styles():
    base = getSampleStyleSheet()
    return {
        "normal": ParagraphStyle(
            "normal",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=10,
            textColor=INK,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7,
            leading=8,
            textColor=MUTED,
        ),
        "heading": ParagraphStyle(
            "heading",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=16,
            textColor=INK,
            spaceAfter=2,
        ),
        "section": ParagraphStyle(
            "section",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=10,
            textColor=colors.white,
        ),
        "center": ParagraphStyle(
            "center",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=13,
            alignment=TA_CENTER,
            textColor=INK,
        ),
        "supporting_center": ParagraphStyle(
            "supporting_center",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=11.5,
            alignment=TA_CENTER,
            textColor=MUTED,
        ),
        "right": ParagraphStyle(
            "right",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            alignment=TA_RIGHT,
            textColor=INK,
        ),
        "label": ParagraphStyle(
            "label",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=6.8,
            leading=8,
            textColor=MUTED,
        ),
    }


def p(text, style):
    return Paragraph(text.replace("\n", "<br/>"), style)


def template_header(story, s, quote_title, quote_number):
    logo = str(LOGO)
    story.append(Table([[f'<img src="{logo}" width="260" height="88"/>']], colWidths=[180 * mm]))
    story.append(
        Table(
            [[p("Interactive Security Consultants", s["center"])]],
            colWidths=[180 * mm],
            style=TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER")]),
        )
    )
    story.append(
        Table(
            [[p("Reg no: - | VAT No: -", s["supporting_center"])]],
            colWidths=[180 * mm],
            style=TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), YELLOW),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("TOPPADDING", (0, 0), (-1, -1), 2),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ]
            ),
        )
    )
    story.append(Spacer(1, 4))
    story.append(Table([[""]], colWidths=[180 * mm], rowHeights=[1], style=TableStyle([("LINEABOVE", (0, 0), (-1, -1), 1, LINE)])))
    story.append(
        Table(
            [[p("Select quoting company", s["small"])]],
            colWidths=[180 * mm],
            style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), YELLOW), ("ALIGN", (0, 0), (-1, -1), "CENTER")]),
        )
    )
    story.append(Spacer(1, 8))
    story.append(p(quote_title.upper(), s["heading"]))
    story.append(p(quote_number, s["heading"]))
    story.append(Spacer(1, 5))


def meta_blocks(s):
    data = [
        [
            p("<b>Client Detail</b><br/>Client name<br/>Client address", s["small"]),
            p("<b>Contact Detail</b><br/>Contact person<br/>Email / Phone", s["small"]),
            p("<b>Sales Rep</b><br/>Name<br/>Email / Phone", s["small"]),
            p("<b>Date</b><br/>01 Jun 2026", s["small"]),
        ]
    ]
    table = Table(data, colWidths=[43.5 * mm] * 4)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PANEL),
                ("BOX", (0, 0), (-1, -1), 0.35, colors.HexColor("#dce3ea")),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#dce3ea")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def section_title(text, s):
    return Table(
        [[p(text, s["section"])]],
        colWidths=[180 * mm],
        style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), INK), ("LEFTPADDING", (0, 0), (-1, -1), 5)]),
    )


def standard_terms(s):
    return [
        Spacer(1, 7),
        p("<b>Terms</b>", s["normal"]),
        p("This quotation is valid for 7 days from quotation date. A 70% deposit is required before work can be done. Pricing excludes work outside the agreed scope unless approved in writing by the client. Final delivery depends on timely access to required information and approvals.", s["normal"]),
        Spacer(1, 8),
        Table([[""]], colWidths=[180 * mm], rowHeights=[1], style=TableStyle([("LINEABOVE", (0, 0), (-1, -1), 0.7, LINE)])),
        p("<b>Banking Details</b>", s["normal"]),
        Table(
            [
                [p("<b>Bank:</b>", s["small"]), p("-", s["normal"])],
                [p("<b>Account Holder:</b>", s["small"]), p("-", s["normal"])],
                [p("<b>Account Type:</b>", s["small"]), p("-", s["normal"])],
                [p("<b>Account Number:</b>", s["small"]), p("-", s["normal"])],
                [p("<b>Branch Code:</b>", s["small"]), p("-", s["normal"])],
            ],
            colWidths=[28 * mm, 152 * mm],
            style=TableStyle(
                [
                    ("BACKGROUND", (1, 0), (1, -1), YELLOW),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                    ("TOPPADDING", (0, 0), (-1, -1), 2),
                ]
            ),
        ),
        Spacer(1, 5),
        p("<b>Please use quotation number as your reference.</b>", s["normal"]),
    ]


def technical_pdf(path):
    s = styles()
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=15 * mm, leftMargin=15 * mm, topMargin=10 * mm, bottomMargin=10 * mm)
    story = []
    template_header(story, s, "Quotation", "Q-2026-TECH")
    story.append(meta_blocks(s))
    story.append(Spacer(1, 7))
    story.append(section_title("Scope of Work", s))
    story.append(p("We will provide a structured delivery of the requested services with progress updates and a final handover once the agreed scope has been completed.", s["normal"]))
    rows = [
        [p("<b>Stock Code</b>", s["section"]), p("<b>Description</b>", s["section"]), p("<b>Cost Per Unit Excl. VAT</b>", s["section"]), p("<b>Quantity</b>", s["section"]), p("<b>Total Cost Excl. VAT</b>", s["section"])],
        ["", "Technical equipment / service item", money(0), "1", money(0)],
        ["", "Consumables", money(0), "1", money(0)],
        ["", "Labour", money(0), "1", money(0)],
    ]
    table = Table(rows, colWidths=[28 * mm, 62 * mm, 36 * mm, 22 * mm, 32 * mm])
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), INK), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.5, LINE), ("ALIGN", (2, 1), (-1, -1), "RIGHT")]))
    story.append(table)
    story.append(Table([["", "", "Subtotal", money(0)], ["", "", "VAT 15%", money(0)], ["", "", "Total", money(0)]], colWidths=[100 * mm, 20 * mm, 30 * mm, 30 * mm], style=TableStyle([("GRID", (2, 0), (-1, -1), 0.5, LINE), ("ALIGN", (3, 0), (3, -1), "RIGHT")])))
    story.extend(standard_terms(s))
    doc.build(story)


def guarding_pdf(path):
    s = styles()
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=15 * mm, leftMargin=15 * mm, topMargin=10 * mm, bottomMargin=10 * mm)
    story = []
    template_header(story, s, "Guarding Quotation", "Q-2026-GUARD")
    story.append(meta_blocks(s))
    story.append(Spacer(1, 7))
    story.append(section_title("Scope of Guarding Services", s))
    story.append(p("Guarding services will be provided according to the agreed site requirements, shift structure, deployment plan, and final confirmed scope.", s["normal"]))
    rows = [
        [p("<b>Position</b>", s["section"]), p("<b>Qty</b>", s["section"]), p("<b>Shift</b>", s["section"]), p("<b>Monthly Selling</b>", s["section"])],
        ["Grade C Guard", "1", "Day / Night", money(0)],
        ["Supervisor", "1", "As required", money(0)],
    ]
    table = Table(rows, colWidths=[75 * mm, 25 * mm, 40 * mm, 40 * mm])
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), INK), ("GRID", (0, 0), (-1, -1), 0.5, LINE), ("ALIGN", (1, 1), (-1, -1), "RIGHT")]))
    story.append(table)
    story.append(section_title("Equipment Included", s))
    story.append(Table([["Equipment item", "Qty", "Included", "Monthly Selling"], ["Radio / panic / site equipment", "1", "Yes", money(0)]], colWidths=[75 * mm, 25 * mm, 40 * mm, 40 * mm], style=TableStyle([("BACKGROUND", (0, 0), (-1, 0), INK), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.5, LINE)])))
    story.append(Table([["", "", "Monthly selling price", money(0)], ["", "", "Annual contract value", money(0)]], colWidths=[90 * mm, 20 * mm, 40 * mm, 30 * mm], style=TableStyle([("GRID", (2, 0), (-1, -1), 0.5, LINE), ("ALIGN", (3, 0), (3, -1), "RIGHT")])))
    story.extend(standard_terms(s))
    doc.build(story)


def armed_response_pdf(path):
    s = styles()
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=15 * mm, leftMargin=15 * mm, topMargin=10 * mm, bottomMargin=10 * mm)
    story = []
    template_header(story, s, "Monthly Armed Response Quotation", "Q-2026-ARMED")
    story.append(meta_blocks(s))
    story.append(Spacer(1, 7))
    story.append(section_title("Scope of Armed Response Services", s))
    story.append(p("Monthly armed response services are subject to site access, active alarm communication, response area confirmation, and approval of the agreed scope.", s["normal"]))
    rows = [
        [p("<b>Service Package</b>", s["section"]), p("<b>Sites</b>", s["section"]), p("<b>Monthly Selling</b>", s["section"])],
        ["Standard Armed Response", "1", money(0)],
        ["Alarm Monitoring", "1", money(0)],
        ["Key Holding", "1", money(0)],
    ]
    table = Table(rows, colWidths=[95 * mm, 35 * mm, 50 * mm])
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), INK), ("GRID", (0, 0), (-1, -1), 0.5, LINE), ("ALIGN", (1, 1), (-1, -1), "RIGHT")]))
    story.append(table)
    story.append(section_title("Equipment / Once-Off Charges", s))
    story.append(Table([["Item", "Qty", "Once-off Selling"], ["Panic button / radio link / activation fee", "1", money(0)]], colWidths=[95 * mm, 35 * mm, 50 * mm], style=TableStyle([("BACKGROUND", (0, 0), (-1, 0), INK), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.5, LINE)])))
    story.append(Table([["", "", "Monthly selling price", money(0)], ["", "", "Once-off charges", money(0)], ["", "", "Annual contract value", money(0)]], colWidths=[90 * mm, 20 * mm, 40 * mm, 30 * mm], style=TableStyle([("GRID", (2, 0), (-1, -1), 0.5, LINE), ("ALIGN", (3, 0), (3, -1), "RIGHT")])))
    story.extend(standard_terms(s))
    doc.build(story)


def main():
    OUT.mkdir(exist_ok=True)
    technical_pdf(OUT / "Technical Quotation Template.pdf")
    guarding_pdf(OUT / "Guarding Quotation Template.pdf")
    armed_response_pdf(OUT / "Monthly Armed Response Quotation Template.pdf")
    print(OUT)


if __name__ == "__main__":
    main()
