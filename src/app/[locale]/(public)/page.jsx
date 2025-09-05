import { db } from '@/lib/db/kysely'

import { availableLocales } from '@/i18n/config'
import { setLocaleCache } from '@/i18n/server-i18n';
import MapContainer from '@/components/front-map/map-container';
import MapModal from '@/components/front-map/modal';
import FrontPage from '@/components/static/front-page';
import AIChatbot from '@/components/ai/chatbot';

export const revalidate = false;
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return availableLocales.map((locale) => ({ locale }));
}

export default async function Home({ params : { locale } }) {

  setLocaleCache(locale);

  try {
    // Querying for select2 list initial options
    const territoryOptions = await db.selectFrom('Entry')
      .where('category', '=', 'territories')
      .where('published', '=', true)
      .select(['id', 'name'])
      .limit(25)
      .execute()

    const languageOptions = await db.selectFrom('Entry')
      .where('category', '=', 'languages')
      .where('published', '=', true)
      .select(['id', 'name'])
      .limit(25)
      .execute()

    const treatyOptions = await db.selectFrom('Entry')
      .where('category', '=', 'treaties')
      .where('published', '=', true)
      .select(['id', 'name'])
      .limit(25)
      .execute()

    return (
      <div className="font-[family-name:var(--font-geist-sans)]">
        <MapModal headerText="disclaimer-header" bodyText="disclaimer" footerText="disclaimer-close" />
        <MapContainer territoryOptions={territoryOptions} languageOptions={languageOptions} treatyOptions={treatyOptions} />
        <FrontPage />
        <AIChatbot />
      </div>
    );
  } catch (err) {
    const isDev = process.env.NODE_ENV === 'development';

    // handle startup errors gracefully
    console.log(err);
    if (err.message.includes('relation "Entry" does not exist')) {
      console.error('\x1b[31m%s\x1b[0m', "Ensure database is set up correctly, and/or seeded.");
    }
    // Return a error UI
    return (<div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Error</h1>
      {isDev ? (
        <p className="text-red-600">An error occurred while loading the page. Please review console errors.</p>
      ) : (
        <p className="text-red-600">An error occurred while loading the page. Please try again later.</p>
      )}
    </div>
    );
  }
}
