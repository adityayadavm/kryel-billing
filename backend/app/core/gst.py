"""
GST split logic: CGST+SGST for intra-state (customer and company in the
same state), IGST for inter-state or international. This is the one
place that decision gets made so every invoice applies it the same way.
"""
from decimal import Decimal, ROUND_HALF_UP


def round2(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_invoice_totals(
    line_items: list[dict],
    company_state: str | None,
    customer_state: str | None,
    is_international: bool,
) -> dict:
    """
    line_items: [{"quantity": Decimal, "unit_price": Decimal, "gst_rate": Decimal}, ...]
    Returns subtotal, cgst_total, sgst_total, igst_total, grand_total,
    plus each line's computed line_total (pre-tax).
    """
    subtotal = Decimal("0")
    cgst_total = Decimal("0")
    sgst_total = Decimal("0")
    igst_total = Decimal("0")
    computed_lines = []

    intra_state = (
        not is_international
        and company_state is not None
        and customer_state is not None
        and company_state.strip().lower() == customer_state.strip().lower()
    )

    for item in line_items:
        line_total = round2(item["quantity"] * item["unit_price"])
        subtotal += line_total

        if is_international:
            # No GST on international invoices.
            pass
        else:
            gst_rate = item.get("gst_rate", Decimal("0"))
            gst_amount = round2(line_total * gst_rate / Decimal("100"))
            if intra_state:
                cgst_total += round2(gst_amount / 2)
                sgst_total += round2(gst_amount / 2)
            else:
                igst_total += gst_amount

        computed_lines.append({**item, "line_total": line_total})

    grand_total = round2(subtotal + cgst_total + sgst_total + igst_total)

    return {
        "line_items": computed_lines,
        "subtotal": round2(subtotal),
        "cgst_total": round2(cgst_total),
        "sgst_total": round2(sgst_total),
        "igst_total": round2(igst_total),
        "grand_total": grand_total,
    }
