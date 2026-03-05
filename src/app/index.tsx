import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useWeather} from '../hooks/useWeather';
import SearchBar from '../components/specific/SearchBar';
import WeatherCard from '../components/specific/WeatherCard';
import ForecastList from '../components/specific/ForecastList';
import {DBService} from '../services/dbService';
import {auth} from '../services/firebaseConfig';
import HistoryScreen from './history';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {BlurView} from 'expo-blur';
import WeatherEffects from '../components/specific/WeatherEffects';
import WeatherDetails from '../components/specific/WeatherDetails';

function getWeatherGradient(weatherCode: number | undefined): [string, string, string] {
    if (weatherCode === undefined) return ['#0F2027', '#203A43', '#2C5364'];
    if (weatherCode === 0) return ['#1A6B9A', '#2E86C1', '#85C1E9'];           // Clear sky — bright blue
    if (weatherCode <= 2) return ['#2874A6', '#5DADE2', '#AED6F1'];            // Mainly clear — light blue
    if (weatherCode === 3) return ['#566573', '#717D7E', '#99A3A4'];           // Overcast — gray
    if (weatherCode <= 48) return ['#626567', '#797D7F', '#AAB7B8'];           // Fog — muted gray
    if (weatherCode <= 55) return ['#1B4F72', '#2E86C1', '#7FB3D3'];           // Drizzle — steel blue
    if (weatherCode <= 65) return ['#154360', '#1A5276', '#2471A3'];           // Rain — dark blue
    if (weatherCode <= 77) return ['#1a2a3a', '#2d4a6b', '#4a7a9b'];           // Snow — dark wintry blue
    if (weatherCode <= 82) return ['#1B2631', '#1F618D', '#2874A6'];           // Rain showers — deep blue
    if (weatherCode === 85 || weatherCode === 86) return ['#1a2a3a', '#2d4a6b', '#4a7a9b']; // Snow showers
    return ['#17202A', '#1C2833', '#273746'];                                   // Thunderstorm — near black
}

