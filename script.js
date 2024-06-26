const canvasElement = document.getElementById('canvas');
const ctx = canvasElement.getContext('2d');
const result = document.getElementById("result");
const resultText = document.getElementById("resultText")

let model;
let video;
let hand;

const fingerTips = [4, 8, 12, 16, 20];

const main = async () => {
  video = await setupCamera();
  model = await handpose.load();
  detectHands();

};//main

const setupCamera = async () => {
  try {

    const video = document.getElementById('video');

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });//stream

    video.srcObject = stream;

    await video.play();
    return video;

  } catch (error) {
    alert(error);
  };//trycatch



};//setupcamera

const detectHands = async () => {

  setInterval(async () => {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(video, 0, 0);
    

    const predictions = await model.estimateHands(video);

    if (predictions.length > 0) {
      hand = predictions[0];

      drawHand(hand);

      const fingerCount = countFingers(hand);
      result.innerText = fingerCount;
      sendFingerCount(fingerCount);
    };//ifblock

  }, 500);//setinterval
};//detecthands

const drawHand = (hand) => {
  for (let i = 0; i < hand.landmarks.length; i++) {
    const [x, y] = hand.landmarks[i];
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();

  }//forloop

};//drawhands

const countFingers = (hand) => {
  let fingerCount = 0;

  if ((hand.landmarks[2][0] < hand.landmarks[4][0])) {
    fingerCount++;
  }//ifblock

  for (let i = 1; i < fingerTips.length; i++) {
    if (hand.landmarks[fingerTips[i]][1] < hand.landmarks[fingerTips[i] - 2][1]) {
      fingerCount++;
    };//ifblock

  };//forloop
  return fingerCount;
}//countfingers

const sendFingerCount = (count) => {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/fingercount", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({ count: count }));
};//sendFingercount

main();