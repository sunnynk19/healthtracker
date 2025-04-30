import { MongoClient, Db } from 'mongodb';
import { format } from 'date-fns';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not defined in environment variables');
  throw new Error('MONGODB_URI is not defined in environment variables');
}

const dbName = 'healthtracker';
const collectionName = 'habits';

// Create a cached connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri as string);
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

async function ensureTodayExists() {
  const { db } = await connectToDatabase();
  const collection = db.collection(collectionName);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayData = await collection.findOne({ date: today });
  
  if (!todayData) {
    const newData = {
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
    const { db } = await connectToDatabase();
    await ensureTodayExists();
    
    const collection = db.collection(collectionName);
    const data = await collection.find().sort({ date: -1 }).toArray();
    
    return Response.json(data);
  } catch (error) {
    console.error('Error in GET:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return Response.json({ 
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    console.log('Received data:', data);
    
    // Create a clean copy without _id
    const updateData = { ...data };
    delete updateData._id;
    
    const collection = db.collection(collectionName);
    
    // First, check if the document exists
    const existingDoc = await collection.findOne({ date: updateData.date });
    
    if (existingDoc) {
      // If document exists, update it without touching _id
      const result = await collection.updateOne(
        { date: updateData.date },
        { $set: updateData }
      );
      console.log('Update result:', result);
    } else {
      // If document doesn't exist, insert it
      const result = await collection.insertOne(updateData);
      console.log('Insert result:', result);
    }
    
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
  }
} 