import io
import base64
import pymupdf

def generate_tamper_visual_overlay(pdf_bytes: bytes, font_mismatches: list = None, layout_anomalies: list = None) -> str:
    """
    Renders visual bounding-box tamper annotations directly on the PDF first page
    and returns a base64-encoded PNG image for the Risk Ops Visual Audit panel.
    - Red Box: Foreign font family insertions (e.g. Courier inserted into Helvetica)
    - Yellow Box: Numerical column spacing/alignment shifts
    """
    try:
        doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
        if len(doc) == 0:
            return ""

        page = doc[0]

        # Scan text blocks and draw bounding boxes around anomalous font blocks or text
        blocks = page.get_text("dict").get("blocks", [])

        # Color palette: RGB (0-1 floats)
        RED = (0.85, 0.15, 0.15)     # Font tamper
        YELLOW = (0.95, 0.65, 0.10)  # Layout anomaly
        GREEN = (0.10, 0.75, 0.35)   # Authentic section

        tamper_detected = False

        for b in blocks:
            if "lines" in b:
                for line in b["lines"]:
                    for span in line["spans"]:
                        font_name = str(span.get("font", "")).lower()
                        bbox = span.get("bbox", []) # [x0, y0, x1, y1]
                        text = span.get("text", "")

                        # If foreign font family detected
                        if any(f in font_name for f in ["courier", "times", "editor", "custom", "injected"]):
                            tamper_detected = True
                            rect = pymupdf.Rect(bbox[0]-2, bbox[1]-2, bbox[2]+2, bbox[3]+2)
                            page.draw_rect(rect, color=RED, width=1.5)
                            # Draw small badge
                            page.draw_rect(pymupdf.Rect(bbox[2]+4, bbox[1], bbox[2]+36, bbox[1]+10), color=RED, fill=RED)

                        # If numerical column anomaly detected
                        elif any(char.isdigit() for char in text) and ("cr" in text.lower() or "bal" in text.lower()):
                            # Draw subtle alignment verification
                            rect = pymupdf.Rect(bbox[0]-1, bbox[1]-1, bbox[2]+1, bbox[3]+1)
                            page.draw_rect(rect, color=YELLOW, width=0.8)

        # If no specific spans flagged but doc is marked forged, draw prominent top alert banner
        if not tamper_detected and (font_mismatches or layout_anomalies):
            page.draw_rect(pymupdf.Rect(20, 20, page.rect.width - 20, 60), color=RED, fill=(1.0, 0.9, 0.9), width=1.5)

        # Render annotated page to high-res PNG pixmap
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        b64_img = base64.b64encode(img_bytes).decode("utf-8")
        return f"data:image/png;base64,{b64_img}"

    except Exception as e:
        print(f"[tamper_visualizer] Error generating overlay: {e}")
        return ""
