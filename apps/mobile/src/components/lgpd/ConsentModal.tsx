import React, { useState } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '../ui/Button';
import { useSettingsStore } from '../../store/settingsStore';
import { api } from '../../api/client';

interface ConsentModalProps {
  visible: boolean;
  onAccept: () => void;
}

export function ConsentModal({ visible, onAccept }: ConsentModalProps) {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const setConsentGiven = useSettingsStore((s) => s.setConsentGiven);

  const canProceed = privacyAccepted && termsAccepted;

  async function handleAccept() {
    setLoading(true);
    try {
      await Promise.all([
        api.post('/api/consent', { consentType: 'privacy', accepted: privacyAccepted }),
        api.post('/api/consent', { consentType: 'terms', accepted: termsAccepted }),
        api.post('/api/consent', { consentType: 'cookies', accepted: cookiesAccepted }),
      ]);
      setConsentGiven(true);
      onAccept();
    } catch {
      // Silent fail — consent saved locally
      setConsentGiven(true);
      onAccept();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-4/5">
          <Text className="text-xl font-bold text-primary-500 mb-2">Bem-vindo ao LexStudy</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Para continuar, precisamos do seu consentimento conforme a LGPD (Lei 13.709/2018).
          </Text>

          <ScrollView className="max-h-48 mb-4">
            <Text className="text-xs text-gray-500">
              Coletamos dados como nome, e-mail, progresso de estudo e preferências para personalizar sua experiência educacional. Seus dados não são vendidos a terceiros. Você pode solicitar exclusão a qualquer momento no seu perfil.
            </Text>
          </ScrollView>

          <ConsentItem
            label="Aceito a Política de Privacidade *"
            checked={privacyAccepted}
            onToggle={() => setPrivacyAccepted((s) => !s)}
          />
          <ConsentItem
            label="Aceito os Termos de Uso *"
            checked={termsAccepted}
            onToggle={() => setTermsAccepted((s) => !s)}
          />
          <ConsentItem
            label="Aceito cookies de análise (opcional)"
            checked={cookiesAccepted}
            onToggle={() => setCookiesAccepted((s) => !s)}
          />

          <Text className="text-xs text-gray-400 mb-4">* Obrigatório para usar o aplicativo</Text>

          <Button
            title="Concordar e Continuar"
            disabled={!canProceed}
            loading={loading}
            onPress={handleAccept}
            fullWidth
            variant="primary"
          />
        </View>
      </View>
    </Modal>
  );
}

function ConsentItem({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity className="flex-row items-center mb-3" onPress={onToggle}>
      <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${checked ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
        {checked && <Text className="text-white text-xs font-bold">✓</Text>}
      </View>
      <Text className="text-sm text-gray-700 flex-1">{label}</Text>
    </TouchableOpacity>
  );
}
