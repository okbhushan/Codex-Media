import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  HardDrive,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  LogOut,
  FolderOpen,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
} from '../services/googleAuth';
import {
  listDriveFiles,
  uploadBackupToDrive,
  readDriveFileContent,
  deleteDriveFile,
  DriveFile,
} from '../services/googleDriveService';
import {
  exportSubscriptionsToSheets,
  readSubscriptionsFromSheets,
  CreateSpreadsheetResult,
} from '../services/googleSheetsService';
import { Subscription } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  currencySymbol: string;
  onImportSubscriptions: (imported: Subscription[]) => void;
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  currencySymbol,
  onImportSubscriptions,
  currentUser,
  onUserChange,
}) => {
  const [activeTab, setActiveTab] = useState<'sheets' | 'drive'>('sheets');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Drive files state
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Export result
  const [lastExport, setLastExport] = useState<CreateSpreadsheetResult | null>(null);

  // Destructive delete confirmation modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
  }>({ isOpen: false, fileId: '', fileName: '' });

  // Import overwrite confirmation modal
  const [importConfirmation, setImportConfirmation] = useState<{
    isOpen: boolean;
    subscriptions: Subscription[];
    sourceName: string;
  }>({ isOpen: false, subscriptions: [], sourceName: '' });

  // Custom spreadsheet ID input
  const [customSheetInput, setCustomSheetInput] = useState('');

  // Auto fetch drive files if user is authenticated and modal is open
  useEffect(() => {
    if (isOpen && currentUser) {
      loadDriveFiles();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onUserChange(result.user);
        setStatusMessage({
          type: 'success',
          text: `Signed in as ${result.user.displayName || result.user.email}`,
        });
        loadDriveFiles();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Google Sign-In failed';
      setStatusMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onUserChange(null);
    setDriveFiles([]);
    setLastExport(null);
    setStatusMessage({ type: 'info', text: 'Disconnected from Google account' });
  };

  const loadDriveFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const files = await listDriveFiles(token);
      setDriveFiles(files);
    } catch (err: unknown) {
      console.warn('Failed to list drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Export to Google Sheets
  const handleExportToSheets = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in with Google first');
      }

      const result = await exportSubscriptionsToSheets(
        token,
        subscriptions,
        currencySymbol
      );
      setLastExport(result);
      setStatusMessage({
        type: 'success',
        text: `Exported ${subscriptions.length} subscriptions to Google Sheets!`,
      });
      loadDriveFiles();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to export to Google Sheets';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Backup to Google Drive
  const handleBackupToDrive = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in with Google first');

      const backupPayload = {
        app: 'SubTrack',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        currencySymbol,
        subscriptions,
      };

      const file = await uploadBackupToDrive(token, backupPayload);
      setStatusMessage({
        type: 'success',
        text: `Backup saved to Google Drive: "${file.name}"`,
      });
      loadDriveFiles();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save backup to Drive';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Import from Google Sheet
  const handleImportSheet = async (sheetId: string, sheetTitle?: string) => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in with Google first');

      // Extract raw ID if full URL pasted
      let cleanId = sheetId.trim();
      const match = cleanId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanId = match[1];
      }

      const rows = await readSubscriptionsFromSheets(token, cleanId);
      if (rows.length === 0) {
        throw new Error('No valid subscription rows found in this spreadsheet.');
      }

      const converted: Subscription[] = rows.map((r, idx) => ({
        id: `imported-${Date.now()}-${idx}`,
        name: r.name,
        amount: r.amount,
        billingCycle: (['Monthly', 'Yearly', 'Quarterly', 'Weekly'].includes(r.billingCycle)
          ? r.billingCycle
          : 'Monthly') as Subscription['billingCycle'],
        renewalDate: r.renewalDate || '2026-10-25',
        category: r.category || 'Utilities',
        iconType: r.name.toLowerCase().includes('wifi')
          ? 'wifi'
          : r.name.toLowerCase().includes('youtube')
          ? 'youtube'
          : r.name.toLowerCase().includes('apple')
          ? 'apple'
          : r.name.toLowerCase().includes('rent') || r.name.toLowerCase().includes('house')
          ? 'house'
          : 'generic',
        active: true,
      }));

      // Require user confirmation before importing/overwriting
      setImportConfirmation({
        isOpen: true,
        subscriptions: converted,
        sourceName: sheetTitle || `Spreadsheet (${cleanId.slice(0, 8)}...)`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import from Google Sheets';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Restore from Drive Backup file
  const handleRestoreBackup = async (file: DriveFile) => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in with Google first');

      const content = await readDriveFileContent(token, file.id);
      const parsed = JSON.parse(content);
      if (!parsed.subscriptions || !Array.isArray(parsed.subscriptions)) {
        throw new Error('Invalid SubTrack backup file structure.');
      }

      setImportConfirmation({
        isOpen: true,
        subscriptions: parsed.subscriptions,
        sourceName: file.name,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to restore backup from Drive';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Execute confirmed import
  const executeImport = () => {
    onImportSubscriptions(importConfirmation.subscriptions);
    setStatusMessage({
      type: 'success',
      text: `Successfully imported ${importConfirmation.subscriptions.length} subscriptions!`,
    });
    setImportConfirmation({ isOpen: false, subscriptions: [], sourceName: '' });
  };

  // Prompt confirmation for deleting file
  const promptDeleteFile = (file: DriveFile) => {
    setDeleteConfirmation({
      isOpen: true,
      fileId: file.id,
      fileName: file.name,
    });
  };

  // Execute confirmed delete
  const executeDeleteFile = async () => {
    const { fileId, fileName } = deleteConfirmation;
    setDeleteConfirmation({ isOpen: false, fileId: '', fileName: '' });
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');
      await deleteDriveFile(token, fileId);
      setStatusMessage({
        type: 'success',
        text: `Deleted "${fileName}" from Google Drive`,
      });
      loadDriveFiles();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete file from Google Drive';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[24px] glass-panel-elevated p-5 sm:p-7 relative border border-purple-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-14 bg-purple-600/25 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#F8F7FC] tracking-tight">
                Google Workspace Hub
              </h2>
              <p className="text-xs text-[#A7A0B5]">
                Google Drive & Google Sheets Integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-button flex items-center justify-center text-[#A7A0B5] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-red-500/15 border-red-500/30 text-red-200'
                : 'bg-purple-500/15 border-purple-500/30 text-purple-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle size={15} className="shrink-0 text-red-400" />
            ) : (
              <RefreshCw size={15} className="shrink-0 text-purple-400" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-white/60 hover:text-white text-xs ml-1"
            >
              ×
            </button>
          </div>
        )}

        {/* User Auth Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3">
          {currentUser ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full border border-purple-400/40 overflow-hidden shrink-0">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Google User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-bold">
                      {currentUser.displayName?.charAt(0) || 'G'}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#F8F7FC] truncate">
                    {currentUser.displayName || 'Google User'}
                  </div>
                  <div className="text-[11px] text-[#A7A0B5] truncate">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl glass-button text-xs font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <LogOut size={13} />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <div className="w-full space-y-3 py-2 text-center">
              <p className="text-xs text-[#A7A0B5] max-w-sm mx-auto">
                Sign in with your Google account to sync subscriptions with Google Sheets and store backups in Google Drive.
              </p>
              <div className="max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="gsi-material-button"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        style={{ display: 'block' }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        ></path>
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        ></path>
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        ></path>
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        ></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {isLoading ? 'Connecting...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/[0.08] mt-4">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sheets'
                ? 'border-purple-400 text-purple-200'
                : 'border-transparent text-[#A7A0B5] hover:text-white'
            }`}
          >
            <FileSpreadsheet size={15} />
            <span>Google Sheets</span>
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'drive'
                ? 'border-purple-400 text-purple-200'
                : 'border-transparent text-[#A7A0B5] hover:text-white'
            }`}
          >
            <HardDrive size={15} />
            <span>Google Drive Files</span>
          </button>
        </div>

        {/* Tab 1: Google Sheets */}
        {activeTab === 'sheets' && (
          <div className="mt-5 space-y-4">
            {/* Export Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-purple-500/25 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[#F8F7FC] flex items-center gap-2">
                    <Download size={15} className="text-purple-300" />
                    <span>Export to Google Sheets</span>
                  </h4>
                  <p className="text-xs text-[#A7A0B5] mt-1">
                    Creates a formatted Google Sheet with your {subscriptions.length} subscriptions, monthly totals, and renewal dates.
                  </p>
                </div>
                <button
                  onClick={handleExportToSheets}
                  disabled={isLoading || !currentUser}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer shrink-0"
                >
                  {isLoading ? 'Exporting...' : 'Export Now'}
                </button>
              </div>

              {lastExport && (
                <div className="mt-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-semibold text-purple-200 block truncate">
                      {lastExport.title}
                    </span>
                    <span className="text-[11px] text-[#A7A0B5]">Ready in Google Sheets</span>
                  </div>
                  <a
                    href={lastExport.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-white underline ml-2 shrink-0"
                  >
                    <span>Open Sheet</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Import by ID / URL */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <h4 className="text-sm font-bold text-[#F8F7FC] flex items-center gap-2">
                <Upload size={15} className="text-purple-300" />
                <span>Import from Google Sheets</span>
              </h4>
              <p className="text-xs text-[#A7A0B5] mt-1">
                Enter a Google Sheets URL or ID to import subscription rows into SubTrack.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Google Sheet URL or ID..."
                  value={customSheetInput}
                  onChange={(e) => setCustomSheetInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-[#F8F7FC] focus:outline-none"
                />
                <button
                  onClick={() => handleImportSheet(customSheetInput)}
                  disabled={isLoading || !currentUser || !customSheetInput.trim()}
                  className="px-3.5 py-2 rounded-xl glass-button text-xs font-semibold text-purple-200 hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Google Drive */}
        {activeTab === 'drive' && (
          <div className="mt-5 space-y-4">
            {/* Backup Action */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#F8F7FC] flex items-center gap-2">
                  <HardDrive size={15} className="text-purple-300" />
                  <span>Backup to Google Drive</span>
                </h4>
                <p className="text-xs text-[#A7A0B5] mt-0.5">
                  Save a snapshot of your SubTrack data to your Drive folder.
                </p>
              </div>
              <button
                onClick={handleBackupToDrive}
                disabled={isLoading || !currentUser}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer shrink-0"
              >
                Create Backup
              </button>
            </div>

            {/* Drive Files List */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7A0B5] flex items-center gap-1.5">
                  <FolderOpen size={14} className="text-purple-300" />
                  <span>SubTrack Files in Drive</span>
                </h4>
                <button
                  onClick={loadDriveFiles}
                  disabled={isLoadingFiles || !currentUser}
                  className="p-1 rounded-lg glass-button text-purple-300 hover:text-white"
                  title="Refresh files"
                >
                  <RefreshCw size={13} className={isLoadingFiles ? 'animate-spin' : ''} />
                </button>
              </div>

              {!currentUser ? (
                <p className="text-xs text-[#A7A0B5] text-center py-6">
                  Sign in with Google above to view Drive files.
                </p>
              ) : isLoadingFiles ? (
                <p className="text-xs text-[#A7A0B5] text-center py-6">
                  Loading Drive files...
                </p>
              ) : driveFiles.length === 0 ? (
                <p className="text-xs text-[#A7A0B5] text-center py-6">
                  No SubTrack spreadsheets or backups found in your Google Drive.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {driveFiles.map((file) => {
                    const isSheet = file.mimeType.includes('spreadsheet');
                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/25 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-300 shrink-0">
                            {isSheet ? <FileSpreadsheet size={14} /> : <FileText size={14} />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-[#F8F7FC] block truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-[#A7A0B5]">
                              {isSheet ? 'Google Sheet' : 'JSON Backup'} •{' '}
                              {file.modifiedTime
                                ? new Date(file.modifiedTime).toLocaleDateString()
                                : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg glass-button text-purple-300 hover:text-white"
                              title="Open in Google Drive"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}

                          {isSheet ? (
                            <button
                              onClick={() => handleImportSheet(file.id, file.name)}
                              className="p-1.5 rounded-lg glass-button text-emerald-300 hover:text-white"
                              title="Import data into SubTrack"
                            >
                              <Upload size={13} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestoreBackup(file)}
                              className="p-1.5 rounded-lg glass-button text-emerald-300 hover:text-white"
                              title="Restore backup"
                            >
                              <Upload size={13} />
                            </button>
                          )}

                          <button
                            onClick={() => promptDeleteFile(file)}
                            className="p-1.5 rounded-lg glass-button text-red-400 hover:text-red-300"
                            title="Delete file from Google Drive"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Destructive Action User Confirmation Dialog for File Deletion */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title="Delete Google Drive File?"
        message="Are you sure you want to permanently delete this file from your Google Drive? This action cannot be undone."
        affectedItemName={deleteConfirmation.fileName}
        confirmLabel="Delete from Drive"
        cancelLabel="Keep File"
        isDestructive={true}
        onConfirm={executeDeleteFile}
        onCancel={() =>
          setDeleteConfirmation({ isOpen: false, fileId: '', fileName: '' })
        }
      />

      {/* Mandatory User Confirmation Dialog for Overwriting Subscriptions via Import */}
      <ConfirmationModal
        isOpen={importConfirmation.isOpen}
        title="Import Subscriptions?"
        message={`Found ${importConfirmation.subscriptions.length} subscription(s) in "${importConfirmation.sourceName}". Do you want to load these subscriptions into SubTrack?`}
        confirmLabel="Load Subscriptions"
        cancelLabel="Cancel"
        isDestructive={false}
        onConfirm={executeImport}
        onCancel={() =>
          setImportConfirmation({ isOpen: false, subscriptions: [], sourceName: '' })
        }
      />
    </div>
  );
};
