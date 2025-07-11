
export const generateTrackingId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const extractTrackingIdFromMessage = (message: string): string | null => {
  const match = message.match(/id:([A-Za-z0-9]{6})/);
  return match ? match[1] : null;
};
