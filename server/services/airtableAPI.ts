import Airtable from 'airtable';

export interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: string;
}

export interface AirtableTable {
  id: string;
  name: string;
  primaryFieldId: string;
  description?: string;
}

export interface AirtableField {
  id: string;
  name: string;
  type: string;
  description?: string;
  options?: {
    choices?: Array<{
      id: string;
      name: string;
      color?: string;
    }>;
  };
}

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

export class AirtableAPIService {
  private airtable: Airtable;

  constructor(accessToken: string) {
    this.airtable = new Airtable({ apiKey: accessToken });
  }

  async getBases(): Promise<AirtableBase[]> {
    try {
      const response = await fetch('https://api.airtable.com/v0/meta/bases', {
        headers: {
          'Authorization': `Bearer ${this.airtable.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.bases || [];
    } catch (error) {
      console.error('Error fetching bases:', error);
      throw new Error('Failed to fetch Airtable bases');
    }
  }

  async getTables(baseId: string): Promise<AirtableTable[]> {
    try {
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${this.airtable.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tables || [];
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw new Error('Failed to fetch Airtable tables');
    }
  }

  async getFields(baseId: string, tableId: string): Promise<AirtableField[]> {
    try {
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${this.airtable.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const table = data.tables?.find((t: AirtableTable) => t.id === tableId);
      
      if (!table) {
        throw new Error('Table not found');
      }

      return table.fields || [];
    } catch (error) {
      console.error('Error fetching fields:', error);
      throw new Error('Failed to fetch Airtable fields');
    }
  }

  async createRecord(baseId: string, tableId: string, fields: Record<string, any>): Promise<AirtableRecord> {
    try {
      const base = this.airtable.base(baseId);
      const table = base(tableId);

      const record = await table.create(fields);
      
      return {
        id: record.id,
        fields: record.fields,
        createdTime: record.get('createdTime') as string
      };
    } catch (error) {
      console.error('Error creating record:', error);
      throw new Error('Failed to create Airtable record');
    }
  }

  async getRecords(baseId: string, tableId: string, options?: {
    maxRecords?: number;
    view?: string;
    filterByFormula?: string;
  }): Promise<AirtableRecord[]> {
    try {
      const base = this.airtable.base(baseId);
      const table = base(tableId);

      const records = await table.select({
        maxRecords: options?.maxRecords || 100,
        view: options?.view,
        filterByFormula: options?.filterByFormula
      }).all();

      return records.map(record => ({
        id: record.id,
        fields: record.fields,
        createdTime: record.get('createdTime') as string
      }));
    } catch (error) {
      console.error('Error fetching records:', error);
      throw new Error('Failed to fetch Airtable records');
    }
  }

  static getSupportedFieldTypes(): string[] {
    return [
      'singleLineText',
      'multilineText', 
      'singleSelect',
      'multipleSelect',
      'attachment'
    ];
  }

  static isFieldTypeSupported(fieldType: string): boolean {
    return this.getSupportedFieldTypes().includes(fieldType);
  }

  static filterSupportedFields(fields: AirtableField[]): AirtableField[] {
    return fields.filter(field => this.isFieldTypeSupported(field.type));
  }
}
