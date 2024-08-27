const axios = require("axios");

async function sendFireBaseNOtificationFCM(
  registrationToken,
  message,
  dataMsg,
  options = null
) {
  // console.log("fcm")
  // console.log(
  //   registrationToken,
  //   "||||||||||||",
  //   typeof registrationToken,
  //   "||||||",
  //   message
  // );
  const body = {
    registration_ids: registrationToken,
    notification: message,
    data: dataMsg,
  };
  //   console.log("body", body);
  await axios
    .post("https://fcm.googleapis.com/fcm/send", body, {
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "key=AAAAPaX5tJM:APA91bE-tkU568bg7h0x9SsIfgmULK4hNKhTNKJx7bHW8vXG-naYVHnu1xZlKmnTpS3bTL99tFZdZ4gMCIFRuPe6CWlC0_m5cp2AagcaRMoVU0zKD_qA-id9vZ38xk6hFLnud7q7UBRoo0",
      },
    })
    .then(
      (response) => {
        // console.log(response.data, "response ");
        // console.log(response.data.results, "response ");
      },
      (error) => {
        console.log(error, "error");
      }
    );
}

exports.sendFireBaseNOtificationFCM = sendFireBaseNOtificationFCM;
