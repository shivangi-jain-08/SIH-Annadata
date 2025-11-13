import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Icon from '../Icon'

const CAddresses = () => {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [addresses, setAddresses] = useState([])

  useFocusEffect(
    React.useCallback(() => {
      loadAddresses()
    }, [])
  )

  const loadAddresses = async () => {
    try {
      setLoading(true)
      // TODO: Fetch from backend API
      // For now, using mock data
      const mockAddresses = [
        {
          id: '1',
          type: 'Home',
          name: 'John Doe',
          phone: '+91 98765 43210',
          address: '123 Green Valley Road, Sector 21, Gurugram, Haryana - 122001',
          isDefault: true
        },
        {
          id: '2',
          type: 'Work',
          name: 'John Doe',
          phone: '+91 98765 43210',
          address: 'Office 404, Tech Park, Cyber City, Gurugram, Haryana - 122002',
          isDefault: false
        }
      ]
      setAddresses(mockAddresses)
    } catch (error) {
      console.error('Error loading addresses:', error)
      Alert.alert('Error', 'Failed to load addresses')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadAddresses()
  }

  const handleAddAddress = () => {
    Alert.alert('Coming Soon', 'Add address functionality will be available soon')
  }

  const handleEditAddress = (addressId) => {
    Alert.alert('Coming Soon', 'Edit address functionality will be available soon')
  }

  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Delete from backend
            setAddresses(addresses.filter(addr => addr.id !== addressId))
            Alert.alert('Success', 'Address deleted successfully')
          }
        }
      ]
    )
  }

  const handleSetDefault = (addressId) => {
    // TODO: Update on backend
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }))
    setAddresses(updatedAddresses)
    Alert.alert('Success', 'Default address updated')
  }

  const renderAddressCard = (address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          <Icon 
            name={address.type === 'Home' ? 'Home' : 'Briefcase'} 
            size={20} 
            color="#2196F3" 
          />
          <Text style={styles.addressType}>{address.type}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditAddress(address.id)}
        >
          <Icon name="Edit2" size={18} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.addressDetails}>
        <View style={styles.detailRow}>
          <Icon name="User" size={16} color="#666" />
          <Text style={styles.detailText}>{address.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="Phone" size={16} color="#666" />
          <Text style={styles.detailText}>{address.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="MapPin" size={16} color="#666" />
          <Text style={styles.detailText}>{address.address}</Text>
        </View>
      </View>

      <View style={styles.addressActions}>
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(address.id)}
          >
            <Icon name="CheckCircle" size={18} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAddress(address.id)}
        >
          <Icon name="Trash2" size={18} color="#F44336" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="ArrowLeft" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Addresses</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddAddress}
        >
          <Icon name="Plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
          />
        }
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="MapPin" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No saved addresses</Text>
            <Text style={styles.emptySubtext}>Add your delivery addresses for faster checkout</Text>
            <TouchableOpacity style={styles.addAddressButton} onPress={handleAddAddress}>
              <Icon name="Plus" size={20} color="white" />
              <Text style={styles.addAddressButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map(renderAddressCard)}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
  },
  addAddressButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addressList: {
    padding: 16,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  addressDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: '#F44336',
  },
})

export default CAddresses
