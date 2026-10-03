import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SummaryCard } from './components/SummaryCard';
import { SpendingChart } from './components/SpendingChart';
import { SubscriptionList } from './components/SubscriptionList';
import { SubscriptionModal } from './components/SubscriptionModal';
import { FloatingAddButton } from './components/FloatingAddButton';
import { CalendarModal } from './components/CalendarModal';
import { SettingsModal } from './components/SettingsModal';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { Subscription, UserProfile } from './types';
import {
  getStoredSubscriptions,
  saveSubscriptions,
  getStoredProfile,
  saveProfile,
  calculateMonthlyEquivalent,
  isDueIn30Days,
  formatCurrency,
  DEFAULT_SUBSCRIPTIONS,
  DEFAULT_PROFILE,
} from './utils/storage';
import { initAuth } from './services/googleAuth';
import { User } from 'firebase/auth';
import { Wallet, CalendarCheck } from 'lucide-react';

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    getStoredSubscriptions()
  );
  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile());
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setCurrentUser(user),
      () => setCurrentUser(null)
    );
    return () => unsubscribe();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    saveSubscriptions(subscriptions);
  }, [subscriptions]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  // Derived metrics
  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.active),
    [subscriptions]
  );

  const monthlyAverage = useMemo(() => {
    return activeSubscriptions.reduce(
      (sum, sub) => sum + calculateMonthlyEquivalent(sub),
      0
    );
  }, [activeSubscriptions]);

  const upcoming30DaysSubs = useMemo(() => {
    return activeSubscriptions.filter((sub) => isDueIn30Days(sub.renewalDate));
  }, [activeSubscriptions]);

  const dueIn30DaysTotal = useMemo(() => {
    return upcoming30DaysSubs.reduce((sum, sub) => sum + sub.amount, 0);
  }, [upcoming30DaysSubs]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingSubscription(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsAddEditModalOpen(true);
  };

  const handleSaveSubscription = (
    data: Omit<Subscription, 'id'>,
    editId?: string
  ) => {
    if (editId) {
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === editId ? { ...data, id: editId } : sub))
      );
    } else {
      const newSub: Subscription = {
        ...data,
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      setSubscriptions((prev) => [newSub, ...prev]);
    }
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
  };

  const handleResetData = () => {
    setSubscriptions(DEFAULT_SUBSCRIPTIONS);
    setProfile(DEFAULT_PROFILE);
  };

  const handleImportSubscriptions = (imported: Subscription[]) => {
    setSubscriptions(imported);
  };

  return (
    <div className="min-h-screen bg-[#07050D] text-[#F8F7FC] relative overflow-hidden flex flex-col items-center">
      {/* Ambient background glows */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[550px] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 15%, rgba(139, 92, 246, 0.18) 0%, rgba(168, 85, 247, 0.08) 45%, rgba(7, 5, 13, 0) 75%)',
        }}
      />
      <div
        className="fixed bottom-0 -left-40 w-[600px] h-[500px] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 30% 70%, rgba(124, 58, 237, 0.10) 0%, rgba(7, 5, 13, 0) 70%)',
        }}
      />
      <div
        className="fixed top-1/3 -right-40 w-[500px] h-[500px] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 70% 40%, rgba(168, 85, 247, 0.07) 0%, rgba(7, 5, 13, 0) 70%)',
        }}
      />

      {/* Main Container - Responsive layout with mobile app feel */}
      <div className="w-full max-w-2xl px-4 sm:px-6 py-4 sm:py-6 relative z-10 flex flex-col gap-5 sm:gap-6 pb-28">
        {/* 1. HEADER */}
        <Header
          profile={profile}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenWorkspace={() => setIsWorkspaceOpen(true)}
          isGoogleConnected={!!currentUser}
        />

        {/* 2. TOP SUMMARY CARDS (Side-by-side on desktop, stacked on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <SummaryCard
            title="Monthly Average"
            amount={formatCurrency(monthlyAverage, profile.currencySymbol)}
            badgeText={`${activeSubscriptions.length} Active Services`}
            badgeVariant="purple"
            icon={Wallet}
          />
          <SummaryCard
            title="Due in 30 Days"
            amount={formatCurrency(dueIn30DaysTotal, profile.currencySymbol)}
            badgeText={`${upcoming30DaysSubs.length} Upcoming Bills`}
            badgeVariant="violet"
            icon={CalendarCheck}
          />
        </div>

        {/* 3. SPENDING TRENDS CARD */}
        <SpendingChart
          monthlyAverage={monthlyAverage}
          currencySymbol={profile.currencySymbol}
        />

        {/* 4. SUBSCRIPTIONS SECTION */}
        <SubscriptionList
          subscriptions={subscriptions}
          currencySymbol={profile.currencySymbol}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteSubscription}
          onAddNew={handleOpenAddModal}
        />
      </div>

      {/* 5. FLOATING ADD BUTTON */}
      <FloatingAddButton onClick={handleOpenAddModal} />

      {/* MODALS */}
      <SubscriptionModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveSubscription}
        initialData={editingSubscription}
        currencySymbol={profile.currencySymbol}
      />

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        subscriptions={activeSubscriptions}
        currencySymbol={profile.currencySymbol}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
        onResetData={handleResetData}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
        isGoogleConnected={!!currentUser}
      />

      <GoogleWorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        subscriptions={subscriptions}
        currencySymbol={profile.currencySymbol}
        onImportSubscriptions={handleImportSubscriptions}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />
    </div>
  );
}
