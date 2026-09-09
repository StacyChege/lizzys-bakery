import { useEffect } from 'react';

// Sets the browser tab title for the page it's called in. The base
// index.html title covers first load and SEO crawlers that don't run JS;
// this keeps the tab accurate as the customer navigates the SPA.
export default function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — Lizzy's Bakery` : "Lizzy's Bakery";
  }, [title]);
}
