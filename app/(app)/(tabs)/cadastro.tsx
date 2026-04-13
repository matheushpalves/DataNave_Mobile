import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth, getApiUrl } from '@/contexts/auth-context';
import { useSync } from '@/hooks/use-sync';
import { enqueuePendingVessel } from '@/services/local-vessel-store';
import { uploadPhotoRequest } from '@/services/photo-service';
import { createVesselRequest } from '@/services/vessel-service';

async function checkOnline(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    await fetch(`${getApiUrl()}/vessels`, { signal: controller.signal });
    clearTimeout(timeout);
    return true;
  } catch {
    clearTimeout(timeout);
    return false;
  }
}

async function pickImage(source: 'camera' | 'gallery'): Promise<string | null> {
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera nas configurações.');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7, allowsEditing: true });
    if (result.canceled || !result.assets[0].base64) return null;
    return result.assets[0].base64;
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria nas configurações.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
      allowsEditing: true,
      mediaTypes: ['images'],
    });
    if (result.canceled || !result.assets[0].base64) return null;
    return result.assets[0].base64;
  }
}

type FormState = {
  nome: string;
  localizacao_municipio: string;
  localizacao_uf: string;
  locais_atracacao: string;
  proprietario_nome: string;
  ano_construcao: string;
  construcao_municipio: string;
  construcao_uf: string;
  mestre_construtor: string;
  propulsao: string;
  uso: string;
  medida_comprimento: string;
  medida_boca: string;
  medida_pontal: string;
  medida_espessura: string;
  reparos: string;
  registro_tipologico: string;
};

const EMPTY_FORM: FormState = {
  nome: '',
  localizacao_municipio: '',
  localizacao_uf: '',
  locais_atracacao: '',
  proprietario_nome: '',
  ano_construcao: '',
  construcao_municipio: '',
  construcao_uf: '',
  mestre_construtor: '',
  propulsao: '',
  uso: '',
  medida_comprimento: '',
  medida_boca: '',
  medida_pontal: '',
  medida_espessura: '',
  reparos: '',
  registro_tipologico: '',
};

