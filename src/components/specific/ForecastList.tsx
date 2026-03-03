import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { DailyForecast } from '../../interfaces/Weather';
import { getWeatherIconName } from '../../utils/weatherIcons';
import { format, parseISO } from 'date-fns';

interface ForecastListProps {
    forecast: DailyForecast[];
}

export default function ForecastList({ forecast }: ForecastListProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>5-Day Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {forecast.map((day, index) => {
                    const date = parseISO(day.time);
                    const dayName = index === 0 ? 'Today' : format(date, 'EEE');
                    const dateStr = format(date, 'MMM d');
                    const iconName = getWeatherIconName(day.weatherCode);

                    return (
                        <BlurView intensity={20} tint="light" key={day.time} style={styles.card}>
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
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 24,
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 16,
    },
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
    dayName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 16,
        fontWeight: '500',
    },
    iconContainer: {
        marginBottom: 16,
    },
    temps: {
        alignItems: 'center',
        gap: 4,
    },
    maxTemp: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    minTemp: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    }
});
