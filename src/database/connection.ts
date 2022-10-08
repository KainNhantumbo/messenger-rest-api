import mongoose from 'mongoose';
/**
 * Makes connection to the database
 * @param db_uri connection string
 * @returns Promise<typeof mongoose>
 */
const db = (db_uri: string) => mongoose.connect(db_uri);
export default db;
