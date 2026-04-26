import { Injectable } from '@angular/core';

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean;
}

@Injectable({ providedIn: 'root' })
export class ExportService {

  /** Export data as CSV and trigger download */
  exportToCsv<T>(data: T[], columns: ExportColumn<T>[], filename: string): void {
    if (data.length === 0) {
      console.warn('ExportService: No data to export');
      return;
    }

    const headers = columns.map(c => this.escapeCsvField(c.header));
    const rows = data.map(item =>
      columns.map(col => this.escapeCsvField(String(col.accessor(item) ?? '')))
    );

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadBlob(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  /** Export data as JSON and trigger download */
  exportToJson<T>(data: T[], filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadBlob(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
  }

  /** Export a pre-formatted text report */
  exportTextReport(content: string, filename: string): void {
    this.downloadBlob(content, `${filename}.txt`, 'text/plain;charset=utf-8;');
  }

  /** Generate a needs summary report as CSV */
  exportNeedsSummary(needs: any[]): void {
    const columns: ExportColumn<any>[] = [
      { header: 'ID', accessor: n => n.id },
      { header: 'Title', accessor: n => n.title },
      { header: 'Category', accessor: n => n.category },
      { header: 'Urgency', accessor: n => n.urgency },
      { header: 'Status', accessor: n => n.status },
      { header: 'Location', accessor: n => n.locationName },
      { header: 'Latitude', accessor: n => n.lat },
      { header: 'Longitude', accessor: n => n.lng },
      { header: 'Reported By', accessor: n => n.reportedBy },
      { header: 'Reported At', accessor: n => this.formatTimestamp(n.reportedAt) },
      { header: 'Assigned Volunteers', accessor: n => (n.assignedVolunteers || []).length },
      { header: 'Description', accessor: n => n.description },
    ];

    this.exportToCsv(needs, columns, `sahaay_needs_${this.dateStamp()}`);
  }

  /** Generate a volunteer roster report as CSV */
  exportVolunteerRoster(volunteers: any[]): void {
    const columns: ExportColumn<any>[] = [
      { header: 'ID', accessor: v => v.id },
      { header: 'Name', accessor: v => v.name },
      { header: 'Phone', accessor: v => v.phone },
      { header: 'Skills', accessor: v => (v.skills || []).join('; ') },
      { header: 'Languages', accessor: v => (v.languages || []).join('; ') },
      { header: 'Available', accessor: v => v.available ? 'Yes' : 'No' },
      { header: 'Active', accessor: v => v.active ? 'Yes' : 'No' },
      { header: 'Rating', accessor: v => v.rating },
      { header: 'Tasks Completed', accessor: v => v.tasksCompleted },
      { header: 'Total Hours', accessor: v => v.totalHours },
      { header: 'Latitude', accessor: v => v.lat },
      { header: 'Longitude', accessor: v => v.lng },
    ];

    this.exportToCsv(volunteers, columns, `sahaay_volunteers_${this.dateStamp()}`);
  }

  /** Generate a task progress report as CSV */
  exportTaskReport(tasks: any[]): void {
    const columns: ExportColumn<any>[] = [
      { header: 'ID', accessor: t => t.id },
      { header: 'Title', accessor: t => t.title },
      { header: 'Category', accessor: t => t.category },
      { header: 'Priority', accessor: t => t.priority },
      { header: 'Status', accessor: t => t.status },
      { header: 'Progress', accessor: t => `${t.progress}%` },
      { header: 'Location', accessor: t => t.locationName },
      { header: 'Volunteers Assigned', accessor: t => (t.volunteerIds || []).length },
      { header: 'Created At', accessor: t => this.formatTimestamp(t.createdAt) },
      { header: 'Due At', accessor: t => this.formatTimestamp(t.dueAt) },
      { header: 'Completed At', accessor: t => t.completedAt ? this.formatTimestamp(t.completedAt) : 'N/A' },
      { header: 'Recurring', accessor: t => t.recurring ? 'Yes' : 'No' },
    ];

    this.exportToCsv(tasks, columns, `sahaay_tasks_${this.dateStamp()}`);
  }

  /** Generate an inventory report as CSV */
  exportInventoryReport(items: any[]): void {
    const columns: ExportColumn<any>[] = [
      { header: 'ID', accessor: i => i.id },
      { header: 'Name', accessor: i => i.name },
      { header: 'Category', accessor: i => i.category },
      { header: 'Quantity', accessor: i => i.quantity },
      { header: 'Unit', accessor: i => i.unit },
      { header: 'Status', accessor: i => i.status },
      { header: 'Location', accessor: i => i.location },
      { header: 'Minimum Threshold', accessor: i => i.minimumThreshold },
      { header: 'Last Updated', accessor: i => this.formatTimestamp(i.lastUpdated) },
    ];

    this.exportToCsv(items, columns, `sahaay_inventory_${this.dateStamp()}`);
  }

  /** Escape a CSV field to handle commas, quotes, newlines */
  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /** Trigger browser download of a blob */
  private downloadBlob(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /** Format a Firestore timestamp to ISO date string */
  private formatTimestamp(timestamp: any): string {
    if (!timestamp) return '';
    if (timestamp.toDate) return timestamp.toDate().toISOString();
    if (timestamp instanceof Date) return timestamp.toISOString();
    return String(timestamp);
  }

  /** Generate date stamp for filenames */
  private dateStamp(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
