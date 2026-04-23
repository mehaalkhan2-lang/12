export const getAIConciergeResponse = async (history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<any> => {
  try {
    const response = await fetch("/api/concierge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ history }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to sync with concierge");
    }

    return await response.json();
  } catch (error: any) {
    console.error("AI Concierge Sync Error:", error);
    return { 
      text: "The clinical brain is currently recalibrating. Please consult our WhatsApp Concierge for immediate assistance." 
    };
  }
};
