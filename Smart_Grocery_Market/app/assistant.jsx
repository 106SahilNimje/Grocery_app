import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Config } from '../constants/Config';

import { useCart } from '../context/CartContext'; // Import context

export default function AssistantScreen() {
    const { rawText } = useLocalSearchParams();
    const { addToCart } = useCart(); // Use hook
    const [scannedItems, setScannedItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set()); // Track selections
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (rawText) {
            setInputText(rawText);
            setMessages([
                {
                    id: '1',
                    type: 'bot',
                    text: `I've extracted this text from your list: \n\n"${rawText}"\n\nYou can edit it above and then tap "Analyze List" to identify items.`,
                }
            ]);
        }
    }, [rawText]);

    const handleProcessList = async () => {
        if (!inputText.trim()) return;

        setIsAnalyzing(true);
        setMessages(prev => [
            ...prev,
            { id: Date.now().toString(), type: 'user', text: inputText },
            { id: (Date.now() + 1).toString(), type: 'bot', text: 'Analyzing items... please wait.' }
        ]);

        try {
            // Step 1: Analyze Text (Get raw items)
            const aiResponse = await fetch(`${Config.API_URL}/ai/analyze-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText }),
            });

            const aiData = await aiResponse.json();
            if (!aiResponse.ok) throw new Error(aiData.error || 'Failed to analyze');

            const aiItems = aiData.items || [];

            setMessages(prev => [
                ...prev.slice(0, -1),
                { id: Date.now().toString(), type: 'bot', text: `Found ${aiItems.length} items. Checking availability...` }
            ]);

            // Step 2: Match with Database Items
            const matchResponse = await fetch(`${Config.API_URL}/products/match-items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: aiItems.map(i => i.item_name) }),
            });

            const matchData = await matchResponse.json();
            const results = matchData.results || [];

            // Merge AI quantity with Database Product
            const finalItems = results.map(res => {
                const aiItem = aiItems.find(i => i.item_name === res.searchedTerm);
                return {
                    ...res.matches[0], // Top match
                    requestedQty: aiItem ? aiItem.quantity : 1,
                    requestedUnit: aiItem ? aiItem.unit : 'unit'
                };
            });

            setScannedItems(finalItems);

            // Auto-select all found items
            const newSelection = new Set();
            finalItems.forEach((_, index) => newSelection.add(index));
            setSelectedItems(newSelection);

            setMessages(prev => [
                ...prev.slice(0, -1),
                {
                    id: Date.now().toString(),
                    type: 'bot',
                    text: `Great news! We have ${finalItems.length} of those items in stock. Add them to your cart below.`
                }
            ]);

        } catch (error) {
            console.error('Process Error:', error);
            setMessages(prev => [
                ...prev.slice(0, -1),
                { id: Date.now().toString(), type: 'bot', text: 'Sorry, something went wrong. Please try again.' }
            ]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleSelection = (index) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        setSelectedItems(newSelection);
    };

    const handleAddSelectedToCart = () => {
        let addedCount = 0;
        scannedItems.forEach((item, index) => {
            if (selectedItems.has(index)) {
                let qty = 1;
                if (item.requestedQty) {
                    qty = Number(item.requestedQty);
                    if (isNaN(qty)) qty = 1;
                }
                addToCart(item, null, qty);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            router.push('/(tabs)/cart');
        } else {
            alert("Please select at least one item to add.");
        }
    };

    const renderItem = ({ item, index }) => {
        const isSelected = selectedItems.has(index);
        return (
            <View style={styles.itemCard}>
                <View style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', borderRadius: 8, marginRight: 12 }}>
                    {/* Placeholder for image */}
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>
                        Requested: {item.requestedQty} {item.requestedUnit} | Price: ₹{item.price}
                    </Text>
                </View>
                <TouchableOpacity style={styles.checkboxButton} onPress={() => toggleSelection(index)}>
                    <Ionicons
                        name={isSelected ? "checkbox" : "square-outline"}
                        size={28}
                        color={isSelected ? "#22C55E" : "#9CA3AF"}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#11181C" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Grocery Assistant</Text>
                    <Text style={styles.headerStatus}>Online</Text>
                </View>
            </View>

            <View style={styles.content}>
                <FlatList
                    data={scannedItems}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    ListHeaderComponent={() => (
                        <View style={styles.chatContainer}>
                            {messages.map((msg) => (
                                <View
                                    key={msg.id}
                                    style={[
                                        styles.messageRow,
                                        msg.type === 'user' ? styles.userRow : styles.botRow
                                    ]}
                                >
                                    <View style={[
                                        styles.messageBubble,
                                        msg.type === 'user' ? styles.userBubble : styles.botBubble
                                    ]}>
                                        <Text style={[
                                            styles.messageText,
                                            msg.type === 'user' ? styles.userText : styles.botText
                                        ]}>
                                            {msg.text}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                style={styles.footer}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Extracted text will appear here..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, isAnalyzing && { opacity: 0.5 }]}
                        onPress={handleProcessList}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons name="sparkles" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addAllButton} onPress={handleAddSelectedToCart}>
                    <Text style={styles.addAllText}>Add Selected to Cart</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#11181C',
    },
    headerStatus: {
        fontSize: 12,
        color: '#22C55E',
    },
    content: {
        flex: 1,
    },
    chatContainer: {
        marginBottom: 20,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    botRow: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    userBubble: {
        backgroundColor: '#22C55E',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: '#F3F4F6',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    userText: {
        color: 'white',
    },
    botText: {
        color: '#11181C',
    },
    itemCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#11181C',
    },
    itemQty: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    addButton: {
        backgroundColor: '#22C55E',
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 12,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#11181C',
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#22C55E',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    addAllButton: {
        backgroundColor: '#11181C',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    addAllText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
