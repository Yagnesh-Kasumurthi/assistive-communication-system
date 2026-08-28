export const categories = {
  'Quick Needs': {
    id: 'quick-needs',
    name: 'Quick Needs',
    accent: 'cyan',
    description: 'Essential daily needs and requests',
    buttonRange: 'Button 1',
    messages: [
      { id: 'qn1', text: 'I need water', buttonLabel: 'BTN 1.1' },
      { id: 'qn2', text: 'I need food', buttonLabel: 'BTN 1.2' },
      { id: 'qn3', text: 'I need toilet', buttonLabel: 'BTN 1.3' },
      { id: 'qn4', text: 'I need help', buttonLabel: 'BTN 1.4' },
    ],
  },
  General: {
    id: 'general',
    name: 'General',
    accent: 'purple',
    description: 'General communication messages',
    buttonRange: 'Button 2',
    messages: [
      { id: 'g1', text: 'Come here', buttonLabel: 'BTN 2.1' },
      { id: 'g2', text: 'Please wait', buttonLabel: 'BTN 2.2' },
      { id: 'g3', text: 'I am okay', buttonLabel: 'BTN 2.3' },
      { id: 'g4', text: 'I need assistance', buttonLabel: 'BTN 2.4' },
    ],
  },
  Health: {
    id: 'health',
    name: 'Health',
    accent: 'green',
    description: 'Health and medical status updates',
    buttonRange: 'Button 3',
    messages: [
      { id: 'h1', text: 'I need medicine', buttonLabel: 'BTN 3.1' },
      { id: 'h2', text: 'I am in pain', buttonLabel: 'BTN 3.2' },
      { id: 'h3', text: "I don't feel well", buttonLabel: 'BTN 3.3' },
    ],
  },
  Emergency: {
    id: 'emergency',
    name: 'Emergency',
    accent: 'red',
    description: 'Urgent emergency alerts',
    buttonRange: 'Button 6',
    messages: [
      { id: 'e1', text: 'EMERGENCY! I NEED HELP', buttonLabel: 'BTN 6' },
    ],
  },
}

export const demoMessages = [
  { message: 'I need water', category: 'Quick Needs' },
  { message: 'I need food', category: 'Quick Needs' },
  { message: 'I need toilet', category: 'Quick Needs' },
  { message: 'I need help', category: 'Quick Needs' },
  { message: 'Come here', category: 'General' },
  { message: 'Please wait', category: 'General' },
  { message: 'I am okay', category: 'General' },
  { message: 'I need assistance', category: 'General' },
  { message: 'I need medicine', category: 'Health' },
  { message: 'I am in pain', category: 'Health' },
  { message: "I don't feel well", category: 'Health' },
  { message: 'EMERGENCY! I NEED HELP', category: 'Emergency' },
]
