import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface WeatherRecord {
    id?: string;
    uid: string;
    locationName: string;
    temperature: number;
    condition: string;
    queryDate: string;
    notes?: string;
}

const COLLECTION_NAME = 'weather_queries';

export const DBService = {
    // CREATE
    async saveWeatherQuery(record: Omit<WeatherRecord, 'id'>) {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...record,
                createdAt: new Date().toISOString()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error saving document: ', error);
            throw error;
        }
    },

    // READ
    async getAllQueries(uid: string): Promise<WeatherRecord[]> {
        try {
            const q = query(collection(db, COLLECTION_NAME), where('uid', '==', uid), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const records: WeatherRecord[] = [];
            querySnapshot.forEach((doc) => {
                records.push({ id: doc.id, ...doc.data() } as WeatherRecord);
            });
            return records;
        } catch (error) {
            console.error('Error getting documents: ', error);
            throw error;
        }
    },

    // UPDATE
    async updateQueryNote(id: string, notes: string) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                notes,
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Error updating document: ', error);
            throw error;
        }
    },

    // DELETE
    async deleteQuery(id: string) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error('Error deleting document: ', error);
            throw error;
        }
    }
};
