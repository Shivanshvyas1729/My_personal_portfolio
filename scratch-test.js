import fetch from "node-fetch";

const testEmail = async () => {
    try {
        const payload = {
            service_id: "service_3rnk76r",
            template_id: "template_4519p5r",
            user_id: "pQnzlnAMoWVOM5DTk",
            template_params: {
              from_name: "Test User",
              from_email: "test@example.com",
              message: "Spoofing headers test",
              to_name: "Shivansh",
            }
          };

          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Origin': 'http://localhost:8080'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
              const txt = await response.text();
              console.log("Failed:", response.status, txt);
          } else {
              console.log("Success! Email sent via spoofing.");
          }
    } catch(e) {
        console.error(e);
    }
}

testEmail();
