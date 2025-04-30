import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';
import path from 'path';
import { format } from 'date-fns';

const EXCEL_FILE_PATH = path.join(process.cwd(), 'health-tracker.xlsx');

export interface HabitData {
  date: string;
  noSmoking: boolean;
  exercise: boolean;
  water: boolean;
  sleep: boolean;
  vegFruits: boolean;
  alcohol: boolean;
  saltOil: boolean;
  b12: boolean;
  breathing: boolean;
  smokingCount: number;
}

type SheetRow = [
  string, // date
  number, // noSmoking
  number, // exercise
  number, // water
  number, // sleep
  number, // vegFruits
  number, // alcohol
  number, // saltOil
  number, // b12
  number, // breathing
  number  // smokingCount
];

function ensureTodayExists(data: HabitData[]): HabitData[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  if (!data.find(row => row.date === today)) {
    data.push({
      date: today,
      noSmoking: false,
      exercise: false,
      water: false,
      sleep: false,
      vegFruits: false,
      alcohol: false,
      saltOil: false,
      b12: false,
      breathing: false,
      smokingCount: 0
    });
  }
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function ensureExcelFileExists() {
  try {
    await fs.access(EXCEL_FILE_PATH);
  } catch {
    // File doesn't exist, create it
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Date', 'No Smoking', 'Exercise', 'Water', 'Sleep', 'Veg+Fruits', 'Alcohol', 'Salt+Oil', 'B12', 'Breathing', 'Smoking Count']
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Habits');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    await fs.writeFile(EXCEL_FILE_PATH, buffer);
  }
}

export async function GET() {
  try {
    await ensureExcelFileExists();
    const fileBuffer = await fs.readFile(EXCEL_FILE_PATH);
    const workbook = XLSX.read(fileBuffer);
    const worksheet = workbook.Sheets['Habits'];
    const data = XLSX.utils.sheet_to_json<SheetRow>(worksheet, { header: 1 });
    
    // Skip header row and convert to HabitData format
    const habitData = data.slice(1).map(row => ({
      date: row[0],
      noSmoking: Boolean(row[1]),
      exercise: Boolean(row[2]),
      water: Boolean(row[3]),
      sleep: Boolean(row[4]),
      vegFruits: Boolean(row[5]),
      alcohol: Boolean(row[6]),
      saltOil: Boolean(row[7]),
      b12: Boolean(row[8]),
      breathing: Boolean(row[9]),
      smokingCount: Number(row[10]) || 0
    }));

    // Ensure today's data exists and sort by date
    const dataWithToday = ensureTodayExists(habitData);

    return NextResponse.json(dataWithToday);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return NextResponse.json({ error: 'Failed to read Excel file' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data: HabitData[] = await request.json();
    await ensureExcelFileExists();

    // Convert data to array format
    const rows = [
      ['Date', 'No Smoking', 'Exercise', 'Water', 'Sleep', 'Veg+Fruits', 'Alcohol', 'Salt+Oil', 'B12', 'Breathing', 'Smoking Count'],
      ...data.map(row => [
        row.date,
        row.noSmoking ? 1 : 0,
        row.exercise ? 1 : 0,
        row.water ? 1 : 0,
        row.sleep ? 1 : 0,
        row.vegFruits ? 1 : 0,
        row.alcohol ? 1 : 0,
        row.saltOil ? 1 : 0,
        row.b12 ? 1 : 0,
        row.breathing ? 1 : 0,
        row.smokingCount
      ])
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Habits');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    await fs.writeFile(EXCEL_FILE_PATH, buffer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing to Excel file:', error);
    return NextResponse.json({ error: 'Failed to write to Excel file' }, { status: 500 });
  }
} 