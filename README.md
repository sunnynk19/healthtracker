# Health Habit Tracker

A beautiful frontend application for tracking daily health habits and storing data in a local Excel file.

## Features

- Track daily health habits:
  - No Smoking (or reduce count)
  - 30 min Exercise
  - Drink Water
  - Sleep tracking
  - Veg+Fruits intake
  - Alcohol consumption
  - Salt+Oil intake
  - B12 supplement
  - Breathing exercises
- Increment and track smoking count
- Store all data in a local Excel file
- View 30-day smoking trend
- Check/uncheck habits for each day
- Auto-create new rows for each day
- Beautiful and responsive UI
- Dark mode support

## Tech Stack

- React 18
- Next.js 14
- TypeScript
- Tailwind CSS
- SheetJS (xlsx) for Excel file handling
- Recharts for data visualization
- Zustand for state management
- Radix UI for accessible components
- File System Access API for local file handling

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd healthtracker
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. When you first open the app, you'll be prompted to select a location to save your Excel file.
2. The app will create a new Excel file if one doesn't exist, or load existing data if it does.
3. Check/uncheck your daily habits using the toggles.
4. Use the "Smoking Count" button to track cigarettes smoked.
5. View your 30-day smoking trend in the graph.
6. All changes are automatically saved to the Excel file.
7. View your history in the table below.

## Excel File Structure

The Excel file contains the following columns:

- Date
- No Smoking
- Exercise
- Water
- Sleep
- Veg+Fruits
- Alcohol
- Salt+Oil
- B12
- Breathing
- Smoking Count

## Contributing

Feel free to submit issues and enhancement requests.

## License

MIT License
