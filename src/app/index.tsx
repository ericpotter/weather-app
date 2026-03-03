import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Text, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWeather } from '../hooks/useWeather';
import SearchBar from '../components/specific/SearchBar';
import WeatherCard from '../components/specific/WeatherCard';
import ForecastList from '../components/specific/ForecastList';
import { DBService } from '../services/dbService';
import HistoryScreen from './history';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export type RootStackParamList = {
    Home: undefined;
    History: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

function HomeScreen({ navigation }: Props) {
    const { data, locationInfo, loading, error, fetchWeatherByQuery, fetchWeatherByCurrentLocation } = useWeather();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Wait for user action
    }, []);

    const handleSaveToHistory = async () => {
        if (!data) return;
        setSaving(true);
        try {
            await DBService.saveWeatherQuery({
                locationName: data.location.name,
                temperature: data.current.temperature,
                condition: data.current.weatherCode.toString(),
                queryDate: new Date().toISOString(),
            });
            Alert.alert('Success', 'Weather data saved to history!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save to Firebase. Did you set up the Config?');
        } finally {
            setSaving(false);
        }
    };

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']} // Deep atmospheric gradient
            style={styles.container}
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color="#FFFFFF" />
                            <Text style={styles.logo}>PM Accelerator</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.historyBtn}>
                            <BlurView intensity={30} tint="light" style={styles.historyGlass}>
                                <MaterialCommunityIcons name="history" size={24} color="#FFFFFF" />
                            </BlurView>
                        </TouchableOpacity>
                    </View>

                    <SearchBar
                        onSearch={fetchWeatherByQuery}
                        onLocationSearch={fetchWeatherByCurrentLocation}
                        loading={loading}
                    />

                    {loading && (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                            <Text style={styles.loadingText}>Fetching Atmosphere...</Text>
                        </View>
                    )}

                    {error && !loading && (
                        <BlurView intensity={40} tint="dark" style={styles.errorContainer}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#EF4444" />
                            <Text style={styles.errorText}>{error}</Text>
                        </BlurView>
                    )}

                    {data && !loading && !error && (
                        <View style={styles.resultsContainer}>
                            <WeatherCard current={data.current} location={data.location} />

                            {locationInfo && (
                                <BlurView intensity={20} tint="light" style={styles.wikiContainer}>
                                    <MaterialCommunityIcons name="wikipedia" size={24} color="rgba(255,255,255,0.8)" style={{ marginTop: 2 }} />
                                    <Text style={styles.wikiText} numberOfLines={5}>{locationInfo}</Text>
                                </BlurView>
                            )}

                            <ForecastList forecast={data.daily} />

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleSaveToHistory}
                                disabled={saving}
                                style={styles.saveBtnWrapper}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.saveBtn}
                                >
                                    <MaterialCommunityIcons name="cloud-check" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.saveBtnText}>
                                        {saving ? 'Saving...' : 'Save to History Logs'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.pmAcceleratorNote}>
                                <Text style={styles.pmAcceleratorNoteText}>
                                    PM Accelerator is a premier product management coaching program helping tech professionals land PM offers.
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
        zIndex: 10,
    },
    logo: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    historyBtn: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    historyGlass: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        padding: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 1,
        opacity: 0.8,
    },
    errorContainer: {
        margin: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        overflow: 'hidden',
    },
    errorText: {
        color: '#FECACA',
        fontSize: 15,
        flex: 1,
        fontWeight: '500',
        lineHeight: 22,
    },
    resultsContainer: {
        marginTop: 8,
    },
    wikiContainer: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    wikiText: {
        flex: 1,
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        lineHeight: 24,
        fontWeight: '400',
    },
    saveBtnWrapper: {
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    saveBtn: {
        flexDirection: 'row',
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    pmAcceleratorNote: {
        marginHorizontal: 20,
        marginTop: 32,
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    pmAcceleratorNoteText: {
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '500',
    }
});

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootApp() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="History"
                    component={HistoryScreen}
                    options={{
                        title: 'Logs',
                        headerStyle: { backgroundColor: '#0F2027' },
                        headerTintColor: '#FFFFFF',
                        headerShadowVisible: false,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
