import React from 'react';
import ConceptEditor from './ConceptEditor';
import { Concept } from './types';

type AddConceptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (concept: Concept) => void;
  editingConcept?: Concept;
};

const AddConceptModal: React.FC<AddConceptModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingConcept
}) => {
  return (
    <ConceptEditor
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      concept={editingConcept}
    />
  );
};

export default AddConceptModal; 