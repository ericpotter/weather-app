import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {BlurView} from 'expo-blur';
import {LinearGradient} from 'expo-linear-gradient';
import {DBService, WeatherRecord} from '../services/dbService';
import {auth} from '../services/firebaseConfig';

export default function HistoryScreen() {
    const [records, setRecords] = useState<WeatherRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNote, setEditNote] = useState('');

    const loadData = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await DBService.getAllQueries(uid);
            setRecords(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load history data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const exportData = async () => {
        if (records.length === 0) {
            Alert.alert('No Data', 'There is no data to export.');
            return;
        }
        const jsonData = JSON.stringify(records, null, 2);

        if (Platform.OS === 'web') {
            const blob = new Blob([jsonData], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'weather_history.json';
            a.click();
            URL.revokeObjectURL(url);
        } else {
            try {
                const FileSystem = await import('expo-file-system/legacy');
                const Sharing = await import('expo-sharing');
                const fileUri = FileSystem.documentDirectory + 'weather_history.json';
                await FileSystem.writeAsStringAsync(fileUri, jsonData, {encoding: 'utf8'});
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                    await Sharing.shareAsync(fileUri);
                }
            } catch (error) {
                Alert.alert('Export Error', 'Failed to export data.');
            }
        }
    };

    const handleDelete = async (id: string) => {
        const doDelete = async () => {
            try {
                await DBService.deleteQuery(id);
                setRecords(prev => prev.filter(r => r.id !== id));
            } catch (error) {
                Alert.alert('Error', 'Failed to delete record');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this record?')) {
                await doDelete();
            }
        } else {
            Alert.alert('Delete Record', 'Are you sure you want to permanently delete this weather log?', [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Delete', style: 'destructive', onPress: doDelete}
            ]);
        }
    };

    const startEdit = (record: WeatherRecord) => {
        setEditingId(record.id!);
        setEditNote(record.notes || '');
    };

    const saveEdit = async (id: string) => {
        try {
            await DBService.updateQueryNote(id, editNote);
            setRecords(records.map(r => r.id === id ? {...r, notes: editNote} : r));
            setEditingId(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to update record');
        }
    };

    const renderItem = ({item}: { item: WeatherRecord }) => (
        <BlurView intensity={20} tint="light" style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.location}>{item.locationName}</Text>
                <Text style={styles.temp}>{Math.round(item.temperature)}°</Text>
            </View>
            <Text style={styles.condition}>Condition Code: {item.condition}</Text>
            <Text style={styles.date}>{new Date(item.queryDate).toLocaleString()}</Text>

            {editingId === item.id ? (
                <View style={styles.editContainer}>
                    <TextInput
                        style={styles.input}
                        value={editNote}
                        onChangeText={setEditNote}
                        placeholder="Write a custom note..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        autoFocus
                    />
                    <TouchableOpacity style={styles.saveBtn} onPress={() => saveEdit(item.id!)}>
                        <MaterialCommunityIcons name="check" size={20} color="#FFFFFF"/>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.noteContainer}>
                    <Text
                        style={styles.noteText}>{item.notes ? `"${item.notes}"` : 'No notes added. Tap edit to add one.'}</Text>
                </View>
            )}

            <View style={styles.actions}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => startEdit(item)}>
                    <MaterialCommunityIcons name="pencil-outline" size={22} color="rgba(255,255,255,0.8)"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id!)}>
                    <MaterialCommunityIcons name="delete-outline" size={22} color="#EF4444"/>
                </TouchableOpacity>
            </View>
        </BlurView>
    );

    return (
        <LinearGradient
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={styles.container}
        >
            {loading ? (
                <ActivityIndicator size="large" color="#FFFFFF" style={{marginTop: 60}}/>
            ) : (
                <>
                    <View style={styles.exportContainer}>
                        <TouchableOpacity activeOpacity={0.8} onPress={exportData}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={styles.exportBtn}
                            >
                                <MaterialCommunityIcons name="export-variant" size={20} color="#FFF"/>
                                <Text style={styles.exportBtnText}>Share JSON</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={records}
                        keyExtractor={(item) => item.id!}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="history" size={64} color="rgba(255,255,255,0.2)"/>
                                <Text style={styles.emptyText}>No weather history found.</Text>
                                <Text style={styles.emptySubText}>Search and save locations to see them here.</Text>
                            </View>
                        }
                    />
                </>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    exportContainer: {padding: 20, paddingTop: 16, paddingBottom: 0, alignItems: 'flex-end'},
    exportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        gap: 8,
        shadowColor: '#10B981',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    exportBtnText: {color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5},
    list: {padding: 20, paddingTop: 16, gap: 16, paddingBottom: 40},
    card: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8},
    location: {fontSize: 20, fontWeight: '700', color: '#FFFFFF', flex: 1, marginRight: 16, letterSpacing: 0.5},
    temp: {fontSize: 24, fontWeight: '300', color: '#FFFFFF'},
    condition: {fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4, fontWeight: '500'},
    date: {fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontFamily: 'System'},
    noteContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    noteText: {fontSize: 14, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: 20},
    editContainer: {flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'center'},
    input: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        paddingHorizontal: 16,
        color: '#FFFFFF',
        fontSize: 14,
    },
    saveBtn: {
        backgroundColor: '#10B981',
        height: 48,
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 16
    },
    iconBtn: {padding: 4},
    emptyState: {alignItems: 'center', marginTop: 80, gap: 16},
    emptyText: {color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: '600'},
    emptySubText: {color: 'rgba(255,255,255,0.5)', fontSize: 15}
});
