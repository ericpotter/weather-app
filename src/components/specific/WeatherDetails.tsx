import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CurrentWeather } from '../../interfaces/Weather';

function windDegToCompass(deg: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
}

interface StatProps {
    icon: string;
    label: string;
    value: string;
}

function StatTile({ icon, label, value }: StatProps) {
    return (
        <BlurView intensity={25} tint="light" style={styles.tile}>
            <MaterialCommunityIcons name={icon as any} size={24} color="rgba(255,255,255,0.9)" />
            <Text style={styles.tileValue}>{value}</Text>
            <Text style={styles.tileLabel}>{label}</Text>
        </BlurView>
    );
}

export default function WeatherDetails({ current }: { current: CurrentWeather }) {
    const stats: StatProps[] = [
        { icon: 'thermometer', label: 'Feels Like', value: `${Math.round(current.feelsLike)}°C` },
        { icon: 'weather-windy', label: 'Wind Gusts', value: `${Math.round(current.windGusts)} km/h` },
        { icon: 'compass-outline', label: 'Wind Dir', value: windDegToCompass(current.windDirection) },
        { icon: 'white-balance-sunny', label: 'UV Index', value: `${Math.round(current.uvIndex)}` },
        { icon: 'eye-outline', label: 'Visibility', value: `${(current.visibility / 1000).toFixed(1)} km` },
        { icon: 'gauge', label: 'Pressure', value: `${Math.round(current.pressure)} hPa` },
        { icon: 'cloud-outline', label: 'Cloud Cover', value: `${current.cloudCover}%` },
        { icon: 'water', label: 'Precipitation', value: `${current.precipitation} mm` },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Weather Details</Text>
            <View style={styles.grid}>
                {stats.map((s, i) => <StatTile key={i} {...s} />)}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tile: {
        width: '47%',
        borderRadius: 20,
        overflow: 'hidden',
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        gap: 6,
    },
    tileValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 8,
    },
    tileLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
