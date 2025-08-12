// Google Forms configuration for the Contact Us form
// Store form IDs and entry mappings here to decouple from UI components

export const googleContactForm = {
  // Form ID extracted from the provided prefilled link
  formId: '1FAIpQLSevqkvgCtErh6PyV-dfsEBPxwLamFDKvGjdBjPAQ0JyJ34LfA',
  // Optional: preserve the prefill link base for easy sharing/debugging

  entryIds: {
    name: 'entry.2053111584',
    email: 'entry.1784549577',
    phone: 'entry.849479955',
    organization: 'entry.366023573',
    message: 'entry.496949466',
  },
};

export function getSubmitUrl(): string {
  return `https://docs.google.com/forms/d/e/${googleContactForm.formId}/formResponse`;
}


