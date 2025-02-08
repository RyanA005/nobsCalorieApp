import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { FIREBASE_AUTH } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage';

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
            await signInWithEmailAndPassword(auth, email, password)
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
            await createUserWithEmailAndPassword(auth, email, password)
            alert("Sign up successful")
        } catch (error: any) {
            alert("Sign up failed: " + error.message)
            console.error(error)
        }
        finally {
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

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <KeyboardAvoidingView behavior='padding' style={styles.container}>
                <TextInput 
                    style={[styles.input, {color: colors.text, borderColor: colors.text}]}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                />
                <TextInput 
                    style={[styles.input, {color: colors.text, borderColor: colors.text}]}
                    placeholder="Password"
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