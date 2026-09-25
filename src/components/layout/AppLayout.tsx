import React from 'react';
import { AppHeader } from './AppHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { AppWorkspace } from '../AppWorkspace';
import { SimulatorSection } from '../SimulatorSection';
import { LandingView } from '../LandingView';
import { DigitalSignatureModal } from '../DigitalSignatureModal';
import { ReceiptModal } from '../ReceiptModal';
import { ToastContainer } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useSerralheria } from '../../context/SerralheriaContext';
import { ArrowLeft } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    editingConfig,
    setEditingConfig,
    presets,
    salvarPreset,
    excluirPreset,
    salvarOrcamentoDoSimulador,
    signatureModalOpen,
    closeSignatureModal,
    saveSignature,
    selectedDocForSignature,
    receiptModalOpen,
    closeReceiptModal,
    docForReceipt,
    toasts,
    dismissToast,
    confirmDialog,
    closeConfirm
  } = useSerralheria();

  return (
    <div className="min-h-screen bg-[#090b10] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header Profissional do Sistema com Seletor de Módulos */}
      <AppHeader />

      {/* Conteúdo do Módulo Selecionado com respiro para a barra inferior no mobile */}
      <div className="flex-1 pb-20 md:pb-0">
        {/* 1. MÓDULO ERP OPERACIONAL (Padrão do Sistema) */}
        {viewMode === 'erp' && <AppWorkspace />}

        {/* 2. MÓDULO SIMULADOR CAD PARAMÉTRICO 2D */}
        {viewMode === 'simulador' && (
          <div className="py-6">
            <SimulatorSection
              initialConfig={editingConfig}
              onCriarOrcamento={salvarOrcamentoDoSimulador}
              onCancelarEdicao={() => {
                setEditingConfig(null);
                setViewMode('erp');
              }}
              presetsCustom={presets}
              onSalvarPreset={salvarPreset}
              onExcluirPreset={excluirPreset}
            />
          </div>
        )}

        {/* 3. MÓDULO LANDING PAGE COMERCIAL */}
        {viewMode === 'landing' && (
          <div>
            <LandingView
              onOpenApp={() => setViewMode('erp')}
              onCriarOrcamento={salvarOrcamentoDoSimulador}
              editingConfig={editingConfig}
              onCancelarEdicao={() => setEditingConfig(null)}
              presetsCustom={presets}
              onSalvarPreset={salvarPreset}
              onExcluirPreset={excluirPreset}
            />
          </div>
        )}
      </div>

      {/* Barra de Navegação Inferior Fixa no Mobile */}
      <MobileBottomNav />

      {/* Modais Globais de Assinatura e Recibo */}
      <DigitalSignatureModal
        isOpen={signatureModalOpen}
        onClose={closeSignatureModal}
        onSave={saveSignature}
        titulo={selectedDocForSignature?.tipo === 'orcamento' ? 'Aprovação de Orçamento com Assinatura Digital' : 'Termo de Vistoria e Entrega de Instalação'}
      />

      {docForReceipt && (
        <ReceiptModal
          isOpen={receiptModalOpen}
          onClose={closeReceiptModal}
          documento={docForReceipt.doc}
          tipoDoc={docForReceipt.tipo}
          modoInicial={docForReceipt.modoInicial || 'proposta'}
        />
      )}

      {/* Sistema Global de Confirmação Explícita para Ações Destrutivas (UX Lei 7) */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          cancelLabel={confirmDialog.cancelLabel}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirm}
        />
      )}

      {/* Notificações Toasts Globais (UX Lei 1) */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
