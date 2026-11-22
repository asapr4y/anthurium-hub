"""Import the reviewed Canva export without replacing its information with summaries.

Usage: python scripts/import-reference.py path/to/royal-citrine-bootstrap.json
Only outward URL destinations are left unconfigured. Source text and image
references are retained in a fixture so content coverage can be verified.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))["page"]
assets = {asset["id"]: asset for asset in source["E"]}


def decode(text):
    try:
        return text.encode("latin1").decode("utf-8")
    except UnicodeError:
        return text


def outward_links(value):
    found = []
    if isinstance(value, dict):
        for key, item in value.items():
            if key in ("Q", "G") and isinstance(item, str) and item.startswith("https://"):
                found.append(item)
            else:
                found.extend(outward_links(item))
    elif isinstance(value, list):
        for item in value:
            found.extend(outward_links(item))
    return list(dict.fromkeys(found))


pages = []
for page_index, page in enumerate(source["A"]["A"]):
    sections = []
    for section_index, section in enumerate(page.get("t", [])):
        entries = []
        for element_index, element in enumerate(section.get("E", [])):
            key = f"{page_index}.{section_index}.{element_index}"
            common = {"sourceKey": key, "y": element.get("A", 0), "x": element.get("B", 0)}
            if element.get("A?") == "K":
                text = decode("".join(element["a"]["C"]["A"]).strip())
                if text:
                    entries.append({**common, "kind": "text", "text": text, "originalUrls": outward_links(element)})
            if element.get("A?") == "I":
                asset_id = element.get("a", {}).get("B", {}).get("A", {}).get("A")
                asset = assets.get(asset_id, {})
                if asset.get("type") == "RASTER":
                    files = asset["files"]
                    file = next((file for file in files if file.get("quality") == "SCREEN"), files[0])
                    entries.append({**common, "kind": "image", "assetId": asset_id, "originalPath": file["url"], "width": file["width"], "height": file["height"]})
        sections.append({"index": section_index, "entries": sorted(entries, key=lambda item: (round(item["y"] / 12), item["x"]))})
    pages.append({"index": page_index, "title": page.get("B"), "sections": sections})

fixture = {"source": "https://orchidtree.my.canva.site/royal-citrine-hub/", "pages": pages}
(ROOT / "tests/fixtures").mkdir(parents=True, exist_ok=True)
(ROOT / "tests/fixtures/reference-content.json").write_text(json.dumps(fixture, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

documents = []
used = set()
link_defaults = {}


def article(resource_id, category, title, selections, description, keywords=(), featured=False):
    blocks = []
    link_count = 0
    def add_link(label, source_key, original_url=None):
        nonlocal link_count
        link_count += 1
        key = f"{resource_id}-{link_count}"
        link_defaults[key] = None
        blocks.append({"kind": "link", "sourceKey": source_key, "label": label, "linkKey": key, "url": None})
        return key
    for page_index, section_index, indices in selections:
        entries = pages[page_index]["sections"][section_index]["entries"]
        if indices is not None:
            entries = [entry for entry in entries if int(entry["sourceKey"].split(".")[-1]) in indices]
        for entry in entries:
            used.add(entry["sourceKey"])
            if entry["kind"] == "image":
                blocks.append({"kind": "image", "sourceKey": entry["sourceKey"], "src": "/assets/reference/" + Path(entry["originalPath"]).name, "alt": f"{title} — reference illustration", "width": entry["width"], "height": entry["height"]})
                continue
            text = entry["text"]
            urls = list(dict.fromkeys(entry["originalUrls"] + re.findall(r"https?://[^\s]+", text)))
            link_label = bool(re.fullmatch(r"(?:DOWNLOAD|ACCESS|CHECK|UPLOAD|SAMPLE FILLED.OUT|ONE PAGER|CLICK HERE|https?://).*", text, re.I | re.S))
            if link_label:
                label = text if not text.startswith("http") else ("Advisor Home Office (AHO)" if "advisorhomeoffice" in text else "SunSMART+")
                add_link(label, entry["sourceKey"])
            else:
                inline_links = []
                for url in re.findall(r"https?://[^\s]+", text):
                    label = "Meeting booking link" if "WithKristalyn" in url else "Prospect form link" if "StartYourFinancialPlan" in url else "Lnk.bio profile" if "lnk.bio" in url else "Resource link"
                    key = add_link(label, entry["sourceKey"])
                    inline_links.append(blocks.pop())
                    text = text.replace(url, "{{link:" + key + "}}")
                if "[Insert Link]" in text:
                    key = add_link("Insurance planning session booking", entry["sourceKey"])
                    inline_links.append(blocks.pop())
                    text = text.replace("[Insert Link]", "{{link:" + key + "}}")
                kind = "script" if category == "scripts" and text.startswith("Hi!") else "note" if text.startswith(("NOTE:", "VIDEO PASSWORD:")) else "step" if re.match(r"^\d+\. ", text) else "paragraph"
                if text.startswith(("Step-by-Step", "How to ", "Valid ID Guidelines", "Sending Follow Ups", "BIR Registration", "Payment Tracking", "Client Policy Anniversary", "FOR ELECTRONIC", "FOR HARD COPY")):
                    kind = "heading"
                blocks.append({"kind": kind, "sourceKey": entry["sourceKey"], "text": text})
                blocks.extend(inline_links)
    documents.append({"id": resource_id, "category": category, "title": title, "type": "Conversation script" if category == "scripts" else "Video recordings" if category == "learning" else "Reference guide" if category in ("guides", "tools") else "Step-by-step guide", "description": description, "keywords": list(keywords), "featured": featured, "blocks": blocks, "url": None})


article('product-guides', 'guides', 'SLOCPI Quick Product Guide', [(1, 1, [1, 2])], 'SLOCPI Quick Product Guide.', ['products', 'brochures', 'benefits'], True)
article('payment-guides', 'guides', 'Payment Guides for Clients (Insurance/SLOCPI)', [(1, 1, [3, 4])], 'Payment Guides for Clients (Insurance/SLOCPI).', ['premium', 'payments'], True)
article('mutual-fund-payments', 'guides', 'Payment Guides for Clients (Mutual Funds/SLAMCI)', [(1, 1, [5, 6])], 'Payment Guides for Clients (Mutual Funds/SLAMCI).', ['investments', 'payments'])
article('underwriting', 'guides', 'Medical, Travel & Occupational Guidelines', [(1, 2, [0, 1, 2])], 'Medical Conditions Guidelines, Foreign Travel and Residence Guidelines, and Occupational Guidelines.', ['underwriting', 'medical', 'travel', 'occupation'])
article('proposal-guides', 'guides', 'How to make Proposals for Prospects', [(1, 2, [3, 4])], 'How to make Proposals for Prospects.', ['proposal', 'quotation'])
article('application', 'new-business', 'New Business Process', [(2, 1, None)], 'Step-by-Step Guide on How to Process New Business Applications.', ['SunSMART', 'application', 'NB process', 'settlement'], True)
article('loa-request', 'new-business', 'LOA Request', [(2, 2, None), (2, 3, None)], 'Step-by-Step Guide on How to Request for LOA.', ['medical', 'laboratory', 'LOA'])
article('additional-requirements', 'new-business', 'Additional Requirements', [(2, 4, None)], 'Step-by-Step Guide on How to Send Additional Requirements.', ['underwriter', 'requirements'])
article('agents-report', 'new-business', 'Agent’s Report', [(2, 5, None)], 'Step-by-Step Guide on How to Send Agent’s Report.', ['report', 'underwriter'])
article('amendments', 'new-business', 'Amendment of Application (AOA)', [(2, 6, None)], 'Step-by-Step Guide on How to Send Amendment of Application (AOA).', ['AOA', 'amendment'])
article('acceptance-offer', 'new-business', 'Acceptance of Offer (AOO)', [(2, 7, None)], 'Step-by-Step Guide on How to Send Acceptance of Offer (AOO).', ['AOO', 'rated', 'exclusions'])
article('refund', 'new-business', 'Refund Request', [(2, 8, None)], 'Step-by-Step Guide on How to Send Refund Request.', ['refund', 'bank', 'credit card'])
article('id-references', 'new-business', 'Valid ID Guidelines', [(2, 9, [1, 2, 3, 4, 5, 6])], 'Valid ID Guidelines and Authentication Process.', ['identity', 'identification', 'PhilID', 'TIN'])
article('settlement-followups', 'new-business', 'Sending Follow Ups', [(2, 9, [7, 8, 9])], 'For follow ups regarding application settlement.', ['follow up', 'underwriter', 'settlement'])
article('after-settlement', 'servicing', 'To Do After Settlement', [(3, 1, None)], 'Step-by-Step Guide on What to Do After Client’s Policy is Settled.', ['policy', 'settlement'])
article('client-portal', 'servicing', 'Client Portal', [(3, 2, None)], 'How to Activate Client Portal.', ['activate', 'account', 'mobile application'])
article('policy-delivery', 'servicing', 'Policy Delivery', [(3, 3, None)], 'Step-by-Step Guide for Policy Delivery.', ['electronic', 'paper', 'contract', 'PAR'])
article('payment-tracking', 'servicing', 'Payment Tracking', [(3, 4, None)], 'Payment Tracking and sample Excel files.', ['Excel', 'payment', 'masterlist', 'orphan clients'])
article('policy-reviews', 'servicing', 'Client Policy Anniversary', [(3, 5, None)], 'Client Policy Anniversary and sample art card.', ['review', 'anniversary', 'art card'])
article('service-requests', 'servicing', 'Servicing Requests via AHO', [(3, 6, None), (3, 7, None), (3, 8, None)], 'How to Process Servicing Requests via AHO.', ['clients', 'servicing', 'claims', 'requirements'])
article('work-setup', 'getting-started', 'How to Access Your Email', [(4, 1, None)], 'Step-by-Step Guide on How to Access Your Email.', ['rookie', 'email', 'Gmail', 'two factor'])
article('advisor-access', 'getting-started', 'AHO & SunSMART+ Access', [(4, 2, None)], 'Step-by-Step Guide on How to Access your Advisor Home Office or AHO, and SunSMART+.', ['rookie', 'account', 'SunSMART', 'AHO'])
article('calling-card', 'getting-started', 'Order a Calling Card', [(4, 3, None)], 'Step-by-Step Guide on How to Order free calling card via SunClick2Shop.', ['rookie', 'calling card'])
article('payroll', 'getting-started', 'BPI Payroll Account Opening', [(4, 4, None)], 'Step-by-Step Guide on How to Open Your BPI Payroll Account.', ['rookie', 'bank', 'BPI', 'payroll'])
article('bir-registration', 'getting-started', 'BIR Registration', [(4, 5, None)], 'BIR Registration: guide and forms.', ['rookie', 'tax', 'BIR'])
article('group-life', 'getting-started', 'Group Life Enrollment', [(4, 6, None)], 'Step-by-Step Guide on How to Enroll to Group Life Insurance.', ['rookie', 'benefits', 'group life'])
article('unit-recordings', 'learning', 'Team Recordings (in-house trainings and meetings)', [(5, 1, [1, 2, 6])], 'Team Recordings (in-house trainings and meetings).', ['unit', 'training', 'meeting', 'video'])
article('dld-recordings', 'learning', 'Video Recordings (Sun Life DLD)', [(5, 1, [3, 4, 5, 7])], 'Video Recordings (Sun Life DLD).', ['training', 'DLD', 'Brightbox'])
article('brand-materials', 'tools', 'Sun Life Google Drive', [(6, 1, [1, 2, 3])], 'Sun Life Google Drive and social media art cards.', ['art cards', 'social media', 'Drive'])
article('advisor-platforms', 'tools', 'Advisor Home Office (AHO)', [(6, 1, [4, 5])], 'Advisor Home Office (AHO).', ['AHO', 'portal'])
article('product-brochures', 'tools', 'Product Brochures and Quick Guide', [(6, 1, [6, 7])], 'Product Brochures and Quick Guide.', ['products', 'brochures'])
article('sunsmart', 'tools', 'SunSMART+ (new proposal generator + eApplication)', [(6, 2, [0, 1, 2])], 'SunSMART+ (new proposal generator + eApplication).', ['proposal', 'application', 'SunSMART'])
article('planning-tools', 'tools', 'Financial Planning Tools', [(6, 2, [3, 4, 5, 6])], 'Financial Planning Tools, presentations, and one-pager quote.', ['financial', 'planning', 'presentation', 'Canva', 'quote'])
article('campers', 'tools', 'For CAMPers (Email Marketing Banner)', [(6, 3, [1, 2])], 'For CAMPers (Email Marketing Banner).', ['email marketing', 'Canva', 'CAMP'])
article('learning-enrollment', 'tools', 'ALD E-learning Course Enrollment Form', [(6, 3, [3, 4, 5])], 'ALD E-learning Course Enrollment Form.', ['course', 'enrollment', 'training'])
article('learning-platform', 'tools', 'E-learning Hub', [(6, 3, [6, 7])], 'E-learning Hub.', ['academy', 'learning', 'course'])
article('one-pager', 'tools', 'One-Pager Quotation (Google Sheet)', [(6, 4, None)], 'One-Pager Quotation (Google Sheet).', ['quotation', 'quote', 'Google Sheet'])
article('first-conversations', 'scripts', 'For Warm Prospects — Birthday', [(7, 1, None)], 'For Warm Prospects (FB Friends, Relatives etc.) celebrating birthday soon.', ['birthday', 'warm', 'prospects', 'spiel'])
article('warm-cold-prospects', 'scripts', 'For Warm Prospects & Cold Prospects', [(7, 2, None)], 'For Warm Prospects & Cold Prospects.', ['prospects', 'cold', 'warm', 'referral', 'spiel'])
article('referrals', 'scripts', 'For Existing Clients’ Beneficiaries — Siblings', [(7, 3, None)], 'For Existing Clients’ Beneficiaries: SIBLINGS.', ['referral', 'siblings', 'beneficiaries', 'spiel'])
article('parents-spiel', 'scripts', 'For Existing Clients’ Beneficiaries — Parents', [(7, 4, None)], 'For Existing Clients’ Beneficiaries: PARENTS.', ['referral', 'parents', 'beneficiaries', 'spiel'])
article('children-spiel', 'scripts', 'For Existing Clients’ Beneficiaries — Children', [(7, 5, None)], 'For Existing Clients’ Beneficiaries: CHILD/CHILDREN.', ['children', 'beneficiaries', 'spiel'])
article('product-spiel', 'scripts', 'Product focused spiel', [(7, 6, None)], 'Product focused spiel.', ['health', '900', 'million', 'product', 'spiel'])

expected = {entry["sourceKey"] for page in pages[1:] for section in page["sections"][1:] for entry in section["entries"]}
assert expected == used, f"Unmapped source entries: {expected - used}; unexpected: {used - expected}"
(ROOT / "src/reference-content.js").write_text("// Complete source information. Future destinations are configured in resource-links.js.\nexport const referenceResources = " + json.dumps(documents, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
links_file = ROOT / "src/resource-links.js"
if not links_file.exists():
    links_file.write_text("// Add each future https:// destination here. null keeps only that link pending.\nexport const resourceLinks = " + json.dumps(link_defaults, indent=2) + ";\n", encoding="utf-8")
image_entries = {entry["originalPath"]: entry for page in pages[1:] for section in page["sections"][1:] for entry in section["entries"] if entry["kind"] == "image"}
(ROOT / "scripts/reference-assets.json").write_text(json.dumps(list(image_entries.values()), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Imported {len(documents)} articles, {len(used)} source entries, and {len(image_entries)} reference images.")
