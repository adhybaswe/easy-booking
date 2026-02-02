import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isLoading?: boolean;
}

export function Button({
    title,
    variant = 'primary',
    isLoading = false,
    style,
    disabled,
    ...props
}: ButtonProps) {
    const getBackgroundColor = () => {
        if (disabled) return '#E2E8F0';
        switch (variant) {
            case 'primary': return '#2563EB'; // Blue-600
            case 'secondary': return '#475569'; // Slate-600
            case 'danger': return '#DC2626'; // Red-600
            case 'outline': return 'transparent';
            default: return '#2563EB';
        }
    };

    const getTextColor = () => {
        if (disabled) return '#94A3B8';
        switch (variant) {
            case 'outline': return '#2563EB';
            default: return '#FFFFFF';
        }
    };

    const getBorderColor = () => {
        if (variant === 'outline') {
            return disabled ? '#E2E8F0' : '#2563EB';
        }
        return 'transparent';
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: variant === 'outline' ? 1 : 0,
                },
                style,
            ]}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