export default function CadastroScreen() {
  const { token } = useAuth();
  const { refreshPending } = useSync(token);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const set = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const required: (keyof FormState)[] = [
      'nome',
      'localizacao_municipio',
      'localizacao_uf',
    ];

    const newErrors: Partial<Record<keyof FormState, string>> = {};

    for (const field of required) {
      if (!form[field].trim()) {
        newErrors[field] = 'Campo obrigatório.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickPhoto = async (source: 'camera' | 'gallery') => {
    setPhotoModalVisible(false);
    // small delay so modal closes before permissions dialog on Android
    await new Promise((r) => setTimeout(r, 300));
    const b64 = await pickImage(source);
    if (b64) setPhotos((p) => [...p, b64]);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      nome: form.nome.trim(),
      localizacao_municipio: form.localizacao_municipio.trim(),
      localizacao_uf: form.localizacao_uf.trim() || undefined,
      locais_atracacao: form.locais_atracacao.trim() || undefined,
      proprietario_nome: form.proprietario_nome.trim() || undefined,
      ano_construcao: form.ano_construcao.trim() || undefined,
      construcao_municipio: form.construcao_municipio.trim() || undefined,
      construcao_uf: form.construcao_uf.trim() || undefined,
      mestre_construtor: form.mestre_construtor.trim() || undefined,
      propulsao: form.propulsao.trim() || undefined,
      uso: form.uso.trim() || undefined,
      medida_comprimento: form.medida_comprimento.trim() || undefined,
      medida_boca: form.medida_boca.trim() || undefined,
      medida_pontal: form.medida_pontal.trim() || undefined,
      medida_espessura: form.medida_espessura.trim() || undefined,
      reparos: form.reparos.trim() || undefined,
      registro_tipologico: form.registro_tipologico.trim() || undefined,
    };

    try {
      const online = await checkOnline();

      if (online && token) {
        const vessel = await createVesselRequest(token, payload);
        for (const photo of photos) {
          await uploadPhotoRequest(token, vessel.id, photo);
        }
        Alert.alert('Cadastrada!', 'Embarcação enviada com sucesso.', [
          { text: 'OK', onPress: () => { setForm(EMPTY_FORM); setPhotos([]); router.back(); } },
        ]);
      } else {
        await enqueuePendingVessel(payload, photos.length > 0 ? photos : undefined);
        await refreshPending();
        Alert.alert(
          'Salva localmente',
          'Sem conexão. Será sincronizada quando houver internet.',
          [{ text: 'OK', onPress: () => { setForm(EMPTY_FORM); setPhotos([]); router.back(); } }],
        );
      }
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao cadastrar embarcação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#1d4ed8" />
          </Pressable>
          <Text style={styles.headerTitle}>Nova Embarcação</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

          {/* ── Identificação ────────────────────────── */}
          <Section title="Identificação" icon="boat-outline">
            <Field label="Nome *" error={errors.nome}>
              <TextInput
                placeholder="Nome da embarcação"
                placeholderTextColor="#475569"
                style={[styles.input, errors.nome && styles.inputError]}
                value={form.nome}
                onChangeText={set('nome')}
              />
            </Field>

            <Field label="Proprietário">
              <TextInput
                placeholder="Nome do proprietário"
                placeholderTextColor="#475569"
                style={styles.input}
                value={form.proprietario_nome}
                onChangeText={set('proprietario_nome')}
              />
            </Field>

            <Row>
              <Field label="Uso" flex={1}>
                <TextInput
                  placeholder="Ex: Pesca"
                  placeholderTextColor="#475569"
                  style={styles.input}
                  value={form.uso}
                  onChangeText={set('uso')}
                />
              </Field>
              <Field label="Propulsão" flex={1}>
                <TextInput
                  placeholder="Ex: Motor"
                  placeholderTextColor="#475569"
                  style={styles.input}
                  value={form.propulsao}
                  onChangeText={set('propulsao')}
                />
              </Field>
            </Row>

            <Field label="Registro tipológico">
              <TextInput
                placeholder="Ex: Canoa de tolda"
                placeholderTextColor="#475569"
                style={styles.input}
                value={form.registro_tipologico}
                onChangeText={set('registro_tipologico')}
              />
            </Field>
          </Section>

          {/* ── Localização ──────────────────────────── */}
          <Section title="Localização" icon="location-outline">
            <Row>
              <Field label="Município *" flex={3} error={errors.localizacao_municipio}>
                <TextInput
                  placeholder="Ex: Belém"
                  placeholderTextColor="#475569"
                  style={[styles.input, errors.localizacao_municipio && styles.inputError]}
                  value={form.localizacao_municipio}
                  onChangeText={set('localizacao_municipio')}
                />
              </Field>
              <Field label="UF *" flex={1} error={errors.localizacao_uf}>
                <TextInput
                  autoCapitalize="characters"
                  maxLength={2}
                  placeholder="PA"
                  placeholderTextColor="#475569"
                  style={[styles.input, styles.inputCenter, errors.localizacao_uf && styles.inputError]}
                  value={form.localizacao_uf}
                  onChangeText={set('localizacao_uf')}
                />
              </Field>
            </Row>

            <Field label="Locais de atracação">
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="Descreva os locais de atracação"
                placeholderTextColor="#475569"
                style={[styles.input, styles.inputMultiline]}
                value={form.locais_atracacao}
                onChangeText={set('locais_atracacao')}
              />
            </Field>
          </Section>

          {/* ── Construção ───────────────────────────── */}
          <Section title="Construção" icon="construct-outline">
            <Row>
              <Field label="Município de Construção" flex={3}>
                <TextInput
                  placeholder="Ex: Breves"
                  placeholderTextColor="#475569"
                  style={styles.input}
                  value={form.construcao_municipio}
                  onChangeText={set('construcao_municipio')}
                />
              </Field>
              <Field label="UF" flex={1}>
                <TextInput
                  autoCapitalize="characters"
                  maxLength={2}
                  placeholder="PA"
                  placeholderTextColor="#475569"
                  style={[styles.input, styles.inputCenter]}
                  value={form.construcao_uf}
                  onChangeText={set('construcao_uf')}
                />
              </Field>
            </Row>

            <Row>
              <Field label="Ano de Construção" flex={1}>
                <TextInput
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder="Ex: 1985"
                  placeholderTextColor="#475569"
                  style={styles.input}
                  value={form.ano_construcao}
                  onChangeText={set('ano_construcao')}
                />
              </Field>
              <Field label="Mestre Construtor" flex={2}>
                <TextInput
                  placeholder="Nome do mestre"
                  placeholderTextColor="#475569"
                  style={styles.input}
                  value={form.mestre_construtor}
                  onChangeText={set('mestre_construtor')}
                />
              </Field>
            </Row>
          </Section>

          {/* ── Medidas ──────────────────────────────── */}
          <Section title="Medidas (metros)" icon="resize-outline">
            <Row>
              <Field label="Comprimento" flex={1}>
                <TextInput
                  keyboardType="decimal-pad"
                  placeholder="0,00"
                  placeholderTextColor="#475569"
                  style={[styles.input, styles.inputCenter]}
                  value={form.medida_comprimento}
                  onChangeText={set('medida_comprimento')}
                />
              </Field>
              <Field label="Boca" flex={1}>
                <TextInput
                  keyboardType="decimal-pad"
                  placeholder="0,00"
                  placeholderTextColor="#475569"
                  style={[styles.input, styles.inputCenter]}
                  value={form.medida_boca}
                  onChangeText={set('medida_boca')}
                />
              </Field>
              <Field label="Pontal" flex={1}>
                <TextInput
                  keyboardType="decimal-pad"
                  placeholder="0,00"
                  placeholderTextColor="#475569"
                  style={[styles.input, styles.inputCenter]}
                  value={form.medida_pontal}
                  onChangeText={set('medida_pontal')}
                />
              </Field>
              <Field label="Espessura" flex={1}>
                <TextInput
                  keyboardType="decimal-pad"
                  placeholder="0,00"
                  placeholderTextColor="#475569"
                  style={[styles.input, styles.inputCenter]}
                  value={form.medida_espessura}
                  onChangeText={set('medida_espessura')}
                />
              </Field>
            </Row>
          </Section>

          {/* ── Reparos ──────────────────────────────── */}
          <Section title="Reparos e Observações" icon="hammer-outline">
            <Field label="Reparos">
              <TextInput
                multiline
                numberOfLines={4}
                placeholder="Descreva reparos realizados ou observações relevantes"
                placeholderTextColor="#475569"
                style={[styles.input, styles.inputMultiline]}
                value={form.reparos}
                onChangeText={set('reparos')}
              />
            </Field>
          </Section>

          {/* ── Fotos ────────────────────────────────── */}
          <Section title={`Fotos${photos.length > 0 ? ` (${photos.length})` : ''}`} icon="camera-outline">
            {/* Botão principal */}
            <Pressable onPress={() => setPhotoModalVisible(true)} style={styles.addPhotoPrimary}>
              <Ionicons name="camera-outline" size={22} color="#3b82f6" />
              <Text style={styles.addPhotoPrimaryText}>Adicionar Fotos</Text>
            </Pressable>

            {/* Previews */}
            {photos.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoRow}
              >
                {photos.map((photo, i) => (
                  <View key={i} style={styles.thumbContainer}>
                    <Image source={{ uri: `data:image/jpeg;base64,${photo}` }} style={styles.thumb} />
                    <Pressable
                      onPress={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                      style={styles.removeBtn}
                    >
                      <Ionicons name="close-circle" size={22} color="#ef4444" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
          </Section>

          {/* ── Modal escolha de origem ───────────────── */}
          <Modal
            animationType="slide"
            transparent
            visible={photoModalVisible}
            onRequestClose={() => setPhotoModalVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setPhotoModalVisible(false)}>
              <View style={styles.photoSheet}>
                <View style={styles.photoSheetHandle} />
                <Text style={styles.photoSheetTitle}>Adicionar Foto</Text>

                <Pressable onPress={() => handlePickPhoto('camera')} style={styles.photoOption}>
                  <View style={[styles.photoOptionIcon, { backgroundColor: '#1d4ed8' }]}>
                    <Ionicons name="camera" size={24} color="#fff" />
                  </View>
                  <View style={styles.photoOptionText}>
                    <Text style={styles.photoOptionLabel}>Câmera</Text>
                    <Text style={styles.photoOptionDesc}>Tirar uma nova foto agora</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#475569" />
                </Pressable>

                <Pressable onPress={() => handlePickPhoto('gallery')} style={styles.photoOption}>
                  <View style={[styles.photoOptionIcon, { backgroundColor: '#7c3aed' }]}>
                    <Ionicons name="images" size={24} color="#fff" />
                  </View>
                  <View style={styles.photoOptionText}>
                    <Text style={styles.photoOptionLabel}>Galeria</Text>
                    <Text style={styles.photoOptionDesc}>Escolher foto existente</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#475569" />
                </Pressable>

                <Pressable onPress={() => setPhotoModalVisible(false)} style={styles.photoCancel}>
                  <Text style={styles.photoCancelText}>Cancelar</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>

          {/* Submit */}
          <Pressable disabled={isSubmitting} onPress={handleSubmit} style={styles.submitBtn}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>Cadastrar Embarcação</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={16} color="#3b82f6" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Field({
  label,
  error,
  flex,
  children,
}: {
  label: string;
  error?: string;
  flex?: number;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.fieldGroup, flex !== undefined && { flex }]}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

// ── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f0f6ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  body: {
    padding: 16,
    gap: 12,
    paddingBottom: 48,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionBody: {
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldGroup: {
    gap: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#0f172a',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  inputCenter: {
    textAlign: 'center',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  errorText: {
    fontSize: 11,
    color: '#ef4444',
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  addPhotoPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: '#eff6ff',
  },
  addPhotoPrimaryText: {
    color: '#1d4ed8',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  photoSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
    gap: 12,
  },
  photoSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 8,
  },
  photoSheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  photoOptionIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOptionText: {
    flex: 1,
    gap: 2,
  },
  photoOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  photoOptionDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  photoCancel: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginTop: 4,
  },
  photoCancelText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
  thumbContainer: {
    position: 'relative',
  },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ffffff',
    borderRadius: 11,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 15,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
