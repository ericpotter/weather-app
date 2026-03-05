import React, {useEffect} from 'react';
import RootApp from './src/app/index';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {onAuthStateChanged, signInAnonymously} from 'firebase/auth';
import {auth} from './src/services/firebaseConfig';

export default function App() {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                signInAnonymously(auth).catch((error) => {
                    console.error('Anonymous sign-in failed:', error);
                });
            }
        });
        return unsubscribe;
    }, []);

    return (
        <SafeAreaProvider>
            <RootApp/>
        </SafeAreaProvider>
    );
}
