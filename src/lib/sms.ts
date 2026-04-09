const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';
const API_KEY = import.meta.env.VITE_FAST2SMS_API_KEY;

export async function sendSMS(numbers: string, message: string) {
  if (!API_KEY) {
    console.error('Fast2SMS API Key missing');
    return { success: false, error: 'API Key missing' };
  }

  try {
    const response = await fetch(FAST2SMS_URL, {
      method: 'POST',
      headers: {
        'authorization': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: numbers,
      }),
    });

    const data = await response.json();
    console.log('Fast2SMS Response:', data);
    return { success: data.return === true, data };
  } catch (error) {
    console.error('Fast2SMS Error:', error);
    return { success: false, error };
  }
}
