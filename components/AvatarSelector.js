import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { AVATAR_CONFIG } from '../config/avatarConfig';

/**
 * AvatarSelector Component
 * Avatar seçim modal'ı
 * 
 * Props:
 * - visible: boolean - Modal görünür mü?
 * - selectedAvatar: object - Seçili avatar
 * - onSelect: function - Avatar seçildiğinde callback
 * - onClose: function - Modal kapatıldığında callback
 */
export const AvatarSelector = ({ visible, selectedAvatar, onSelect, onClose }) => {
  // Mode'a göre avatar listesi seç
  const avatars = AVATAR_CONFIG.mode === 'online'
    ? AVATAR_CONFIG.avatars.heygenAvatars // HeyGen online avatarlar
    : AVATAR_CONFIG.avatars.offlineAvatars; // Offline avatarlar

  const handleAvatarSelect = (avatar) => {
    onSelect(avatar);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🎭 Avatar Seç</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar Grid */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            {avatars.map((avatar) => {
              const isSelected = selectedAvatar?.id === avatar.id;

              return (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarCard,
                    isSelected && styles.avatarCardSelected,
                  ]}
                  onPress={() => handleAvatarSelect(avatar)}
                  activeOpacity={0.7}
                >
                  {/* Avatar Image */}
                  <Image
                    source={
                      avatar.offline 
                        ? avatar.baseImage  // Offline: require() kullanılmış
                        : avatar.online
                          ? require('../assets/icon.png')  // HeyGen: Placeholder (icon.png)
                          : { uri: avatar.imageUrl }  // D-ID (deprecated): URL
                    }
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />

                  {/* Avatar Info */}
                  <View style={styles.avatarInfo}>
                    <Text style={styles.avatarName}>{avatar.name}</Text>
                    <Text style={styles.avatarGender}>
                      {avatar.gender === 'male' ? '👨 Erkek' : '👩 Kadın'}
                    </Text>
                  </View>

                  {/* Selected Badge */}
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Coming Soon Card */}
            <View style={[styles.avatarCard, styles.comingSoonCard]}>
              <View style={styles.comingSoonContent}>
                <Text style={styles.comingSoonIcon}>➕</Text>
                <Text style={styles.comingSoonText}>Kendi fotoğrafını</Text>
                <Text style={styles.comingSoonText}>yükle</Text>
                <Text style={styles.comingSoonBadge}>Yakında</Text>
              </View>
            </View>
          </ScrollView>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 Premium avatarlar profesyonel lip-sync ile konuşur
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  avatarCard: {
    width: '48%',
    aspectRatio: 0.75,
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  avatarCardSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#e3f2fd',
  },
  avatarImage: {
    width: '100%',
    height: '70%',
    backgroundColor: '#e0e0e0',
  },
  avatarInfo: {
    padding: 10,
    alignItems: 'center',
  },
  avatarName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  avatarGender: {
    fontSize: 12,
    color: '#666',
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  comingSoonCard: {
    backgroundColor: '#f0f0f0',
    borderStyle: 'dashed',
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonContent: {
    alignItems: 'center',
    padding: 10,
  },
  comingSoonIcon: {
    fontSize: 40,
    color: '#999',
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  comingSoonBadge: {
    marginTop: 8,
    fontSize: 10,
    color: '#999',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AvatarSelector;

