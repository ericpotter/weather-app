import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

type EffectType = 'rain' | 'snow' | 'storm' | 'none';

function getEffectType(code: number | undefined): EffectType {
    if (code === undefined) return 'none';
    if (code >= 95) return 'storm';
    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return 'rain';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    return 'none';
}

const RAIN_COUNT = 30;
const SNOW_COUNT = 20;

export default function WeatherEffects({ weatherCode }: { weatherCode: number | undefined }) {
    const effect = getEffectType(weatherCode);

    const rainParticles = useRef(
        Array.from({ length: RAIN_COUNT }, () => ({
            anim: new Animated.Value(0),
            x: Math.random() * width,
            delay: Math.random() * 1500,
            speed: 700 + Math.random() * 600,
            opacity: 0.2 + Math.random() * 0.5,
        }))
    ).current;

    const snowParticles = useRef(
        Array.from({ length: SNOW_COUNT }, () => ({
            anim: new Animated.Value(0),
            x: Math.random() * width,
            drift: (Math.random() - 0.5) * 80,
            delay: Math.random() * 3000,
            speed: 3000 + Math.random() * 2000,
            size: 3 + Math.random() * 4,
            opacity: 0.5 + Math.random() * 0.4,
        }))
    ).current;

    const lightningOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animations: Animated.CompositeAnimation[] = [];

        if (effect === 'rain' || effect === 'storm') {
            rainParticles.forEach(p => {
                const a = Animated.loop(
                    Animated.sequence([
                        Animated.delay(p.delay),
                        Animated.timing(p.anim, { toValue: 1, duration: p.speed, useNativeDriver: true }),
                        Animated.timing(p.anim, { toValue: 0, duration: 0, useNativeDriver: true }),
                    ])
                );
                a.start();
                animations.push(a);
            });
        }

        if (effect === 'snow') {
            snowParticles.forEach(p => {
                const a = Animated.loop(
                    Animated.sequence([
                        Animated.delay(p.delay),
                        Animated.timing(p.anim, { toValue: 1, duration: p.speed, useNativeDriver: true }),
                        Animated.timing(p.anim, { toValue: 0, duration: 0, useNativeDriver: true }),
                    ])
                );
                a.start();
                animations.push(a);
            });
        }

        let lightningTimeout: ReturnType<typeof setTimeout>;
        if (effect === 'storm') {
            const flash = () => {
                Animated.sequence([
                    Animated.timing(lightningOpacity, { toValue: 0.35, duration: 60, useNativeDriver: true }),
                    Animated.timing(lightningOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
                    Animated.timing(lightningOpacity, { toValue: 0.2, duration: 60, useNativeDriver: true }),
                    Animated.timing(lightningOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                ]).start(() => {
                    lightningTimeout = setTimeout(flash, 2000 + Math.random() * 4000);
                });
            };
            lightningTimeout = setTimeout(flash, 1500);
        }

        return () => {
            animations.forEach(a => a.stop());
            rainParticles.forEach(p => p.anim.setValue(0));
            snowParticles.forEach(p => p.anim.setValue(0));
            clearTimeout(lightningTimeout);
            lightningOpacity.setValue(0);
        };
    }, [effect]);

    if (effect === 'none') return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {(effect === 'rain' || effect === 'storm') &&
                rainParticles.map((p, i) => (
                    <Animated.View
                        key={i}
                        style={{
                            position: 'absolute',
                            left: p.x,
                            top: 0,
                            width: 1.5,
                            height: 18,
                            backgroundColor: 'rgba(174, 214, 241, 0.8)',
                            borderRadius: 1,
                            opacity: p.opacity,
                            transform: [{
                                translateY: p.anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-30, height + 30],
                                }),
                            }],
                        }}
                    />
                ))}

            {effect === 'storm' && (
                <Animated.View
                    style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF', opacity: lightningOpacity }]}
                />
            )}

            {effect === 'snow' &&
                snowParticles.map((p, i) => (
                    <Animated.View
                        key={i}
                        style={{
                            position: 'absolute',
                            left: p.x,
                            top: 0,
                            width: p.size,
                            height: p.size,
                            borderRadius: p.size / 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            opacity: p.opacity,
                            transform: [
                                {
                                    translateY: p.anim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-10, height + 10],
                                    }),
                                },
                                {
                                    translateX: p.anim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0, p.drift, 0],
                                    }),
                                },
                            ],
                        }}
                    />
                ))}
        </View>
    );
}
