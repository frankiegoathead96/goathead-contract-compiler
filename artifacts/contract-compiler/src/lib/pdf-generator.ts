import jsPDF from "jspdf";

export type ContractType = "le" | "full-accel";

export interface ContractFormData {
  logoDataUrl?: string;
  signatureDataUrl?: string;
  firstName: string;
  lastName: string;
  artistName: string;
  email: string;
  phone: string;
  contractType: ContractType;
  totalAmount: string;
  productionOption: "a" | "b";
  upgradePrice: string;
}

const PAGE_W = 612;
const PAGE_H = 792;
const ML = 30;           // left margin
const MR = 30;           // right margin
const CW = PAGE_W - ML - MR; // content width = 552
const HEADER_LINE_Y = 57; // horizontal rule below header
const BODY_START_Y = 72;  // where body content begins after header rule
const FOOTER_Y = 773;     // footer text baseline
const LABEL_W = 88;       // label column width in label/value pairs

function ordinal(d: number): string {
  if (d === 1 || d === 21 || d === 31) return `${d}st`;
  if (d === 2 || d === 22) return `${d}nd`;
  if (d === 3 || d === 23) return `${d}rd`;
  return `${d}th`;
}

function todayFormatted(): string {
  const d = new Date();
  const months = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  return `${months[d.getMonth()]} ${ordinal(d.getDate())} ${d.getFullYear()}`;
}

class PDFBuilder {
  private doc: jsPDF;
  private y: number;
  private page: number;
  private logoDataUrl?: string;
  private signatureDataUrl?: string;
  private prodCode = "GHR PROD 001 CA (01-26)";

  constructor(logoDataUrl?: string, signatureDataUrl?: string) {
    this.doc = new jsPDF({ unit: "pt", format: "letter" });
    this.page = 1;
    this.logoDataUrl = logoDataUrl;
    this.signatureDataUrl = signatureDataUrl;
    this.y = BODY_START_Y;
  }

