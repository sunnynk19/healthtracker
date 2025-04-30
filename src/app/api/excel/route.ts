import { MongoClient } from 'mongodb';
import { format } from 'date-fns';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not defined in environment variables');
  throw new Error('MONGODB_URI is not defined in environment variables');
}

const client = new MongoClient(uri);
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
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    await ensureTodayExists();
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const data = await collection.find().sort({ date: -1 }).toArray();
    console.log('Successfully fetched data:', data.length, 'records');
    return Response.json(data);
  } catch (error) {
    console.error('Error in GET:', error);
    return Response.json({ 
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
  try {
    console.log('Attempting to connect to MongoDB for POST...');
    await client.connect();
    console.log('Successfully connected to MongoDB for POST');
    
    const data = await request.json();
    console.log('Received data:', data);
    
    // Create a clean copy without _id
    const updateData = { ...data };
    delete updateData._id;
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const result = await collection.updateOne(
      { date: updateData.date },
      { $set: updateData },
      { upsert: true }
    );
    
    console.log('Update result:', result);
    console.log('Successfully updated data for date:', updateData.date);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in POST:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return Response.json({ 
      error: 'Failed to save data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await client.close();
  }
} 