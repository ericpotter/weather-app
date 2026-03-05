import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {CurrentWeather, Location} from '../../interfaces/Weather';
import {getWeatherDescription, getWeatherIconName} from '../../utils/weatherIcons';

interface WeatherCardProps {
    current: CurrentWeather;
    location: Location;
}

export default function WeatherCard({current, location}: WeatherCardProps) {
    const iconName = getWeatherIconName(current.weatherCode);
    const description = getWeatherDescription(current.weatherCode);

    return (
        <View style={styles.card}>
            <Text style={styles.locationText}>
                {location.name}
                {location.admin1 ? ` • ${location.admin1}` : ''}
            </Text>

            <View style={styles.mainInfo}>
                <MaterialCommunityIcons name={iconName} size={120} color="#FFFFFF" style={styles.shadowIcon}/>
                <View style={styles.tempContainer}>
                    <Text style={styles.temperature}>{Math.round(current.temperature)}</Text>
                    <Text style={styles.degreeSymbol}>°C</Text>
                </View>
            </View>

            <Text style={styles.descriptionText}>{description}</Text>

            <View style={styles.divider}/>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="water-percent" size={28} color="rgba(255,255,255,0.7)"/>
                    <View>
                        <Text style={styles.detailLabel}>Humidity</Text>
                        <Text style={styles.detailValue}>{current.humidity}%</Text>
                    </View>
                </View>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="weather-windy" size={28} color="rgba(255,255,255,0.7)"/>
                    <View>
                        <Text style={styles.detailLabel}>Wind</Text>
                        <Text style={styles.detailValue}>{current.windSpeed} km/h</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 32,
        padding: 32,
        marginHorizontal: 20,
        marginVertical: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    locationText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 24,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    mainInfo: {
        alignItems: 'center',
        marginBottom: 16,
    },
    shadowIcon: {
        shadowColor: '#FFFFFF',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.4,
        shadowRadius: 20,
        marginBottom: 16,
    },
    tempContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    temperature: {
        fontSize: 96,
        fontWeight: '200',
        color: '#FFFFFF',
        letterSpacing: -4,
        includeFontPadding: false,
    },
    degreeSymbol: {
        fontSize: 32,
        fontWeight: '400',
        color: '#FFFFFF',
        marginTop: 12,
    },
    descriptionText: {
        fontSize: 24,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 32,
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
        marginBottom: 24,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
    }
});
