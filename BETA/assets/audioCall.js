var speakerDevices = document.getElementById("speaker-devices");
var ringtoneDevices = document.getElementById("ringtone-devices");
var outputVolumeBar = document.getElementById("output-volume");
var inputVolumeBar = document.getElementById("input-volume");
var volumeIndicators = document.getElementById("volume-indicators");
var callButton = document.getElementById("button-call");
// var autoMessage = document.getElementById("auto-message");
// ES6 style
//autoMessage.addEventListener("click", handleClick);
var outgoingCallHangupButton = document.getElementById(
  "button-hangup-outgoing"
);
var initializing = document.getElementById("initializing");
var callControlsDiv = document.getElementById("call-controls");
var audioSelectionDiv = document.getElementById("output-selection");
var getAudioDevicesButton = document.getElementById("get-devices");
var logDiv = document.getElementById("log");
var incomingCallDiv = document.getElementById("incoming-call");
var closeModel = document.getElementById("close-call-model");
var incomingCallHangupButton = document.getElementById("button-hangup");
var incomingCallAcceptButton = document.getElementById(
  "button-accept-incoming"
);
var incomingCallRejectButton = document.getElementById(
  "button-reject-incoming"
);

var incomingPhoneNumberEl = document.getElementById("incoming-number");
var startupButton = document.getElementById("startup-button");
var startedButton = document.getElementById("started-button");

var callContainer = document.getElementById("call-container");
var device;
var token;
var callingDeviceIdentity;
var callSidNum;
let url = window.location.origin + "/";

function addWwwIfNoSubdomain(url) {
  const urlObj = new URL(url);
  const hostnameParts = urlObj.hostname.split(".");

  if (hostnameParts.length === 2) {
    // No subdomain, add www
    hostnameParts.unshift("www");
    urlObj.hostname = hostnameParts.join(".");
    return urlObj.toString();
  } else {
    // URL already has a subdomain
    return url;
  }
}
url = addWwwIfNoSubdomain(url);
// Start up device:

const replacedUrl = url
  .replace("//www.", "//api.")
  .replace("//caretalk.", "//caretalkapi.");

