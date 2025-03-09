import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useQuestionnaireStore } from '@/store/questionnaire-store';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isComplete } = useQuestionnaireStore();
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  
  // Check user state and set a flag when done, but don't navigate immediately
  useEffect(() => {
    if (user) {
      setInitialCheckComplete(true);
    }
  }, [user]);

  // Only attempt navigation after the component is fully mounted and we've checked user state
  useEffect(() => {
    if (initialCheckComplete && user) {
      // Now it's safe to navigate
      if (isComplete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/questionnaire');
      }
    }
  }, [initialCheckComplete, user, isComplete, router]);

  const handleGetStarted = () => {
    router.push('/auth');
  };

  // If we're still checking or about to navigate, don't render the full screen
  if (user && !initialCheckComplete) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="dark" />
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }} 
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>Mango AI</Text>
        </View>
        
        <Text style={styles.tagline}>
          Personalized meal plans for your health goals
        </Text>
        
        <View style={styles.featuresContainer}>
          <FeatureItem 
            title="Personalized Nutrition" 
            description="Get meal plans tailored to your medical conditions and dietary preferences"
          />
          <FeatureItem 
            title="Smart Shopping Lists" 
            description="Automatically generated shopping lists for your meal plans"
          />
          <FeatureItem 
            title="Detailed Recipes" 
            description="Step-by-step instructions and nutritional information"
          />
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Get Started" 
          onPress={handleGetStarted} 
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  title: string;
  description: string;
}

function FeatureItem({ title, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>✓</Text>
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    color: Colors.text.secondary,
    marginBottom: SPACING.xl,
  },
  featuresContainer: {
    marginTop: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
});