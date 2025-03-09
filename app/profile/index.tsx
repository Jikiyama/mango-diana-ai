import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Switch,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  User, 
  Settings, 
  LogOut, 
  Heart, 
  Bell, 
  HelpCircle, 
  FileText, 
  Lock, 
  Trash2,
  ClipboardList
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useMealPlanStore } from '@/store/meal-plan-store';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { logger } from '@/utils/logger';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { clearCurrentPlan } = useMealPlanStore();
  const { resetQuestionnaire } = useQuestionnaireStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const handleLogout = () => {
    logger.info('PROFILE', 'User initiated logout');
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: () => {
            logger.info('PROFILE', 'User confirmed logout');
            logout();
            router.replace('/auth');
          }
        }
      ]
    );
  };
  
  const handleResetData = () => {
    logger.info('PROFILE', 'User initiated data reset');
    Alert.alert(
      'Reset Data',
      'This will clear your meal plan and questionnaire data. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            logger.info('PROFILE', 'User confirmed data reset');
            clearCurrentPlan();
            resetQuestionnaire();
            Alert.alert('Success', 'Your data has been reset');
            logger.info('PROFILE', 'Data reset completed');
          }
        }
      ]
    );
  };
  
  const handleViewLogs = () => {
    logger.info('PROFILE', 'User navigated to logs screen');
    router.push('/profile/logs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImagePlaceholder}>
              {user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => {
              logger.info('PROFILE', 'User tapped edit profile');
              Alert.alert('Coming Soon', 'This feature is not yet available');
            }}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              logger.info('PROFILE', 'User tapped personal information');
              router.push('/questionnaire');
            }}
          >
            <User size={20} color={Colors.text.primary} />
            <Text style={styles.menuItemText}>Personal Information</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              logger.info('PROFILE', 'User tapped favorites');
              router.push('/(tabs)/favorites');
            }}
          >
            <Heart size={20} color={Colors.text.primary} />
            <Text style={styles.menuItemText}>Favorites</Text>
          </TouchableOpacity>
          
          <View style={styles.menuItem}>
            <Bell size={20} color={Colors.text.primary} />
            <Text style={styles.menuItemText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                logger.info('PROFILE', `User ${value ? 'enabled' : 'disabled'} notifications`);
                setNotificationsEnabled(value);
              }}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              logger.info('PROFILE', 'User tapped help center');
              Alert.alert('Coming Soon', 'This feature is not yet available');
            }}
          >
            <HelpCircle size={20} color={Colors.text.primary} />
            <Text style={styles.menuItemText}>Help Center</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              logger.info('PROFILE', 'User tapped terms of service');
              Alert.alert('Coming Soon', 'This feature is not yet available');
            }}
          >
            <FileText size={20} color={Colors.text.primary} />
            <Text style={styles.menuItemText}>Terms of Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              logger.info('PROFILE', 'User tapped privacy policy');
              Alert.alert('Coming Soon', 'This feature is not yet available');
            }}
          >
            <Lock size={20} color={Colors.text.primary} />
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleViewLogs}
          >
            <ClipboardList size={20} color={Colors.text.primary} />
            <Text style={styles.menuItemText}>View Logs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleResetData}
          >
            <Trash2 size={20} color={Colors.error} />
            <Text style={[styles.menuItemText, { color: Colors.error }]}>Reset Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <LogOut size={20} color={Colors.error} />
            <Text style={[styles.menuItemText, { color: Colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileImagePlaceholder: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: SPACING.md,
  },
  editProfileButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editProfileButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: SPACING.md,
  },
  versionContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});