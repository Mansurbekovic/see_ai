export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalResults?: number;
}

export interface SearchProvider {
  readonly name: string;
  search(query: string, options?: { limit?: number }): Promise<SearchResponse>;
}
