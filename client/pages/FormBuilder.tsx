import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormInput, ArrowLeft, Plus, Save, Database, Trash2, Settings, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: string;
}

interface AirtableTable {
  id: string;
  name: string;
  primaryFieldId: string;
  description?: string;
}

interface AirtableField {
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

interface FormField {
  airtableFieldId: string;
  airtableFieldName: string;
  fieldType: string;
  questionLabel: string;
  isRequired: boolean;
  options?: string[];
  conditionalLogic?: {
    dependsOn: string;
    showWhen: string;
    operator: 'equals' | 'notEquals' | 'contains';
  };
  order: number;
}

export default function FormBuilder() {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [selectedBase, setSelectedBase] = useState<AirtableBase | null>(null);
  const [selectedTable, setSelectedTable] = useState<AirtableTable | null>(null);
  const [availableFields, setAvailableFields] = useState<AirtableField[]>([]);
  const [selectedFields, setSelectedFields] = useState<FormField[]>([]);

  // Data fetching
  const [bases, setBases] = useState<AirtableBase[]>([]);
  const [tables, setTables] = useState<AirtableTable[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Fetch bases on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchBases();
    }
  }, [isAuthenticated, token]);

  // Fetch tables when base is selected
  useEffect(() => {
    if (selectedBase && token) {
      fetchTables(selectedBase.id);
    }
  }, [selectedBase, token]);

  // Fetch fields when table is selected
  useEffect(() => {
    if (selectedBase && selectedTable && token) {
      fetchFields(selectedBase.id, selectedTable.id);
    }
  }, [selectedBase, selectedTable, token]);

  const fetchBases = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/airtable/bases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch bases');
      
      const data = await response.json();
      setBases(data.bases);
    } catch (error) {
      setError('Failed to fetch Airtable bases');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTables = async (baseId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/airtable/bases/${baseId}/tables`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch tables');
      
      const data = await response.json();
      setTables(data.tables);
    } catch (error) {
      setError('Failed to fetch Airtable tables');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFields = async (baseId: string, tableId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/airtable/bases/${baseId}/tables/${tableId}/fields`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch fields');
      
      const data = await response.json();
      setAvailableFields(data.fields);
    } catch (error) {
      setError('Failed to fetch Airtable fields');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = (field: AirtableField) => {
    const formField: FormField = {
      airtableFieldId: field.id,
      airtableFieldName: field.name,
      fieldType: field.type,
      questionLabel: field.name,
      isRequired: false,
      options: field.options?.choices?.map(choice => choice.name),
      order: selectedFields.length
    };

    setSelectedFields(prev => [...prev, formField]);
  };

  const handleRemoveField = (index: number) => {
    setSelectedFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleFieldUpdate = (index: number, updates: Partial<FormField>) => {
    setSelectedFields(prev => prev.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ));
  };

  const handleSaveForm = async () => {
    if (!formTitle || !selectedBase || !selectedTable || selectedFields.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          airtableBaseId: selectedBase.id,
          airtableTableId: selectedTable.id,
          airtableBaseName: selectedBase.name,
          airtableTableName: selectedTable.name,
          fields: selectedFields
        })
      });

      if (!response.ok) throw new Error('Failed to save form');

      const data = await response.json();
      navigate(`/forms/${data.form._id}`);
    } catch (error) {
      setError('Failed to save form');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FormInput className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FormFlow</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Form</h1>
          <p className="text-gray-600">Build a dynamic form from your Airtable data</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step 1: Form Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Form Details</CardTitle>
              <CardDescription>Set up basic information about your form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Form Title *</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter form title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter form description (optional)"
                />
              </div>

              <Button 
                onClick={() => setStep(2)} 
                disabled={!formTitle}
                className="w-full"
              >
                Next: Select Airtable Data
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Airtable Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Select Airtable Data</CardTitle>
                <CardDescription>Choose the base and table for your form</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Airtable Base *</Label>
                  <Select onValueChange={(value) => {
                    const base = bases.find(b => b.id === value);
                    setSelectedBase(base || null);
                    setSelectedTable(null);
                    setTables([]);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an Airtable base" />
                    </SelectTrigger>
                    <SelectContent>
                      {bases.map(base => (
                        <SelectItem key={base.id} value={base.id}>
                          {base.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBase && (
                  <div>
                    <Label>Table *</Label>
                    <Select onValueChange={(value) => {
                      const table = tables.find(t => t.id === value);
                      setSelectedTable(table || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a table" />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map(table => (
                          <SelectItem key={table.id} value={table.id}>
                            {table.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Previous
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    disabled={!selectedBase || !selectedTable}
                  >
                    Next: Configure Fields
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Field Configuration */}
        {step === 3 && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Available Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Available Fields</CardTitle>
                <CardDescription>
                  Fields from {selectedTable?.name} table
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableFields.map(field => (
                    <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{field.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddField(field)}
                        disabled={selectedFields.some(f => f.airtableFieldId === field.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Form Fields</CardTitle>
                <CardDescription>
                  Configure your form fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedFields.map((field, index) => (
                    <div key={field.airtableFieldId} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{field.fieldType}</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleRemoveField(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label>Question Label</Label>
                        <Input
                          value={field.questionLabel}
                          onChange={(e) => handleFieldUpdate(index, { questionLabel: e.target.value })}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.isRequired}
                          onCheckedChange={(checked) => handleFieldUpdate(index, { isRequired: checked })}
                        />
                        <Label>Required field</Label>
                      </div>
                    </div>
                  ))}

                  {selectedFields.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No fields selected yet. Add fields from the left panel.
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Previous
                  </Button>
                  <Button 
                    onClick={handleSaveForm}
                    disabled={selectedFields.length === 0 || isLoading}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Create Form'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
