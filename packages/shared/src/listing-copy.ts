export type ListingCopy = {
  title: string;
  bullets: string[];
  description: string;
  backendKeywords: string;
  model: string;
};

export const AMAZON_LIMITS = {
  titleMax: 200,
  bulletMax: 500,
  bulletCount: 5,
  descriptionMax: 2000,
  backendKeywordsMaxBytes: 250,
} as const;

export type ComplianceStatus = "pass" | "warn" | "fail";

export type ComplianceItem = {
  id: string;
  label: string;
  status: ComplianceStatus;
  message: string;
};

const BANNED_PATTERNS = [
  /\b(cure|cures|heal|heals|treat|treats)\b/i,
  /\b(#1|number one|best seller|top rated)\b/i,
  /\b(fda approved|clinically proven|doctor recommended)\b/i,
  /\b(100% guaranteed|money back guarantee)\b/i,
  /\b(miracle|magic)\b/i,
  /\b(anti[- ]?aging|wrinkle[- ]?free)\b/i,
];

function byteLength(value: string): number {
  let len = 0;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x7f) len += 1;
    else if (code <= 0x7ff) len += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      len += 4;
      i++;
    } else len += 3;
  }
  return len;
}

function checkBanned(text: string): string | null {
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return `Avoid risky claims matching: ${pattern.source}`;
    }
  }
  return null;
}

export function runComplianceChecks(copy: ListingCopy | null): ComplianceItem[] {
  const items: ComplianceItem[] = [];

  if (!copy) {
    items.push({
      id: "no-copy",
      label: "Listing copy",
      status: "warn",
      message: "Generate listing copy before upload (step 4).",
    });
    return items;
  }

  const titleLen = copy.title.length;
  if (titleLen === 0) {
    items.push({ id: "title-empty", label: "Title", status: "fail", message: "Title is required." });
  } else if (titleLen > AMAZON_LIMITS.titleMax) {
    items.push({
      id: "title-len",
      label: "Title length",
      status: "fail",
      message: `${titleLen}/${AMAZON_LIMITS.titleMax} characters — shorten before upload.`,
    });
  } else {
    items.push({
      id: "title-len",
      label: "Title length",
      status: "pass",
      message: `${titleLen}/${AMAZON_LIMITS.titleMax} characters.`,
    });
  }

  const titleBanned = checkBanned(copy.title);
  if (titleBanned) {
    items.push({ id: "title-claims", label: "Title claims", status: "warn", message: titleBanned });
  }

  const bullets = copy.bullets ?? [];
  if (bullets.length < AMAZON_LIMITS.bulletCount) {
    items.push({
      id: "bullet-count",
      label: "Bullet count",
      status: "warn",
      message: `Only ${bullets.length}/${AMAZON_LIMITS.bulletCount} bullets — Amazon allows up to 5.`,
    });
  } else {
    items.push({
      id: "bullet-count",
      label: "Bullet count",
      status: "pass",
      message: `${AMAZON_LIMITS.bulletCount} bullets ready.`,
    });
  }

  bullets.forEach((bullet, index) => {
    if (bullet.length > AMAZON_LIMITS.bulletMax) {
      items.push({
        id: `bullet-len-${index}`,
        label: `Bullet ${index + 1}`,
        status: "fail",
        message: `${bullet.length}/${AMAZON_LIMITS.bulletMax} characters.`,
      });
    }
    const banned = checkBanned(bullet);
    if (banned) {
      items.push({
        id: `bullet-claims-${index}`,
        label: `Bullet ${index + 1} claims`,
        status: "warn",
        message: banned,
      });
    }
  });

  const descLen = copy.description.length;
  if (descLen === 0) {
    items.push({
      id: "desc-empty",
      label: "Description",
      status: "warn",
      message: "Description is empty — add product story if needed.",
    });
  } else if (descLen > AMAZON_LIMITS.descriptionMax) {
    items.push({
      id: "desc-len",
      label: "Description length",
      status: "fail",
      message: `${descLen}/${AMAZON_LIMITS.descriptionMax} characters.`,
    });
  } else {
    items.push({
      id: "desc-len",
      label: "Description length",
      status: "pass",
      message: `${descLen}/${AMAZON_LIMITS.descriptionMax} characters.`,
    });
  }

  const kwBytes = byteLength(copy.backendKeywords);
  if (kwBytes > AMAZON_LIMITS.backendKeywordsMaxBytes) {
    items.push({
      id: "kw-len",
      label: "Backend keywords",
      status: "fail",
      message: `${kwBytes}/${AMAZON_LIMITS.backendKeywordsMaxBytes} bytes — trim keywords.`,
    });
  } else if (kwBytes === 0) {
    items.push({
      id: "kw-empty",
      label: "Backend keywords",
      status: "warn",
      message: "Backend keywords empty — optional but helps search.",
    });
  } else {
    items.push({
      id: "kw-len",
      label: "Backend keywords",
      status: "pass",
      message: `${kwBytes}/${AMAZON_LIMITS.backendKeywordsMaxBytes} bytes.`,
    });
  }

  items.push({
    id: "ai-disclosure",
    label: "AI image disclosure",
    status: "warn",
    message:
      "If images are AI-generated, disclose when Amazon asks during upload. Keep product representation accurate.",
  });

  return items;
}

export function formatListingCopyText(copy: ListingCopy, productContext?: string): string {
  const lines = [
    "AMAZON LISTING COPY",
    "===================",
    "",
  ];
  if (productContext?.trim()) {
    lines.push(`Product: ${productContext.trim()}`, "");
  }
  lines.push(`TITLE (${copy.title.length} chars)`, copy.title, "", "BULLET POINTS");
  copy.bullets.forEach((bullet, i) => {
    lines.push(`${i + 1}. (${bullet.length} chars) ${bullet}`);
  });
  lines.push("", `DESCRIPTION (${copy.description.length} chars)`, copy.description, "");
  lines.push(
    `BACKEND KEYWORDS (${byteLength(copy.backendKeywords)} bytes)`,
    copy.backendKeywords,
    "",
    `Generated with: ${copy.model}`,
  );
  return lines.join("\n");
}

export function formatComplianceChecklist(items: ComplianceItem[]): string {
  const lines = [
    "AMAZI LOCI — UPLOAD CHECKLIST",
    "=============================",
    "",
    "Review each item before uploading to Seller Central.",
    "",
  ];
  for (const item of items) {
    const icon = item.status === "pass" ? "[OK]" : item.status === "warn" ? "[!]" : "[X]";
    lines.push(`${icon} ${item.label}`, `    ${item.message}`, "");
  }
  lines.push(
    "IMAGE TIPS",
    "----------",
    "- Main image: pure white background (RGB 255,255,255), product fills ~85% of frame",
    "- Minimum 1000px on longest side; 2000px+ recommended for zoom",
    "- Secondary images: lifestyle and infographics allowed",
    "",
    "NEXT STEPS",
    "----------",
    "1. Open Seller Central → Inventory → Edit listing",
    "2. Paste title, bullets, description, backend keywords",
    "3. Upload images from the images/ folder in this zip",
    "4. Save and preview on mobile",
  );
  return lines.join("\n");
}
