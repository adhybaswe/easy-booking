import React from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style,
                ]}
                placeholderTextColor="#94A3B8"
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569', // Slate-600
        marginBottom: 6,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#E2E8F0', // Slate-200
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8FAFC', // Slate-50
        fontSize: 16,
        color: '#0F172A', // Slate-900
    },
    inputError: {
        borderColor: '#EF4444', // Red-500
        backgroundColor: '#FEF2F2', // Red-50
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444', // Red-500
        marginTop: 4,
    },
});
