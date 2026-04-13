import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

import { useAuth } from '@/contexts/auth-context';
import { listVesselsRequest, updateVesselRequest, VesselRecord } from '@/services/vessel-service';

type EditForm = {
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

function vesselToForm(v: VesselRecord): EditForm {
  return {
    nome: v.nome ?? '',
    localizacao_municipio: v.localizacao_municipio ?? '',
    localizacao_uf: v.localizacao_uf ?? '',
    locais_atracacao: v.locais_atracacao ?? '',
    proprietario_nome: v.proprietario_nome ?? '',
    ano_construcao: v.ano_construcao ?? '',
    construcao_municipio: v.construcao_municipio ?? '',
    construcao_uf: v.construcao_uf ?? '',
    mestre_construtor: v.mestre_construtor ?? '',
    propulsao: v.propulsao ?? '',
    uso: v.uso ?? '',
    medida_comprimento: v.medida_comprimento ?? '',
    medida_boca: v.medida_boca ?? '',
    medida_pontal: v.medida_pontal ?? '',
    medida_espessura: v.medida_espessura ?? '',
    reparos: v.reparos ?? '',
    registro_tipologico: v.registro_tipologico ?? '',
  };
}

export default function ConsultasScreen() {
  const { token, user } = useAuth();
  const [all, setAll] = useState<VesselRecord[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit modal
  const [editTarget, setEditTarget] = useState<VesselRecord | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchVessels = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listVesselsRequest(token);
      setAll(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar embarcações.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchVessels(); }, [fetchVessels]);

  // My vessels filtered by search
  const myVessels = all
    .filter((v) => v.user_id === user?.id)
    .filter((v) => q.trim() === '' || v.nome.toLowerCase().includes(q.toLowerCase()) || (v.localizacao_municipio ?? '').toLowerCase().includes(q.toLowerCase()));

  const openEdit = (vessel: VesselRecord) => {
    setEditTarget(vessel);
    setForm(vesselToForm(vessel));
  };

  const closeEdit = () => {
    setEditTarget(null);
    setForm(null);
  };

  const setField = (field: keyof EditForm) => (value: string) =>
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);

  const handleSave = async () => {
    if (!editTarget || !form || !token) return;
    if (!form.nome.trim() || !form.localizacao_municipio.trim()) {
      Alert.alert('Atenção', 'Nome e município são obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateVesselRequest(token, editTarget.id, {
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
      });

      setAll((prev) => prev.map((v) => (v.id === updated.id ? { ...v, ...updated } : v)));
      closeEdit();
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#1d4ed8" />
        </Pressable>
        <Text style={styles.headerTitle}>Minhas Embarcações</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou município..."
          placeholderTextColor="#94a3b8"
          value={q}
          onChangeText={setQ}
          returnKeyType="search"
        />
        {q.length > 0 && (
          <Pressable onPress={() => setQ('')}>
            <Ionicons name="close-circle" size={18} color="#cbd5e1" />
          </Pressable>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1d4ed8" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={48} color="#cbd5e1" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={fetchVessels} style={styles.retryBtn}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={myVessels}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="boat-outline" size={56} color="#dbeafe" />
              <Text style={styles.emptyTitle}>Nenhuma embarcação encontrada</Text>
              <Text style={styles.emptyDesc}>
                {q ? 'Tente outro termo de busca.' : 'Você ainda não cadastrou embarcações.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openEdit(item)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrapper}>
                  <Ionicons name="boat-outline" size={20} color="#1d4ed8" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.nome}</Text>
                  {item.localizacao_municipio ? (
                    <Text style={styles.cardLocation}>
                      <Ionicons name="location-outline" size={12} color="#94a3b8" />
                      {' '}{item.localizacao_municipio}{item.localizacao_uf ? `, ${item.localizacao_uf}` : ''}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.editBadge}>
                  <Ionicons name="create-outline" size={16} color="#1d4ed8" />
                  <Text style={styles.editBadgeText}>Editar</Text>
                </View>
              </View>

              <View style={styles.cardTags}>
                {item.uso ? <Tag label={item.uso} /> : null}
                {item.propulsao ? <Tag label={item.propulsao} /> : null}
                {item.ano_construcao ? <Tag label={item.ano_construcao} icon="calendar-outline" /> : null}
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={!!editTarget} animationType="slide" presentationStyle="pageSheet">
        {form && editTarget && (
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHeader}>
              <Pressable onPress={closeEdit} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Text style={styles.modalTitle} numberOfLines={1}>{editTarget.nome}</Text>
              <Pressable onPress={handleSave} disabled={saving} style={styles.modalSaveBtn}>
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>Salvar</Text>
                )}
              </Pressable>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>

                <EditSection title="Identificação">
                  <EditField label="Nome *">
                    <TextInput style={styles.input} value={form.nome} onChangeText={setField('nome')} placeholder="Nome da embarcação" placeholderTextColor="#94a3b8" />
                  </EditField>
                  <EditField label="Proprietário">
                    <TextInput style={styles.input} value={form.proprietario_nome} onChangeText={setField('proprietario_nome')} placeholder="Nome do proprietário" placeholderTextColor="#94a3b8" />
                  </EditField>
                  <View style={styles.row}>
                    <EditField label="Uso" flex={1}>
                      <TextInput style={styles.input} value={form.uso} onChangeText={setField('uso')} placeholder="Ex: Pesca" placeholderTextColor="#94a3b8" />
                    </EditField>
                    <EditField label="Propulsão" flex={1}>
                      <TextInput style={styles.input} value={form.propulsao} onChangeText={setField('propulsao')} placeholder="Ex: Motor" placeholderTextColor="#94a3b8" />
                    </EditField>
                  </View>
                  <EditField label="Registro tipológico">
                    <TextInput style={styles.input} value={form.registro_tipologico} onChangeText={setField('registro_tipologico')} placeholder="Ex: Canoa de tolda" placeholderTextColor="#94a3b8" />
                  </EditField>
                </EditSection>

                <EditSection title="Localização">
                  <View style={styles.row}>
                    <EditField label="Município *" flex={3}>
                      <TextInput style={styles.input} value={form.localizacao_municipio} onChangeText={setField('localizacao_municipio')} placeholder="Ex: Belém" placeholderTextColor="#94a3b8" />
                    </EditField>
                    <EditField label="UF" flex={1}>
                      <TextInput style={[styles.input, { textAlign: 'center' }]} value={form.localizacao_uf} onChangeText={setField('localizacao_uf')} placeholder="PA" placeholderTextColor="#94a3b8" maxLength={2} autoCapitalize="characters" />
                    </EditField>
                  </View>
                  <EditField label="Locais de atracação">
                    <TextInput style={[styles.input, styles.inputMultiline]} value={form.locais_atracacao} onChangeText={setField('locais_atracacao')} placeholder="Descreva os locais" placeholderTextColor="#94a3b8" multiline numberOfLines={3} />
                  </EditField>
                </EditSection>

                <EditSection title="Construção">
                  <View style={styles.row}>
                    <EditField label="Município" flex={3}>
                      <TextInput style={styles.input} value={form.construcao_municipio} onChangeText={setField('construcao_municipio')} placeholder="Ex: Breves" placeholderTextColor="#94a3b8" />
                    </EditField>
                    <EditField label="UF" flex={1}>
                      <TextInput style={[styles.input, { textAlign: 'center' }]} value={form.construcao_uf} onChangeText={setField('construcao_uf')} placeholder="PA" placeholderTextColor="#94a3b8" maxLength={2} autoCapitalize="characters" />
                    </EditField>
                  </View>
                  <View style={styles.row}>
                    <EditField label="Ano" flex={1}>
                      <TextInput style={styles.input} value={form.ano_construcao} onChangeText={setField('ano_construcao')} placeholder="1985" placeholderTextColor="#94a3b8" keyboardType="numeric" maxLength={4} />
                    </EditField>
                    <EditField label="Mestre Construtor" flex={2}>
                      <TextInput style={styles.input} value={form.mestre_construtor} onChangeText={setField('mestre_construtor')} placeholder="Nome do mestre" placeholderTextColor="#94a3b8" />
                    </EditField>
                  </View>
                </EditSection>

                <EditSection title="Medidas (metros)">
                  <View style={styles.row}>
                    {(['medida_comprimento', 'medida_boca', 'medida_pontal', 'medida_espessura'] as (keyof EditForm)[]).map((f, i) => (
                      <EditField key={f} label={['Compr.', 'Boca', 'Pontal', 'Espes.'][i]} flex={1}>
                        <TextInput style={[styles.input, { textAlign: 'center' }]} value={form[f]} onChangeText={setField(f)} placeholder="0,00" placeholderTextColor="#94a3b8" keyboardType="decimal-pad" />
                      </EditField>
                    ))}
                  </View>
                </EditSection>

                <EditSection title="Reparos e Observações">
                  <EditField label="Reparos">
                    <TextInput style={[styles.input, styles.inputMultiline]} value={form.reparos} onChangeText={setField('reparos')} placeholder="Descreva reparos ou observações" placeholderTextColor="#94a3b8" multiline numberOfLines={4} />
                  </EditField>
                </EditSection>

              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

function Tag({ label, icon }: { label: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.tag}>
      {icon ? <Ionicons name={icon} size={11} color="#1d4ed8" /> : null}
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

function EditSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.editSection}>
      <Text style={styles.editSectionTitle}>{title}</Text>
      <View style={styles.editSectionBody}>{children}</View>
    </View>
  );
}

function EditField({ label, flex, children }: { label: string; flex?: number; children: React.ReactNode }) {
  return (
    <View style={[styles.fieldGroup, flex !== undefined && { flex }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f6ff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#ffffff', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a', padding: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  loadingText: { color: '#64748b', fontSize: 14 },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center' },
  retryBtn: {
    marginTop: 4, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#eff6ff', borderRadius: 10, borderWidth: 1, borderColor: '#bfdbfe',
  },
  retryText: { color: '#1d4ed8', fontWeight: '600', fontSize: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  emptyDesc: { fontSize: 13, color: '#64748b', textAlign: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  card: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, gap: 10,
  },
  cardPressed: { opacity: 0.8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconWrapper: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  cardLocation: { fontSize: 12, color: '#64748b' },
  editBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eff6ff', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  editBadgeText: { fontSize: 12, fontWeight: '600', color: '#1d4ed8' },
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f0f6ff', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: '#dbeafe',
  },
  tagText: { fontSize: 11, color: '#1d4ed8', fontWeight: '500' },
  // Modal
  modalSafe: { flex: 1, backgroundColor: '#f0f6ff' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  modalCancelBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  modalCancelText: { color: '#64748b', fontSize: 15 },
  modalTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  modalSaveBtn: {
    backgroundColor: '#1d4ed8', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 6, minWidth: 60, alignItems: 'center',
  },
  modalSaveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalBody: { padding: 16, gap: 12, paddingBottom: 40 },
  editSection: {
    backgroundColor: '#ffffff', borderRadius: 14,
    borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden',
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  editSectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: 0.8,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  editSectionBody: { padding: 14, gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 },
  input: {
    backgroundColor: '#f8fafc', borderRadius: 8,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    paddingHorizontal: 12, paddingVertical: 10,
    color: '#0f172a', fontSize: 14,
  },
  inputMultiline: { minHeight: 76, textAlignVertical: 'top', paddingTop: 10 },
});
