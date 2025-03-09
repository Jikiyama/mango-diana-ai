import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';

export default function AuthScreen() {
  const router = useRouter();
  const { signInAsGuest } = useAuthStore();

  const handleBack = () => {
    router.back();
  };

  const handleGoogleSignIn = () => {
    // In a real app, implement Google Sign-In
    signInAsGuest();
    // Navigate to questionnaire after sign in
    router.push('/questionnaire');
  };

  const handleAppleSignIn = () => {
    // In a real app, implement Apple Sign-In
    signInAsGuest();
    // Navigate to questionnaire after sign in
    router.push('/questionnaire');
  };

  const handleGuestSignIn = () => {
    signInAsGuest();
    // Navigate to questionnaire after sign in
    router.push('/questionnaire');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={Colors.text.primary} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }} 
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>Mango AI</Text>
        </View>
        
        <Text style={styles.title}>Sign in to continue</Text>
        <Text style={styles.subtitle}>
          Create an account to save your meal plans and track your progress
        </Text>
        
        <View style={styles.authButtons}>
          <Button 
            title="Continue with Google" 
            onPress={handleGoogleSignIn}
            variant="outline"
            size="large"
            fullWidth
            style={styles.authButton}
          />
          
          <Button 
            title="Continue with Apple" 
            onPress={handleAppleSignIn}
            variant="outline"
            size="large"
            fullWidth
            style={styles.authButton}
          />
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>
          
          <Button 
            title="Continue as Guest" 
            onPress={handleGuestSignIn}
            variant="text"
            size="medium"
            fullWidth
          />
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: SPACING.md,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  authButtons: {
    width: '100%',
  },
  authButton: {
    marginBottom: SPACING.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: SPACING.md,
    color: Colors.text.secondary,
  },
  footer: {
    padding: SPACING.xl,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});