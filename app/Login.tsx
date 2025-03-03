import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView, Animated, TouchableOpacity } from 'react-native'
import React, { useState, useRef } from 'react'
import { NavigationProp } from '@react-navigation/native'
import { FIREBASE_AUTH } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../FirebaseConfig';
import { useAppTheme } from '../hooks/colorScheme';

const Login = ({ navigation }: { navigation: NavigationProp<any> }) => {
    const colors = useAppTheme();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const auth = FIREBASE_AUTH

    const showError = (message: string) => {
        setError(message);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (error) setError('');
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (error) setError('');
    };

    const getDetailedErrorMessage = (error: any): string => {
        const errorCode = error.code?.replace('auth/', '') || 'internal-error';
        
        const errorMessages: { [key: string]: string } = {
            'invalid-email': 'Please enter a valid email address format.',
            'user-disabled': 'This account has been disabled. Please contact support for assistance.',
            'user-not-found': 'No account found with this email. Please create a new account.',
            'wrong-password': 'Incorrect password. Please try again or reset your password.',
            'too-many-requests': 'Access temporarily blocked due to many failed attempts. Please try again later.',
            'network-request-failed': 'Connection failed. Please check your internet and try again.',
            'email-already-in-use': 'This email is already registered. Please try signing in instead.',
            'weak-password': 'Password should be at least 6 characters long.',
            'operation-not-allowed': 'This login method is not enabled. Please use another method.',
            'account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
            'invalid-credential': 'Your login credentials are incorrect. Please try again.',
            'user-mismatch': 'The provided credentials do not match the previous sign-in.',
            'invalid-verification-code': 'Invalid verification code. Please try again.',
            'invalid-verification-id': 'Invalid verification ID. Please request a new code.',
            'timeout': 'The request has timed out. Please try again.',
            'web-storage-unsupported': 'This browser does not support web storage. Please enable cookies.',
            'internal-error': 'An unexpected error occurred. Please try again.',
        };

        return errorMessages[errorCode] || 
               'Something went wrong. Please try again or contact support if the problem persists.';
    };

    const handleFirebaseError = (error: any) => {
        const message = getDetailedErrorMessage(error);
        showError(message);
    };

    const signIn = async () => {
        if (!email.trim() || !password.trim()) {
            showError('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            await AsyncStorage.setItem('email', email)
            await AsyncStorage.setItem('password', password)
            await AsyncStorage.setItem('isLoggedOut', 'false')
        } catch (error: any) {
            handleFirebaseError(error);
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const signUp = async () => {
        navigation.navigate('Onboarding')
    }

    React.useEffect(() => {
        const tryAutoLogin = async () => {
            const isLoggedOut = await AsyncStorage.getItem('isLoggedOut')
            if (isLoggedOut === 'true') {
                // Just load the stored email but don't auto-login
                const storedEmail = await AsyncStorage.getItem('email')
                if (storedEmail) setEmail(storedEmail)
                return
            }

            const storedEmail = await AsyncStorage.getItem('email')
            const storedPassword = await AsyncStorage.getItem('password')
            
            if (storedEmail && storedPassword) {
                setEmail(storedEmail)
                setPassword(storedPassword)
                // Attempt auto-login
                setLoading(true)
                try {
                    await signInWithEmailAndPassword(auth, storedEmail, storedPassword)
                } catch (error) {
                    console.log("Auto-login failed, requiring manual login")
                } finally {
                    setLoading(false)
                }
            }
        }
        tryAutoLogin()
    }, [])

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <KeyboardAvoidingView behavior='padding' style={styles.loginContainer}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.title, {color: colors.text, textAlign: 'center'}]}>
                        Sign in to track your nutrition
                    </Text>
                </View>
                
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.inputLabel, {color: colors.text}]}>Email</Text>
                        <TextInput 
                            style={[styles.input, {
                                color: colors.text, 
                                backgroundColor: colors.boxes,
                                borderColor: error ? colors.accent : colors.boxes,
                                borderWidth: error ? 2 : 1,
                            }]}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.text + '40'}
                            value={email}
                            onChangeText={handleEmailChange}
                            keyboardType='email-address'
                            autoCapitalize='none'
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.inputLabel, {color: colors.text}]}>Password</Text>
                        <TextInput 
                            style={[styles.input, {
                                color: colors.text, 
                                backgroundColor: colors.boxes,
                                borderColor: error ? colors.accent : colors.boxes,
                                borderWidth: error ? 2 : 1,
                            }]}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.text + '40'}
                            value={password}
                            onChangeText={handlePasswordChange}
                            secureTextEntry
                        />
                    </View>
                </View>

                <View style={styles.errorOuterContainer}>
                    <Animated.View style={[styles.errorContainer, { 
                        opacity: fadeAnim,
                        backgroundColor: error ? colors.accent + '15' : 'transparent',
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [5, 0]
                            })
                        }]
                    }]}>
                        {error ? (
                            <View style={styles.errorWrapper}>
                                <Text style={[styles.errorText, { color: colors.accent }]} numberOfLines={3}>
                                    {error}
                                </Text>
                            </View>
                        ) : null}
                    </Animated.View>
                </View>

                <View style={styles.buttonContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.accent} />
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={[styles.primaryButton, { backgroundColor: colors.accent }]}
                                onPress={signIn}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.secondaryButton, { backgroundColor: colors.boxes }]}
                                onPress={signUp}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
                                    Create New Account
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginContainer: {
        width: '100%',
        padding: 30,
        alignItems: 'center',
        gap: 25,
    },
    headerContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        gap: 20,
    },
    inputWrapper: {
        width: '100%',
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    errorOuterContainer: {
        width: '100%',
        minHeight: 70, // Increased from 60
        maxHeight: 100, // Added max height
        marginVertical: 8,
        justifyContent: 'center', // Added to center content
    },
    errorContainer: {
        width: '100%',
        borderRadius: 12, // Increased from 8
        padding: 12, // Increased from 8
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorWrapper: {
        width: '100%',
        paddingHorizontal: 16, // Increased from 8
    },
    errorText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 20,
        flexWrap: 'wrap', // Added to ensure text wraps
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
        marginTop: 10,
    },
    primaryButton: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
})

export default Login