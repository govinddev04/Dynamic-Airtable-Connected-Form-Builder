import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IFormField {
  airtableFieldId: string;
  airtableFieldName: string;
  fieldType: 'singleLineText' | 'multilineText' | 'singleSelect' | 'multipleSelect' | 'attachment';
  questionLabel: string;
  isRequired: boolean;
  options?: string[]; // For select fields
  conditionalLogic?: {
    dependsOn: string; // Field ID this depends on
    showWhen: string; // Value that should trigger showing this field
    operator: 'equals' | 'notEquals' | 'contains';
  };
  order: number;
}

export interface IForm extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  airtableBaseId: string;
  airtableTableId: string;
  airtableBaseName: string;
  airtableTableName: string;
  fields: IFormField[];
  isActive: boolean;
  submissionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema<IFormField>({
  airtableFieldId: { type: String, required: true },
  airtableFieldName: { type: String, required: true },
  fieldType: {
    type: String,
    required: true,
    enum: ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelect', 'attachment'],
  },
  questionLabel: { type: String, required: true },
  isRequired: { type: Boolean, default: false },
  options: [{ type: String }],
  conditionalLogic: {
    dependsOn: String,
    showWhen: String,
    operator: { type: String, enum: ['equals', 'notEquals', 'contains'] },
  },
  order: { type: Number, required: true },
});

const FormSchema = new Schema<IForm>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    airtableBaseId: { type: String, required: true },
    airtableTableId: { type: String, required: true },
    airtableBaseName: { type: String, required: true },
    airtableTableName: { type: String, required: true },
    fields: [FormFieldSchema],
    isActive: { type: Boolean, default: true },
    submissionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for efficient queries
FormSchema.index({ userId: 1, createdAt: -1 });
FormSchema.index({ isActive: 1 });

// ✅ Hot-reload safe export
export const Form: Model<IForm> =
  mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema);