  private drawHeader(): void {
    // Logo — top left (image is 451×84, displayed at ~150×28pt)
    if (this.logoDataUrl) {
      this.doc.addImage(this.logoDataUrl, "PNG", ML, 14, 150, 28);
    }

    // Contact info — top right, 3 lines
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(30, 30, 30);
    this.doc.text("Questions: info@goatheadrecords.com", PAGE_W - MR, 22, { align: "right" });
    this.doc.text("Legal: legal@goatheadrecords.com",   PAGE_W - MR, 32, { align: "right" });
    this.doc.text("O: +1 (310) 844-6358",               PAGE_W - MR, 42, { align: "right" });
    this.doc.setTextColor(0, 0, 0);

    // Divider line below header
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.6);
    this.doc.line(ML, HEADER_LINE_Y, PAGE_W - MR, HEADER_LINE_Y);
  }

  private drawFooter(): void {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(60, 60, 60);
    this.doc.text(
      `${this.prodCode}  THIS IS NOT A BILL. YOU WILL BE BILLED SEPARATELY.`,
      ML, FOOTER_Y
    );
    this.doc.text(`Page ${this.page}`, PAGE_W - MR, FOOTER_Y, { align: "right" });
    this.doc.setTextColor(0, 0, 0);
  }

  private rule(): void {
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(ML, this.y, PAGE_W - MR, this.y);
    this.y += 10;
  }

  private newPage(): void {
    this.drawFooter();
    this.doc.addPage();
    this.page++;
    this.y = BODY_START_Y;
    this.drawHeader();
  }

  private checkSpace(needed: number): void {
    if (this.y + needed > FOOTER_Y - 18) {
      this.newPage();
    }
  }

  /** Render a line of text. Returns height consumed. */
  private line(
    txt: string,
    size: number,
    bold: boolean,
    x: number,
    spaceAfter = 0,
    color: [number,number,number] = [0,0,0]
  ): void {
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(color[0], color[1], color[2]);
    const lineH = size * 1.35;
    const lines = this.doc.splitTextToSize(txt, CW - (x - ML));
    for (const l of lines) {
      this.checkSpace(lineH);
      this.doc.text(l, x, this.y);
      this.y += lineH;
    }
    if (spaceAfter) this.y += spaceAfter;
    this.doc.setTextColor(0, 0, 0);
  }

  /** Bold section header (UPPERCASE) */
  private sectionHead(txt: string): void {
    this.checkSpace(18);
    this.y += 4;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.text(txt, ML, this.y);
    this.y += 13;
    this.doc.setFont("helvetica", "normal");
  }

  /** Bold sub-heading (not uppercase) */
  private subHead(txt: string): void {
    this.checkSpace(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.text(txt, ML, this.y);
    this.y += 13;
    this.doc.setFont("helvetica", "normal");
  }

  /** Paragraph of body text */
  private para(txt: string, spaceAfter = 8): void {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    const lineH = 9.5 * 1.4;
    const lines = this.doc.splitTextToSize(txt, CW);
    for (const l of lines) {
      this.checkSpace(lineH);
      this.doc.text(l, ML, this.y);
      this.y += lineH;
    }
    this.y += spaceAfter;
  }

  /** Label + value on same row */
  private labelVal(label: string, value: string): void {
    this.checkSpace(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.text(label, ML, this.y);
    this.doc.setFont("helvetica", "normal");
    // wrap value if needed
    const maxValW = CW - LABEL_W;
    const valLines = this.doc.splitTextToSize(value, maxValW);
    this.doc.text(valLines[0] ?? "", ML + LABEL_W, this.y);
    this.y += 13;
    for (let i = 1; i < valLines.length; i++) {
      this.checkSpace(13);
      this.doc.text(valLines[i], ML + LABEL_W, this.y);
      this.y += 13;
    }
  }

  // ─── Full Accel ──────────────────────────────────────────────────────────

  buildFullAccel(data: ContractFormData): void {
    const fullName = `${data.firstName} ${data.lastName}`;
    const isOptA = data.productionOption === "a";
    const reScope = isOptA
      ? "7 Mix/Mastering Songs Bundle"
      : "3 Original Productions with ASTRØMAN";
    const amount = data.totalAmount ? `$${data.totalAmount} USD` : "$990 USD";

    this.drawHeader();

    // ── Cover letter section
    this.line("ACCEL PROGRAM FULL ACCEL AGREEMENT", 11, true, ML, 4);
    this.line(todayFormatted(), 9.5, false, ML, 2);
    this.line("VIA ELECTRONIC DELIVERY", 9.5, true, ML, 10);

    this.labelVal("Artist Name:", data.artistName);
    this.labelVal("Email:", data.email);
    this.labelVal("RE:", reScope);
    this.y += 8;

    this.line(`Dear ${data.firstName} (${data.artistName}),`, 9.5, false, ML, 3);
    this.para("Enclosed is one partially executed copy of the mentioned contract for your review.");
    this.line("Best regards,", 9.5, false, ML, 3);
    this.line("Frank Carrozzo", 9.5, true, ML, 1);
    this.line("FC:sb", 9.5, false, ML, 14);

    // Divider before PARTIES
    this.rule();

    // ── PARTIES
    this.sectionHead("PARTIES");
    this.labelVal("Artist Name:", data.artistName);
    this.labelVal("Name:", fullName);
    this.labelVal("Email:", data.email);
    this.labelVal("Phone Number:", data.phone);
    this.labelVal("Record Company:", "Goathead Records (Music Division of Cloudchasers Entertainment L.L.C.)");
    this.labelVal("Represented by:", "Frank Carrozzo (CEO)");
    this.labelVal("Email:", "info@goatheadrecords.com   Legal: legal@goatheadrecords.com");
    this.y += 10;

    // ── PRODUCTION DETAILS
    this.sectionHead("PRODUCTION DETAILS");
    this.line("Scope of Work:", 9.5, true, ML, 4);

    if (isOptA) {
      this.line("A) 7 Mix / Mastering Songs Bundle", 9.5, true, ML, 3);
      this.para("These sessions include 7 original co-production, mixing and mastering recordings. Mixing and mastering is included in the project.");
    } else {
      this.line("A) 3 Original Productions with ASTRØMAN (Good Faith)", 9.5, true, ML, 3);
      this.para("These sessions include 3 original productions delivered by ASTRØMAN. Payment will be held until the Artist approves the first drafts. Once a draft (or its sample) is approved, the full payment for the productions will be released by Goathead Records to ensure quality and maintain the Producer's dedication and fair pay to the project.");
    }

    this.line("B) Accel Based Services (Accel Program)", 9.5, true, ML, 3);
    this.para("Upon successful enrollment in the Accel Program and while remaining in good standing, the Artist receives all associated services and benefits, including graphic support (up to 15 graphics per month), three short-form videos per month, administrative support, co-management, branding and social media support, EPK creation, logo creation, and related Accel Program deliverables.");
    // ── PRICE AND PAYMENT TERMS
    this.sectionHead("PRICE AND PAYMENT TERMS");
    this.subHead("Total Payment");
    this.line(`The total payment for the above services is ${amount}.`, 9.5, true, ML, 3);
    this.para("Payment shall be made through Goathead Records website and processed via PayPal using the provided link, ensuring Buyer and Seller Protection for both parties. A credit or debit card may be linked.");

    // ── BREAKDOWN
    this.sectionHead("BREAKDOWN OF PROCESS, PAYMENTS, AND REFUND POLICY");
    if (isOptA) {
      this.para("Payment for the Mix/Mastering Songs Bundle is due upon execution of this Agreement and processed through Goathead Records' website via PayPal. Mixing and mastering sessions will commence upon receipt of payment and delivery of the Artist's stems or tracks. Final deliverables shall be provided in WAV and MP3 formats.");
      this.para("Any revisions requested after the deliverables have been fully approved and released will incur an additional fee of $70 per revision, completed within a mutually agreed timeframe.");
    } else {
      this.line("$35 per song:", 9.5, true, ML, 2);
      this.para("As soon as ASTRØMAN starts working on a song, he will inform the Artist that the process has begun. The $35 per song payment is non-refundable in the event of a contract breach due to the Artist's personal preferences regarding ASTRØMAN's work. This payment covers the Producer's hourly wage.");
      this.para("Payment will be held until the Artist approves the first drafts of the songs from ASTRØMAN. Once one draft (or its sample) is approved, the full payment for the productions will be released by Goathead Records to ensure quality and maintain the Producer's dedication and fair pay to the project.");
      this.para("Given the collaborative nature of ASTRØMAN's services, the first draft approval (or its sample) is crucial, as it ensures the Artist's expectations are met early in the process, preventing discrepancies later.");
    }

    // ── LENIENT FEES
    this.sectionHead("LENIENT FEES AND REFUNDS");
    this.para("In the event of early termination or dispute, refunds will be handled in a lenient and good faith manner. Any services that have been delivered, commenced, or approved will be deemed earned and may be charged a la carte at their standard individual rates. Any refund issued will apply only to clearly unrendered and unapproved services after delivered and approved services have been accounted for.");

    // ── ACCEL PROGRAM RESOURCES
    this.sectionHead("ACCEL PROGRAM RESOURCES");
    this.para("Accel Insider resources may include up to fifteen (15) monthly visual assets and release visualizers, provided at the Company's discretion based on availability, release timing, and creative alignment.");
    this.para("If Artist requests assets or services that fall outside the included scope, or that require additional production time or specialized work, Goathead Records may present an additional offer.");
    this.para("Any such work will be priced based on the Company's hourly rates and offered at a discounted rate compared to standard a la carte pricing.");

    // ── CO-MANAGEMENT
    this.sectionHead("CO-MANAGEMENT CLAUSE");
    this.para("This Agreement does not create an employment relationship, partnership, or joint venture between the Artist and Goathead Records. Goathead Records shall act in a co-management and advisory capacity only, with the purpose of supporting and guiding the Artist's career development as opportunities arise. Such support may include, but is not limited to: identifying and presenting potential opportunities, providing strategic guidance, assisting in securing Features for Artist's vocalists needs, support with outreach, introductions, brand positioning, promotional planning, and other career-related advisory services. The Artist retains full control over all creative, business, and career decisions. Goathead Records shall not have authority to bind the Artist to any agreement, obligation, or commitment without the Artist's prior written consent.");
    this.subHead("Management Fees");
    this.para("Goathead Records shall not receive any management fee or retainer unless and until the Artist's gross revenue generated during the term of this Agreement exceeds Five Thousand Dollars ($5,000 USD). If and only if such threshold is exceeded, and provided that the revenue is directly attributable to Goathead Records' co-management efforts, the parties may negotiate and enter into a separate written management agreement. Any such future agreement may provide for a management fee of up to ten percent (10%) of the Artist's gross revenue, subject to mutually agreed terms. Nothing in this clause shall be construed as a binding management agreement, and no management fee shall apply unless expressly agreed to in writing by both parties in a separate agreement.");

    // ── FEATURED ARTISTS
    this.sectionHead("FEATURED ARTISTS AND CONSIDERATION OFFER CLAUSE");
    this.para("From time to time, Goathead Records may present opportunities for the Artist to participate as a featured artist or featured vocalist on third party or Goathead Records affiliated projects. All proposed terms, including compensation, credits, and ownership interests, shall be disclosed to the Artist for review.");
    this.para("The Artist has no obligation to accept any such opportunity. Acceptance requires the Artist's prior written approval, and Goathead Records shall not bind the Artist without such consent.");
    this.para("If accepted, Goathead Records may assist with coordination and clearances; however, all material terms must be approved by the Artist prior to final commitment. Once a featured performance is recorded, approved, and incorporated into a final master, it shall be deemed locked and may not be removed or materially altered without the mutual written consent of the Artist and Goathead Records, except as required by law.");
    this.para("Nothing herein creates exclusivity, employment, or a guarantee of opportunities.");

    // ── VIDEO ASSETS
    this.sectionHead("VIDEO ASSETS AND VISUALIZER TRADE-OFF CLAUSE");
    this.para("As part of the Accel Program, the Artist is entitled to receive up to three (3) short-form video assets per month. At the Artist's request and subject to Goathead Records' approval, these monthly video assets may be traded in good faith for one (1) longer-form visualizer or lyric-style video, where the scope, complexity, and production requirements reasonably exceed those of standard short-form edits. Such trade-offs are rendered in good faith and do not establish an obligation for Goathead Records to provide additional services beyond the standard Accel Program deliverables.");
    this.para("In the event a project requires extended processing time, increased production complexity, or additional work hours beyond the scope of the Accel Program, Goathead Records may propose a separate project-specific offer to the Artist at a discounted Accelerator Artist rate.");
    this.para("Any such additional work shall be subject to a separate written agreement or written approval and shall only be proposed where the requested project does not reasonably fall within the standard scope of the Accel Program. Goathead Records shall not be obligated to undertake such additional work unless expressly agreed to in writing by both parties.");

    // ── DELIVERABLES AND TIMING
    this.sectionHead("DELIVERABLES AND TIMING");
    this.para("ASTRØMAN will deliver final templates, mastering files in WAV and MP3 formats within 12 months from the commencement of the project and execution of this contract. This timeline may be adjusted based on the Artist's discretion, deadlines, and needs. Specific deadlines may be set by the Artist and communicated in a timely manner.");

    // ── REVISIONS
    this.sectionHead("REVISIONS");
    this.para("Any feedback loop by the Artist during the process will be free of charge. However, additional revisions requested after the deliverables/masters have been fully approved, and only if already in the release phase, will incur an additional fee of $70 per revision, completed within a mutually agreed timeframe.");

    // ── CREDIT AND ROLES
    this.sectionHead("CREDIT AND ROLES");
    this.para(`ASTRØMAN may be credited as mixer, mastering and sound engineer of the phono-recordings at the Artist's discretion, but not as a featuring Artist or Producer (except for produced recordings). ${data.artistName} shall be credited as a producer due to his ownership of the works. There is no requirement for split sheets due to the works being classified as a work for hire.`);

    // ── BREACH
    this.sectionHead("BREACH OF CONTRACT");
    this.para("1. Company Breach (Goathead Records): In the event Goathead Records fails to fulfill its obligations, specifically delivery of final mixes and master recordings, the Artist shall be entitled to expedited delivery. Goathead Records agrees to complete remaining song-related basic deliverables within two (2) to three (3) weeks from the date of breach notification and provide lenient good-faith refunds of non-rendered services only in the event of non-delivery.");
    this.para("2. Artist Breach: If the Artist breaches by failure to communicate, failure to make payments, or other material violation, Goathead Records reserves the right to withhold or forfeit funds already paid for services provided or resources rendered up to the breach date, including graphics, admin, and program resources.");

    // ── DURATION
    this.sectionHead("DURATION OF CONTRACT");
    this.para("Twelve (12) months from signing.");

    // ── SIGNATURES
    this.sectionHead("SIGNATURES");
    this.para("By signing this contract, both parties acknowledge and agree to the terms and conditions stated above.");
    this.signatures(fullName, data.artistName);

    this.drawFooter();
  }

  // ─── L.E. ────────────────────────────────────────────────────────────────

  buildLE(data: ContractFormData): void {
    const fullName = `${data.firstName} ${data.lastName}`;
    const amount = data.totalAmount ? `$${data.totalAmount} USD` : "_____ USD";
    const upgradeAmt = data.upgradePrice ? `$${data.upgradePrice} USD` : "$250–$990 USD";

    this.drawHeader();

    // ── Cover letter
    this.line("ACCEL PROGRAM L.E. AGREEMENT", 11, true, ML, 4);
    this.line(todayFormatted(), 9.5, false, ML, 2);
    this.line("VIA ELECTRONIC DELIVERY", 9.5, true, ML, 10);

    this.labelVal("Artist Name:", data.artistName);
    this.labelVal("Email:", data.email);
    this.labelVal("RE:", "Accel Program L.E. — Limited Edition Enrollment");
    this.y += 8;

    this.line(`Dear ${data.firstName} (${data.artistName}),`, 9.5, false, ML, 3);
    this.para("Enclosed is one partially executed copy of the mentioned contract for your review.");
    this.line("Best regards,", 9.5, false, ML, 3);
    this.line("Frank Carrozzo", 9.5, true, ML, 1);
    this.line("FC:sb", 9.5, false, ML, 14);

    // Divider before PARTIES
    this.rule();

    // ── PARTIES
    this.sectionHead("PARTIES");
    this.labelVal("Artist Name:", data.artistName);
    this.labelVal("Name:", fullName);
    this.labelVal("Email:", data.email);
    this.labelVal("Phone Number:", data.phone);
    this.labelVal("Record Company:", "Goathead Records (Music Division of Cloudchasers Entertainment L.L.C.)");
    this.labelVal("Represented by:", "Frank Carrozzo (CEO)");
    this.labelVal("Email:", "info@goatheadrecords.com   Legal: legal@goatheadrecords.com");
    this.y += 10;

    // ── PRODUCTION DETAILS
    this.sectionHead("PRODUCTION DETAILS");
    this.line("Scope of Work:", 9.5, true, ML, 4);
    this.line("A) Accel Based Services (Accel Program)", 9.5, true, ML, 3);
    this.para("Upon successful enrollment in the Accel Program L.E. and while remaining in good standing, the Artist receives all associated services and benefits, including graphic support (up to 15 graphics per month), three short-form videos per month, administrative support, co-management, branding and social media support, EPK creation, logo creation, and related Accel Program deliverables.");

    // ── PRICE AND PAYMENT TERMS
    this.sectionHead("PRICE AND PAYMENT TERMS");
    this.subHead("Total Payment");
    this.line(`The total payment for the above L.E. services is ${amount}.`, 9.5, true, ML, 3);
    this.para("Payment shall be made through Goathead Records website and processed via PayPal using the provided link, ensuring Buyer and Seller Protection for both parties. A credit or debit card may be linked.");

    this.subHead("Upgrade to Full Accel Program");
    this.para(`The Artist enrolled under this L.E. Agreement may elect, at any time during the term of this Agreement, to upgrade to the Full Accel Program for an additional payment of ${upgradeAmt}. Upon payment and written confirmation by both parties, this Agreement shall be amended to reflect the Full Accel Program terms. At the time of upgrade, the Artist shall select one of the following production options:`);
    this.line("Option A: 7 Mix / Mastering Songs Bundle", 9.5, true, ML, 2);
    this.line("Option B: 3 Original Productions with ASTRØMAN", 9.5, true, ML, 6);
    this.para("The selected option will be incorporated into the amended Full Accel Agreement. The L.E. program payment shall be applied as a credit toward the total Full Accel Program fee.");

    // ── LENIENT FEES
    this.sectionHead("LENIENT FEES AND REFUNDS");
    this.para("In the event of early termination or dispute, refunds will be handled in a lenient and good faith manner. Any services that have been delivered, commenced, or approved will be deemed earned and may be charged a la carte at their standard individual rates. Any refund issued will apply only to clearly unrendered and unapproved services after delivered and approved services have been accounted for.");

    // ── ACCEL PROGRAM RESOURCES
    this.sectionHead("ACCEL PROGRAM RESOURCES");
    this.para("Accel Insider resources may include up to fifteen (15) monthly visual assets and release visualizers, provided at the Company's discretion based on availability, release timing, and creative alignment.");
    this.para("If Artist requests assets or services that fall outside the included scope, or that require additional production time or specialized work, Goathead Records may present an additional offer.");
    this.para("Any such work will be priced based on the Company's hourly rates and offered at a discounted rate compared to standard a la carte pricing.");

    // ── CO-MANAGEMENT
    this.sectionHead("CO-MANAGEMENT CLAUSE");
    this.para("This Agreement does not create an employment relationship, partnership, or joint venture between the Artist and Goathead Records. Goathead Records shall act in a co-management and advisory capacity only, with the purpose of supporting and guiding the Artist's career development as opportunities arise. Such support may include, but is not limited to: identifying and presenting potential opportunities, providing strategic guidance, assisting in securing Features for Artist's vocalists needs, support with outreach, introductions, brand positioning, promotional planning, and other career-related advisory services. The Artist retains full control over all creative, business, and career decisions. Goathead Records shall not have authority to bind the Artist to any agreement, obligation, or commitment without the Artist's prior written consent.");
    this.subHead("Management Fees");
    this.para("Goathead Records shall not receive any management fee or retainer unless and until the Artist's gross revenue generated during the term of this Agreement exceeds Five Thousand Dollars ($5,000 USD). If and only if such threshold is exceeded, and provided that the revenue is directly attributable to Goathead Records' co-management efforts, the parties may negotiate and enter into a separate written management agreement. Any such future agreement may provide for a management fee of up to ten percent (10%) of the Artist's gross revenue, subject to mutually agreed terms. Nothing in this clause shall be construed as a binding management agreement, and no management fee shall apply unless expressly agreed to in writing by both parties in a separate agreement.");

    // ── FEATURED ARTISTS
    this.sectionHead("FEATURED ARTISTS AND CONSIDERATION OFFER CLAUSE");
    this.para("From time to time, Goathead Records may present opportunities for the Artist to participate as a featured artist or featured vocalist on third party or Goathead Records affiliated projects. All proposed terms, including compensation, credits, and ownership interests, shall be disclosed to the Artist for review.");
    this.para("The Artist has no obligation to accept any such opportunity. Acceptance requires the Artist's prior written approval, and Goathead Records shall not bind the Artist without such consent.");
    this.para("If accepted, Goathead Records may assist with coordination and clearances; however, all material terms must be approved by the Artist prior to final commitment. Once a featured performance is recorded, approved, and incorporated into a final master, it shall be deemed locked and may not be removed or materially altered without the mutual written consent of the Artist and Goathead Records, except as required by law.");
    this.para("Nothing herein creates exclusivity, employment, or a guarantee of opportunities.");

    // ── VIDEO ASSETS
    this.sectionHead("VIDEO ASSETS AND VISUALIZER TRADE-OFF CLAUSE");
    this.para("As part of the Accel Program, the Artist is entitled to receive up to three (3) short-form video assets per month. At the Artist's request and subject to Goathead Records' approval, these monthly video assets may be traded in good faith for one (1) longer-form visualizer or lyric-style video, where the scope, complexity, and production requirements reasonably exceed those of standard short-form edits. Such trade-offs are rendered in good faith and do not establish an obligation for Goathead Records to provide additional services beyond the standard Accel Program deliverables.");
    this.para("In the event a project requires extended processing time, increased production complexity, or additional work hours beyond the scope of the Accel Program, Goathead Records may propose a separate project-specific offer to the Artist at a discounted Accelerator Artist rate.");
    this.para("Any such additional work shall be subject to a separate written agreement or written approval and shall only be proposed where the requested project does not reasonably fall within the standard scope of the Accel Program. Goathead Records shall not be obligated to undertake such additional work unless expressly agreed to in writing by both parties.");

    // ── BREACH
    this.sectionHead("BREACH OF CONTRACT");
    this.para("1. Company Breach (Goathead Records): In the event Goathead Records fails to fulfill its obligations under this L.E. Agreement, the Artist shall be entitled to expedited service resolution. Goathead Records shall address any outstanding deliverables within two (2) to three (3) weeks from the date of breach notification and provide lenient good-faith refunds of non-rendered services only in the event of non-delivery.");
    this.para("2. Artist Breach: If the Artist breaches by failure to communicate, failure to make payments, or other material violation, Goathead Records reserves the right to withhold or forfeit funds already paid for services provided or resources rendered up to the breach date, including graphics, admin, and program resources.");

    // ── DURATION
    this.sectionHead("DURATION OF CONTRACT");
    this.para("Twelve (12) months from signing.");

    // ── SIGNATURES
    this.sectionHead("SIGNATURES");
    this.para("By signing this contract, both parties acknowledge and agree to the terms and conditions stated above.");
    this.signatures(fullName, data.artistName);

    this.drawFooter();
  }

  private signatures(fullName: string, artistName: string): void {
    this.checkSpace(110);
    this.y += 48;
    const sig1X = ML;
    const sig2X = PAGE_W / 2 + 20;
    const lineLen = 170;
    const today = todayFormatted();

    // Signature image (includes the line) — width matches lineLen, height proportional (1157x452)
    if (this.signatureDataUrl) {
      const imgW = lineLen;
      const imgH = Math.round(imgW * (452 / 1157));
      // Place so the line in the image aligns with the artist's signature line
      this.doc.addImage(this.signatureDataUrl, "PNG", sig2X, this.y - imgH + 14, imgW, imgH);
    }

    // Left signature line (artist) — Frank's line is part of the image
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(0, 0, 0);
    this.doc.line(sig1X, this.y, sig1X + lineLen, this.y);
    if (!this.signatureDataUrl) {
      // Only draw Frank's line if no signature image is present
      this.doc.line(sig2X, this.y, sig2X + lineLen, this.y);
    }
    this.y += 12;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    this.doc.text(`${fullName} (${artistName}) Artist`, sig1X, this.y);
    this.doc.text("Frank Carrozzo", sig2X, this.y);
    this.y += 12;
    this.doc.text(`EXECUTED ON: ${today}`, sig1X, this.y);
    this.doc.text("Goathead Records", sig2X, this.y);
  }

  save(filename: string): void {
    this.doc.save(filename);
  }
}

export function generateContract(data: ContractFormData): void {
  const builder = new PDFBuilder(data.logoDataUrl, data.signatureDataUrl);
  const filename = `${data.artistName.replace(/\s+/g, "_")}_${
    data.contractType === "le" ? "LE" : "FullAccel"
  }_${Date.now()}.pdf`;

  if (data.contractType === "le") {
    builder.buildLE(data);
  } else {
    builder.buildFullAccel(data);
  }

  builder.save(filename);
}
