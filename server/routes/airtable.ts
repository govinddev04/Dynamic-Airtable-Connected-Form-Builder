import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AirtableAPIService } from '../services/airtableAPI';

export async function getBases(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const airtableService = new AirtableAPIService(req.user.airtableAccessToken);
    const bases = await airtableService.getBases();

    res.json({ bases });
  } catch (error) {
    console.error('Error fetching bases:', error);
    res.status(500).json({ error: 'Failed to fetch Airtable bases' });
  }
}

export async function getTables(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { baseId } = req.params;
    if (!baseId) {
      return res.status(400).json({ error: 'Base ID is required' });
    }

    const airtableService = new AirtableAPIService(req.user.airtableAccessToken);
    const tables = await airtableService.getTables(baseId);

    res.json({ tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch Airtable tables' });
  }
}

export async function getFields(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { baseId, tableId } = req.params;
    if (!baseId || !tableId) {
      return res.status(400).json({ error: 'Base ID and Table ID are required' });
    }

    const airtableService = new AirtableAPIService(req.user.airtableAccessToken);
    const allFields = await airtableService.getFields(baseId, tableId);
    
    // Filter to only supported field types
    const supportedFields = AirtableAPIService.filterSupportedFields(allFields);

    res.json({ 
      fields: supportedFields,
      supportedFieldTypes: AirtableAPIService.getSupportedFieldTypes()
    });
  } catch (error) {
    console.error('Error fetching fields:', error);
    res.status(500).json({ error: 'Failed to fetch Airtable fields' });
  }
}

export async function createRecord(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { baseId, tableId } = req.params;
    const { fields } = req.body;

    if (!baseId || !tableId) {
      return res.status(400).json({ error: 'Base ID and Table ID are required' });
    }

    if (!fields || typeof fields !== 'object') {
      return res.status(400).json({ error: 'Fields object is required' });
    }

    const airtableService = new AirtableAPIService(req.user.airtableAccessToken);
    const record = await airtableService.createRecord(baseId, tableId, fields);

    res.json({ record });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Failed to create Airtable record' });
  }
}

export async function getRecords(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { baseId, tableId } = req.params;
    const { maxRecords, view, filterByFormula } = req.query;

    if (!baseId || !tableId) {
      return res.status(400).json({ error: 'Base ID and Table ID are required' });
    }

    const options = {
      maxRecords: maxRecords ? parseInt(maxRecords as string) : undefined,
      view: view as string,
      filterByFormula: filterByFormula as string
    };

    const airtableService = new AirtableAPIService(req.user.airtableAccessToken);
    const records = await airtableService.getRecords(baseId, tableId, options);

    res.json({ records });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch Airtable records' });
  }
}
