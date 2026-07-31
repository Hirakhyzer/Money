# Money Map

A privacy-first personal finance dashboard that runs entirely in your browser.

Money Map helps you record income and expenses, understand spending by category, set a monthly budget, search transactions, and export your data. All information is stored locally in your browser using `localStorage`; no account, server, or API key is required.

## Features

- Add income and expense transactions
- Monthly income, spending, and balance summaries
- Budget progress tracking
- Category breakdown
- Search and filter transactions
- Export and import data as JSON
- Responsive design for desktop and mobile
- Local-first privacy: your data stays on your device

## Run locally

No installation is required.

1. Download or clone the repository.
2. Open `index.html` in a modern browser.

For a local development server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Project structure

```text
Money/
├── index.html
├── styles.css
├── app.js
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
└── README.md
```

## Privacy

Money Map does not send financial information anywhere. Data is stored in the browser under the key `money-map-state-v1`. Clearing browser storage removes the saved data unless you exported a backup.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

## License

MIT License. See [LICENSE](LICENSE).
