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
  FileText, 
  ChevronRight, 
  Bell, 
  Lock, 
  HelpCircle,
  Trash2,
  FileBarChart,
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
            logger.info('PROFILE', 'User logged out');
            logout();
            router.replace('/auth');
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete your meal plan and questionnaire data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          onPress: () => {
            logger.info('PROFILE', 'User reset all data');
            clearCurrentPlan();
            resetQuestionnaire();
            Alert.alert('Success', 'All data has been reset');
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const handleViewLogs = () => {
    logger.info('PROFILE', 'User navigated to logs screen');
    router.push('/profile/logs');
  };
  
  const handleEditProfile = () => {
    logger.info('PROFILE', 'User navigated to edit profile');
    router.push('/questionnaire');
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
            <View style={styles.profileImage}>
              <User size={40} color={Colors.text.secondary} />
            </View>
          </View>
          
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileButtonText}>Edit Health Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <User size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Personal Information</Text>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </View>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Lock size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Privacy & Security</Text>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </View>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Bell size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleViewLogs}
          >
            <View style={styles.menuItemIcon}>
              <FileText size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>View Logs</Text>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Settings size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Settings</Text>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </View>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <HelpCircle size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Help & Support</Text>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </View>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleResetData}
          >
            <View style={styles.menuItemIcon}>
              <Trash2 size={20} color={Colors.error} />
            </View>
            <Text style={[styles.menuItemText, { color: Colors.error }]}>Reset All Data</Text>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    paddingBottom: SPACING.md,
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
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  profileImageContainer: {
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: SPACING.md,
  },
  editProfileButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    backgroundColor: Colors.highlight,
  },
  editProfileButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginLeft: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemIcon: {
    marginRight: SPACING.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xl,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  logoutButtonText: {
    marginLeft: SPACING.sm,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: SPACING.xl,
  },
});