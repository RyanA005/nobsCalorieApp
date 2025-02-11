import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { FIREBASE_AUTH } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../FirebaseConfig';

import { useAppTheme } from '../hooks/colorScheme';

const Login = () => {

    const colors = useAppTheme();
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const auth = FIREBASE_AUTH

    const signIn = async () => {
        setLoading(true)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            await AsyncStorage.setItem('email', email)
            await AsyncStorage.setItem('password', password)
            await AsyncStorage.setItem('isLoggedOut', 'false')
        } catch (error: any) {
            alert("Sign in failed: " + error.message)
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const signUp = async () => {
        setLoading(true)
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            alert("Sign up successful")
            // Add user to collection after successful signup
            await addUserToCollection(email, userCredential.user.uid)
        } catch (error: any) {
            alert("Sign up failed: " + error.message)
            console.error(error)
        } finally {
            setLoading(false)
        }
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

    const addUserToCollection = async (email: string, uid: string) => {
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
        });
        if (!(await AsyncStorage.getItem('userGoals'))) {
            await AsyncStorage.setItem('userGoals', JSON.stringify(defaultGoals));
        }
    }

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <KeyboardAvoidingView behavior='padding' style={styles.container}>
                <TextInput 
                    style={[styles.input, {color: colors.text, borderColor: colors.text}]}
                    placeholder="Email"
                    placeholderTextColor={colors.text + '80'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                />
                <TextInput 
                    style={[styles.input, {color: colors.text, borderColor: colors.text}]}
                    placeholder="Password"
                    placeholderTextColor={colors.text + '80'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                {loading ? <ActivityIndicator size="large" color={colors.text} />
                : <>
                    <Button title="Sign In" onPress={signIn} />
                    <Button title="Sign Up" onPress={signUp} />
                </>}
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    input: {
        width: 300,
        padding: 10,
        margin: 10,
        borderRadius: 10,
        borderWidth: 1
    }
})

export default Login