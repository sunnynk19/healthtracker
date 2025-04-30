import { MongoClient } from 'mongodb';
import { format } from 'date-fns';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!);
const dbName = 'healthtracker';
const collectionName = 'habits';

interface HabitData {
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

async function ensureTodayExists() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  
  const todayData = await collection.findOne({ date: today });
  if (!todayData) {
    const newData: HabitData = {
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
      smokingCount: 0,
    };
    await collection.insertOne(newData);
  }
}

export async function GET() {
  try {
    await client.connect();
    await ensureTodayExists();
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const data = await collection.find().sort({ date: -1 }).toArray();
    return Response.json(data);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await client.connect();
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    await collection.updateOne(
      { date: data.date },
      { $set: data },
      { upsert: true }
    );
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to save data' }, { status: 500 });
  } finally {
    await client.close();
  }
} 