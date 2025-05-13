export type Attribute = {
  name: string;
  description: string;
  data_type: string;
  is_required: boolean;
  validation_rules?: any;
};

export type Relationship = {
  target_concept_id: string;
  target_concept_name: string;
  relation_type: string;
  is_bidirectional: boolean;
  cardinality: string;
};

export type Concept = {
  id: string;
  name: string;
  description: string;
  domain: string;
  category: string;
  attributes?: Attribute[];
  relationships?: Relationship[];
  created_at?: Date;
  updated_at?: Date;
}; 