import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getTasks, getTaskById, updateTask, Task, TasksResponse } from '../api/tasks';
import { PrimaryButton } from '../components/PrimaryButton';

export const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadTasks = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setError(null);
      const data: TasksResponse = await getTasks({ page: pageNum, limit: 20, sort: '-createdAt' });
      if (append) {
        setTasks((prev) => [...prev, ...data.tasks]);
      } else {
        setTasks(data.tasks);
      }
      setHasMore(data.page < data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Görevler yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadTasks(1, false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadTasks(nextPage, true);
    }
  };

  const handleTaskPress = async (taskId: string) => {
    try {
      const response = await getTaskById(taskId);
      setSelectedTask(response.task);
      setModalVisible(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Görev detayları yüklenemedi');
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    setUpdating(true);
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
      if (selectedTask?._id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
      setModalVisible(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Görev güncellenemedi');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'COMPLETED':
        return '#00C49F';
      case 'IN_PROGRESS':
        return '#0066CC';
      case 'CANCELLED':
        return '#FF6B6B';
      default:
        return '#FFA500';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'URGENT':
        return '#FF6B6B';
      case 'HIGH':
        return '#FFA500';
      case 'MEDIUM':
        return '#0066CC';
      default:
        return '#9FB2C8';
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity style={styles.taskCard} onPress={() => handleTaskPress(item._id)}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.taskFooter}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
        {item.dueDate && (
          <Text style={styles.dueDate}>
            {new Date(item.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Görevler</Text>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#00C49F" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Görevler</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00C49F" />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>Görev bulunamadı</Text>
          </View>
        }
        contentContainerStyle={tasks.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
      />

      {/* Task Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedTask?.title}</Text>
              {selectedTask?.description && (
                <Text style={styles.modalDescription}>{selectedTask.description}</Text>
              )}
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Durum:</Text>
                <Text style={[styles.modalValue, { color: getStatusColor(selectedTask?.status || 'TODO') }]}>
                  {selectedTask?.status}
                </Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalLabel}>Öncelik:</Text>
                <Text style={[styles.modalValue, { color: getPriorityColor(selectedTask?.priority || 'MEDIUM') }]}>
                  {selectedTask?.priority}
                </Text>
              </View>
              {selectedTask?.assignedTo && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Atanan:</Text>
                  <Text style={styles.modalValue}>{selectedTask.assignedTo.name}</Text>
                </View>
              )}
              {selectedTask?.project && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Proje:</Text>
                  <Text style={styles.modalValue}>{selectedTask.project.name}</Text>
                </View>
              )}
              {selectedTask?.dueDate && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Bitiş Tarihi:</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selectedTask.dueDate).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              )}

              <Text style={styles.modalSectionTitle}>Durum Güncelle</Text>
              <View style={styles.statusButtons}>
                {selectedTask?.status !== 'TODO' && (
                  <PrimaryButton
                    label="TODO"
                    onPress={() => selectedTask && handleStatusUpdate(selectedTask._id, 'TODO')}
                    style={[styles.statusButton, { backgroundColor: '#FFA500' }]}
                    disabled={updating}
                  />
                )}
                {selectedTask?.status !== 'IN_PROGRESS' && (
                  <PrimaryButton
                    label="IN_PROGRESS"
                    onPress={() => selectedTask && handleStatusUpdate(selectedTask._id, 'IN_PROGRESS')}
                    style={[styles.statusButton, { backgroundColor: '#0066CC' }]}
                    disabled={updating}
                  />
                )}
                {selectedTask?.status !== 'COMPLETED' && (
                  <PrimaryButton
                    label="COMPLETED"
                    onPress={() => selectedTask && handleStatusUpdate(selectedTask._id, 'COMPLETED')}
                    style={[styles.statusButton, { backgroundColor: '#00C49F' }]}
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
  taskCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 12,
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  taskTitle: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  taskDescription: { color: '#CFE0F5', fontSize: 13, marginBottom: 8 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priorityText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  dueDate: { color: '#9FB2C8', fontSize: 12 },
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
  modalDescription: { color: '#CFE0F5', fontSize: 14, marginBottom: 16 },
  modalInfo: { flexDirection: 'row', marginBottom: 12 },
  modalLabel: { color: '#9FB2C8', fontSize: 14, width: 100 },
  modalValue: { color: '#fff', fontSize: 14, flex: 1 },
  modalSectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 12 },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusButton: { flex: 1, minWidth: '45%' },
});

