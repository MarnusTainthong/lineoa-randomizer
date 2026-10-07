/** Stable sample values so request and response schemas show the same ids in Swagger. */
export const SWAGGER_EXAMPLE = {
  userId: '3f1c2a40-7b2e-4d11-9c3a-1a2b3c4d5e6f',
  eventId: '8a7b6c5d-4e3f-4a21-9b10-aabbccddeeff',
  participantId: '11111111-2222-4333-8444-555555555555',
  otherParticipantId: '66666666-7777-4888-8999-aaaaaaaaaaaa',
  ruleId: 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff',
  inviteCode: 'Ab12Cd34Ef56',
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature',
  lineIdToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.line-id-token.example',
} as const;
