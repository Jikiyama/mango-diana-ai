import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Download, RefreshCw, Trash2, Search, Copy } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import Colors from '@/constants/colors';
import { SPACING } from '@/constants/theme';
import { logger } from '@/utils/logger';

export default function LogsScreen() {
  const router = useRouter();
  const [logContent, setLogContent] = useState<string>('');
  const [filteredContent, setFilteredContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContent(logContent);
      return;
    }

    const lines = logContent.split('\n');
    const matchedLines = lines.filter(line => 
      line.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContent(matchedLines.join('\n'));
  }, [searchQuery, logContent]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const content = await logger.getLogContent();
      setLogContent(content);
      setFilteredContent(content);
    } catch (error) {
      console.error('Failed to load logs:', error);
      Alert.alert('Error', 'Failed to load log file');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLogs = async () => {
    try {
      setIsRefreshing(true);
      await loadLogs();
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearLogs = async () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              if (Platform.OS === 'web') {
                Alert.alert('Not Available', 'Clearing logs is not available on web');
                return;
              }
              
              const logPath = logger.getLogFilePath();
              await FileSystem.deleteAsync(logPath, { idempotent: true });
              
              // Re-initialize log file
              await FileSystem.writeAsStringAsync(
                logPath,
                `=== LOGS CLEARED AT ${new Date().toISOString()} ===\n\n`,
                { encoding: FileSystem.EncodingType.UTF8 }
              );
              
              logger.info('LOGS', 'Log file cleared by user');
              await loadLogs();
            } catch (error) {
              console.error('Failed to clear logs:', error);
              Alert.alert('Error', 'Failed to clear log file');
            }
          }
        }
      ]
    );
  };

  const shareLogs = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Not Available', 'Sharing logs is not available on web');
        return;
      }
      
      const logPath = logger.getLogFilePath();
      
      await Share.share({
        title: 'Application Logs',
        message: Platform.OS === 'ios' ? 'Application Logs' : logContent,
        url: Platform.OS === 'ios' ? logPath : undefined,
      });
      
      logger.info('LOGS', 'Log file shared by user');
    } catch (error) {
      console.error('Failed to share logs:', error);
      Alert.alert('Error', 'Failed to share log file');
    }
  };

  const copyToClipboard = async () => {
    try {
      // On web, use the browser's clipboard API
      if (Platform.OS === 'web') {
        navigator.clipboard.writeText(filteredContent);
        Alert.alert('Success', 'Logs copied to clipboard');
        logger.info('LOGS', 'Log content copied to clipboard');
        return;
      }
      
      // For native platforms, we'd use the clipboard API
      Alert.alert('Not Available', 'Clipboard functionality not available on this platform');
      logger.warn('LOGS', 'Clipboard functionality not available on this platform');
    } catch (error) {
      console.error('Failed to copy logs:', error);
      Alert.alert('Error', 'Failed to copy logs to clipboard');
    }
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setSearchQuery('');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Application Logs</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={toggleSearch}
          >
            <Search size={20} color={isSearching ? Colors.primary : Colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={refreshLogs}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <RefreshCw size={20} color={Colors.text.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={copyToClipboard}
          >
            <Copy size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={shareLogs}
          >
            <Download size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={clearLogs}
          >
            <Trash2 size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {isSearching && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search logs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading logs...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.logContainer}>
            <Text style={styles.logContent}>{filteredContent}</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  searchContainer: {
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  logContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: SPACING.md,
  },
  logContent: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#333',
  },
});