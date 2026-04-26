import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LogOut, LayoutGrid } from 'lucide-react-native'; // Keeping icons consistent
import { useAuth } from '../components/context/AuthContext';

export function CustomDrawerContent(props) {
  const { user, logout } = useAuth();
  const userRole = user?.role || 'freelancer';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBFDF8' }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        
        {/* --- BRAND SECTION (INTEGRATED) --- */}
        <View style={styles.brandSection}>
          <Text style={styles.tagline}>VERDANT EDITION</Text>
          <Text style={styles.logoText}>FRELOPRO</Text>
          
          <View style={[
            styles.roleBadge, 
            { backgroundColor: userRole === 'freelancer' ? '#1A1C19' : '#D7E8CD' }
          ]}>
            <Text style={[
              styles.roleText, 
              { color: userRole === 'freelancer' ? '#FFF' : '#1A1C19' }
            ]}>
              {userRole.toUpperCase()} PORTAL
            </Text>
          </View>
        </View>

        {/* --- NAV ITEMS --- */}
        <View style={styles.linksContainer}>
          <DrawerItemList 
            {...props} 
            activeBackgroundColor="rgba(26, 28, 25, 0.05)"
            activeTintColor="#1A1C19"
            inactiveTintColor="#6B7280"
            labelStyle={styles.drawerLabel}
          />
        </View>

      </DrawerContentScrollView>

      {/* --- BOTTOM SECTION --- */}
      <View style={styles.footerSection}>
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={logout} // Uses your real logout logic
        >
          <LogOut size={20} color="#FF4B4B" />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>v1.0.4 • LAGOS OFFICE</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brandSection: {
    padding: 24,
    paddingTop: 40,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#6B7280',
    marginBottom: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1C19',
    letterSpacing: -1.5,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20, // Pill shape
    marginTop: 12,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  linksContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  drawerLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: -10,
  },
  footerSection: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F1EB',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 75, 75, 0.05)',
    borderRadius: 16,
  },
  logoutText: {
    color: '#FF4B4B',
    marginLeft: 12,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  versionText: {
    color: '#A0A29C',
    fontSize: 9,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1,
  }
});