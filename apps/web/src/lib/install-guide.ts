import { APP_VERSION, DOWNLOAD_BASE_URL } from "./site";

export const RECOMMENDED_INSTALLER = `Amzi-Loci-${APP_VERSION}-setup.exe`;

export const INSTALL_STEPS = [
  {
    step: 1,
    title: "Download the installer",
    body: "Use the recommended Setup.exe for one-click install on Windows 10 or 11 (64-bit). No manual dependencies.",
    action: { label: "Download Setup.exe", href: `${DOWNLOAD_BASE_URL}/${RECOMMENDED_INSTALLER}` },
  },
  {
    step: 2,
    title: "Run Setup.exe",
    body: 'Double-click the file. If SmartScreen appears, choose "More info" → "Run anyway" (unsigned indie build). Follow the wizard — Next → Install → Finish.',
  },
  {
    step: 3,
    title: "Open Amzi Loci",
    body: "Launch from the Start menu or desktop shortcut. Activate your 14-day trial or enter your license in Settings.",
  },
  {
    step: 4,
    title: "Add your Google API key (BYOK)",
    body: "Open Settings → Google AI. Paste one Google key, click Test, then Save. Enable billing on your Google Cloud project for image generation. Anthropic/OpenAI are optional.",
    link: { label: "BYOK setup guide", href: "/byok-setup" },
  },
  {
    step: 5,
    title: "Create your first project",
    body: "Projects → New project → paste Amazon reviews → run all six steps through Export. Typical first run: under 30 minutes.",
  },
] as const;

export const INSTALLER_OPTIONS = [
  {
    id: "setup",
    label: "Setup.exe",
    file: RECOMMENDED_INSTALLER,
    audience: "Most users — one-click install",
    recommended: true,
  },
  {
    id: "msi",
    label: "MSI installer",
    file: `Amzi-Loci-${APP_VERSION}.msi`,
    audience: "IT teams — silent deploy via Group Policy / Intune",
    recommended: false,
  },
  {
    id: "portable",
    label: "Portable",
    file: `Amzi-Loci-${APP_VERSION}-portable.exe`,
    audience: "USB or no admin rights — run without installing",
    recommended: false,
  },
] as const;

export const SMARTScreen_HELP = [
  'Windows may show "Windows protected your PC" for new publishers.',
  'Click "More info", then "Run anyway".',
  "The app is not code-signed yet — this is normal for early releases.",
] as const;

export const IT_DEPLOY_NOTES = [
  "MSI supports per-machine install: msiexec /i Amzi-Loci-0.11.0.msi /quiet",
  "Portable build needs no installer — extract and run from any folder.",
  "API keys are per-user in Windows Credential Manager (not in the MSI).",
] as const;
