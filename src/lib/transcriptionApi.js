// API service for call transcription
export const transcriptionApi = {
    async transcribeCall(callId) {
        const response = await fetch(`/api/calls/${callId}/transcribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to transcribe call');
        }
        return response.json();
    },
    async getTranscription(callId) {
        const response = await fetch(`/api/calls/${callId}/transcription`);
        if (!response.ok) {
            throw new Error('Failed to fetch transcription');
        }
        return response.json();
    }
};
