import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  searchTerm = signal('');
  searchHistory = signal<string[]>(JSON.parse(localStorage.getItem('sahaay_search_history') || '[]'));

  setSearchTerm(term: string) {
    this.searchTerm.set(term);
    if (term && !this.searchHistory().includes(term)) {
      const newHistory = [term, ...this.searchHistory()].slice(0, 5);
      this.searchHistory.set(newHistory);
      localStorage.setItem('sahaay_search_history', JSON.stringify(newHistory));
    }
  }

  clearHistory() {
    this.searchHistory.set([]);
    localStorage.removeItem('sahaay_search_history');
  }
}
