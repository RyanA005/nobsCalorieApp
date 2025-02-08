import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { FIREBASE_AUTH } from '../../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const Login = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const auth = FIREBASE_AUTH

    const signIn = async () => {
        setLoading(true)
        try {
            await signInWithEmailAndPassword(auth, email, password)
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


  return (
    <View style={styles.container}>
        <KeyboardAvoidingView behavior='padding' style={styles.container}>
        <TextInput 
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
        />
        <TextInput 
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
        />
        {loading ? <ActivityIndicator size="large" color="blue" />
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
        borderWidth: 1
    }
})


export default Login