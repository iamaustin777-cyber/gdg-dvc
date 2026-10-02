# GDG on Campus DVC

Website of Google Developer Groups on Campus at Diablo Valley College — https://gdg-dvc.web.app/

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build in dist/
```

Hosted on Firebase Hosting (project `gdg-dvc`). Deploy with `npm run deploy` (needs `npx firebase login` once).

- Chapter globe data: `python3 scripts/build-globe-data.py <chapters.json> <land-110m.json>` (sources listed in the script).
- Google campus photos are from Wikimedia Commons under CC BY-SA 4.0; attribution is shown with each photo.

---

Designed and built by [Austin Cao](https://github.com/iamaustin777-cyber), Lead Software Architect, GDG on Campus DVC (2026–27).
