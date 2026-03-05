import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {BlurView} from 'expo-blur';

interface SearchBarProps {
    onSearch: (query: string) => void;
    onLocationSearch: () => void;
    loading?: boolean;
}

export default function SearchBar({onSearch, onLocationSearch, loading}: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <View style={styles.container}>
            <BlurView intensity={20} tint="light" style={styles.glassContainer}>
                <View style={styles.inputRow}>
                    <MaterialCommunityIcons name="magnify" size={24} color="rgba(255,255,255,0.7)" style={styles.icon}/>
                    <TextInput
                        style={styles.input}
                        placeholder="Search city, zip, landmark..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        selectionColor="#FFFFFF"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={handleSearch} disabled={loading} style={styles.searchBtn}>
                            <MaterialCommunityIcons name="arrow-right-circle" size={28} color="#FFFFFF"/>
                        </TouchableOpacity>
                    )}
                </View>
            </BlurView>

            <TouchableOpacity
                style={styles.locationButton}
                onPress={onLocationSearch}
                disabled={loading}
            >
                <BlurView intensity={15} tint="light" style={styles.locationGlass}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#FFFFFF"/>
                    <Text style={styles.locationButtonText}>Use Current Location</Text>
                </BlurView>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 16,
        width: '100%',
    },
    glassContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    searchBtn: {
        paddingLeft: 8,
    },
    locationButton: {
        alignSelf: 'flex-start',
        borderRadius: 20,
        overflow: 'hidden',
    },
    locationGlass: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    locationButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    }
});
