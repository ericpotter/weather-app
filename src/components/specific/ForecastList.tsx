import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { DailyForecast } from '../../interfaces/Weather';
import { getWeatherDescription, getWeatherIconName } from '../../utils/weatherIcons';
import { format, parseISO } from 'date-fns';

function windDegToCompass(deg: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
}

function formatTime(isoString: string): string {
    try {
        return format(parseISO(isoString), 'h:mm a');
    } catch {
        return isoString;
    }
}

interface ForecastListProps {
    forecast: DailyForecast[];
}

export default function ForecastList({ forecast }: ForecastListProps) {
    const [selected, setSelected] = useState<DailyForecast | null>(null);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>7-Day Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {forecast.map((day, index) => {
                    const date = parseISO(day.time);
                    const dayName = index === 0 ? 'Today' : format(date, 'EEE');
                    const dateStr = format(date, 'MMM d');
                    const iconName = getWeatherIconName(day.weatherCode);

                    return (
                        <TouchableOpacity key={day.time} activeOpacity={0.8} onPress={() => setSelected(day)}>
                            <BlurView intensity={20} tint="light" style={styles.card}>
                                <Text style={styles.dayName}>{dayName}</Text>
                                <Text style={styles.dateText}>{dateStr}</Text>
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons name={iconName} size={42} color="#FFFFFF" />
                                </View>
                                <View style={styles.temps}>
                                    <Text style={styles.maxTemp}>{Math.round(day.maxTemp)}°</Text>
                                    <Text style={styles.minTemp}>{Math.round(day.minTemp)}°</Text>
                                </View>
                            </BlurView>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
                {selected && (
                    <View style={styles.modalOverlay}>
                        <BlurView intensity={60} tint="dark" style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={styles.modalDay}>
                                        {format(parseISO(selected.time), 'EEEE')}
                                    </Text>
                                    <Text style={styles.modalDate}>
                                        {format(parseISO(selected.time), 'MMMM d, yyyy')}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons
                                    name={getWeatherIconName(selected.weatherCode)}
                                    size={52}
                                    color="#FFFFFF"
                                />
                            </View>

                            <Text style={styles.modalDescription}>
                                {getWeatherDescription(selected.weatherCode)}
                            </Text>

                            <View style={styles.tempRow}>
                                <View style={styles.tempBlock}>
                                    <Text style={styles.tempBlockLabel}>High</Text>
                                    <Text style={styles.tempBlockValue}>{Math.round(selected.maxTemp)}°C</Text>
                                </View>
                                <View style={styles.tempDivider} />
                                <View style={styles.tempBlock}>
                                    <Text style={styles.tempBlockLabel}>Low</Text>
                                    <Text style={styles.tempBlockValue}>{Math.round(selected.minTemp)}°C</Text>
                                </View>
                            </View>

                            <View style={styles.detailGrid}>
                                {[
                                    { icon: 'weather-rainy', label: 'Precipitation', value: `${selected.precipitationSum} mm` },
                                    { icon: 'water-percent', label: 'Rain Chance', value: `${selected.precipitationProbability}%` },
                                    { icon: 'weather-windy', label: 'Max Wind', value: `${Math.round(selected.windSpeedMax)} km/h` },
                                    { icon: 'weather-hurricane', label: 'Wind Gusts', value: `${Math.round(selected.windGustsMax)} km/h` },
                                    { icon: 'compass-outline', label: 'Wind Dir', value: windDegToCompass(selected.windDirection) },
                                    { icon: 'white-balance-sunny', label: 'UV Index', value: `${Math.round(selected.uvIndexMax)}` },
                                    { icon: 'weather-sunset-up', label: 'Sunrise', value: formatTime(selected.sunrise) },
                                    { icon: 'weather-sunset-down', label: 'Sunset', value: formatTime(selected.sunset) },
                                ].map((item, i) => (
                                    <View key={i} style={styles.detailTile}>
                                        <MaterialCommunityIcons name={item.icon as any} size={20} color="rgba(255,255,255,0.7)" />
                                        <Text style={styles.detailValue}>{item.value}</Text>
                                        <Text style={styles.detailLabel}>{item.label}</Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>Close</Text>
                            </TouchableOpacity>
                        </BlurView>
                    </View>
                )}
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: 16 },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 24,
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    scrollContent: { paddingHorizontal: 20, gap: 16 },
    card: {
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        width: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    dayName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
    dateText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, fontWeight: '500' },
    iconContainer: { marginBottom: 16 },
    temps: { alignItems: 'center', gap: 4 },
    maxTemp: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    minTemp: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalCard: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        padding: 28,
        paddingBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalDay: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
    modalDate: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    modalDescription: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 20,
        fontWeight: '500',
    },
    tempRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tempBlock: { flex: 1, alignItems: 'center' },
    tempBlockLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    tempBlockValue: { fontSize: 36, fontWeight: '300', color: '#FFFFFF', marginTop: 4 },
    tempDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.15)' },
    detailGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    detailTile: {
        width: '47%',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        gap: 4,
    },
    detailValue: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 4 },
    detailLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    closeBtn: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    closeBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});
