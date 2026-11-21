// পেজের Title সেট করে (SEO ও Browser Tab-এর জন্য)
import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

export default function useTitle(title) {
  const { settings } = useSettings();
  useEffect(() => {
    document.title = title ? `${title} | ${settings.storeName}` : settings.storeName;
  }, [title, settings.storeName]);
}
