import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getEquipment, getEquipmentById, updateEquipment, Equipment, EquipmentResponse } from '../api/equipment';
import { PrimaryButton } from '../components/PrimaryButton';

export const EquipmentScreen: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadEquipment = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setError(null);
      const params: any = { page: pageNum, limit: 20, sort: 'name' };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const data: EquipmentResponse = await getEquipment(params);
      if (append) {
        setEquipment((prev) => [...prev, ...data.equipment]);
      } else {
        setEquipment(data.equipment);
      }
      setHasMore(data.page < data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ekipmanlar yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadEquipment(1, false);
  };

  const handleSearch = () => {
    setPage(1);
    loadEquipment(1, false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadEquipment(nextPage, true);
    }
  };

  const handleEquipmentPress = async (equipmentId: string) => {
    try {
      const response = await getEquipmentById(equipmentId);
      setSelectedEquipment(response.equipment);
      setModalVisible(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ekipman detayları yüklenemedi');
    }
  };

  const handleStatusUpdate = async (equipmentId: string, newStatus: Equipment['status']) => {
    setUpdating(true);
    try {
      await updateEquipment(equipmentId, { status: newStatus });
      setEquipment((prev) => prev.map((e) => (e._id === equipmentId ? { ...e, status: newStatus } : e)));
      if (selectedEquipment?._id === equipmentId) {
        setSelectedEquipment({ ...selectedEquipment, status: newStatus });
      }
      setModalVisible(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ekipman güncellenemedi');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return '#00C49F';
      case 'IN_USE':
        return '#0066CC';
      case 'MAINTENANCE':
        return '#FFA500';
      case 'DAMAGED':
        return '#FF6B6B';
      default:
        return '#9FB2C8';
    }
  };

  const getStatusLabel = (status: Equipment['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Müsait';
      case 'IN_USE':
        return 'Kullanımda';
      case 'MAINTENANCE':
        return 'Bakımda';
      case 'DAMAGED':
        return 'Arızalı';
      default:
        return status;
    }
  };

  const renderEquipmentItem = ({ item }: { item: Equipment }) => (
    <TouchableOpacity style={styles.equipmentCard} onPress={() => handleEquipmentPress(item._id)}>
      <View style={styles.equipmentHeader}>
        <Text style={styles.equipmentName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      {item.type && <Text style={styles.equipmentType}>{item.type}</Text>}
      {item.model && <Text style={styles.equipmentModel}>Model: {item.model}</Text>}
      {item.serialNumber && <Text style={styles.equipmentSerial}>Seri: {item.serialNumber}</Text>}
      {item.location && <Text style={styles.equipmentLocation}>📍 {item.location}</Text>}
    </TouchableOpacity>
  );

  if (loading && equipment.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ekipmanlar</Text>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#00C49F" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ekipmanlar</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ara..."
          placeholderTextColor="#9FB2C8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <PrimaryButton label="Ara" onPress={handleSearch} style={styles.searchButton} />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={equipment}
        renderItem={renderEquipmentItem}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00C49F" />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>Ekipman bulunamadı</Text>
          </View>
        }
        contentContainerStyle={equipment.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
      />

      {/* Equipment Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedEquipment?.name}</Text>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Tip:</Text>
                <Text style={styles.modalValue}>{selectedEquipment?.type || '—'}</Text>
              </View>
              {selectedEquipment?.model && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Model:</Text>
                  <Text style={styles.modalValue}>{selectedEquipment.model}</Text>
                </View>
              )}
              {selectedEquipment?.serialNumber && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Seri No:</Text>
                  <Text style={styles.modalValue}>{selectedEquipment.serialNumber}</Text>
                </View>
              )}
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Durum:</Text>
                <Text style={[styles.modalValue, { color: getStatusColor(selectedEquipment?.status || 'AVAILABLE') }]}>
                  {selectedEquipment ? getStatusLabel(selectedEquipment.status) : '—'}
                </Text>
              </View>
              {selectedEquipment?.location && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Konum:</Text>
                  <Text style={styles.modalValue}>{selectedEquipment.location}</Text>
                </View>
              )}
              {selectedEquipment?.responsibleUser && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Sorumlu:</Text>
                  <Text style={styles.modalValue}>{selectedEquipment.responsibleUser.name}</Text>
                </View>
              )}
              {selectedEquipment?.currentProject && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Proje:</Text>
                  <Text style={styles.modalValue}>{selectedEquipment.currentProject.name}</Text>
                </View>
              )}
              {selectedEquipment?.notes && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Notlar:</Text>
                  <Text style={styles.modalValue}>{selectedEquipment.notes}</Text>
                </View>
              )}

              <Text style={styles.modalSectionTitle}>Durum Güncelle</Text>
              <View style={styles.statusButtons}>
                {selectedEquipment?.status !== 'AVAILABLE' && (
                  <PrimaryButton
                    label="Müsait"
                    onPress={() => selectedEquipment && handleStatusUpdate(selectedEquipment._id, 'AVAILABLE')}
                    style={[styles.statusButton, { backgroundColor: '#00C49F' }]}
                    disabled={updating}
                  />
                )}
                {selectedEquipment?.status !== 'IN_USE' && (
                  <PrimaryButton
                    label="Kullanımda"
                    onPress={() => selectedEquipment && handleStatusUpdate(selectedEquipment._id, 'IN_USE')}
                    style={[styles.statusButton, { backgroundColor: '#0066CC' }]}
                    disabled={updating}
                  />
                )}
                {selectedEquipment?.status !== 'MAINTENANCE' && (
                  <PrimaryButton
                    label="Bakımda"
                    onPress={() => selectedEquipment && handleStatusUpdate(selectedEquipment._id, 'MAINTENANCE')}
                    style={[styles.statusButton, { backgroundColor: '#FFA500' }]}
                    disabled={updating}
                  />
                )}
                {selectedEquipment?.status !== 'DAMAGED' && (
                  <PrimaryButton
                    label="Arızalı"
                    onPress={() => selectedEquipment && handleStatusUpdate(selectedEquipment._id, 'DAMAGED')}
                    style={[styles.statusButton, { backgroundColor: '#FF6B6B' }]}
                    disabled={updating}
                  />
                )}
              </View>
              {updating && <ActivityIndicator color="#00C49F" style={{ marginTop: 12 }} />}
            </ScrollView>
            <PrimaryButton
              label="Kapat"
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 16, backgroundColor: '#1B2A44' }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 28 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9FB2C8', marginTop: 12 },
  errorText: { color: '#FF6B6B', marginBottom: 12 },
  emptyText: { color: '#9FB2C8', fontSize: 14 },
  searchContainer: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  searchButton: { paddingHorizontal: 20 },
  equipmentCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 12,
  },
  equipmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  equipmentName: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  equipmentType: { color: '#CFE0F5', fontSize: 13, marginBottom: 4 },
  equipmentModel: { color: '#9FB2C8', fontSize: 12, marginBottom: 4 },
  equipmentSerial: { color: '#9FB2C8', fontSize: 12, marginBottom: 4 },
  equipmentLocation: { color: '#9FB2C8', fontSize: 12, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  modalInfo: { flexDirection: 'row', marginBottom: 12 },
  modalLabel: { color: '#9FB2C8', fontSize: 14, width: 100 },
  modalValue: { color: '#fff', fontSize: 14, flex: 1 },
  modalSectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 12 },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusButton: { flex: 1, minWidth: '45%' },
});

