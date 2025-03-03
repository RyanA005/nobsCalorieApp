import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Animated } from 'react-native'
import { useState, useRef } from 'react';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../hooks/colorScheme';
import FeaturesSlideshow from '../components/FeaturesSlideshow'
import Purchases from 'react-native-purchases';
import React from 'react'
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../FirebaseConfig';
import { FIREBASE_AUTH } from '../FirebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'

const Onboarding = ({ navigation }) => {
    const colors = useAppTheme();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const auth = FIREBASE_AUTH

    const showError = (message) => {
        setError(message);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        if (error) setError('');
    };

    const handlePasswordChange = (text) => {
        setPassword(text);
        if (error) setError('');
    };

    const getDetailedErrorMessage = (error) => {
        const errorCode = error.code?.replace('auth/', '') || 'internal-error';
        
        const errorMessages = {
            'invalid-email': 'Please enter a valid email address.',
            'email-already-in-use': 'This email is already registered. Please try signing in instead.',
            'weak-password': 'Password should be at least 6 characters long.',
            'operation-not-allowed': 'Email/password sign up is not enabled. Please contact support.',
            'network-request-failed': 'Connection failed. Please check your internet and try again.',
            'too-many-requests': 'Too many attempts. Please try again later.',
            'internal-error': 'An unexpected error occurred. Please try again.',
            'invalid-credential': 'Invalid signup credentials. Please check your information.',
            'user-disabled': 'This account has been disabled. Please contact support.',
            'missing-email': 'Please enter an email address.',
            'missing-password': 'Please enter a password.',
        };

        return errorMessages[errorCode] || 
               'Something went wrong. Please try again or contact support if the problem persists.';
    };

    const handleFirebaseError = (error) => {
        const message = getDetailedErrorMessage(error);
        showError(message);
    };

    const validateForm = () => {
        if (!email.trim()) {
            showError('Please enter an email address');
            return false;
        }
        if (!password.trim()) {
            showError('Please enter a password');
            return false;
        }
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return false;
        }
        // Basic password strength validation
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const signUp = async () => {
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await AsyncStorage.setItem('email', email);
            await AsyncStorage.setItem('password', password);
            await AsyncStorage.setItem('isLoggedOut', 'false');
            await addUserToCollection(email, userCredential.user.uid);
        } catch (error) {
            handleFirebaseError(error);
            console.error('Signup error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addUserToCollection = async (email, uid) => {
        const defaultGoals = {
            protein: '150',
            carbs: '150',
            fats: '100',
            dailyCalories: '2100',
          
            transFat: '2',
            saturatedFat: '20',
            polyunsaturatedFat: '17',
            monounsaturatedFat: '44',
          
            netCarbs: '53',
            sugar: '25',
            fiber: '28',
          
            cholesterol: '300',
            sodium: '2300',
            calcium: '1000',
            magnesium: '400',
            phosphorus: '700',
            potassium: '3400',
          
            iron: '18',
            copper: '900',
            zinc: '11',
            manganese: '2.3',
            selenium: '55',
          
            vitaminA: '900',
            vitaminD: '20',
            vitaminE: '15',
            vitaminK: '120',
            
            vitaminC: '90',
            vitaminB1: '1.2',
            vitaminB12: '2.4',
            vitaminB2: '1.3',
            vitaminB3: '16',
            vitaminB5: '5',
            vitaminB6: '1.7',
            folate: '400',
          };
      
        const userDocRef = doc(FIREBASE_DB, "users", uid);
        await setDoc(userDocRef, {
            email: email,
            createdAt: new Date(),
            uid: uid,
        });
        if (!(await AsyncStorage.getItem('userGoals'))) {
            await AsyncStorage.setItem('userGoals', JSON.stringify(defaultGoals));
        }
    }

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <KeyboardAvoidingView behavior='padding' style={styles.mainContainer}>
                <View style={styles.intro}>
                    <Text style={[styles.subtitle, {color:colors.text}]}>You're too intelligent for all the BS</Text>
                    <Text style={{color: colors.text, fontSize: 16}}>Let's get you started with a free account</Text>
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
                            placeholder="Create a password"
                            placeholderTextColor={colors.text + '40'}
                            value={password}
                            onChangeText={handlePasswordChange}
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.getStartedBtn, { opacity: loading ? 0.7 : 1}]}
                    onPress={signUp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                        <View style={{marginHorizontal: 'auto', flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={[styles.actionText, {color:colors.accent}]}>Sign Up</Text>
                            <AntDesign name="right" size={24} color={colors.accent} />
                        </View>
                    )}
                </TouchableOpacity>


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

            </KeyboardAvoidingView>

            <TouchableOpacity
                style={styles.getStartedBtn}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={[{color:colors.text, fontSize: 16}]}>Already have an account? Sign in</Text>
                <AntDesign name="right" size={16} color={colors.text} />
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 'auto',
        justifyContent: 'center'
    },
    intro: {
        gap: 10,
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        padding: 5,
    },
    getStartedBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: 16,
        borderRadius: 12,
        minHeight: 56,
    },
    actionText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    mainContainer: {
        width: '100%',
        padding: 30,
        alignItems: 'center',
        gap: 25,
    },
    inputContainer: {
        width: '100%',
        gap: 20,
        marginTop: 20,
        minHeight: 180,
    },
    inputWrapper: {
        width: '100%',
        minHeight: 85,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        width: 300,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        minHeight: 56,
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
        minHeight: 70,
        maxHeight: 100,
        marginVertical: 8,
        justifyContent: 'center',
    },
    errorContainer: {
        width: '100%',
        borderRadius: 12,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorWrapper: {
        width: '100%',
        paddingHorizontal: 16,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 20,
        flexWrap: 'wrap',
    },
})

export default Onboarding