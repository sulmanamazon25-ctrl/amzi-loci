# Windows installers for amziloci.com/download

Copy from the repo build output before deploy:

    .\scripts\sync-web-downloads.ps1

Source folder: `dist/` (Amzi-Loci-0.11.0-*.exe / .msi)
Served at: https://amziloci.com/downloads/

Large binaries are gitignored; sync + deploy uploads them to the live server.