export type RootStackParamList = {
    Home: undefined;
    History: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

function HomeScreen({navigation}: Props) {
    const {
        data,
        loading,
        error,
        locationOptions,
        fetchWeatherByQuery,
        selectLocation,
        fetchWeatherByCurrentLocation
    } = useWeather();
    const [saving, setSaving] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    useEffect(() => {
        const cities = ['Tokyo', 'New York', 'Paris', 'Sydney', 'Dubai', 'London', 'São Paulo', 'Cairo', 'Toronto', 'Seoul'];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        fetchWeatherByQuery(randomCity);
    }, []);

    const handleSaveToHistory = async () => {
        if (!data) return;
        const uid = auth.currentUser?.uid;
        if (!uid) {
            Alert.alert('Error', 'Not signed in. Please wait a moment and try again.');
            return;
        }
        setSaving(true);
        try {
            await DBService.saveWeatherQuery({
                uid,
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
            colors={getWeatherGradient(data?.current.weatherCode)}
            style={styles.container}
        >
            <WeatherEffects key={data?.current.weatherCode} weatherCode={data?.current.weatherCode}/>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent"/>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                            <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color="#FFFFFF"/>
                            <Text style={styles.logo}>Weather</Text>
                        </View>
                        <View style={{flexDirection: 'row', gap: 10}}>
                            <TouchableOpacity onPress={() => setShowAbout(true)} style={styles.historyBtn}>
                                <BlurView intensity={30} tint="light" style={styles.historyGlass}>
                                    <MaterialCommunityIcons name="information-outline" size={24} color="#FFFFFF"/>
                                </BlurView>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.historyBtn}>
                                <BlurView intensity={30} tint="light" style={styles.historyGlass}>
                                    <MaterialCommunityIcons name="history" size={24} color="#FFFFFF"/>
                                </BlurView>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Modal visible={showAbout} transparent animationType="fade"
                           onRequestClose={() => setShowAbout(false)}>
                        <View style={styles.modalOverlay}>
                            <BlurView intensity={60} tint="dark" style={styles.modalCard}>
                                <MaterialCommunityIcons name="weather-partly-cloudy" size={40} color="#FFFFFF"
                                                        style={{marginBottom: 8}}/>
                                <Text style={styles.modalTitle}>Weather</Text>
                                <Text style={styles.modalSubtitle}>Built by Tsung-Yueh (Eric) Lai</Text>

                                <View style={styles.modalDivider}/>

                                <Text style={styles.modalSectionTitle}>About PM Accelerator</Text>
                                <Text style={styles.modalBody}>
                                    Product Manager Accelerator is the fastest-growing Product Management professional
                                    development company in the industry. Led by Dr. Nancy Li, PM Accelerator boasts the
                                    most engaging alumni network, the highest success rate in landing top-tier PM
                                    offers, and is top-rated in the product management education space.{'\n\n'}PM
                                    Accelerator also provides seed investment to selected teams building high-impact
                                    products, helping them scale or apply to Y Combinator, and created the AI PM
                                    Bootcamp to help professionals become the next generation of AI Product Leaders.
                                </Text>

                                <TouchableOpacity
                                    style={styles.linkedInBtn}
                                    onPress={() => Linking.openURL('https://www.linkedin.com/school/pmaccelerator/')}
                                >
                                    <MaterialCommunityIcons name="linkedin" size={18} color="#FFFFFF"/>
                                    <Text style={styles.linkedInBtnText}>View on LinkedIn</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setShowAbout(false)} style={styles.modalClose}>
                                    <Text style={styles.modalCloseText}>Close</Text>
                                </TouchableOpacity>
                            </BlurView>
                        </View>
                    </Modal>

                    <SearchBar
                        onSearch={fetchWeatherByQuery}
                        onLocationSearch={fetchWeatherByCurrentLocation}
                        loading={loading}
                    />

                    {locationOptions && (
                        <BlurView intensity={30} tint="dark" style={styles.pickerContainer}>
                            <Text style={styles.pickerTitle}>Select a location:</Text>
                            {locationOptions.map((loc, i) => (
                                <TouchableOpacity key={i} style={styles.pickerItem} onPress={() => selectLocation(loc)}>
                                    <MaterialCommunityIcons name="map-marker-outline" size={18}
                                                            color="rgba(255,255,255,0.7)"/>
                                    <Text style={styles.pickerText}>
                                        {loc.name}{loc.admin1 ? `, ${loc.admin1}` : ''}{loc.country ? `, ${loc.country}` : ''}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </BlurView>
                    )}

                    {loading && (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#FFFFFF"/>
                            <Text style={styles.loadingText}>Fetching Atmosphere...</Text>
                        </View>
                    )}

                    {error && !loading && (
                        <BlurView intensity={40} tint="dark" style={styles.errorContainer}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#EF4444"/>
                            <Text style={styles.errorText}>{error}</Text>
                        </BlurView>
                    )}

                    {data && !loading && !error && (
                        <View style={styles.resultsContainer}>
                            <WeatherCard current={data.current} location={data.location}/>
                            <WeatherDetails current={data.current}/>
                            <ForecastList forecast={data.daily}/>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleSaveToHistory}
                                disabled={saving}
                                style={styles.saveBtnWrapper}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 1}}
                                    style={styles.saveBtn}
                                >
                                    <MaterialCommunityIcons name="cloud-check" size={24} color="#FFFFFF"
                                                            style={{marginRight: 8}}/>
                                    <Text style={styles.saveBtnText}>
                                        {saving ? 'Saving...' : 'Save to History Logs'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.pmAcceleratorNote}>
                                <Text style={styles.pmAcceleratorNoteText}>
                                    Weather — Built by Tsung-Yueh (Eric) Lai
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
    pickerContainer: {
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        marginBottom: 8,
    },
    pickerTitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 6,
        textTransform: 'uppercase',
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    pickerText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
    },
    resultsContainer: {
        marginTop: 8,
    },
    saveBtnWrapper: {
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: {width: 0, height: 4},
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        borderRadius: 28,
        overflow: 'hidden',
        padding: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    modalSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
        marginBottom: 4,
    },
    modalDivider: {
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 20,
    },
    modalSectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    modalBody: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 22,
        textAlign: 'left',
        alignSelf: 'flex-start',
    },
    linkedInBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
        backgroundColor: '#0A66C2',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
    },
    linkedInBtnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    modalClose: {
        marginTop: 16,
        padding: 10,
    },
    modalCloseText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
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
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="History"
                    component={HistoryScreen}
                    options={{
                        title: 'History',
                        headerStyle: {backgroundColor: '#0F2027'},
                        headerTintColor: '#FFFFFF',
                        headerShadowVisible: false,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