function startupClient() {
  const authToken = localStorage.getItem("auth_token");
  fetch(`${replacedUrl}api/token`, {
    headers: {
      Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
    },
  })
    .then((response) => response.json())
    .then((data) => {
      token = data.token;
      callingDeviceIdentity = data.identity;

      intitializeDevice();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function intitializeDevice() {
  //logDiv.classList.remove("hide");
  //log("Initializing device");

  device = new Twilio.Device(token, {
    logLevel: 1,
    // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
    // providing better audio quality in restrained network conditions.
    codecPreferences: ["opus", "pcmu"],
  });

  addDeviceListeners(device);

  // Device must be registered in order to receive incoming calls
  device.register();
}

// Calling Button

function CallContact() {
  var callButton = document.getElementById("button-call");
  callButton.style.display = "none";

  // var closeModel = document.getElementById("close-call-model");
  // closeModel.style.display = "none";

  var initializing = document.getElementById("initializing");
  initializing.style.display = "inline";

  var phoneNumberInput = document.getElementById("phone-number");

  var phoneNumber = phoneNumberInput.value;

  var userId = document.getElementById("userId");
  var userIdValue = userId.value;

  const authToken = localStorage.getItem("auth_token");
  fetch(
    `${replacedUrl}api/twilio/call?client=${callingDeviceIdentity}&to=${phoneNumber}&userId=${userIdValue}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      callSidNum = data.sid;
    })
    .catch((error) => {
      //console.error('Error:', error);
    });

  // call.on("disconnect", updateUIDisconnectedOutgoingCall);
  // call.on("cancel", updateUIDisconnectedOutgoingCall);

  // incomingCallHangupButton.onclick = () => {
  //   hangupIncomingCall(call);
  // };

  // var myPromise = new Promise((resolve, reject) => {
  //   // Asynchronous operation
  //   setTimeout(() => {
  //     var success = true;
  //     if (success) {
  //       resolve();
  //     } else {
  //       reject('Operation failed!');
  //     }
  //   }, 2000); // Simulating an asynchronous operation that takes 2 seconds
  // });
  // myPromise.then((message) => {
  //   e.preventDefault();
  //   makeOutgoingCall();
  // })
}

function acceptIncomingCall(call) {
  call.accept();

  call.on("accept", () => {
    var callButton = document.getElementById("button-call");
    callButton.style.display = "none";

    // var autoMessage = document.getElementById("auto-message");
    // autoMessage.style.display = "inline";
    // var closeModel = document.getElementById("close-call-model");
    // closeModel.style.display = "none";

    var initializing = document.getElementById("initializing");
    initializing.style.display = "none";

    var incomingCallHangupButton = document.getElementById("button-hangup");
    incomingCallHangupButton.style.display = "inline";

    incomingCallHangupButton.addEventListener(
      "click",
      function () {
        hangupIncomingCall(call);
      },
      false
    );

    var muteButton = document.getElementById("mute-btn");
    muteButton.style.display = "flex";
    muteButton.addEventListener(
      "click",
      function () {
        muteCall(call);
      },
      false
    );

    var unMuteButton = document.getElementById("unmute-btn");
    unMuteButton.addEventListener(
      "click",
      function () {
        unMuteCall(call);
      },
      false
    );

    var DialPad = document.getElementById("dial-pad");
    DialPad.style.display = "inline";

    DialPad.addEventListener("keyup", (event) => {
      var dialPadNumber = parseInt(
        document.getElementById("dial-pad").value
      ).toString();
      call.sendDigits(dialPadNumber);
    });
  });
}

// function runAutoVoice() {
//   fetch(`https://caretalkapi.majisa.com/api/deal/CallAudioVoice?callsid=${callSidNum}`).then(response => response.json())
//     .then(data => {

//       var callButton = document.getElementById("button-call");
//       callButton.style.display = "inline";

//       // var closeModel = document.getElementById("close-call-model");
//       // closeModel.style.display = "inline";

//       var incomingCallHangupButton = document.getElementById("button-hangup");
//       incomingCallHangupButton.style.display = "none";
//       // Process the response data
//
//     })
//     .catch(error => {
//       // Handle any errors
//       console.error('Error:', error);
//     });

//   //update UI
//   //log("Accepted incoming call.");
//   //incomingCallAcceptButton.classList.add("hide");
//   //incomingCallRejectButton.classList.add("hide");
//   //incomingCallHangupButton.classList.remove("hide");
// }

//getAudioDevicesButton.onclick = getAudioDevices;
//speakerDevices.addEventListener("change", updateOutputDevice);
//ringtoneDevices.addEventListener("change", updateRingtoneDevice);

// SETUP STEP 1:
// Browser client should be started after a user gesture
// to avoid errors in the browser console re: AudioContext
// make callContainer on load

// SETUP STEP 3:
// Instantiate a new Twilio.Device

// SETUP STEP 4:
// Listen for Twilio.Device states
function addDeviceListeners(device) {
  device.on("registered", function () {
    //log("Twilio.Device Ready to make and receive calls!");
    //callControlsDiv.classList.remove("hide");
    //callButton.style.display = "inline";
  });

  device.on("error", function (error) {
    //log("Twilio.Device Error: " + error.message);
  });

  device.on("incoming", handleIncomingCall);

  device.audio.on("deviceChange", updateAllAudioDevices.bind(device));

  // Show audio selection UI if it is supported by the browser.
  if (device.audio.isOutputSelectionSupported) {
    //audioSelectionDiv.classList.remove("hide");
  }
}

// MAKE AN OUTGOING CALL

async function makeOutgoingCall() {
  var params = {
    To: phoneNumberInput.value,
    callingDeviceIdentity,
  };

  if (device) {
    outgoingCallHangupButton.style.display = "inline";
    callButton.style.display = "none";
    initializing.style.display = "none";
    closeModel.style.display = "none";
    log(`Attempting to call ${params.To} ...`);

    // Twilio.Device.connect() returns a Call object
    var call = await device.connect({ params });
    // add listeners to the Call
    // "accepted" means the call has finished connecting and the state is now "open"

    // call.on("accept", updateUIAcceptedOutgoingCall   )

    // call.on("accept", () => {
    //   callSid = call.parameters.CallSid;
    //   autoMessage.style.display = "inline";

    //
    //   var value = element.value;

    //   // fetch(`http://10.0.0.244:8085/api/twilio?CallSid=${callSid}&dealId=${value}`).then(response => response.json())

    //   fetch(`https://api.capsnap.ai/api/twilio?CallSid=${callSid}&DealId=${value}`).then(response => response.json())
    //     .then(data => {
    //       // Process the response data
    //
    //     })
    //     .catch(error => {
    //       // Handle any errors
    //       console.error('Error:', error);
    //     });

    // });

    call.on("disconnect", updateUIDisconnectedOutgoingCall);
    call.on("cancel", updateUIDisconnectedOutgoingCall);

    outgoingCallHangupButton.onclick = () => {
      log("Hanging up ...");
      callButton.style.display = "inline";
      outgoingCallHangupButton.style.display = "none";
      autoMessage.style.display = "none";

      // closeModel.style.display = "inline";
      call.disconnect();
    };
    // outgoingCallHangupButton.classList.remove("hide");
  } else {
    log("Unable to make call.");
  }
}

function handleClick() {
  var value = element.value;
  const authToken = localStorage.getItem("auth_token");

  // fetch(`https://api.capsnap.ai/api/deal/CallAudioVoice?id=${callSid}`)
  fetch(`${replacedUrl}api/deal/CallAudioVoice?callsid=${callSid}`, {
    headers: {
      Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Process the response data
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error:", error);
    });
}

function updateUIAcceptedOutgoingCall(call) {
  callButton.disabled = true;
  outgoingCallHangupButton.classList.remove("hide");
  volumeIndicators.classList.remove("hide");
  bindVolumeIndicators(call);
}

function updateUIDisconnectedOutgoingCall() {
  callButton.disabled = false;
  outgoingCallHangupButton.classList.add("hide");
  volumeIndicators.classList.add("hide");
}

// HANDLE INCOMING CALL

function handleIncomingCall(call) {
  call.on("cancel", handleDisconnectedIncomingCall);
  call.on("disconnect", handleDisconnectedIncomingCall);
  call.on("reject", handleDisconnectedIncomingCall);
  acceptIncomingCall(call);
}

// ACCEPT INCOMING CALL

// REJECT INCOMING CALL

function rejectIncomingCall(call) {
  call.reject();
  log("Rejected incoming call");
}

// HANG UP INCOMING CALL

function hangupIncomingCall(call) {
  // fetch(`https://api.capsnap.ai/api/tasks/TaskChecker?actionName=call&DealId=${value}&contactId=${contactId}&AdminId=${AdminId}`).then(response => response.json())
  //   .then(data => {
  //   })
  //   .catch(error => {
  //   });
  call.disconnect();

  // var closeModel = document.getElementById("close-call-model");
  // closeModel.style.display = "inline";

  // var initializing = document.getElementById("initializing");
  // initializing.style.display = "none";

  // var muteButton = document.getElementById("mute-btn");
  // muteButton.style.display = "none";
}
function SendDigits(digits) {
  call.sendDigits(digits);
}

function muteCall(call) {
  call.mute(true);

  var muteButton = document.getElementById("mute-btn");
  muteButton.style.display = "none";

  var unMuteButton = document.getElementById("unmute-btn");
  unMuteButton.style.display = "inline";
}

function unMuteCall(call) {
  call.mute(false);

  var unMuteButton = document.getElementById("unmute-btn");
  unMuteButton.style.display = "none";

  var muteButton = document.getElementById("mute-btn");
  muteButton.style.display = "flex";
}

// HANDLE DISCONNECTED INCOMING CALL

function handleDisconnectedIncomingCall() {
  var incomingCallHangupButton = document.getElementById("button-hangup");
  incomingCallHangupButton.style.display = "none";

  // var autoMessage = document.getElementById("auto-message");
  // autoMessage.style.display = "none";

  var callButton = document.getElementById("button-call");
  callButton.style.display = "flex";

  var unMuteButton = document.getElementById("unmute-btn");
  unMuteButton.style.display = "none";

  var muteButton = document.getElementById("mute-btn");
  muteButton.style.display = "none";

  var DialPad = document.getElementById("dial-pad");
  DialPad.style.display = "none";

  log("Incoming call ended.");
}

// MISC USER INTERFACE

// Activity log
function log(message) {
  //logDiv.innerHTML += `<p class="log-entry">&gt;&nbsp; ${message} </p>`;
  //logDiv.scrollTop = logDiv.scrollHeight;
}

// AUDIO CONTROLS

async function getAudioDevices() {
  await navigator.mediaDevices.getUserMedia({ audio: true });
  updateAllAudioDevices.bind(device);
}

function updateAllAudioDevices() {
  if (device) {
    //updateDevices(speakerDevices, device.audio.speakerDevices.get());
    //updateDevices(ringtoneDevices, device.audio.ringtoneDevices.get());
  }
}

function updateOutputDevice() {
  var selectedDevices = Array.from(speakerDevices.children)
    .filter((node) => node.selected)
    .map((node) => node.getAttribute("data-id"));

  device.audio.speakerDevices.set(selectedDevices);
}

function updateRingtoneDevice() {
  var selectedDevices = Array.from(ringtoneDevices.children)
    .filter((node) => node.selected)
    .map((node) => node.getAttribute("data-id"));

  device.audio.ringtoneDevices.set(selectedDevices);
}

function bindVolumeIndicators(call) {
  call.on("volume", function (inputVolume, outputVolume) {
    var inputColor = "red";
    if (inputVolume < 0.5) {
      inputColor = "green";
    } else if (inputVolume < 0.75) {
      inputColor = "yellow";
    }

    inputVolumeBar.style.width = Math.floor(inputVolume * 300) + "px";
    inputVolumeBar.style.background = inputColor;

    var outputColor = "red";
    if (outputVolume < 0.5) {
      outputColor = "green";
    } else if (outputVolume < 0.75) {
      outputColor = "yellow";
    }

    outputVolumeBar.style.width = Math.floor(outputVolume * 300) + "px";
    outputVolumeBar.style.background = outputColor;
  });
}

// Update the available ringtone and speaker devices
function updateDevices(selectEl, selectedDevices) {
  selectEl.innerHTML = "";

  device.audio.availableOutputDevices.forEach(function (device, id) {
    var isActive = selectedDevices.size === 0 && id === "default";
    selectedDevices.forEach(function (device) {
      if (device.deviceId === id) {
        isActive = true;
      }
    });

    var option = document.createElement("option");
    option.label = device.label;
    option.setAttribute("data-id", id);
    if (isActive) {
      option.setAttribute("selected", "selected");
    }
    selectEl.appendChild(option);
  });
}
