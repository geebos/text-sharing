import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  // Try to get locale from cookie first (set by client-side language switcher)
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('preferred-locale')?.value;
  
  // Use cookie if available and valid, otherwise default to 'zh'
  // Removed Accept-Language header detection to prevent hydration mismatch
  let locale = 'zh';
  if (cookieLocale && ['zh', 'en'].includes(cookieLocale)) {
    locale = cookieLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});