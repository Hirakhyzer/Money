# Contributing to Money Map

Thank you for helping improve Money Map.

## Before you start

- Search existing issues before opening a new one.
- Keep changes focused and easy to review.
- Never add analytics, remote storage, or data collection without an explicit privacy discussion.
- Do not commit real financial information, API keys, credentials, or personal data.

## Development

Money Map uses plain HTML, CSS, and JavaScript. No dependency installation is required.

```bash
git clone https://github.com/Hirakhyzer/Money.git
cd Money
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## Making a contribution

1. Fork the repository.
2. Create a descriptive branch such as `fix/mobile-table` or `feature/recurring-transactions`.
3. Make and test your change.
4. Confirm the app still works with an empty browser store and with existing transactions.
5. Open a pull request explaining what changed and how you tested it.

## Suggested checks

- Add income and expense transactions.
- Change budget and currency settings.
- Search and filter transactions.
- Export data, reset the app, and import the backup.
- Test at desktop and mobile widths.
- Check browser developer tools for errors.

## Pull request guidance

A useful pull request includes:

- A clear title
- A concise explanation of the change
- Screenshots for visual updates
- Testing steps
- Any privacy, accessibility, or browser compatibility considerations

By contributing, you agree that your contribution will be licensed under the MIT License.
