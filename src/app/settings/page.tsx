
import { TagsSettings } from '@/components/TagsSettings';
import { AnalyticsSettings } from '@/components/AnalyticsSettings';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChangePassword } from '@/components/ChangePassword';
import { FocusGoalSettings } from '@/components/FocusGoalSettings';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { DeleteAccount } from '@/components/DeleteAccount';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader 
            title="Settings" 
            description="Manage your preferences and configurations. Click on the settings to open them."
        />
        
        <div className="flex flex-col gap-6">
          <section id="password">
              <ChangePassword />
          </section>
          
          <section id="tags">
              <TagsSettings />
          </section>

          <section id="analytics">
              <AnalyticsSettings />
          </section>

          <section id="focus-goals">
              <FocusGoalSettings />
          </section>

          <section id="appearance">
              <ThemeSwitcher />
          </section>

          <section id="account">
              <DeleteAccount />
          </section>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
