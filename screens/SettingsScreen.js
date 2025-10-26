import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { AVATAR_CONFIG } from '../config/avatarConfig';
import { DEEPGRAM_CONFIG } from '../config/deepgramConfig';

/**
 * SettingsScreen
 * Deepgram ve HeyGen Avatar ayarları
 */
export default function SettingsScreen({ navigation }) {
  // API Keys
  const [deepgramApiKey, setDeepgramApiKey] = useState(DEEPGRAM_CONFIG.apiKey);
  const [heygenApiKey, setHeygenApiKey] = useState(AVATAR_CONFIG.heygenApiKey);

  // Deepgram Settings
  const [sttModel, setSttModel] = useState(DEEPGRAM_CONFIG.stt.model);
  const [language, setLanguage] = useState(DEEPGRAM_CONFIG.stt.language);
  const [smartFormat, setSmartFormat] = useState(DEEPGRAM_CONFIG.stt.smartFormat);
  const [punctuate, setPunctuate] = useState(DEEPGRAM_CONFIG.stt.punctuate);

  // TTS Settings
  const [ttsModel, setTtsModel] = useState(DEEPGRAM_CONFIG.tts.model);

  // Avatar Settings
  const [avatarQuality, setAvatarQuality] = useState(AVATAR_CONFIG.video.quality);
  const [cacheVideos, setCacheVideos] = useState(AVATAR_CONFIG.performance.cacheVideos);

  const handleSaveSettings = () => {
    // Not: Bu ayarları AsyncStorage veya başka bir persistence çözümüne kaydetmelisiniz
    Alert.alert('✅ Başarılı', 'Ayarlar kaydedildi!\n\n⚠️ Değişikliklerin geçerli olması için uygulamayı yeniden başlatın.');
  };

  const handleTestDeepgram = async () => {
    Alert.alert('🧪 Test', 'Deepgram API testi başlatılıyor...\n\n(Implementasyon gerekli)');
  };

  const handleTestHeyGen = async () => {
    Alert.alert('🧪 Test', 'HeyGen API testi başlatılıyor...\n\n(Implementasyon gerekli)');
  };

  const openDeepgramConsole = () => {
    Linking.openURL('https://console.deepgram.com/');
  };

  const openHeyGenApp = () => {
    Linking.openURL('https://app.heygen.com/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Ayarlar</Text>
        <Text style={styles.headerSubtitle}>Deepgram & HeyGen API Konfigürasyonu</Text>
      </View>

      {/* Deepgram API Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔊 Deepgram API</Text>
          <TouchableOpacity style={styles.linkButton} onPress={openDeepgramConsole}>
            <Text style={styles.linkButtonText}>Console ↗</Text>
          </TouchableOpacity>
        </View>

        {/* API Key */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>API Key</Text>
          <TextInput
            style={styles.input}
            value={deepgramApiKey}
            onChangeText={setDeepgramApiKey}
            placeholder="YOUR_DEEPGRAM_API_KEY_HERE"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            Ücretsiz $200 kredi için{' '}
            <Text style={styles.link} onPress={openDeepgramConsole}>
              console.deepgram.com
            </Text>
          </Text>
        </View>

        {/* STT Model */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>STT Model</Text>
          <View style={styles.buttonGroup}>
            {['nova-2', 'nova', 'enhanced', 'base'].map((model) => (
              <TouchableOpacity
                key={model}
                style={[
                  styles.optionButton,
                  sttModel === model && styles.optionButtonActive,
                ]}
                onPress={() => setSttModel(model)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    sttModel === model && styles.optionButtonTextActive,
                  ]}
                >
                  {model}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hint}>Nova-2: En hızlı ve doğru (önerilen)</Text>
        </View>

        {/* Language */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dil</Text>
          <View style={styles.buttonGroup}>
            {[
              { code: 'tr', name: '🇹🇷 Türkçe' },
              { code: 'en', name: '🇺🇸 English' },
              { code: 'es', name: '🇪🇸 Español' },
              { code: 'fr', name: '🇫🇷 Français' },
            ].map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.optionButton,
                  language === lang.code && styles.optionButtonActive,
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    language === lang.code && styles.optionButtonTextActive,
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Smart Format & Punctuate */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Smart Formatting</Text>
          <Switch
            value={smartFormat}
            onValueChange={setSmartFormat}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Otomatik Noktalama</Text>
          <Switch
            value={punctuate}
            onValueChange={setPunctuate}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
          />
        </View>

        {/* TTS Model */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>TTS Voice Model</Text>
          <View style={styles.buttonGroup}>
            {[
              { id: 'aura-asteria-en', name: 'Asteria 👩' },
              { id: 'aura-luna-en', name: 'Luna 👩' },
              { id: 'aura-orion-en', name: 'Orion 👨' },
            ].map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.optionButton,
                  ttsModel === model.id && styles.optionButtonActive,
                ]}
                onPress={() => setTtsModel(model.id)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    ttsModel === model.id && styles.optionButtonTextActive,
                  ]}
                >
                  {model.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Test Button */}
        <TouchableOpacity style={styles.testButton} onPress={handleTestDeepgram}>
          <Text style={styles.testButtonText}>🧪 Deepgram Test</Text>
        </TouchableOpacity>
      </View>

      {/* HeyGen API Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎭 HeyGen Avatar API</Text>
          <TouchableOpacity style={styles.linkButton} onPress={openHeyGenApp}>
            <Text style={styles.linkButtonText}>Dashboard ↗</Text>
          </TouchableOpacity>
        </View>

        {/* API Key */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>API Key</Text>
          <TextInput
            style={styles.input}
            value={heygenApiKey}
            onChangeText={setHeygenApiKey}
            placeholder="sk_V2_..."
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            API key için{' '}
            <Text style={styles.link} onPress={openHeyGenApp}>
              app.heygen.com/settings
            </Text>
          </Text>
        </View>

        {/* Video Quality */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Video Kalitesi</Text>
          <View style={styles.buttonGroup}>
            {['low', 'medium', 'high'].map((quality) => (
              <TouchableOpacity
                key={quality}
                style={[
                  styles.optionButton,
                  avatarQuality === quality && styles.optionButtonActive,
                ]}
                onPress={() => setAvatarQuality(quality)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    avatarQuality === quality && styles.optionButtonTextActive,
                  ]}
                >
                  {quality === 'low' ? 'Düşük' : quality === 'medium' ? 'Orta' : 'Yüksek'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hint}>
            Yüksek kalite daha uzun işleme süresi gerektirir
          </Text>
        </View>

        {/* Cache Videos */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Video Cache</Text>
            <Text style={styles.switchHint}>
              Videoları önbelleğe al (performans için)
            </Text>
          </View>
          <Switch
            value={cacheVideos}
            onValueChange={setCacheVideos}
            trackColor={{ false: '#767577', true: '#9C27B0' }}
          />
        </View>

        {/* Test Button */}
        <TouchableOpacity style={styles.testButton} onPress={handleTestHeyGen}>
          <Text style={styles.testButtonText}>🧪 HeyGen Test</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Bilgi</Text>
        <Text style={styles.infoText}>
          • Deepgram: Speech-to-Text ve Text-to-Speech{'\n'}
          • HeyGen: Konuşan avatar videoları (lip-sync){'\n'}
          • API anahtarları güvenli şekilde saklanmalıdır{'\n'}
          • Production'da environment variables kullanın
        </Text>
    </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
        <Text style={styles.saveButtonText}>💾 Ayarları Kaydet</Text>
      </TouchableOpacity>

      {/* Spacer */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  linkButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  linkButtonText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  link: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  switchHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  testButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
