// PostgREST `.or("col.ilike.%term%,...")` filters are comma/parenthesis
// delimited, so raw user input containing , ( ) % * \ breaks the query (or
// returns wrong results). Strip those before interpolating. Common real case:
// searching "Hunsur, Mysuru".
export function cleanSearchTerm(q: string | null | undefined): string {
  return (q ?? "").replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim();
}
