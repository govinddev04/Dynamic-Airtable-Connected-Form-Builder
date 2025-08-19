import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Form, IForm, IFormField } from '../models/Form';
import { Types } from 'mongoose';

export async function createForm(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const {
      title,
      description,
      airtableBaseId,
      airtableTableId,
      airtableBaseName,
      airtableTableName,
      fields
    } = req.body;

    if (!title || !airtableBaseId || !airtableTableId || !fields) {
      return res.status(400).json({ 
        error: 'Title, Airtable base ID, table ID, and fields are required' 
      });
    }

    const form = new Form({
      userId: new Types.ObjectId(req.user.id),
      title,
      description,
      airtableBaseId,
      airtableTableId,
      airtableBaseName,
      airtableTableName,
      fields: fields.map((field: any, index: number) => ({
        ...field,
        order: field.order || index
      }))
    });

    await form.save();

    res.status(201).json({ form });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
}

export async function getForms(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const forms = await Form.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Form.countDocuments({ userId: req.user.id });

    res.json({
      forms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
}

export async function getForm(req: AuthenticatedRequest, res: Response) {
  try {
    const { formId } = req.params;

    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    const form = await Form.findById(formId).lean();

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // For public form viewing, we don't need authentication
    // For form management, we need to check ownership
    if (req.user && form.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ form });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
}

export async function updateForm(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { formId } = req.params;
    const updates = req.body;

    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    const form = await Form.findOneAndUpdate(
      { _id: formId, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({ error: 'Form not found or access denied' });
    }

    res.json({ form });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
}

export async function deleteForm(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { formId } = req.params;

    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    const form = await Form.findOneAndDelete({ 
      _id: formId, 
      userId: req.user.id 
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found or access denied' });
    }

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
}

export async function getPublicForm(req: Request, res: Response) {
  try {
    const { formId } = req.params;

    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    const form = await Form.findOne({ 
      _id: formId, 
      isActive: true 
    }).lean();

    if (!form) {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }

    // Remove sensitive information for public access
    const publicForm = {
      id: form._id,
      title: form.title,
      description: form.description,
      fields: form.fields,
      airtableBaseId: form.airtableBaseId,
      airtableTableId: form.airtableTableId
    };

    res.json({ form: publicForm });
  } catch (error) {
    console.error('Error fetching public form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
}
